from __future__ import annotations

from datetime import date, datetime, timezone
from uuid import UUID

from app.db import models


WEEKDAY_CN = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]


def calc_bmi(height_cm: float, weight_kg: float) -> tuple[float, str]:
    if not height_cm or not weight_kg:
        return 0.0, "未知"
    h = height_cm / 100.0
    bmi = round(weight_kg / (h * h), 1)
    if bmi < 18.5:
        status = "偏瘦"
    elif bmi < 24:
        status = "正常"
    elif bmi < 28:
        status = "超重"
    else:
        status = "肥胖"
    return bmi, status


def member_to_out(m: models.Member, pending_todos: int = 0) -> dict:
    bmi, bmi_status = calc_bmi(m.height or 0, m.weight or 0)
    vitals = m.latest_vitals or {}
    return {
        "id": str(m.id),
        "name": m.name,
        "nickname": m.nickname or m.relation,
        "relation": m.relation,
        "age": m.age,
        "avatar": m.avatar,
        "statusText": m.status_text,
        "statusType": m.status_type,
        "pendingTodos": pending_todos,
        "bloodType": m.blood_type,
        "height": m.height,
        "weight": m.weight,
        "bmi": bmi,
        "bmiStatus": bmi_status,
        "chronicConditions": m.chronic_conditions or [],
        "allergies": m.allergies or [],
        "vitals": vitals,
    }


def _format_taken_at(value: datetime | None) -> str | None:
    if not value:
        return None
    # Store as UTC; display in local wall-clock for UI
    local = value.astimezone() if value.tzinfo else value
    return local.strftime("%Y-%m-%d %H:%M:%S")


def medication_to_out(med: models.Medication, member_name: str, today: date | None = None) -> dict:
    today = today or date.today()
    intake = next((i for i in (med.intakes or []) if i.taken_date == today), None)
    remaining = med.stock_current  # rough days left if 1 dose/day
    return {
        "id": str(med.id),
        "memberId": str(med.member_id),
        "memberName": member_name,
        "name": med.name,
        "genericName": med.generic_name or "",
        "dosage": med.dosage,
        "dosageForm": med.dosage_form,
        "frequency": med.frequency,
        "timeSlot": med.time_slot,
        "timeLabel": med.time_label,
        "mealTiming": med.meal_timing,
        "tags": med.tags or [],
        "notes": med.notes or "",
        "stockCurrent": med.stock_current,
        "stockWarning": med.stock_warning,
        "remainingDays": remaining,
        "isTakenToday": intake is not None,
        "takenAt": _format_taken_at(intake.taken_at) if intake else None,
        "scheduleMode": med.schedule_mode,
        "startDate": med.start_date,
        "duration": med.duration,
    }


def record_to_out(r: models.MedicalRecord) -> dict:
    return {
        "id": str(r.id),
        "memberId": str(r.member_id),
        "hospital": r.hospital,
        "department": r.department,
        "date": r.visit_date,
        "doctor": r.doctor,
        "status": r.status,
        "complaint": r.complaint,
        "diagnosis": r.diagnosis,
        "orders": r.orders,
    }


def lab_to_out(r: models.LabReport) -> dict:
    return {
        "id": str(r.id),
        "memberId": str(r.member_id),
        "title": r.title,
        "date": r.report_date,
        "lab": r.lab,
        "statusTag": r.status_tag,
        "statusType": r.status_type,
        "sourceFileUrl": r.source_file_url or "",
        "metrics": r.metrics or [],
    }


def schedule_to_out(s: models.MedicalSchedule, member_name: str) -> dict:
    dt = s.scheduled_at
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    local = dt.astimezone()
    now = datetime.now(timezone.utc)
    delta = dt - now
    if s.is_completed:
        countdown = "已完成"
    elif delta.total_seconds() < 0:
        countdown = "已过期"
    elif delta.days == 0:
        hours = int(delta.total_seconds() // 3600)
        countdown = f"{hours}小时后" if hours > 0 else "即将开始"
    else:
        countdown = f"{delta.days}天后"

    return {
        "id": str(s.id),
        "memberId": str(s.member_id),
        "memberName": member_name,
        "month": f"{local.month}月",
        "day": f"{local.day:02d}",
        "weekday": WEEKDAY_CN[local.weekday()],
        "title": s.title,
        "time": local.strftime("%H:%M"),
        "location": s.location,
        "countdown": countdown,
        "tags": s.tags or [],
        "notes": s.notes or "",
        "themeColor": s.theme_color,
        "dateIso": local.date().isoformat(),
        "department": s.department,
        "doctor": s.doctor,
        "isCompleted": s.is_completed,
        "type": s.type,
        "reminderSet": s.reminder_set,
    }


def notification_to_out(n: models.Notification) -> dict:
    created = n.created_at
    if created and created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    time_label = created.astimezone().strftime("%m月%d日 %H:%M") if created else ""
    return {
        "id": str(n.id),
        "title": n.title,
        "time": time_label,
        "desc": n.body,
        "type": n.type,
        "actionLabel": n.action_label,
        "actionType": n.action_type,
        "isRead": n.is_read,
    }


def parse_uuid(value: str) -> UUID:
    return UUID(str(value))
