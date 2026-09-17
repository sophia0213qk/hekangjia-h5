from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_family
from app.db import models
from app.db.session import get_db
from app.schemas.common import MemberCreate, MemberUpdate, VitalCreate
from app.services.serializers import member_to_out, parse_uuid

router = APIRouter(prefix="/members", tags=["members"])


def _get_member_in_family(db: Session, member_id: str, family_id) -> models.Member:
    member = db.get(models.Member, parse_uuid(member_id))
    if not member or member.family_id != family_id:
        raise HTTPException(status_code=404, detail="成员不存在")
    return member


@router.get("")
def list_members(user: models.User = Depends(require_family), db: Session = Depends(get_db)):
    members = db.query(models.Member).filter(models.Member.family_id == user.family_id).all()
    return [member_to_out(m) for m in members]


@router.post("")
def create_member(
    body: MemberCreate,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    member = models.Member(
        family_id=user.family_id,
        name=body.name,
        nickname=body.nickname or body.relation,
        relation=body.relation,
        age=body.age,
        avatar=body.avatar,
        blood_type=body.blood_type,
        height=body.height,
        weight=body.weight,
        chronic_conditions=body.chronic_conditions,
        allergies=body.allergies,
        status_text=body.status_text,
        status_type=body.status_type,
        latest_vitals={},
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member_to_out(member)


@router.patch("/{member_id}")
def update_member(
    member_id: str,
    body: MemberUpdate,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    member = _get_member_in_family(db, member_id, user.family_id)
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(member, k, v)
    db.commit()
    db.refresh(member)
    return member_to_out(member)


@router.delete("/{member_id}")
def delete_member(
    member_id: str,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    member = _get_member_in_family(db, member_id, user.family_id)
    db.delete(member)
    db.commit()
    return {"ok": True}


@router.post("/{member_id}/vitals")
def record_vitals(
    member_id: str,
    body: VitalCreate,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    member = _get_member_in_family(db, member_id, user.family_id)
    measured_at = body.measured_at or datetime.now(timezone.utc)
    record = models.VitalRecord(
        member_id=member.id,
        type=body.type,
        measured_at=measured_at,
        payload=body.data,
        status="",
    )
    db.add(record)

    vitals = dict(member.latest_vitals or {})
    if body.type == "bp":
        vitals["bloodPressure"] = {
            "systolic": body.data.get("systolic"),
            "diastolic": body.data.get("diastolic"),
            "changeText": "新录入",
            "status": "已更新",
            "history": (vitals.get("bloodPressure", {}).get("history") or [])[-6:]
            + [body.data.get("systolic")],
            "measuredAt": "刚刚录入",
        }
    elif body.type == "glucose":
        vitals["bloodSugar"] = {
            "value": body.data.get("value"),
            "unit": body.data.get("unit", "mmol/L"),
            "status": "已更新",
            "timing": body.data.get("timing", "餐前"),
        }
    elif body.type == "heartRate":
        vitals["heartRate"] = {
            "value": body.data.get("value"),
            "unit": "次/分",
            "status": "已更新",
            "rhythm": body.data.get("rhythm", "窦性"),
        }
    elif body.type == "temp":
        vitals["temperature"] = {
            "value": body.data.get("value"),
            "unit": "°C",
            "status": "已更新",
            "timeAgo": "刚刚",
        }
    elif body.type == "sleep":
        vitals["sleep"] = body.data

    member.latest_vitals = vitals
    db.commit()
    db.refresh(member)
    return member_to_out(member)
