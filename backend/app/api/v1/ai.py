import mimetypes
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.api.deps import require_family
from app.core.config import get_settings
from app.db import models
from app.schemas.common import ScanResult
from app.services.ocr import scan_image

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/scan", response_model=ScanResult)
async def scan_report(
    kind: str = Form(..., pattern="^(medicine|lab)$"),
    file: UploadFile = File(...),
    user: models.User = Depends(require_family),
):
    settings = get_settings()
    upload_root = Path(settings.upload_dir)
    upload_root.mkdir(parents=True, exist_ok=True)

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="空文件")
    if len(content) > 12 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="文件过大（上限 12MB）")

    suffix = Path(file.filename or "upload.jpg").suffix or ".jpg"
    saved = upload_root / f"{user.id}_{uuid.uuid4().hex}{suffix}"
    saved.write_bytes(content)

    mime = file.content_type or mimetypes.guess_type(str(saved))[0] or "image/jpeg"
    try:
        result = scan_image(content, kind=kind, mime=mime)  # type: ignore[arg-type]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OCR 识别失败: {exc}") from exc

    # Relative path served via /api/v1/uploads/{filename}
    result["source_file_url"] = f"/api/v1/uploads/{saved.name}"
    return ScanResult(**result)
