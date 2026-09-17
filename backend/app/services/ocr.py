import base64
import json
import logging
import re
from typing import Any, Literal

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

MEDICINE_PROMPT = """你是医疗信息抽取助手。请识别药盒/药品说明书图片，只输出 JSON（不要 markdown）：
{
  "type": "medicine",
  "title": "药品名称",
  "spec": "规格",
  "manufacturer": "厂家",
  "approval": "批准文号",
  "indications": ["适应症"],
  "suggestedDose": "建议用法用量",
  "confidence": 0.0
}
无法识别的字段用空字符串或空数组。confidence 为 0~1。"""

LAB_PROMPT = """你是医疗化验单识别助手。请仔细阅读图片中的表格每一列，只输出 JSON（不要 markdown）：
{
  "type": "lab",
  "title": "报告标题",
  "date": "报告日期 YYYY-MM-DD",
  "lab": "检验机构",
  "items": [
    {
      "name": "项目名称（如白细胞计数）",
      "value": "测定结果（只填数值及单位，如 21.01×10^9/L）",
      "reference": "参考区间原文（必须是数值范围，如 3.50-9.50 或 3.5~9.5×10^9/L；不要写「参考区间内」「正常」等描述）",
      "status": "normal|high|low"
    }
  ],
  "confidence": 0.0
}
硬性要求：
1. reference 必须从「参考区间/参考值/参考范围」列抄写数值范围，保留原图单位与符号（~、-、–、<、>）。
2. 禁止把 status 或「参考区间内」填进 reference；看不清则 reference 用空字符串。
3. status：结果在参考区间内为 normal，高于上限为 high，低于下限为 low。
4. 尽量识别表格中全部检验项目。confidence 为 0~1。"""


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("模型未返回有效 JSON")
    return json.loads(match.group(0))


def _normalize_lab_item(raw: dict[str, Any]) -> dict[str, Any]:
    name = str(
        raw.get("name")
        or raw.get("item")
        or raw.get("project")
        or raw.get("项目")
        or raw.get("项目名称")
        or ""
    ).strip()
    value = str(
        raw.get("value")
        or raw.get("result")
        or raw.get("测定结果")
        or raw.get("结果")
        or ""
    ).strip()
    reference = str(
        raw.get("reference")
        or raw.get("ref")
        or raw.get("refRange")
        or raw.get("referenceRange")
        or raw.get("参考区间")
        or raw.get("参考值")
        or raw.get("参考范围")
        or ""
    ).strip()
    # Model sometimes puts status phrases into reference
    bad_refs = {"参考区间内", "正常", "异常", "偏高", "偏低", "within range", "normal", "abnormal"}
    if reference.lower() in {b.lower() for b in bad_refs} or reference in bad_refs:
        reference = ""

    status_raw = str(raw.get("status") or raw.get("状态") or "").strip().lower()
    if status_raw in {"high", "h", "↑", "偏高", "升高", "高于", "abnormal_high"}:
        status = "high"
    elif status_raw in {"low", "l", "↓", "偏低", "降低", "低于", "abnormal_low"}:
        status = "low"
    elif status_raw in {"abnormal", "异常", "阳性"}:
        status = "abnormal"
    elif status_raw in {"normal", "n", "正常", "阴性"}:
        status = "normal"
    else:
        status = "normal" if not status_raw else status_raw

    return {"name": name, "value": value, "reference": reference, "status": status}


def _normalize_parsed(kind: Literal["medicine", "lab"], parsed: dict[str, Any]) -> dict[str, Any]:
    if kind != "lab":
        return parsed
    items = parsed.get("items") or parsed.get("metrics") or []
    if isinstance(items, list):
        parsed["items"] = [
            _normalize_lab_item(it) if isinstance(it, dict) else {"name": str(it), "value": "", "reference": "", "status": "normal"}
            for it in items
        ]
    return parsed


def _mock_result(kind: Literal["medicine", "lab"]) -> dict[str, Any]:
    if kind == "medicine":
        return {
            "type": "medicine",
            "title": "苯磺酸氨氯地平片",
            "spec": "5mg*28片",
            "manufacturer": "辉瑞制药",
            "approval": "国药准字H20093881",
            "indications": ["高血压", "冠心病"],
            "suggestedDose": "每日一次，一次1片",
            "confidence": 0.82,
        }
    return {
        "type": "lab",
        "title": "血常规检验报告",
        "date": "2026-03-15",
        "lab": "华西医院检验科",
        "items": [
            {"name": "白细胞", "value": "6.2", "reference": "3.5-9.5", "status": "normal"},
            {"name": "血红蛋白", "value": "138", "reference": "130-175", "status": "normal"},
            {"name": "血小板", "value": "210", "reference": "125-350", "status": "normal"},
        ],
        "confidence": 0.85,
    }


def scan_image(file_bytes: bytes, kind: Literal["medicine", "lab"], mime: str = "image/jpeg") -> dict[str, Any]:
    settings = get_settings()
    if not settings.zhipu_api_key or settings.zhipu_api_key.startswith("YOUR_"):
        logger.warning("ZHIPU_API_KEY 未配置，返回 mock OCR 结果")
        data = _mock_result(kind)
        return {"kind": kind, "data": data, "confidence": data.get("confidence", 0.0), "raw_text": ""}

    try:
        from zai import ZhipuAiClient
    except ImportError as exc:
        raise RuntimeError("请安装 zai-sdk: pip install zai-sdk") from exc

    img_b64 = base64.b64encode(file_bytes).decode("utf-8")
    image_url = f"data:{mime};base64,{img_b64}"
    prompt = MEDICINE_PROMPT if kind == "medicine" else LAB_PROMPT

    # Bypass Windows/system HTTP proxy — local proxies often break TLS to open.bigmodel.cn
    http_client = httpx.Client(trust_env=False, timeout=120.0)
    try:
        client = ZhipuAiClient(api_key=settings.zhipu_api_key, http_client=http_client)
        response = client.chat.completions.create(
            model=settings.zhipu_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": image_url}},
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
            thinking={"type": "disabled"},
        )
    finally:
        http_client.close()

    message = response.choices[0].message
    content = getattr(message, "content", None) or str(message)
    if isinstance(content, list):
        content = "".join(
            part.get("text", "") if isinstance(part, dict) else getattr(part, "text", str(part))
            for part in content
        )

    parsed = _normalize_parsed(kind, _extract_json(str(content)))
    return {
        "kind": kind,
        "data": parsed,
        "confidence": float(parsed.get("confidence") or 0.0),
        "raw_text": str(content),
    }
