import React, { useState } from 'react';
import { FamilyMember, Medication, MedicalRecord, LabReport } from '../types';
import { APP_ICONS } from '../data/mockData';
import { EditMemberProfileModal } from './EditMemberProfileModal';
import { EditMedicationModal } from './EditMedicationModal';
import { MemberAvatar } from './MemberAvatar';
import { hasRecordedVitals } from '../utils/vitals';

interface MemberProfileViewProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
  onSelectMember: (id: string) => void;
  medications: Medication[];
  records: MedicalRecord[];
  labReports: LabReport[];
  onBack: () => void;
  onRecordVitals: (memberId: string) => void;
  onExportBrief: (member: FamilyMember) => void;
  onViewReportDetail?: (report: LabReport) => void;
  onUploadReport?: () => void;
  onAddMedication?: () => void;
  onUpdateMember?: (updatedMember: FamilyMember) => void;
  onAvatarChange?: (memberId: string, avatarUrl: string) => void;
  onUpdateMedication?: (updatedMedication: Medication) => void;
  onDeleteMedication?: (medicationId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({
  member,
  allMembers,
  onSelectMember,
  medications,
  records,
  labReports,
  onBack,
  onRecordVitals,
  onExportBrief,
  onViewReportDetail,
  onUploadReport,
  onAddMedication,
  onUpdateMember,
  onAvatarChange,
  onUpdateMedication,
  onDeleteMedication,
  onShowToast,
}) => {
  const [selectedWeekDay, setSelectedWeekDay] = useState<number>(6);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [confirmDeleteMedId, setConfirmDeleteMedId] = useState<string | null>(null);

  // Filter records and medications for this member
  const memberMeds = medications.filter((m) => m.memberId === member.id);
  const memberRecords = records.filter((r) => r.memberId === member.id);
  const memberReports = labReports.filter((l) => l.memberId === member.id);

  const hasVitals = hasRecordedVitals(member);
  const bp = member.vitals?.bloodPressure;
  const hasBp =
    !!bp &&
    bp.status !== '待录入' &&
    !!bp.measuredAt &&
    bp.measuredAt !== '暂无';
  const bpHistory = hasBp ? bp.history || [] : [];
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '今日'];
  const sugar = member.vitals?.bloodSugar;
  const heart = member.vitals?.heartRate;

  return (
    <div className="min-h-screen bg-[#f0fcf5] text-[#131e1a] pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#f0fcf5]/90 backdrop-blur-xl border-b border-[#00685d]/10 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label="返回上一页"
            className="w-10 h-10 -ml-2 flex items-center justify-center text-[#3e4946] hover:text-[#00685d] transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#00685d] text-[20px]">
              contact_emergency
            </span>
            <h1 className="text-[17px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
              成员健康档案
            </h1>
          </div>
        </div>

        {/* Member Avatar Quick Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={member.id}
            onChange={(e) => onSelectMember(e.target.value)}
            className="text-[12px] font-bold text-[#00685d] bg-white px-2.5 py-1 rounded-full border border-[#00685d]/20 shadow-xs focus:outline-none cursor-pointer"
          >
            {allMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nickname} · {m.name}
              </option>
            ))}
          </select>
          <img
            alt="用户头像"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs"
            src={APP_ICONS.userProfile}
          />
        </div>
      </header>

      {/* Main Profile Body */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 1. Member Basic Information Card */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#00685d]/10 space-y-3.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MemberAvatar
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-[#00685d]/20 shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#2E9E6D] text-white rounded-full ring-2 ring-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[10px]">check</span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[20px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
                    {member.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#005047] text-[11px] font-bold">
                    {member.relation} · {member.age}岁
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#00685d] font-semibold mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#2E9E6D] animate-pulse"></span>
                  <span>档案已同步 · 状态安好</span>
                </div>
              </div>
            </div>

            <button
              id="edit-profile-btn"
              onClick={() => setIsEditProfileOpen(true)}
              className="text-[12px] text-[#00685d] bg-[#f0fcf5] hover:bg-[#e5f1ea] px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 border border-[#00685d]/10 transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[14px]">edit_note</span>
              <span>编辑档案</span>
            </button>
          </div>

          {/* 4 Stat Badges */}
          <div className="grid grid-cols-4 gap-2 text-center pt-1">
            <div className="p-2 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10">
              <span className="text-[10px] text-[#6f7975] block">血型</span>
              <span className="text-[11px] font-bold text-[#131e1a] mt-0.5 block leading-tight">
                {member.bloodType}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10">
              <span className="text-[10px] text-[#6f7975] block">身高</span>
              <span className="text-[12px] font-bold text-[#131e1a] mt-0.5 block">
                {member.height} 厘米
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10">
              <span className="text-[10px] text-[#6f7975] block">体重</span>
              <span className="text-[12px] font-bold text-[#131e1a] mt-0.5 block">
                {member.weight} 公斤
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10">
              <span className="text-[10px] text-[#6f7975] block">体质指数</span>
              <span className="text-[12px] font-bold text-[#131e1a] mt-0.5 block">
                {member.bmi} {member.bmiStatus}
              </span>
            </div>
          </div>

          {/* Condition Chips */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-[#f0fcf5]">
            {member.chronicConditions?.map((cond, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-[#e5eeff] text-[#005047] text-[11px] font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">monitor_heart</span>
                {cond}
              </span>
            ))}
            {member.allergies?.map((allergy, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-[#ffdad2]/60 text-[#a7391e] text-[11px] font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">warning</span>
                {allergy}
              </span>
            ))}
          </div>
        </section>

        {/* 2. 健康数据速览 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#00685d]/10 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#00685d] text-[20px]">
                show_chart
              </span>
              <h3 className="text-[16px] font-bold text-[#131e1a]">健康数据速览</h3>
            </div>
            <button
              id="profile-vitals-action"
              type="button"
              onClick={() => onRecordVitals(member.id)}
              className="shrink-0 text-[12px] text-[#00685d] bg-[#f0fcf5] hover:bg-[#e5f1ea] px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 border border-[#00685d]/10 transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[14px]">
                {hasVitals ? 'edit' : 'add_chart'}
              </span>
              <span>{hasVitals ? '修改体征' : '录入体征'}</span>
            </button>
          </div>

          {!hasVitals && (
            <div className="rounded-xl border border-dashed border-[#00685d]/25 bg-[#f8f9ff] px-4 py-8 text-center space-y-1.5">
              <span className="material-symbols-outlined text-[#00685d] text-[28px]">monitor_heart</span>
              <p className="text-[14px] font-semibold text-[#131e1a]">还没有体征数据</p>
              <p className="text-[12px] text-[#6f7975] leading-relaxed">
                第一次请先录入血压、血糖或心率，保存后可以在这里查看，之后也能修改。
              </p>
            </div>
          )}

          {hasVitals && (
          <>
          {hasBp && bp && (
          <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#00685d]/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#6f7975] font-medium">
                血压水平 (收缩压 / 舒张压)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#9af3e3]/60 text-[#005047] text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00685d]"></span>
                {bp.status || '已记录'}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] font-extrabold text-[#131e1a] tracking-tight font-['Plus_Jakarta_Sans']">
                {bp.systolic} / {bp.diastolic}
              </span>
              <span className="text-[12px] text-[#6f7975]">毫米汞柱</span>
            </div>

            {/* Trend info */}
            <div className="flex items-center justify-between text-[11px] text-[#6f7975] pt-1">
              <span>过去7天晨间趋势</span>
              <span className="font-semibold text-[#00685d]">波动率 ±3.8% · 稳定</span>
            </div>

            {/* Interactive SVG Chart */}
            <div className="pt-2">
              <div className="relative h-20 w-full">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 300 70"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00685d" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00685d" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Shaded Area */}
                  <path
                    d="M 10 35 Q 50 20 95 30 T 180 25 T 250 22 L 290 32 L 290 65 L 10 65 Z"
                    fill="url(#chartGrad)"
                  />
                  {/* Line */}
                  <path
                    d="M 10 35 Q 50 20 95 30 T 180 25 T 250 22 L 290 32"
                    fill="none"
                    stroke="#00685d"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {[
                    { cx: 10, cy: 35, val: bpHistory[0] },
                    { cx: 55, cy: 26, val: bpHistory[1] },
                    { cx: 100, cy: 30, val: bpHistory[2] },
                    { cx: 145, cy: 28, val: bpHistory[3] },
                    { cx: 195, cy: 24, val: bpHistory[4] },
                    { cx: 245, cy: 26, val: bpHistory[5] },
                    { cx: 290, cy: 32, val: bpHistory[6] },
                  ]
                    .filter((pt) => pt.val != null)
                    .map((pt, i) => (
                    <g key={i} className="cursor-pointer" onClick={() => setSelectedWeekDay(i)}>
                      <circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r={selectedWeekDay === i ? 5.5 : 3.5}
                        fill={selectedWeekDay === i ? '#00685d' : '#ffffff'}
                        stroke="#00685d"
                        strokeWidth="2.5"
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Day Labels */}
              <div className="flex justify-between text-[10px] text-[#6f7975] pt-1">
                {days.map((d, idx) => (
                  <span
                    key={d}
                    onClick={() => setSelectedWeekDay(idx)}
                    className={`cursor-pointer px-1 rounded transition-colors ${
                      selectedWeekDay === idx
                        ? 'text-[#00685d] font-bold bg-[#e5f1ea]'
                        : 'hover:text-[#131e1a]'
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
          )}

          {(sugar || heart) && (
          <div className="grid grid-cols-2 gap-3">
            {sugar && (
            <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#00685d]/10 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#6f7975]">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#904800] text-[15px]">
                    opacity
                  </span>
                  <span>{sugar.timing?.includes('餐后') ? '餐后血糖' : '空腹血糖'}</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00685d]"></span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-extrabold text-[#131e1a]">
                  {sugar.value}
                </span>
                <span className="text-[10px] text-[#6f7975]">毫摩尔/升</span>
              </div>
              <span className="text-[10px] text-[#00685d] font-semibold block">
                {sugar.status || '已记录'}
              </span>
            </div>
            )}

            {heart && (
            <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#00685d]/10 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#6f7975]">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#00685d] text-[15px]">
                    favorite
                  </span>
                  <span>静息心率</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00685d]"></span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-extrabold text-[#131e1a]">
                  {heart.value}
                </span>
                <span className="text-[10px] text-[#6f7975]">次/分</span>
              </div>
              <span className="text-[10px] text-[#00685d] font-semibold block">
                {heart.status || '已记录'}
              </span>
            </div>
            )}
          </div>
          )}
          </>
          )}
        </section>

        {/* 3. 当前服用药物 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#00685d]/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00685d] text-[20px]">pill</span>
              <h3 className="text-[16px] font-bold text-[#131e1a]">当前服用药物</h3>
            </div>
            <span className="text-[11px] text-[#6f7975] flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px] text-[#00685d]">touch_app</span>
              点击修改 · 可删除
            </span>
          </div>

          <div className="space-y-2.5">
            {memberMeds.length > 0 ? (
              memberMeds.map((med) => (
                <div
                  key={med.id}
                  onClick={() => setEditingMedication(med)}
                  role="button"
                  tabIndex={0}
                  className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#00685d]/10 hover:border-[#00685d]/40 hover:bg-[#f0fcf5]/60 transition-all cursor-pointer flex flex-col space-y-2 group shadow-2xs active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[14px] font-bold text-[#131e1a] group-hover:text-[#00685d] transition-colors truncate">
                        {med.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#9af3e3]/50 text-[#005047] text-[10px] font-bold shrink-0">
                        正在服用
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] text-[#00685d] font-semibold flex items-center gap-0.5 opacity-90">
                        <span className="material-symbols-outlined text-[13px]">edit_calendar</span>
                        <span>修改</span>
                      </span>
                      {onDeleteMedication && (
                        <button
                          type="button"
                          title="删除药物"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteMedId(med.id);
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[#a7391e]/80 hover:bg-[#ffdad2] hover:text-[#a7391e] transition"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#6f7975] flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">medication</span>
                      {med.dosage}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">alarm</span>
                      {med.timeSlot || '08:00'} · {med.frequency} · {med.mealTiming}
                    </span>
                    <span className="flex items-center gap-1 text-[#00685d] font-semibold">
                      <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                      剩余 {med.remainingDays} 天
                    </span>
                  </div>

                  {med.notes && (
                    <div className="text-[11px] text-[#3e4946] bg-white/70 px-2.5 py-1 rounded-lg border border-[#00685d]/5 truncate">
                      医嘱：{med.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[12px] text-[#6f7975]">
                暂无当前服用药物
              </div>
            )}
          </div>
        </section>
      </div>

      {confirmDeleteMedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#a7391e] text-[28px]">warning</span>
              <div>
                <h4 className="text-[15px] font-bold text-[#131e1a]">确认删除药物？</h4>
                <p className="text-[12px] text-[#6f7975] mt-1">
                  将移出「{memberMeds.find((m) => m.id === confirmDeleteMedId)?.name || '该药物'}」，删除后不可恢复。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteMedId(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#f0fcf5] text-[#3e4946] text-[13px] font-semibold"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMedication?.(confirmDeleteMedId);
                  setConfirmDeleteMedId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#a7391e] hover:bg-[#8c2f18] text-white text-[13px] font-bold"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#00685d]/10 px-4 py-2.5 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => onExportBrief(member)}
            className="flex-1 h-12 rounded-xl bg-[#f0fcf5] hover:bg-[#e5f1ea] text-[#00685d] border border-[#00685d]/20 text-[14px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
            <span>导出简报</span>
          </button>

          <button
            onClick={() => onRecordVitals(member.id)}
            className="flex-1 h-12 rounded-xl bg-[#00685d] hover:bg-[#005047] text-white text-[14px] font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              {hasVitals ? 'edit' : 'add_circle'}
            </span>
            <span>{hasVitals ? '修改体征' : '录入体征'}</span>
          </button>
        </div>
      </div>

      {/* Edit Member Profile Modal */}
      <EditMemberProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        member={member}
        onSave={(updatedMem) => {
          if (onUpdateMember) onUpdateMember(updatedMem);
        }}
        onAvatarChange={onAvatarChange}
        onShowToast={onShowToast}
      />

      {/* Edit Medication Modal */}
      <EditMedicationModal
        isOpen={!!editingMedication}
        onClose={() => setEditingMedication(null)}
        medication={editingMedication}
        onSave={(updatedMed) => {
          if (onUpdateMedication) onUpdateMedication(updatedMed);
        }}
        onDelete={(medId) => {
          if (onDeleteMedication) onDeleteMedication(medId);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
