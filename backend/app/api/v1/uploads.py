import mimetypes
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db import models

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_BYTES = 5 * 1024 * 1024


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_user),
):
    settings = get_settings()
    upload_root = Path(settings.upload_dir)
    upload_root.mkdir(parents=True, exist_ok=True)

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="空文件")
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="头像过大（上限 5MB）")

    suffix = Path(file.filename or "avatar.jpg").suffix.lower() or ".jpg"
    if suffix not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="仅支持 jpg/png/webp/gif")

    name = f"avatar_{user.id}_{uuid.uuid4().hex}{suffix}"
    saved = upload_root / name
    saved.write_bytes(content)

    return {"url": f"/api/v1/uploads/{name}"}


@router.get("/{filename}")
def get_upload(filename: str):
    """Serve uploaded files (avatars / report originals)."""
    settings = get_settings()
    # Prevent path traversal
    safe = Path(filename).name
    path = Path(settings.upload_dir) / safe
    if not path.is_file():
        raise HTTPException(status_code=404, detail="文件不存在")
    media = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    return FileResponse(path, media_type=media)
