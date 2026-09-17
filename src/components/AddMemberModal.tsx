import React, { useState } from 'react';
import { FamilyMember } from '../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: FamilyMember) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
}) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('爷爷');
  const [age, setAge] = useState(70);
  const [bloodType, setBloodType] = useState('O型 (Rh阳性)');
  const [chronic, setChronic] = useState('日常保健');

  const presetAvatars = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBkrn2DPPgzH_zdwMQxmxE6aO4uURfcC5XgyW8_rqmwKdMzM06HQgbaFtegt72AwYlKbaukP5TMMCrl43BM9RFC7oMq4Yf6tmLfQ2pX2f1vyjWw1B--C-NQUq0BJooCIaERZEF1SUMaAY84gThV3iYPPvLn4OwJbHSAM_MzmAuWSv1e8O3NTGQyEtDMbKQOFSEiRAoeP97btMehF8VBOv8QtSAhDMFu9D4-gL3WvK3Nb-4zL0FB8BKW',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCYq4UYGd5L8c3JBWWI4edI0IS_ZoA00b2jwQ5gOs_Yo6JczXI7fZ_Tv0lKx6ku4ZyrQR_7yKoPx--Xkr_pwWmwafKYmt_Z1pdpd_xGvVEkP2cwZaUpnil6w5URUUdVLthJ8GzzGQKNaPOK95UDehmkrpFx6d2Pxz54bhYn7ENuj9rLwaK0eapajfx3sr0waQPkeSye2EWvt-_KjlCL6CTII4iXPn6FEIefoHADHgjnRxwYR1skVTha',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDb-BMZuVkNnSEQssndoVQQ7ywhmIRyl92ccYbP5dlOFdk_UoDXgZjfSfCGeX9T4PY6SqK0exPqV7YGu6gw2spqYsDpgHWzwh4ZAx3Kx78p4eXw_TUUKXb6psqkxV-vxsZUXKVCHo2O1764irDJyuhAPYVWEE7MWqM3XNkFWdZK2SMNqfXYEG-qBdJTcfwRWBJl47GV4oQdYJEKc4cmqFwtX-VLWveFfRMzUMePEUb4Ql8sAYfPqGd4',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDdnHOB85D706fuxxTKIPrqi61aOuPoV_2OOBsn762sED2uz7p5H6GtSN3tUJNTfP1cIltDq04TgA-UjuK8m_BW1rBFgVE7PisszZJ0cJuutzNPZStv03LTseoEj5ihIr3gUuCNfbROSMt4Rk9GZ9AoBFh8THNgYCeTiW8JFD6lkN4erchXOQIizRiAc424RbL9KF2IWcri7_r-vfoGzdCSwxmgImRRgUrlpToczxRI-BuE2EKOfOAi',
  ];
  const [selectedAvatar, setSelectedAvatar] = useState(presetAvatars[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `member-${Date.now()}`;
    const newMember: FamilyMember = {
      id,
      name: name.trim() || relation,
      nickname: relation,
      relation,
      age: Number(age) || 60,
      avatar: selectedAvatar,
      statusText: chronic || '健康稳定',
      statusType: 'normal',
      pendingTodos: 0,
      bloodType,
      height: 168,
      weight: 62,
      bmi: 22.0,
      bmiStatus: '正常',
      chronicConditions: chronic ? [chronic] : [],
      vitals: {
        bloodPressure: {
          systolic: 120,
          diastolic: 78,
          changeText: '标准',
          status: '稳态正常',
          history: [122, 120, 118, 122, 120, 119, 120],
          measuredAt: '刚刚录入',
        },
        bloodSugar: {
          value: 5.4,
          unit: 'mmol/L',
          status: '平稳',
          timing: '餐前',
        },
        heartRate: {
          value: 70,
          unit: '次/分',
          status: '平稳',
          rhythm: '窦性',
        },
      },
    };

    onAddMember(newMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#00685d]/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685d] text-[22px]">
              group_add
            </span>
            <h3 className="text-[17px] font-bold text-[#131e1a]">添加家庭成员档案</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Avatar selector */}
          <div className="space-y-1.5">
            <label className="text-[12px] text-[#6f7975] font-medium">选择形象头像</label>
            <div className="flex items-center gap-3">
              {presetAvatars.map((av, idx) => (
                <img
                  key={idx}
                  src={av}
                  alt={`Avatar ${idx}`}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-12 h-12 rounded-full object-cover cursor-pointer transition-all ${
                    selectedAvatar === av
                      ? 'ring-4 ring-[#00685d] scale-105 shadow-md'
                      : 'opacity-70 hover:opacity-100 ring-1 ring-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] text-[#6f7975] font-medium">称谓 / 角色</label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none focus:bg-white"
              >
                <option value="爷爷">爷爷</option>
                <option value="奶奶">奶奶</option>
                <option value="外公">外公</option>
                <option value="外婆">外婆</option>
                <option value="配偶">配偶</option>
                <option value="女儿">女儿</option>
                <option value="儿子">儿子</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] text-[#6f7975] font-medium">姓名</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：陈德清"
                className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] text-[#6f7975] font-medium">年龄</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] text-[#6f7975] font-medium">血型</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none focus:bg-white"
              >
                <option value="A型 (Rh阳性)">A型 (Rh阳性)</option>
                <option value="B型 (Rh阳性)">B型 (Rh阳性)</option>
                <option value="AB型 (Rh阳性)">AB型 (Rh阳性)</option>
                <option value="O型 (Rh阳性)">O型 (Rh阳性)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[12px] text-[#6f7975] font-medium">重点慢病或健康关怀关注</label>
            <input
              type="text"
              value={chronic}
              onChange={(e) => setChronic(e.target.value)}
              placeholder="例：高血压调理、痛风预防、关节养护"
              className="w-full h-11 px-3 rounded-xl bg-[#f0fcf5] border border-[#00685d]/10 text-[13px] font-medium focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[#f0fcf5] text-[#3e4946] font-semibold text-[14px]"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#00685d] hover:bg-[#005047] text-white font-bold text-[14px] shadow-md active:scale-95 transition-all"
            >
              创建健康档案
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
