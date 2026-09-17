from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import create_access_token
from app.db import models
from app.db.session import get_db
from app.schemas.common import (
    SmsLoginRequest,
    SmsSendRequest,
    SmsSendResponse,
    TokenResponse,
    UserOut,
)
from app.services.sms import create_and_send_sms_code, verify_sms_code

router = APIRouter(prefix="/auth", tags=["auth"])


def _ensure_family(db: Session, user: models.User) -> models.User:
    if user.family_id:
        return user
    family = models.Family(name=f"{user.display_name or '我'}的家庭", owner_user_id=user.id)
    db.add(family)
    db.flush()
    user.family_id = family.id
    if not user.display_name:
        user.display_name = f"用户{user.phone[-4:]}"
    # Default self member
    self_member = models.Member(
        family_id=family.id,
        name=user.display_name,
        nickname="本人",
        relation="本人",
        age=30,
        avatar="",
        status_text="健康稳定",
        status_type="normal",
        blood_type="",
        height=170,
        weight=60,
        chronic_conditions=[],
        allergies=[],
        latest_vitals={},
    )
    db.add(self_member)
    db.commit()
    db.refresh(user)
    return user


@router.post("/sms/send", response_model=SmsSendResponse)
def send_sms(body: SmsSendRequest, db: Session = Depends(get_db)):
    row = create_and_send_sms_code(db, body.phone)
    settings = get_settings()
    resp = SmsSendResponse(message="验证码已发送，5分钟内有效")
    if settings.dev_expose_sms_code:
        resp.debug_code = row.code
    return resp


@router.post("/sms/login", response_model=TokenResponse)
def sms_login(body: SmsLoginRequest, db: Session = Depends(get_db)):
    if not verify_sms_code(db, body.phone, body.code):
        raise HTTPException(status_code=400, detail="验证码错误或已过期")

    user = db.query(models.User).filter(models.User.phone == body.phone).first()
    if not user:
        user = models.User(phone=body.phone, display_name=f"用户{body.phone[-4:]}")
        db.add(user)
        db.commit()
        db.refresh(user)

    user = _ensure_family(db, user)
    token = create_access_token(str(user.id), extra={"phone": user.phone})
    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def me(user: models.User = Depends(get_current_user)):
    return UserOut.model_validate(user)
