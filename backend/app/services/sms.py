import logging
import random
import string
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db import models

logger = logging.getLogger(__name__)


class SmsProvider(ABC):
    @abstractmethod
    def send(self, phone: str, code: str) -> None:
        ...


class MockSmsProvider(SmsProvider):
    def send(self, phone: str, code: str) -> None:
        logger.info("[SMS:mock] phone=%s code=%s", phone, code)
        print(f"[SMS:mock] 验证码已发送至 {phone}: {code}")


class AliyunSmsProvider(SmsProvider):
    """Placeholder for Alibaba Cloud SMS. Wire SDK when credentials are ready."""

    def send(self, phone: str, code: str) -> None:
        settings = get_settings()
        if not settings.aliyun_access_key_id:
            raise RuntimeError("阿里云短信未配置，请先填写 ALIYUN_* 环境变量")
        # TODO: integrate aliyun dysmsapi when credentials are available
        logger.info(
            "[SMS:aliyun] would send phone=%s code=%s sign=%s template=%s",
            phone,
            code,
            settings.aliyun_sms_sign_name,
            settings.aliyun_sms_template_code,
        )
        raise NotImplementedError("阿里云短信接入待实现，当前请使用 SMS_PROVIDER=mock")


def get_sms_provider() -> SmsProvider:
    settings = get_settings()
    if settings.sms_provider == "aliyun":
        return AliyunSmsProvider()
    return MockSmsProvider()


def generate_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def create_and_send_sms_code(db: Session, phone: str, purpose: str = "login") -> models.SmsCode:
    settings = get_settings()
    code = generate_code()
    expires = datetime.now(timezone.utc) + timedelta(minutes=5)

    # Invalidate previous unused codes for this phone/purpose
    db.query(models.SmsCode).filter(
        models.SmsCode.phone == phone,
        models.SmsCode.purpose == purpose,
        models.SmsCode.used.is_(False),
    ).update({"used": True})

    row = models.SmsCode(phone=phone, code=code, purpose=purpose, expires_at=expires)
    db.add(row)
    db.commit()
    db.refresh(row)

    get_sms_provider().send(phone, code)
    if settings.dev_expose_sms_code:
        logger.info("DEV SMS code for %s: %s", phone, code)
    return row


def verify_sms_code(db: Session, phone: str, code: str, purpose: str = "login") -> bool:
    now = datetime.now(timezone.utc)
    row = (
        db.query(models.SmsCode)
        .filter(
            models.SmsCode.phone == phone,
            models.SmsCode.purpose == purpose,
            models.SmsCode.used.is_(False),
            models.SmsCode.expires_at >= now,
        )
        .order_by(models.SmsCode.created_at.desc())
        .first()
    )
    if not row or row.code != code:
        return False
    row.used = True
    db.commit()
    return True
