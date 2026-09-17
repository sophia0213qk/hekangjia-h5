from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.api.deps import require_family
from app.db import models
from app.db.session import get_db
from app.schemas.common import MedicationCreate, MedicationUpdate
from app.services.serializers import medication_to_out, parse_uuid

router = APIRouter(prefix="/medications", tags=["medications"])


def _member_in_family(db: Session, member_id, family_id) -> models.Member:
    member = db.get(models.Member, member_id if not isinstance(member_id, str) else parse_uuid(str(member_id)))
    if not member or member.family_id != family_id:
        raise HTTPException(status_code=404, detail="成员不存在")
    return member


@router.get("")
def list_medications(
    member_id: str | None = Query(None),
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.Medication)
        .join(models.Member)
        .options(joinedload(models.Medication.intakes), joinedload(models.Medication.member))
        .filter(models.Member.family_id == user.family_id, models.Medication.is_active.is_(True))
    )
    if member_id:
        q = q.filter(models.Medication.member_id == parse_uuid(member_id))
    meds = q.all()
    return [medication_to_out(m, m.member.name if m.member else "") for m in meds]


@router.post("")
def create_medication(
    body: MedicationCreate,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    member = _member_in_family(db, body.memberId, user.family_id)
    med = models.Medication(
        member_id=member.id,
        name=body.name,
        generic_name=body.genericName,
        dosage=body.dosage,
        dosage_form=body.dosageForm,
        frequency=body.frequency,
        time_slot=body.timeSlot,
        time_label=body.timeLabel,
        meal_timing=body.mealTiming,
        tags=body.tags,
        notes=body.notes,
        stock_current=body.stockCurrent,
        stock_warning=body.stockWarning,
        schedule_mode=body.scheduleMode,
        start_date=body.startDate,
        duration=body.duration,
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return medication_to_out(med, member.name)


@router.patch("/{med_id}")
def update_medication(
    med_id: str,
    body: MedicationUpdate,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    med = (
        db.query(models.Medication)
        .join(models.Member)
        .options(joinedload(models.Medication.intakes), joinedload(models.Medication.member))
        .filter(models.Medication.id == parse_uuid(med_id), models.Member.family_id == user.family_id)
        .first()
    )
    if not med:
        raise HTTPException(status_code=404, detail="药品不存在")
    field_map = {
        "name": "name",
        "genericName": "generic_name",
        "dosage": "dosage",
        "dosageForm": "dosage_form",
        "frequency": "frequency",
        "timeSlot": "time_slot",
        "timeLabel": "time_label",
        "mealTiming": "meal_timing",
        "tags": "tags",
        "notes": "notes",
        "stockCurrent": "stock_current",
        "stockWarning": "stock_warning",
        "scheduleMode": "schedule_mode",
        "startDate": "start_date",
        "duration": "duration",
        "is_active": "is_active",
    }
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(med, field_map.get(k, k), v)
    db.commit()
    db.refresh(med)
    return medication_to_out(med, med.member.name if med.member else "")


@router.delete("/{med_id}")
def deactivate_medication(
    med_id: str,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    med = (
        db.query(models.Medication)
        .join(models.Member)
        .filter(models.Medication.id == parse_uuid(med_id), models.Member.family_id == user.family_id)
        .first()
    )
    if not med:
        raise HTTPException(status_code=404, detail="药品不存在")
    med.is_active = False
    db.commit()
    return {"ok": True}


@router.post("/{med_id}/take")
def take_medication(
    med_id: str,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    med = (
        db.query(models.Medication)
        .join(models.Member)
        .options(joinedload(models.Medication.intakes), joinedload(models.Medication.member))
        .filter(models.Medication.id == parse_uuid(med_id), models.Member.family_id == user.family_id)
        .first()
    )
    if not med:
        raise HTTPException(status_code=404, detail="药品不存在")
    today = date.today()
    existing = next((i for i in med.intakes if i.taken_date == today), None)
    if existing:
        db.delete(existing)
        if med.stock_current > 0:
            pass
        else:
            pass
        db.commit()
        db.refresh(med)
        return medication_to_out(med, med.member.name if med.member else "")

    intake = models.MedicationIntake(
        medication_id=med.id,
        taken_date=today,
        taken_at=datetime.now(timezone.utc),
    )
    db.add(intake)
    if med.stock_current > 0:
        med.stock_current -= 1
    db.commit()
    db.refresh(med)
    return medication_to_out(med, med.member.name if med.member else "")
