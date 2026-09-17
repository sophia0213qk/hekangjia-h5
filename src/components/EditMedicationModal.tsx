import React, { useState, useEffect } from 'react';
import { Medication } from '../types';

interface EditMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: Medication | null;
  onSave: (updatedMedication: Medication) => void;
  onDelete?: (medicationId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const EditMedicationModal: React.FC<EditMedicationModalProps> = ({
  isOpen,
  onClose,
  medication,
  onSave,
  onDelete,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1片');
  const [dosageForm, setDosageForm] = useState('片剂');
  const [frequency, setFrequency] = useState('每日 1 次');
  const [mealTiming, setMealTiming] = useState('饭后 30 分钟');
  const [timeSlot, setTimeSlot] = useState('08:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [stockCurrent, setStockCurrent] = useState(30);
  const [stockWarning, setStockWarning] = useState(7);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (medication) {
      setName(medication.name || '');
      setDosage(medication.dosage || '1片');
      setDosageForm(medication.dosageForm || '片剂');
      setFrequency(medication.frequency || '每日 1 次');
      setMealTiming(medication.mealTiming || '饭后 30 分钟');
      setTimeSlot(medication.timeSlot || '08:00');
      setReminderEnabled(true);
      setStockCurrent(medication.stockCurrent || 30);
      setStockWarning(medication.stockWarning || 7);
      setNotes(medication.notes || '');
      setTags(medication.tags || []);
      setShowDeleteConfirm(false);
    }
  }, [medication, isOpen]);

  if (!isOpen || !medication) return null;

  // Calculate remaining days
  const doseNumber = parseInt(dosage.replace(/[^0-9]/g, '')) || 1;
  const freqMultiplier = frequency.includes('3') ? 3 : frequency.includes('2') ? 2 : 1;
  const dailyTotal = doseNumber * freqMultiplier;
  const calculatedDays = Math.max(1, Math.floor(stockCurrent / Math.max(1, dailyTotal)));

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const val = newTagInput.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setNewTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      if (onShowToast) onShowToast('请填写药品名称');
      return;
    }

    const updated: Medication = {
      ...medication,
      name: name.trim(),
      dosage,
      dosageForm,
      frequency,
      mealTiming,
      timeSlot,
      timeLabel: `${timeSlot} · ${mealTiming}`,
      stockCurrent: Number(stockCurrent),
      stockWarning: Number(stockWarning),
      remainingDays: calculatedDays,
      notes: notes.trim(),
      tags,
    };

    onSave(updated);
    if (onShowToast) onShowToast(`已更新【${updated.name}】的用药与提醒设置`);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && medication) {
      onDelete(medication.id);
      if (onShowToast) onShowToast(`已移出药品【${medication.name}】`);
      onClose();
    }
  };

  const commonTags = ['高血压', '高血脂', '降血糖', '心血管', '抗生素', '日常调理', '骨质疏松'];

  return (
    <div
      id="edit-medication-modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#00685d]/15 max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#00685d]/10 flex items-center justify-between bg-linear-to-r from-[#f0fcf5] to-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00685d]/10 text-[#00685d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">medication</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
                  修改用药与提醒
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00685d]/10 text-[#00685d] font-bold">
                  {medication.memberName}
                </span>
              </div>
              <p className="text-[12px] text-[#6f7975] mt-0.5">
                调整服药时间、单次用量、餐食时机与药品库存
              </p>
            </div>
          </div>

          <button
            id="close-edit-med-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6f7975] hover:bg-[#f0fcf5] hover:text-[#131e1a] transition"
            aria-label="关闭"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Drug Name & Form */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[12px] font-bold text-[#131e1a] mb-1">
                药品名称 *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：苯磺酸氨氯地平片 (络活喜)"
                className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[13px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#131e1a] mb-1">
                剂型
              </label>
              <select
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value)}
                className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2.5 py-2 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              >
                <option value="片剂">片剂</option>
                <option value="胶囊">胶囊</option>
                <option value="口服液">口服液</option>
                <option value="冲剂/颗粒">颗粒</option>
                <option value="滴眼液">滴眼液</option>
                <option value="外用药膏">药膏</option>
              </select>
            </div>
          </div>

          {/* Dosage & Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                单次用量
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="如：1片、2粒、5mg/次"
                className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[13px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                服药频次
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2.5 py-2 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              >
                <option value="每日 1 次">每日 1 次</option>
                <option value="每日 2 次">每日 2 次</option>
                <option value="每日 3 次">每日 3 次</option>
                <option value="隔日 1 次">隔日 1 次</option>
                <option value="必要时服用">必要时服用</option>
              </select>
            </div>
          </div>

          {/* Timing & Reminder Section */}
          <div className="bg-[#f0fcf5] p-3.5 rounded-2xl border border-[#00685d]/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685d] text-[18px]">
                  alarm
                </span>
                <span className="text-[13px] font-bold text-[#131e1a]">
                  服药提醒与时机设置
                </span>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="rounded text-[#00685d] focus:ring-[#00685d] w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-[#00685d]">
                  {reminderEnabled ? '提醒已开启' : '关闭提醒'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#6f7975] mb-1">
                  每日服药时间点
                </label>
                <input
                  type="time"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-1.5 text-[13px] font-bold text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6f7975] mb-1">
                  服药与餐食关系
                </label>
                <select
                  value={mealTiming}
                  onChange={(e) => setMealTiming(e.target.value)}
                  className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2.5 py-1.5 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                >
                  <option value="饭后 30 分钟">饭后 30 分钟</option>
                  <option value="饭前半小时">饭前半小时</option>
                  <option value="随餐服用">随餐服用</option>
                  <option value="晨起空腹">晨起空腹</option>
                  <option value="睡前半小时">睡前半小时</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] text-[#6f7975] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#00685d]">
                notifications_active
              </span>
              <span>到点将自动在家庭健康守护屏弹窗并语音播报</span>
            </div>
          </div>

          {/* Stock & Warning */}
          <div className="bg-[#f8f9ff] p-3.5 rounded-2xl border border-[#00685d]/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#131e1a]">药品库存与续药提醒</span>
              <span className="text-[11px] font-semibold text-[#00685d]">
                预估可服约 {calculatedDays} 天
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#6f7975] mb-0.5">
                  当前药品存量 (粒/片)
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={stockCurrent}
                  onChange={(e) => setStockCurrent(Number(e.target.value))}
                  className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-1.5 text-[13px] font-bold text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#6f7975] mb-0.5">
                  低库存预警阈值 (小于此天数提醒)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={stockWarning}
                  onChange={(e) => setStockWarning(Number(e.target.value))}
                  className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-1.5 text-[13px] font-bold text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                />
              </div>
            </div>
          </div>

          {/* Doctor Advice / Notes */}
          <div>
            <label className="block text-[12px] font-bold text-[#131e1a] mb-1">
              医嘱备忘与注意事项
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="如：温开水送服，服药期间避免饮用西柚汁..."
              className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#3e4946]">
              关联疾病与调理标签
            </label>
            <div className="flex flex-wrap gap-1">
              {commonTags.map((tag) => {
                const isSel = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`text-[11px] px-2 py-0.5 rounded-md transition cursor-pointer ${
                      isSel
                        ? 'bg-[#00685d] text-white font-medium'
                        : 'bg-[#f0fcf5] text-[#3e4946] border border-[#00685d]/15 hover:bg-[#e0f7ef]'
                    }`}
                  >
                    {isSel ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3 border-t border-[#00685d]/10 bg-[#f0fcf5]/60 flex items-center justify-between shrink-0">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-[#a7391e] font-medium">确认停药移出？</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2 py-1 bg-[#a7391e] text-white text-[11px] rounded-lg font-semibold hover:bg-[#852a14]"
                >
                  确认
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-[11px] text-[#6f7975] hover:underline"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-[12px] text-[#a7391e] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
                停用此药
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] text-[#6f7975] hover:bg-[#e5f1ea] transition"
            >
              取消
            </button>
            <button
              id="save-medication-btn"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-[#00685d] text-white shadow-sm hover:bg-[#005249] transition active:scale-95 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
