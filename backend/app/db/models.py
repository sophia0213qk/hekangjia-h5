import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class Family(Base):
    __tablename__ = "families"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(128), default="我的家庭")
    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    members = relationship("Member", back_populates="family", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(64), default="")
    avatar_url: Mapped[str] = mapped_column(String(512), default="")
    family_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("families.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class SmsCode(Base):
    __tablename__ = "sms_codes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    phone: Mapped[str] = mapped_column(String(20), index=True)
    code: Mapped[str] = mapped_column(String(8))
    purpose: Mapped[str] = mapped_column(String(32), default="login")
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Member(Base):
    __tablename__ = "members"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    family_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("families.id"), index=True)
    name: Mapped[str] = mapped_column(String(64))
    nickname: Mapped[str] = mapped_column(String(64), default="")
    relation: Mapped[str] = mapped_column(String(32), default="")
    age: Mapped[int] = mapped_column(Integer, default=0)
    avatar: Mapped[str] = mapped_column(String(512), default="")
    status_text: Mapped[str] = mapped_column(String(128), default="健康稳定")
    status_type: Mapped[str] = mapped_column(String(16), default="normal")
    blood_type: Mapped[str] = mapped_column(String(32), default="")
    height: Mapped[float] = mapped_column(Float, default=0)
    weight: Mapped[float] = mapped_column(Float, default=0)
    chronic_conditions: Mapped[list] = mapped_column(JSONB, default=list)
    allergies: Mapped[list] = mapped_column(JSONB, default=list)
    latest_vitals: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    family = relationship("Family", back_populates="members")
    medications = relationship("Medication", back_populates="member", cascade="all, delete-orphan")
    vital_records = relationship("VitalRecord", back_populates="member", cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="member", cascade="all, delete-orphan")
    lab_reports = relationship("LabReport", back_populates="member", cascade="all, delete-orphan")
    schedules = relationship("MedicalSchedule", back_populates="member", cascade="all, delete-orphan")


class VitalRecord(Base):
    __tablename__ = "vital_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    member_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id"), index=True)
    type: Mapped[str] = mapped_column(String(32))
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    status: Mapped[str] = mapped_column(String(32), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    member = relationship("Member", back_populates="vital_records")


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    member_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id"), index=True)
    name: Mapped[str] = mapped_column(String(128))
    generic_name: Mapped[str] = mapped_column(String(128), default="")
    dosage: Mapped[str] = mapped_column(String(64), default="")
    dosage_form: Mapped[str] = mapped_column(String(64), default="")
    frequency: Mapped[str] = mapped_column(String(64), default="")
    time_slot: Mapped[str] = mapped_column(String(32), default="")
    time_label: Mapped[str] = mapped_column(String(64), default="")
    meal_timing: Mapped[str] = mapped_column(String(64), default="")
    tags: Mapped[list] = mapped_column(JSONB, default=list)
    notes: Mapped[str] = mapped_column(Text, default="")
    stock_current: Mapped[int] = mapped_column(Integer, default=0)
    stock_warning: Mapped[int] = mapped_column(Integer, default=7)
    schedule_mode: Mapped[str] = mapped_column(String(32), default="continuous")
    start_date: Mapped[str] = mapped_column(String(32), default="")
    duration: Mapped[str] = mapped_column(String(64), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    member = relationship("Member", back_populates="medications")
    intakes = relationship("MedicationIntake", back_populates="medication", cascade="all, delete-orphan")


class MedicationIntake(Base):
    __tablename__ = "medication_intakes"
    __table_args__ = (UniqueConstraint("medication_id", "taken_date", name="uq_med_intake_day"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    medication_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("medications.id"), index=True)
    taken_date: Mapped[date] = mapped_column(Date)
    taken_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    medication = relationship("Medication", back_populates="intakes")


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    member_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id"), index=True)
    hospital: Mapped[str] = mapped_column(String(128), default="")
    department: Mapped[str] = mapped_column(String(64), default="")
    visit_date: Mapped[str] = mapped_column(String(32), default="")
    doctor: Mapped[str] = mapped_column(String(64), default="")
    status: Mapped[str] = mapped_column(String(32), default="待随访")
    complaint: Mapped[str] = mapped_column(Text, default="")
    diagnosis: Mapped[str] = mapped_column(Text, default="")
    orders: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    member = relationship("Member", back_populates="medical_records")


class LabReport(Base):
    __tablename__ = "lab_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    member_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id"), index=True)
    title: Mapped[str] = mapped_column(String(128))
    report_date: Mapped[str] = mapped_column(String(32), default="")
    lab: Mapped[str] = mapped_column(String(128), default="")
    status_tag: Mapped[str] = mapped_column(String(64), default="")
    status_type: Mapped[str] = mapped_column(String(16), default="info")
    source_file_url: Mapped[str] = mapped_column(String(512), default="")
    metrics: Mapped[list] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    member = relationship("Member", back_populates="lab_reports")


class MedicalSchedule(Base):
    __tablename__ = "schedules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    member_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id"), index=True)
    title: Mapped[str] = mapped_column(String(128))
    type: Mapped[str] = mapped_column(String(32), default="clinic")
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    location: Mapped[str] = mapped_column(String(256), default="")
    department: Mapped[str] = mapped_column(String(64), default="")
    doctor: Mapped[str] = mapped_column(String(64), default="")
    tags: Mapped[list] = mapped_column(JSONB, default=list)
    notes: Mapped[str] = mapped_column(Text, default="")
    theme_color: Mapped[str] = mapped_column(String(16), default="primary")
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    reminder_set: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    member = relationship("Member", back_populates="schedules")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    member_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    title: Mapped[str] = mapped_column(String(128))
    body: Mapped[str] = mapped_column(Text, default="")
    type: Mapped[str] = mapped_column(String(16), default="info")
    action_type: Mapped[str] = mapped_column(String(64), default="")
    action_label: Mapped[str] = mapped_column(String(64), default="")
    action_payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
