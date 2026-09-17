import React, { useEffect, useState } from 'react';
import { FamilyMember, MedicalRecord } from '../types';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onAddRecord: (record: MedicalRecord) => void | Promise<void>;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatDisplayDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${y}年${m}月${d}日`;
};

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddRecord,
}) => {
  const [memberId, setMemberId] = useState('');
  const [hospital, setHospital] = useState('四川大学华西医院');
  const [department, setDepartment] = useState('心血管内科');
  const [date, setDate] = useState(todayIso());
  const [doctor, setDoctor] = useState('门诊复查 · 主任医师');
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [orders, setOrders] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSaving(false);
    setDate(todayIso());
    setComplaint('');
    setDiagnosis('');
    setOrders('');
    if (members[0]?.id) setMemberId(members[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!memberId && members[0]?.id) setMemberId(members[0].id);
  }, [members, memberId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!memberId || !members.some((m) => m.id === memberId)) {
      setError('请选择就诊人');
      return;
    }
    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      memberId,
      hospital: hospital.trim() || '社区医院',
      department: department.trim() || '全科门诊',
      date: formatDisplayDate(date) || date,
      doctor: doctor.trim() || '门诊医师',
      status: '已完成复诊',
      complaint: complaint.trim() || '常规复诊检查',
      diagnosis: diagnosis.trim() || '慢病稳定调理期',
      orders: orders.trim() || '遵医用药，定期自测体征，适度运动。',
    };

    setSaving(true);
    try {
      await onAddRecord(newRecord);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#00685d]/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685d] text-[22px]">
              note_add
            </span>
            <h3 className="text-[17px] font-bold text-[#131e1a]">录入就诊与复查记录</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[12px] text-[#6f7975] font-medium">就诊人</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none"
            >
              {members.length === 0 ? (
                <option value="">暂无家庭成员</option>
              ) : (
                members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nickname} · {m.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] text-[#6f7975] font-medium">就诊医院</label>
              <input
                type="text"
                required
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] text-[#6f7975] font-medium">科室</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] text-[#6f7975] font-medium">就诊日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] text-[#6f7975] font-medium">接诊医生/职称</label>
              <input
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[12px] text-[#6f7975] font-medium">患者主诉</label>
            <input
              type="text"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="例：晨起轻度血压波动，偶感头昏"
              className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] text-[#6f7975] font-medium">医生诊断</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="例：原发性高血压2级 靶器官稳定"
              className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] text-[#6f7975] font-medium">治疗意见与医嘱</label>
            <textarea
              rows={2}
              value={orders}
              onChange={(e) => setOrders(e.target.value)}
              placeholder="例：继续每日晨起温水送服络活喜；严格低钠饮食。"
              className="w-full p-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none"
            />
          </div>

          {error ? (
            <p className="text-[12px] text-[#a7391e] bg-[#fdecea] rounded-xl px-3 py-2">{error}</p>
          ) : null}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#f0fcf5] text-[#3e4946] font-semibold text-[14px]"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving || members.length === 0}
              className="flex-1 py-3 rounded-xl bg-[#00685d] hover:bg-[#005047] text-white font-bold text-[14px] shadow-md active:scale-95 transition-all disabled:opacity-60"
            >
              {saving ? '保存中…' : '保存记录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
