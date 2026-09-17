from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import require_family
from app.db import models
from app.db.session import get_db
from app.schemas.common import LabReportCreate, RecordCreate, ScheduleCreate, ScheduleUpdate
from app.services.serializers import lab_to_out, parse_uuid, record_to_out, schedule_to_out

router = APIRouter(tags=["health"])


def _member(db: Session, member_id: str, family_id) -> models.Member:
    m = db.get(models.Member, parse_uuid(member_id))
    if not m or m.family_id != family_id:
        raise HTTPException(status_code=404, detail="成员不存在")
    return m


@router.get("/records")
def list_records(
    member_id: str | None = Query(None),
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.MedicalRecord)
        .join(models.Member)
        .filter(models.Member.family_id == user.family_id)
    )
    if member_id:
        q = q.filter(models.MedicalRecord.member_id == parse_uuid(member_id))
    return [record_to_out(r) for r in q.order_by(models.MedicalRecord.created_at.desc()).all()]


@router.post("/records")
def create_record(
    body: RecordCreate,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    member = _member(db, body.memberId, user.family_id)
    row = models.MedicalRecord(
        member_id=member.id,
        hospital=body.hospital,
        department=body.department,
        visit_date=body.date,
        doctor=body.doctor,
        status=body.status,
        complaint=body.complaint,
        diagnosis=body.diagnosis,
        orders=body.orders,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return record_to_out(row)


@router.get("/lab-reports")
def list_lab_reports(
    member_id: str | None = Query(None),
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    q = db.query(models.LabReport).join(models.Member).filter(models.Member.family_id == user.family_id)
    if member_id:
        q = q.filter(models.LabReport.member_id == parse_uuid(member_id))
    return [lab_to_out(r) for r in q.order_by(models.LabReport.created_at.desc()).all()]


@router.post("/lab-reports")
def create_lab_report(
    body: LabReportCreate,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    member = _member(db, body.memberId, user.family_id)
    metrics = []
    for item in body.metrics:
        metrics.append(
            {
                "name": item.get("name", ""),
                "value": item.get("value", ""),
                "reference": item.get("reference", item.get("status", "")),
                "isNormal": item.get("isNormal", item.get("status") != "abnormal"),
            }
        )
    row = models.LabReport(
        member_id=member.id,
        title=body.title,
        report_date=body.date,
        lab=body.lab,
        status_tag=body.statusTag,
        status_type=body.statusType,
        source_file_url=body.sourceFileUrl,
        metrics=metrics,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return lab_to_out(row)


@router.get("/schedules")
def list_schedules(user: models.User = Depends(require_family), db: Session = Depends(get_db)):
    rows = (
        db.query(models.MedicalSchedule)
        .join(models.Member)
        .filter(models.Member.family_id == user.family_id)
        .order_by(models.MedicalSchedule.scheduled_at.asc())
        .all()
    )
    result = []
    for s in rows:
        member = db.get(models.Member, s.member_id)
        result.append(schedule_to_out(s, member.name if member else ""))
    return result


@router.post("/schedules")
def create_schedule(
    body: ScheduleCreate,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    member = _member(db, body.memberId, user.family_id)
    try:
        scheduled_at = datetime.fromisoformat(f"{body.dateIso}T{body.time}:00")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="日期或时间格式错误") from exc
    row = models.MedicalSchedule(
        member_id=member.id,
        title=body.title,
        type=body.type,
        scheduled_at=scheduled_at,
        location=body.location,
        department=body.department,
        doctor=body.doctor,
        tags=body.tags,
        notes=body.notes,
        theme_color=body.themeColor,
        reminder_set=body.reminderSet,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return schedule_to_out(row, member.name)


@router.patch("/schedules/{schedule_id}")
def update_schedule(
    schedule_id: str,
    body: ScheduleUpdate,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    row = (
        db.query(models.MedicalSchedule)
        .join(models.Member)
        .filter(
            models.MedicalSchedule.id == parse_uuid(schedule_id),
            models.Member.family_id == user.family_id,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="日程不存在")
    data = body.model_dump(exclude_unset=True)
    if "isCompleted" in data:
        row.is_completed = data["isCompleted"]
    if "reminderSet" in data:
        row.reminder_set = data["reminderSet"]
    if "title" in data and data["title"] is not None:
        row.title = data["title"]
    if "notes" in data and data["notes"] is not None:
        row.notes = data["notes"]
    db.commit()
    db.refresh(row)
    member = db.get(models.Member, row.member_id)
    return schedule_to_out(row, member.name if member else "")


@router.delete("/schedules/{schedule_id}")
def delete_schedule(
    schedule_id: str,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    row = (
        db.query(models.MedicalSchedule)
        .join(models.Member)
        .filter(
            models.MedicalSchedule.id == parse_uuid(schedule_id),
            models.Member.family_id == user.family_id,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="日程不存在")
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/notifications")
def list_notifications(user: models.User = Depends(require_family), db: Session = Depends(get_db)):
    from app.services.serializers import notification_to_out

    rows = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user.id)
        .order_by(models.Notification.created_at.desc())
        .all()
    )
    return [notification_to_out(n) for n in rows]


@router.patch("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: str,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    from app.services.serializers import notification_to_out

    row = (
        db.query(models.Notification)
        .filter(models.Notification.id == parse_uuid(notif_id), models.Notification.user_id == user.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="通知不存在")
    row.is_read = True
    db.commit()
    db.refresh(row)
    return notification_to_out(row)


@router.post("/notifications/read-all")
def mark_all_read(user: models.User = Depends(require_family), db: Session = Depends(get_db)):
    db.query(models.Notification).filter(
        models.Notification.user_id == user.id, models.Notification.is_read.is_(False)
    ).update({"is_read": True})
    db.commit()
    return {"ok": True}


@router.post("/reminders/send")
def send_reminder(user: models.User = Depends(require_family), db: Session = Depends(get_db)):
    notif = models.Notification(
        user_id=user.id,
        title="已向家人发送服药提醒",
        body="提醒已记录。后续可接入微信/手环推送。",
        type="info",
        action_type="",
        action_label="",
        is_read=False,
    )
    db.add(notif)
    db.commit()
    return {"ok": True, "message": "提醒已发送"}
