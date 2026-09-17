export interface FamilyMember {
  id: string;
  name: string;
  nickname: string;
  relation: string;
  age: number;
  avatar: string;
  statusText: string;
  statusType: 'normal' | 'warning' | 'urgent' | 'info';
  pendingTodos: number;
  bloodType: string;
  height: number;
  weight: number;
  bmi: number;
  bmiStatus: string;
  chronicConditions: string[];
  allergies?: string[];
  vitals: {
    bloodPressure: {
      systolic: number;
      diastolic: number;
      changeText: string;
      status: string;
      history: number[];
      measuredAt: string;
    };
    bloodSugar?: {
      value: number;
      unit: string;
      status: string;
      timing: string;
    };
    heartRate?: {
      value: number;
      unit: string;
      status: string;
      rhythm: string;
    };
    temperature?: {
      value: number;
      unit: string;
      status: string;
      timeAgo: string;
    };
    sleep?: {
      score: number;
      duration: string;
      deepSleep: string;
      status: string;
    };
  };
}

export interface Medication {
  id: string;
  memberId: string;
  memberName: string;
  name: string;
  genericName?: string;
  dosage: string;
  dosageForm: string;
  frequency: string;
  timeSlot: string;
  timeLabel: string;
  mealTiming: string;
  tags: string[];
  notes: string;
  stockCurrent: number;
  stockWarning: number;
  remainingDays: number;
  isTakenToday: boolean;
  takenAt?: string;
  scheduleMode: 'continuous' | 'as_needed';
  startDate: string;
  duration: string;
}

export interface MedicalRecord {
  id: string;
  memberId: string;
  hospital: string;
  department: string;
  date: string;
  doctor: string;
  status: '已完成复诊' | '历史随访' | '待随访';
  complaint: string;
  diagnosis: string;
  orders: string;
}

export interface LabReport {
  id: string;
  memberId: string;
  title: string;
  date: string;
  lab: string;
  statusTag: string;
  statusType: 'success' | 'warning' | 'info';
  sourceFileUrl?: string;
  metrics: {
    name: string;
    value: string;
    reference: string;
    isNormal: boolean;
    statusLabel?: string;
  }[];
}

export interface MedicalSchedule {
  id: string;
  memberId: string;
  memberName: string;
  month: string;
  day: string;
  weekday: string;
  title: string;
  time: string;
  location: string;
  countdown: string;
  tags: string[];
  notes: string;
  themeColor: 'primary' | 'tertiary';
  dateIso?: string;
  department?: string;
  doctor?: string;
  isCompleted?: boolean;
  type?: 'clinic' | 'vaccine' | 'checkup' | 'followup';
  reminderSet?: boolean;
}
