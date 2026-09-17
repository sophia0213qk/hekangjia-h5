import base64
import json
import logging
import re
from typing import Any, Literal

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

LAB_PROMPT = """你是医疗化验单识别助手。请识别化验报告图片，只输出 JSON（不要 markdown）：
{
  "type": "lab",
  "title": "报告标题",
  "date": "报告日期 YYYY-MM-DD",
  "lab": "检验机构",
  "items": [{"name": "项目名", "value": "结果值", "reference": "参考范围", "status": "normal|abnormal"}],
  "confidence": 0.0
}
无法识别的字段用空字符串或空数组。confidence 为 0~1。"""


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("模型未返回有效 JSON")
    return json.loads(match.group(0))


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
    # Some SDKs accept raw base64; others prefer data URI
    image_url = f"data:{mime};base64,{img_b64}"
    prompt = MEDICINE_PROMPT if kind == "medicine" else LAB_PROMPT

    client = ZhipuAiClient(api_key=settings.zhipu_api_key)
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

    message = response.choices[0].message
    content = getattr(message, "content", None) or str(message)
    if isinstance(content, list):
        content = "".join(
            part.get("text", "") if isinstance(part, dict) else getattr(part, "text", str(part))
            for part in content
        )

    parsed = _extract_json(str(content))
    return {
        "kind": kind,
        "data": parsed,
        "confidence": float(parsed.get("confidence") or 0.0),
        "raw_text": str(content),
    }
