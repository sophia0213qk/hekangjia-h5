from datetime import date, datetime
from typing import Any, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SmsSendRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11, pattern=r"^1\d{10}$")


class SmsSendResponse(BaseModel):
    ok: bool = True
    message: str = "验证码已发送"
    # Only returned when DEV_EXPOSE_SMS_CODE=true
    debug_code: Optional[str] = None


class SmsLoginRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11, pattern=r"^1\d{10}$")
    code: str = Field(..., min_length=4, max_length=8)


class UserOut(BaseModel):
    id: UUID
    phone: str
    display_name: str
    avatar_url: str
    family_id: Optional[UUID] = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MemberCreate(BaseModel):
    name: str
    nickname: str = ""
    relation: str = ""
    age: int = 0
    avatar: str = ""
    blood_type: str = ""
    height: float = 0
    weight: float = 0
    chronic_conditions: list[str] = []
    allergies: list[str] = []
    status_text: str = "健康稳定"
    status_type: str = "normal"


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    nickname: Optional[str] = None
    relation: Optional[str] = None
    age: Optional[int] = None
    avatar: Optional[str] = None
    blood_type: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    chronic_conditions: Optional[list[str]] = None
    allergies: Optional[list[str]] = None
    status_text: Optional[str] = None
    status_type: Optional[str] = None


class MemberOut(BaseModel):
    id: str
    name: str
    nickname: str
    relation: str
    age: int
    avatar: str
    statusText: str
    statusType: str
    pendingTodos: int = 0
    bloodType: str
    height: float
    weight: float
    bmi: float
    bmiStatus: str
    chronicConditions: list[str]
    allergies: list[str] = []
    vitals: dict[str, Any] = {}


class VitalCreate(BaseModel):
    type: Literal["bp", "glucose", "temp", "heartRate", "sleep"]
    data: dict[str, Any]
    measured_at: Optional[datetime] = None


class MedicationCreate(BaseModel):
    memberId: str
    name: str
    genericName: str = ""
    dosage: str = ""
    dosageForm: str = ""
    frequency: str = ""
    timeSlot: str = ""
    timeLabel: str = ""
    mealTiming: str = ""
    tags: list[str] = []
    notes: str = ""
    stockCurrent: int = 0
    stockWarning: int = 7
    scheduleMode: str = "continuous"
    startDate: str = ""
    duration: str = ""


class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    genericName: Optional[str] = None
    dosage: Optional[str] = None
    dosageForm: Optional[str] = None
    frequency: Optional[str] = None
    timeSlot: Optional[str] = None
    timeLabel: Optional[str] = None
    mealTiming: Optional[str] = None
    tags: Optional[list[str]] = None
    notes: Optional[str] = None
    stockCurrent: Optional[int] = None
    stockWarning: Optional[int] = None
    scheduleMode: Optional[str] = None
    startDate: Optional[str] = None
    duration: Optional[str] = None
    is_active: Optional[bool] = None


class MedicationOut(BaseModel):
    id: str
    memberId: str
    memberName: str
    name: str
    genericName: str = ""
    dosage: str
    dosageForm: str
    frequency: str
    timeSlot: str
    timeLabel: str
    mealTiming: str
    tags: list[str]
    notes: str
    stockCurrent: int
    stockWarning: int
    remainingDays: int
    isTakenToday: bool
    takenAt: Optional[str] = None
    scheduleMode: str
    startDate: str
    duration: str


class RecordCreate(BaseModel):
    memberId: str
    hospital: str = ""
    department: str = ""
    date: str = ""
    doctor: str = ""
    status: str = "待随访"
    complaint: str = ""
    diagnosis: str = ""
    orders: str = ""


class RecordOut(BaseModel):
    id: str
    memberId: str
    hospital: str
    department: str
    date: str
    doctor: str
    status: str
    complaint: str
    diagnosis: str
    orders: str


class LabReportCreate(BaseModel):
    memberId: str
    title: str
    date: str = ""
    lab: str = ""
    statusTag: str = ""
    statusType: str = "info"
    metrics: list[dict[str, Any]] = []
    sourceFileUrl: str = ""


class LabReportOut(BaseModel):
    id: str
    memberId: str
    title: str
    date: str
    lab: str
    statusTag: str
    statusType: str
    metrics: list[dict[str, Any]]


class ScheduleCreate(BaseModel):
    memberId: str
    title: str
    type: str = "clinic"
    dateIso: str
    time: str = "09:00"
    location: str = ""
    department: str = ""
    doctor: str = ""
    tags: list[str] = []
    notes: str = ""
    themeColor: str = "primary"
    reminderSet: bool = True


class ScheduleUpdate(BaseModel):
    isCompleted: Optional[bool] = None
    reminderSet: Optional[bool] = None
    title: Optional[str] = None
    notes: Optional[str] = None


class ScheduleOut(BaseModel):
    id: str
    memberId: str
    memberName: str
    month: str
    day: str
    weekday: str
    title: str
    time: str
    location: str
    countdown: str
    tags: list[str]
    notes: str
    themeColor: str
    dateIso: str
    department: str = ""
    doctor: str = ""
    isCompleted: bool = False
    type: str = "clinic"
    reminderSet: bool = True


class NotificationOut(BaseModel):
    id: str
    title: str
    time: str
    desc: str
    type: str
    actionLabel: str
    actionType: str
    isRead: bool = False


class ScanResult(BaseModel):
    kind: Literal["medicine", "lab"]
    data: dict[str, Any]
    confidence: float = 0.0
    raw_text: str = ""
