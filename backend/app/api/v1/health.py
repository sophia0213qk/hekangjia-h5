from datetime import datetime
import mimetypes

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
        status_label = item.get("statusLabel") or item.get("status") or ""
        is_normal = item.get("isNormal")
        if is_normal is None:
            is_normal = str(status_label).lower() not in {
                "abnormal",
                "high",
                "low",
                "异常",
                "偏高",
                "偏低",
            }
        reference = str(item.get("reference") or "").strip()
        if reference in {"参考区间内", "正常", "异常", "偏高", "偏低"}:
            reference = ""
        metrics.append(
            {
                "name": item.get("name", ""),
                "value": item.get("value", ""),
                "reference": reference or "—",
                "isNormal": bool(is_normal),
                "statusLabel": status_label
                or ("正常" if is_normal else "异常"),
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


@router.get("/lab-reports/{report_id}/original")
def download_lab_original(
    report_id: str,
    user: models.User = Depends(require_family),
    db: Session = Depends(get_db),
):
    from pathlib import Path

    from fastapi.responses import FileResponse

    from app.core.config import get_settings

    row = db.get(models.LabReport, parse_uuid(report_id))
    if not row:
        raise HTTPException(status_code=404, detail="报告不存在")
    member = db.get(models.Member, row.member_id)
    if not member or member.family_id != user.family_id:
        raise HTTPException(status_code=404, detail="报告不存在")
    if not row.source_file_url:
        raise HTTPException(status_code=404, detail="暂无上传原图，请重新拍照或上传化验单后再归档")

    settings = get_settings()
    name = Path(row.source_file_url).name
    path = Path(settings.upload_dir) / name
    if not path.is_file():
        # Also try absolute/relative as stored
        alt = Path(row.source_file_url)
        if alt.is_file():
            path = alt
        else:
            raise HTTPException(status_code=404, detail="原图文件已丢失，请重新上传化验单")

    media = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    return FileResponse(
        path,
        filename=name,
        media_type=media,
        content_disposition_type="attachment",
    )


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
