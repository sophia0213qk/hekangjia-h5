import React, { useEffect, useState } from 'react';
import { FamilyMember, Medication } from '../types';
import { MemberAvatar } from './MemberAvatar';

interface AddMedicationViewProps {
  members: FamilyMember[];
  onBack?: () => void;
  onSave: (medication: Partial<Medication>) => void;
  onOpenScanCamera?: () => void;
}

interface ReminderSlot {
  id: string;
  time: string; // HH:mm 24小时制
  enabled: boolean;
}

export const AddMedicationView: React.FC<AddMedicationViewProps> = ({
  members,
  onSave,
  onOpenScanCamera,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  useEffect(() => {
    if (!members.length) {
      setSelectedMemberId('');
      return;
    }
    if (!members.some((m) => m.id === selectedMemberId)) {
      setSelectedMemberId(members[0].id);
    }
  }, [members, selectedMemberId]);
  // 药品通用名下输入药品名称应为空
  const [medName, setMedName] = useState<string>('');
  
  // 标签管理：支持自定义新增并正确渲染
  const [availableTags, setAvailableTags] = useState<string[]>([
    '高血压',
    '高血脂',
    '降血糖',
    '感冒消炎',
    '日常维生素',
    '胃肠调理',
    '心脑血管',
  ]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCustomTagInput, setShowCustomTagInput] = useState<boolean>(false);
  const [customTag, setCustomTag] = useState<string>('');

  const [dosageForm, setDosageForm] = useState<string>('片剂 (片)');
  // 药品剂量自己输入，比如1片，或者0.75片，1支 0.5支，不用加减号
  const [dosageText, setDosageText] = useState<string>('1片');

  // 疗程与截止日期
  const [courseDuration, setCourseDuration] = useState<string>('长期服用');
  const [customDays, setCustomDays] = useState<string>('30');
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const [frequency, setFrequency] = useState<string>('每日 1 次');
  const [mealTiming, setMealTiming] = useState<string>('餐后半小时');

  // 提醒时间点列表：支持点击添加与编辑
  const [reminderSlots, setReminderSlots] = useState<ReminderSlot[]>([
    { id: '1', time: '08:00', enabled: true },
  ]);

  const [notes, setNotes] = useState<string>('温开水送服');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTag.trim();
    if (!trimmed) return;
    if (!availableTags.includes(trimmed)) {
      setAvailableTags((prev) => [...prev, trimmed]);
    }
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setCustomTag('');
    setShowCustomTagInput(false);
  };

  const handleAddReminderSlot = () => {
    const defaults = ['08:00', '12:30', '19:00', '21:30', '16:00'];
    const used = new Set(reminderSlots.map((s) => s.time));
    const nextTime = defaults.find((t) => !used.has(t)) || '08:00';
    setReminderSlots((prev) => [
      ...prev,
      { id: `slot-${Date.now()}`, time: nextTime, enabled: true },
    ]);
  };

  const handleRemoveReminderSlot = (id: string) => {
    if (reminderSlots.length <= 1) return;
    setReminderSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const pad2 = (n: number) => String(n).padStart(2, '0');

  const bumpReminderPart = (id: string, part: 'hour' | 'minute', delta: number) => {
    setReminderSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        let h = Number.parseInt(s.time.split(':')[0] || '8', 10);
        let m = Number.parseInt(s.time.split(':')[1] || '0', 10);
        if (part === 'hour') {
          h = (h + delta + 24) % 24;
        } else {
          m = Math.round(m / 5) * 5;
          m = (m + delta * 5 + 60) % 60;
        }
        return { ...s, time: `${pad2(h)}:${pad2(m)}` };
      })
    );
  };

  const handleToggleReminderSlot = (id: string) => {
    setReminderSlots((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find((m) => m.id === selectedMemberId);
    const mainTime = reminderSlots[0]?.time || '08:00';
    const timeLabels = reminderSlots
      .filter((s) => s.enabled)
      .map((s) => s.time)
      .join('，');

    const newMed: Partial<Medication> = {
      id: `med-${Date.now()}`,
      memberId: selectedMemberId,
      memberName: targetMember ? `${targetMember.nickname} · ${targetMember.name}` : '家人',
      name: medName.trim() || '未命名药品',
      genericName: medName.split('(')[0]?.trim() || medName || '未命名药品',
      dosage: `${dosageText.trim() || '1片'} / 次`,
      dosageForm,
      frequency,
      timeSlot: mainTime,
      timeLabel: timeLabels || mainTime,
      mealTiming,
      tags: selectedTags,
      notes,
      stockCurrent: 30,
      stockWarning: 7,
      remainingDays: 30,
      isTakenToday: false,
      startDate: new Date().toISOString().split('T')[0],
      duration: courseDuration === '自定义' ? `自定义至 ${customEndDate}` : courseDuration,
    };

    onSave(newMed);
  };

  return (
    <div className="min-h-screen bg-[#f0fcf5] text-[#131e1a] pb-28">
      {/* Top Header — 与病历一致，通过底部导航切换离开，无需强制返回 */}
      <header className="sticky top-0 z-30 bg-[#f0fcf5]/90 backdrop-blur-xl border-b border-[#00685d]/10 px-4 h-16 flex items-center justify-center">
        <h1 className="text-[17px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
          添加新药
        </h1>
      </header>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 1. 选择用药家庭成员 */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[14px] font-bold text-[#131e1a]">选择用药家庭成员</span>
            <span className="text-[11px] text-[#00685d] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">family_restroom</span>
              家庭健康关照
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
            {members.map((member) => {
              const isSelected = selectedMemberId === member.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`relative flex flex-col items-center p-3 rounded-2xl transition-all text-left cursor-pointer shrink-0 w-[30%] min-w-[100px] snap-start ${
                    isSelected
                      ? 'bg-white shadow-sm ring-2 ring-[#00685d] scale-[1.02]'
                      : 'bg-white/70 hover:bg-white border border-[#00685d]/10 opacity-75'
                  }`}
                >
                  <div className="relative mb-1.5">
                    <MemberAvatar
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00685d]/20"
                    />
                    {isSelected && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00685d] text-white flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[11px]">check</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] font-bold text-[#131e1a] truncate w-full text-center">
                    {member.nickname || member.relation} · {member.name}
                  </span>
                  <span className="text-[11px] text-[#00685d] font-medium mt-0.5 truncate w-full text-center">
                    {member.statusText}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. 药品信息 */}
        <section className="p-4 rounded-2xl bg-white shadow-sm border border-[#00685d]/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#9af3e3]/40 flex items-center justify-center text-[#00685d]">
                <span className="material-symbols-outlined text-[18px]">medication</span>
              </div>
              <h2 className="text-[16px] font-bold text-[#131e1a]">药品信息</h2>
            </div>
            <span className="text-[11px] text-[#6f7975]">支持手动输入或快捷识别</span>
          </div>

          {/* Drug Name Input - 默认输入框为空 */}
          <div className="space-y-1">
            <label className="text-[12px] text-[#6f7975] font-medium">药品通用名或商品名</label>
            <div className="relative flex items-center">
              <input
                type="text"
                id="med-name-input"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                placeholder="请输入药品名称或通用名，如：苯磺酸氨氯地平片"
                className="w-full h-12 pl-3.5 pr-20 rounded-xl bg-[#f0fcf5] text-[#131e1a] text-[14px] font-medium border border-[#00685d]/10 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00685d] transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={onOpenScanCamera}
                  title="扫码识药"
                  className="w-8 h-8 rounded-lg bg-white shadow-xs border border-[#00685d]/10 flex items-center justify-center text-[#00685d] hover:bg-[#e5f1ea] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[19px]">qr_code_scanner</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenScanCamera}
                  title="拍照识药"
                  className="w-8 h-8 rounded-lg bg-white shadow-xs border border-[#00685d]/10 flex items-center justify-center text-[#00685d] hover:bg-[#e5f1ea] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[19px]">photo_camera</span>
                </button>
              </div>
            </div>
          </div>

          {/* Symptom / Usage Tags - 支持自定义添加并即时生效 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] text-[#6f7975] font-medium">管理病症 / 用途标签</label>
              <button
                type="button"
                id="custom-tag-toggle-btn"
                onClick={() => setShowCustomTagInput(!showCustomTagInput)}
                className="text-[11px] text-[#00685d] font-semibold hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>自定义标签</span>
              </button>
            </div>

            {showCustomTagInput && (
              <div className="flex items-center gap-2 p-2 bg-[#f0fcf5] rounded-xl border border-[#00685d]/15">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="输入新标签，按回车添加"
                  className="flex-1 h-9 px-3 text-[12px] rounded-lg bg-white border border-[#00685d]/20 focus:outline-none focus:ring-1 focus:ring-[#00685d]"
                  autoFocus
                />
                <button
                  type="button"
                  id="submit-custom-tag-btn"
                  onClick={handleAddCustomTag}
                  className="h-9 px-3.5 rounded-lg bg-[#00685d] text-white text-[12px] font-bold shadow-xs active:scale-95 cursor-pointer"
                >
                  添加
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-0.5">
              {availableTags.map((tag) => {
                const isChecked = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      isChecked
                        ? 'bg-[#00685d] text-white shadow-xs'
                        : 'bg-[#f0fcf5] text-[#3e4946] border border-[#00685d]/10 hover:bg-[#e5f1ea]'
                    }`}
                  >
                    {isChecked && (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    )}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dosage Form & Custom Dosage Text Input (不用加减号，自由输入 1片、0.75片、1支、0.5支) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[12px] text-[#6f7975] font-medium">药品剂型</label>
              <div className="relative">
                <select
                  value={dosageForm}
                  onChange={(e) => setDosageForm(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[#131e1a] text-[13px] font-medium focus:outline-none focus:bg-white appearance-none pr-8 cursor-pointer"
                >
                  <option value="片剂 (片)">片剂 (片)</option>
                  <option value="胶囊 (粒)">胶囊 (粒)</option>
                  <option value="口服液 (支)">口服液 (支)</option>
                  <option value="滴剂 (ml)">滴剂 (ml)</option>
                  <option value="冲剂/颗粒 (袋)">冲剂/颗粒 (袋)</option>
                </select>
                <span className="material-symbols-outlined text-[18px] text-[#6f7975] absolute right-2.5 top-3 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] text-[#6f7975] font-medium">
                单次用量 <span className="text-[#00685d] font-normal">(自主输入)</span>
              </label>
              <input
                type="text"
                id="dosage-input"
                value={dosageText}
                onChange={(e) => setDosageText(e.target.value)}
                placeholder="如: 1片 / 0.75片 / 1支 / 0.5支"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[#131e1a] text-[13px] font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00685d] transition-all"
              />
            </div>
          </div>

          {/* 快捷用量提示标签 */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] text-[#6f7975]">快捷填入：</span>
            {['1片', '0.5片', '0.75片', '2片', '1支', '0.5支', '1袋', '1粒'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setDosageText(val)}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  dosageText === val
                    ? 'bg-[#00685d] text-white border-[#00685d]'
                    : 'bg-[#f0fcf5] text-[#3e4946] border-[#00685d]/10 hover:bg-[#e5f1ea]'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </section>

        {/* 3. 疗程与截止日期 (已移除第二图周期切换、第三图日历窗) */}
        <section className="p-4 rounded-2xl bg-white shadow-sm border border-[#00685d]/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#9af3e3]/40 flex items-center justify-center text-[#00685d]">
                <span className="material-symbols-outlined text-[18px]">event_repeat</span>
              </div>
              <h2 className="text-[16px] font-bold text-[#131e1a]">疗程与截止日期</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00685d] animate-pulse"></span>
              <span className="text-[11px] text-[#00685d] font-bold">
                {courseDuration === '自定义' ? `自定义至 ${customEndDate}` : courseDuration}
              </span>
            </div>
          </div>

          {/* 疗程选项 */}
          <div className="grid grid-cols-4 gap-2">
            {['长期服用', '7天疗程', '14天疗程', '自定义'].map((opt) => (
              <button
                key={opt}
                type="button"
                id={`duration-opt-${opt}`}
                onClick={() => setCourseDuration(opt)}
                className={`py-2 px-2 rounded-xl text-[12px] text-center font-semibold transition-all cursor-pointer ${
                  courseDuration === opt
                    ? 'bg-[#00685d] text-white shadow-xs'
                    : 'bg-[#f0fcf5] text-[#3e4946] border border-[#00685d]/10 hover:bg-[#e5f1ea]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* 自定义疗程展开面板 */}
          {courseDuration === '自定义' && (
            <div className="p-3.5 rounded-xl bg-[#f0fcf5] border border-[#00685d]/20 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#131e1a] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#00685d]">
                    date_range
                  </span>
                  设置自定义截止日期与天数
                </span>
                <span className="text-[11px] text-[#00685d]">
                  已按需启用
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#6f7975]">服药天数 (天)</label>
                  <input
                    type="number"
                    min="1"
                    value={customDays}
                    onChange={(e) => {
                      const days = parseInt(e.target.value) || 1;
                      setCustomDays(e.target.value);
                      const d = new Date();
                      d.setDate(d.getDate() + days);
                      setCustomEndDate(d.toISOString().split('T')[0]);
                    }}
                    placeholder="如: 30"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#00685d]/20 text-[12px] text-[#131e1a] focus:outline-none focus:ring-1 focus:ring-[#00685d]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[#6f7975]">指定截止日期</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg bg-white border border-[#00685d]/20 text-[12px] text-[#131e1a] focus:outline-none focus:ring-1 focus:ring-[#00685d]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {['21天', '30天', '60天', '90天'].map((dText) => {
                  const num = parseInt(dText);
                  return (
                    <button
                      key={dText}
                      type="button"
                      onClick={() => {
                        setCustomDays(String(num));
                        const d = new Date();
                        d.setDate(d.getDate() + num);
                        setCustomEndDate(d.toISOString().split('T')[0]);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-[#00685d]/20 text-[#00685d] font-semibold hover:bg-[#e5f1ea] transition-colors cursor-pointer"
                    >
                      {dText}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* 4. 频次与闹钟提醒 (支持点击添加服药提醒时间) */}
        <section className="p-4 rounded-2xl bg-white shadow-sm border border-[#00685d]/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#9af3e3]/40 flex items-center justify-center text-[#00685d]">
                <span className="material-symbols-outlined text-[18px]">alarm</span>
              </div>
              <h2 className="text-[16px] font-bold text-[#131e1a]">频次与闹钟提醒</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#9af3e3]/50 text-[#005047] text-[11px] font-bold">
              共 {reminderSlots.length} 个提醒点
            </span>
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <label className="text-[12px] text-[#6f7975] font-medium">服药频次</label>
            <div className="grid grid-cols-3 gap-2">
              {['每日 1 次', '每日 2 次', '每日 3 次'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFrequency(f);
                    if (f === '每日 2 次' && reminderSlots.length < 2) {
                      setReminderSlots([
                        { id: '1', time: '08:00', enabled: true },
                        { id: '2', time: '19:00', enabled: true },
                      ]);
                    } else if (f === '每日 3 次' && reminderSlots.length < 3) {
                      setReminderSlots([
                        { id: '1', time: '08:00', enabled: true },
                        { id: '2', time: '12:30', enabled: true },
                        { id: '3', time: '19:00', enabled: true },
                      ]);
                    }
                  }}
                  className={`py-2 rounded-xl text-[12px] font-semibold text-center transition-all cursor-pointer ${
                    frequency === f
                      ? 'bg-[#00685d] text-white shadow-xs'
                      : 'bg-[#f0fcf5] text-[#3e4946] border border-[#00685d]/10 hover:bg-[#e5f1ea]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between px-1 pt-0.5 text-[11px] text-[#6f7975]">
              <span>更多特殊频次：</span>
              <div className="flex items-center gap-3">
                <span
                  onClick={() => setFrequency('隔日 1 次')}
                  className="text-[#00685d] hover:underline cursor-pointer font-medium"
                >
                  隔日 1 次
                </span>
                <span
                  onClick={() => setFrequency('每周固定日')}
                  className="text-[#00685d] hover:underline cursor-pointer font-medium"
                >
                  每周固定日
                </span>
              </div>
            </div>
          </div>

          {/* Reminder Time Slots List */}
          <div className="space-y-2">
            <label className="text-[12px] text-[#6f7975] font-medium">设定服药提醒时间点</label>

            <div className="space-y-2.5">
              {reminderSlots.map((slot, index) => {
                const [hour = '08', minute = '00'] = slot.time.split(':');
                return (
                  <div
                    key={slot.id}
                    className={`rounded-2xl border p-3.5 transition-opacity ${
                      slot.enabled
                        ? 'bg-white border-[#00685d]/15 shadow-sm'
                        : 'bg-[#f0fcf5] border-[#00685d]/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#e5f1ea] text-[#00685d] text-[11px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-[13px] font-semibold text-[#131e1a]">服药提醒</span>
                        <span className="text-[11px] text-[#6f7975]">24小时制 · 5分钟一档</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleReminderSlot(slot.id)}
                          className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                            slot.enabled ? 'bg-[#00685d] justify-end' : 'bg-[#c4c7c4] justify-start'
                          }`}
                          aria-label={slot.enabled ? '关闭提醒' : '开启提醒'}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                        </button>
                        {reminderSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveReminderSlot(slot.id)}
                            title="删除此提醒点"
                            className="w-7 h-7 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 py-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-[#6f7975] tracking-wide">
                          时
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => bumpReminderPart(slot.id, 'hour', -1)}
                            className="w-9 h-9 rounded-xl bg-[#f0fcf5] border border-[#00685d]/15 text-[#00685d] flex items-center justify-center hover:bg-[#e5f1ea] active:scale-95 transition-all cursor-pointer"
                            aria-label="减少小时"
                          >
                            <span className="material-symbols-outlined text-[20px]">remove</span>
                          </button>
                          <span className="w-12 text-center text-[28px] leading-none font-extrabold text-[#131e1a] font-['Plus_Jakarta_Sans'] tabular-nums">
                            {hour.padStart(2, '0')}
                          </span>
                          <button
                            type="button"
                            onClick={() => bumpReminderPart(slot.id, 'hour', 1)}
                            className="w-9 h-9 rounded-xl bg-[#f0fcf5] border border-[#00685d]/15 text-[#00685d] flex items-center justify-center hover:bg-[#e5f1ea] active:scale-95 transition-all cursor-pointer"
                            aria-label="增加小时"
                          >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                          </button>
                        </div>
                      </div>

                      <span className="text-[28px] font-extrabold text-[#00685d]/40 pt-4">:</span>

                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-[#6f7975] tracking-wide">
                          分
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => bumpReminderPart(slot.id, 'minute', -1)}
                            className="w-9 h-9 rounded-xl bg-[#f0fcf5] border border-[#00685d]/15 text-[#00685d] flex items-center justify-center hover:bg-[#e5f1ea] active:scale-95 transition-all cursor-pointer"
                            aria-label="减少分钟"
                          >
                            <span className="material-symbols-outlined text-[20px]">remove</span>
                          </button>
                          <span className="w-12 text-center text-[28px] leading-none font-extrabold text-[#131e1a] font-['Plus_Jakarta_Sans'] tabular-nums">
                            {minute.padStart(2, '0')}
                          </span>
                          <button
                            type="button"
                            onClick={() => bumpReminderPart(slot.id, 'minute', 1)}
                            className="w-9 h-9 rounded-xl bg-[#f0fcf5] border border-[#00685d]/15 text-[#00685d] flex items-center justify-center hover:bg-[#e5f1ea] active:scale-95 transition-all cursor-pointer"
                            aria-label="增加分钟"
                          >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-[#6f7975]">
                        每次 {dosageText || '1片'} · {mealTiming}
                      </span>
                      <div className="flex gap-1.5">
                        {['08:00', '12:30', '19:00', '21:30'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() =>
                              setReminderSlots((prev) =>
                                prev.map((s) => (s.id === slot.id ? { ...s, time: t } : s))
                              )
                            }
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                              slot.time === t
                                ? 'bg-[#00685d] text-white'
                                : 'bg-[#f0fcf5] text-[#00685d] hover:bg-[#e5f1ea]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              id="add-reminder-time-btn"
              onClick={handleAddReminderSlot}
              className="w-full py-2.5 rounded-xl bg-[#f0fcf5] hover:bg-[#e5f1ea] text-[#00685d] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-dashed border-[#00685d]/30 cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">add_alarm</span>
              <span>添加服药提醒时间</span>
            </button>
          </div>

          {/* Meal Timing */}
          <div className="space-y-1.5">
            <label className="text-[12px] text-[#6f7975] font-medium">就餐关联时机</label>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {['餐前空腹', '随餐服用', '餐后半小时', '睡前服用'].map((timing) => (
                <button
                  key={timing}
                  type="button"
                  onClick={() => setMealTiming(timing)}
                  className={`py-2 px-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    mealTiming === timing
                      ? 'bg-[#00685d] text-white font-bold shadow-xs'
                      : 'bg-[#f0fcf5] text-[#3e4946] border border-[#00685d]/10 hover:bg-[#e5f1ea]'
                  }`}
                >
                  {timing}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor's special notes */}
          <div className="space-y-1">
            <label className="text-[12px] text-[#6f7975] font-medium">特别备忘 / 遵医用药嘱咐</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例：温开水送服，服药期间避免饮用西柚汁"
              className="w-full h-11 px-3.5 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[#131e1a] text-[12px] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00685d]"
            />
          </div>
        </section>

        {/* 5. Save & Activate Button */}
        <div className="pt-2 space-y-2">
          <button
            type="submit"
            id="save-medication-btn"
            className="w-full h-14 rounded-2xl bg-[#00685d] hover:bg-[#005047] text-white text-[16px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer font-['Plus_Jakarta_Sans']"
          >
            <span className="material-symbols-outlined text-[24px]">health_and_safety</span>
            <span>保存并开启用药提醒</span>
          </button>
          <p className="text-center text-[11px] text-[#6f7975]">
            提醒将同步至健康助手日常待办与专属语音提醒
          </p>
        </div>
      </form>
    </div>
  );
};
