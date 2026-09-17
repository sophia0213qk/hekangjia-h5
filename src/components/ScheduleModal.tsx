import React, { useState } from 'react';
import { FamilyMember, MedicalSchedule } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: MedicalSchedule[];
  members: FamilyMember[];
  onToggleComplete: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
  onAddSchedule: (schedule: Omit<MedicalSchedule, 'id'>) => void;
  initialSelectedId?: string;
  onShowToast: (msg: string) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  schedules,
  members,
  onToggleComplete,
  onToggleReminder,
  onDeleteSchedule,
  onAddSchedule,
  initialSelectedId,
  onShowToast,
}) => {
  const [filterMemberId, setFilterMemberId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    initialSelectedId || null
  );

  // New Schedule Form State
  const [newMemberId, setNewMemberId] = useState(members[0]?.id || 'father');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'clinic' | 'vaccine' | 'checkup' | 'followup'>('clinic');
  const [newDate, setNewDate] = useState('2025-06-25');
  const [newTime, setNewTime] = useState('09:30');
  const [newHospital, setNewHospital] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [selectedTagPresets, setSelectedTagPresets] = useState<string[]>([
    '需空腹',
    '携带医保卡与既往病历',
  ]);
  const [customTagInput, setCustomTagInput] = useState('');

  if (!isOpen) return null;

  const tagPresets = [
    '需空腹 8 小时',
    '携带医保卡与既往病历',
    '带齐往期心电图',
    '接种日前测体温',
    '携带儿童预防接种证',
    '接种后留观30分',
    '需散瞳勿自驾',
    '穿着宽松无金属衣物',
    '停用晨起降压药',
  ];

  const handleToggleTagPreset = (tag: string) => {
    if (selectedTagPresets.includes(tag)) {
      setSelectedTagPresets(selectedTagPresets.filter((t) => t !== tag));
    } else {
      setSelectedTagPresets([...selectedTagPresets, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (customTagInput.trim() && !selectedTagPresets.includes(customTagInput.trim())) {
      setSelectedTagPresets([...selectedTagPresets, customTagInput.trim()]);
      setCustomTagInput('');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onShowToast('请填写日程事项标题');
      return;
    }
    const mem = members.find((m) => m.id === newMemberId);
    const dateObj = new Date(newDate);
    const month = `${dateObj.getMonth() + 1}月`;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[dateObj.getDay()] || '周一';

    const newScheduleData: Omit<MedicalSchedule, 'id'> = {
      memberId: newMemberId,
      memberName: mem ? mem.name : '家庭成员',
      month,
      day,
      weekday,
      dateIso: newDate,
      title: `${mem ? mem.name : ''} · ${newTitle.trim()}`,
      time: `${newTime} · ${newDepartment || '就诊科室'}`,
      location: newHospital || '指定医院或卫生中心',
      department: newDepartment,
      doctor: newDoctor,
      countdown: '预约成功',
      tags: selectedTagPresets,
      notes: newNotes || '请提前15分钟到达现场签到取号。',
      themeColor: newType === 'vaccine' ? 'tertiary' : 'primary',
      type: newType,
      isCompleted: false,
      reminderSet: true,
    };

    onAddSchedule(newScheduleData);
    setIsAddingNew(false);
    onShowToast(`已为 ${mem?.name || '家人'} 成功添加就医日程！`);

    // Reset fields
    setNewTitle('');
    setNewHospital('');
    setNewDepartment('');
    setNewDoctor('');
    setNewNotes('');
  };

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    if (filterMemberId !== 'all' && s.memberId !== filterMemberId) return false;
    if (filterType !== 'all' && s.type !== filterType) return false;
    return true;
  });

  const pendingList = filteredSchedules.filter((s) => !s.isCompleted);
  const completedList = filteredSchedules.filter((s) => s.isCompleted);

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'clinic':
        return { label: '门诊复查', color: 'bg-[#e0f7ef] text-[#00685d]' };
      case 'vaccine':
        return { label: '预防接种', color: 'bg-[#ffe8d6] text-[#b55d00]' };
      case 'checkup':
        return { label: '全面体检', color: 'bg-[#e5ecf6] text-[#2c538a]' };
      case 'followup':
        return { label: '专病随访', color: 'bg-[#f0e7f7] text-[#6d3e8e]' };
      default:
        return { label: '就医日程', color: 'bg-[#e0f7ef] text-[#00685d]' };
    }
  };

  return (
    <div
      id="schedule-modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-[#00685d]/15 max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#00685d]/10 flex items-center justify-between bg-linear-to-r from-[#f0fcf5] to-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00685d]/10 text-[#00685d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
                  家庭就医与随访日程
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00685d]/10 text-[#00685d] font-semibold">
                  {pendingList.length} 项待赴约
                </span>
              </div>
              <p className="text-[12px] text-[#6f7975] mt-0.5">
                同步长辈门诊、儿童预防接种及全家复诊安排
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="schedule-add-btn"
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1 text-[13px] font-semibold bg-[#00685d] text-white px-3 py-1.5 rounded-full hover:bg-[#005249] transition shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              新建日程
            </button>
            <button
              id="schedule-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6f7975] hover:bg-[#f0fcf5] hover:text-[#131e1a] transition"
              aria-label="关闭"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-5 py-3 border-b border-[#00685d]/10 bg-white shrink-0 space-y-2.5">
          {/* Member Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            <span className="text-[11px] text-[#6f7975] font-medium shrink-0">家人：</span>
            <button
              id="filter-all-members"
              onClick={() => setFilterMemberId('all')}
              className={`px-2.5 py-1 rounded-full text-[12px] font-medium transition shrink-0 ${
                filterMemberId === 'all'
                  ? 'bg-[#00685d] text-white shadow-xs'
                  : 'bg-[#f0fcf5] text-[#3e4946] hover:bg-[#e0f7ef]'
              }`}
            >
              全部家人 ({schedules.length})
            </button>
            {members.map((mem) => {
              const count = schedules.filter((s) => s.memberId === mem.id).length;
              return (
                <button
                  key={mem.id}
                  id={`filter-member-${mem.id}`}
                  onClick={() => setFilterMemberId(mem.id)}
                  className={`px-2.5 py-1 rounded-full text-[12px] font-medium transition shrink-0 flex items-center gap-1.5 ${
                    filterMemberId === mem.id
                      ? 'bg-[#00685d] text-white shadow-xs'
                      : 'bg-[#f0fcf5] text-[#3e4946] hover:bg-[#e0f7ef]'
                  }`}
                >
                  <img src={mem.avatar} alt={mem.name} className="w-4 h-4 rounded-full object-cover" />
                  <span>{mem.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1 rounded-full ${
                        filterMemberId === mem.id
                          ? 'bg-white/30 text-white'
                          : 'bg-[#00685d]/10 text-[#00685d]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar text-[12px]">
            <span className="text-[11px] text-[#6f7975] font-medium shrink-0">类型：</span>
            {[
              { id: 'all', label: '全部' },
              { id: 'clinic', label: '门诊复查' },
              { id: 'vaccine', label: '预防接种' },
              { id: 'checkup', label: '体检筛查' },
              { id: 'followup', label: '专病随访' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`px-2 py-0.5 rounded-md transition shrink-0 ${
                  filterType === t.id
                    ? 'font-bold text-[#00685d] border-b-2 border-[#00685d]'
                    : 'text-[#6f7975] hover:text-[#131e1a]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Create New Schedule Accordion / Form */}
          {isAddingNew && (
            <div className="bg-[#f0fcf5] border-2 border-[#00685d]/30 rounded-2xl p-4 shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[#00685d]/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00685d] text-[20px]">
                    edit_calendar
                  </span>
                  <h3 className="text-[15px] font-bold text-[#131e1a]">添加新的就医随访安排</h3>
                </div>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="text-[12px] text-[#6f7975] hover:text-[#131e1a]"
                >
                  取消
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="mt-3 space-y-3">
                {/* Member & Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                      就诊成员
                    </label>
                    <select
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[13px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.relation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                      日程类型
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[13px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                    >
                      <option value="clinic">门诊复查</option>
                      <option value="vaccine">预防接种</option>
                      <option value="checkup">全面体检</option>
                      <option value="followup">专病随访</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                    日程标题 / 诊疗项目 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如：心内科复查、百白破加强针、年度眼底筛查..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[13px] text-[#131e1a] placeholder:text-[#6f7975]/60 focus:outline-hidden focus:border-[#00685d]"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                      日期
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[13px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                      就诊时间段
                    </label>
                    <input
                      type="text"
                      placeholder="如：上午 09:30、下午 14:00"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[13px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                    />
                  </div>
                </div>

                {/* Hospital & Department & Doctor */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                      医院 / 机构
                    </label>
                    <input
                      type="text"
                      placeholder="华西医院门诊部..."
                      value={newHospital}
                      onChange={(e) => setNewHospital(e.target.value)}
                      className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2.5 py-1.5 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                      科室 / 诊室
                    </label>
                    <input
                      type="text"
                      placeholder="心内科 3楼4诊室..."
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2.5 py-1.5 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                      主治医生 (选填)
                    </label>
                    <input
                      type="text"
                      placeholder="王主任..."
                      value={newDoctor}
                      onChange={(e) => setNewDoctor(e.target.value)}
                      className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2.5 py-1.5 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                    />
                  </div>
                </div>

                {/* Tag Presets */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                    就诊特别注意事项 (点击选择标签)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {tagPresets.map((tag) => {
                      const isSel = selectedTagPresets.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTagPreset(tag)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg transition cursor-pointer ${
                            isSel
                              ? 'bg-[#00685d] text-white font-medium shadow-xs'
                              : 'bg-white border border-[#00685d]/20 text-[#3e4946] hover:bg-[#e0f7ef]'
                          }`}
                        >
                          {isSel ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="输入自定义标签..."
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      className="flex-1 bg-white border border-[#00685d]/20 rounded-lg px-2.5 py-1 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="text-[12px] text-[#00685d] font-semibold px-2.5 py-1 bg-white border border-[#00685d]/30 rounded-lg hover:bg-[#f0fcf5]"
                    >
                      添加
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                    就医备忘说明
                  </label>
                  <textarea
                    rows={2}
                    placeholder="如：挂号预约单号、就医准备资料、是否需要家属陪同..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 rounded-xl text-[13px] text-[#6f7975] hover:bg-[#e5f1ea]"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-[#00685d] text-white shadow-sm hover:bg-[#005249] transition active:scale-95"
                  >
                    保存日程
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Date Highlights Strip */}
          <div className="bg-[#f0fcf5] rounded-2xl p-3 border border-[#00685d]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00685d] text-[18px]">
                event_upcoming
              </span>
              <span className="text-[12px] font-bold text-[#131e1a]">
                家庭随访备忘速览
              </span>
            </div>
            <span className="text-[11px] text-[#6f7975]">
              就诊前一天将自动通过健康助手推送空腹与资料提醒
            </span>
          </div>

          {/* Pending List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00685d]"></span>
                <h3 className="text-[14px] font-bold text-[#131e1a]">待赴约日程 ({pendingList.length})</h3>
              </div>
              <span className="text-[11px] text-[#6f7975]">点击卡片可查看注意事项与挂号详情</span>
            </div>

            {pendingList.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-[#00685d]/20">
                <span className="material-symbols-outlined text-[36px] text-[#00685d]/40 mb-1">
                  check_circle
                </span>
                <p className="text-[13px] text-[#6f7975]">当前筛选条件下暂无待赴约日程</p>
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="mt-2 text-[12px] text-[#00685d] font-semibold hover:underline"
                >
                  + 添加就医日程
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingList.map((item) => {
                  const typeInfo = getTypeLabel(item.type);
                  const isExpanded = selectedScheduleId === item.id;
                  const member = members.find((m) => m.id === item.memberId);

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                        isExpanded
                          ? 'border-[#00685d] ring-2 ring-[#00685d]/10'
                          : 'border-[#00685d]/15 hover:border-[#00685d]/40'
                      }`}
                    >
                      {/* Top Row: Date Box + Title & Badges */}
                      <div
                        className="flex items-start gap-3.5 cursor-pointer"
                        onClick={() =>
                          setSelectedScheduleId(isExpanded ? null : item.id)
                        }
                      >
                        {/* Date badge */}
                        <div className="flex flex-col items-center justify-center bg-[#f0fcf5] px-3 py-2 rounded-xl shrink-0 min-w-[58px] border border-[#00685d]/15">
                          <span className="text-[11px] font-bold text-[#00685d]">
                            {item.month}
                          </span>
                          <span className="text-[22px] font-bold text-[#131e1a] leading-none my-0.5 font-['Plus_Jakarta_Sans']">
                            {item.day}
                          </span>
                          <span className="text-[10px] text-[#6f7975]">{item.weekday}</span>
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {member && (
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                              )}
                              <span className="text-[14px] font-bold text-[#131e1a] truncate">
                                {item.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00685d]/10 text-[#00685d] font-bold">
                                {item.countdown}
                              </span>
                            </div>
                          </div>

                          {/* Time & Doctor */}
                          <div className="mt-1 flex items-center flex-wrap gap-x-3 gap-y-1 text-[#3e4946] text-[12px]">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-[#00685d]">
                                schedule
                              </span>
                              <span>{item.time}</span>
                            </div>
                            {item.doctor && (
                              <div className="flex items-center gap-1 text-[#6f7975]">
                                <span className="material-symbols-outlined text-[15px] text-[#00685d]">
                                  person
                                </span>
                                <span>{item.doctor}</span>
                              </div>
                            )}
                          </div>

                          {/* Hospital & Department */}
                          <div className="mt-1 flex items-center gap-1 text-[#6f7975] text-[12px] truncate">
                            <span className="material-symbols-outlined text-[15px] text-[#00685d] shrink-0">
                              local_hospital
                            </span>
                            <span className="truncate">{item.location}</span>
                          </div>

                          {/* Tags Preview */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                    idx === 0
                                      ? 'text-[#a7391e] bg-[#ffdad2]/50 font-semibold'
                                      : 'text-[#3e4946] bg-[#f0fcf5]'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Chevron */}
                        <span className="material-symbols-outlined text-[#6f7975] text-[18px] mt-1 shrink-0">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>

                      {/* Expanded Details & Preparation Checklist */}
                      {isExpanded && (
                        <div className="mt-3.5 pt-3.5 border-t border-[#00685d]/10 space-y-3 animate-fadeIn">
                          {/* Instructions / Notes Callout */}
                          <div className="bg-[#f0fcf5] rounded-xl p-3 border border-[#00685d]/15">
                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#00685d] mb-1">
                              <span className="material-symbols-outlined text-[16px]">
                                info
                              </span>
                              <span>就诊前准备与备忘提醒</span>
                            </div>
                            <p className="text-[12px] text-[#3e4946] leading-relaxed">
                              {item.notes}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  onToggleReminder(item.id);
                                  onShowToast(
                                    item.reminderSet ? '已关闭此日程系统提醒' : '已开启就诊提前24小时提醒'
                                  );
                                }}
                                className={`flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg border transition ${
                                  item.reminderSet
                                    ? 'bg-[#00685d]/10 border-[#00685d]/20 text-[#00685d] font-semibold'
                                    : 'border-[#6f7975]/20 text-[#6f7975] hover:bg-[#f0fcf5]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {item.reminderSet ? 'notifications_active' : 'notifications_none'}
                                </span>
                                {item.reminderSet ? '提醒已开启' : '设为提醒'}
                              </button>

                              <button
                                onClick={() => {
                                  onShowToast(`已获取到 ${item.location} 导航路线`);
                                }}
                                className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg border border-[#00685d]/20 text-[#00685d] hover:bg-[#f0fcf5] transition"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  near_me
                                </span>
                                导航路线
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  onDeleteSchedule(item.id);
                                  onShowToast('已删除该项就医日程');
                                }}
                                className="text-[12px] text-[#a7391e] hover:underline px-2 py-1"
                              >
                                删除
                              </button>
                              <button
                                onClick={() => {
                                  onToggleComplete(item.id);
                                  onShowToast('已将该日程标记为已就诊完成！');
                                }}
                                className="flex items-center gap-1 text-[12px] font-semibold bg-[#00685d] text-white px-3.5 py-1.5 rounded-lg hover:bg-[#005249] transition shadow-xs"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  check
                                </span>
                                标记已就医
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Section */}
          {completedList.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6f7975]"></span>
                <h3 className="text-[14px] font-bold text-[#6f7975]">
                  已完成随访 ({completedList.length})
                </h3>
              </div>

              <div className="space-y-2 opacity-75">
                {completedList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/80 rounded-2xl p-3.5 border border-[#6f7975]/15 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00685d]/10 text-[#00685d] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">
                          check
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-[#3e4946] line-through">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-[#6f7975]">
                            {item.month}{item.day}日
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6f7975]">{item.location}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleComplete(item.id)}
                      className="text-[11px] text-[#00685d] hover:underline"
                    >
                      重新标记未完成
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#00685d]/10 bg-[#f0fcf5]/50 flex items-center justify-between text-[12px] text-[#6f7975] shrink-0">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#00685d] text-[16px]">
              verified
            </span>
            家庭日程云端加密同步中
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#00685d]/20 text-[#131e1a] font-medium hover:bg-white/80 transition"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
