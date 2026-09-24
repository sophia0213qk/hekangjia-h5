import { FamilyMember } from '../types';

function hasBloodPressure(member: FamilyMember): boolean {
  const bp = member.vitals?.bloodPressure;
  return (
    !!bp &&
    bp.status !== '待录入' &&
    !!bp.measuredAt &&
    bp.measuredAt !== '暂无' &&
    Number.isFinite(bp.systolic) &&
    Number.isFinite(bp.diastolic)
  );
}

/** 成员是否已有至少一项真实体征。占位默认值（待录入 / 暂无）不算。 */
export function hasRecordedVitals(member: FamilyMember | undefined | null): boolean {
  if (!member?.vitals) return false;
  return (
    hasBloodPressure(member) ||
    member.vitals.bloodSugar?.value != null ||
    member.vitals.heartRate?.value != null ||
    member.vitals.temperature?.value != null
  );
}
