import React, { useState, useEffect } from 'react';
import { FamilyMember } from '../types';

interface EditMemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
  onSave: (updatedMember: FamilyMember) => void;
  onShowToast?: (msg: string) => void;
}

export const EditMemberProfileModal: React.FC<EditMemberProfileModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  onShowToast,
}) => {
  const [name, setName] = useState(member.name);
  const [nickname, setNickname] = useState(member.nickname);
  const [relation, setRelation] = useState(member.relation);
  const [age, setAge] = useState(member.age);
  const [bloodType, setBloodType] = useState(member.bloodType);
  const [height, setHeight] = useState(member.height || 170);
  const [weight, setWeight] = useState(member.weight || 65);
  const [avatar, setAvatar] = useState(member.avatar);

  // Conditions and Allergies
  const [conditions, setConditions] = useState<string[]>(member.chronicConditions || []);
  const [newConditionInput, setNewConditionInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>(member.allergies || []);
  const [newAllergyInput, setNewAllergyInput] = useState('');

  useEffect(() => {
    setName(member.name);
    setNickname(member.nickname);
    setRelation(member.relation);
    setAge(member.age);
    setBloodType(member.bloodType);
    setHeight(member.height || 170);
    setWeight(member.weight || 65);
    setAvatar(member.avatar);
    setConditions(member.chronicConditions || []);
    setAllergies(member.allergies || []);
  }, [member, isOpen]);

  if (!isOpen) return null;

  // Calculate BMI
  const heightM = height / 100;
  const calculatedBmi = heightM > 0 ? Number((weight / (heightM * heightM)).toFixed(1)) : 22;
  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return '偏瘦';
    if (bmi < 24) return '正常标准';
    if (bmi < 28) return '轻微超重';
    return '肥胖预警';
  };

  const presetConditions = [
    '原发性高血压',
    '2型糖尿病',
    '高脂血症',
    '冠心病',
    '慢性支气管炎',
    '痛风',
    '脂肪肝',
    '骨质疏松',
    '颈椎病',
  ];

  const presetAllergies = [
    '无已知药物食物过敏',
    '青霉素类抗生素',
    '头孢类抗生素',
    '磺胺类药物',
    '阿司匹林',
    '海鲜及贝类',
    '花粉粉尘',
  ];

  const toggleConditionPreset = (item: string) => {
    if (conditions.includes(item)) {
      setConditions(conditions.filter((c) => c !== item));
    } else {
      setConditions([...conditions, item]);
    }
  };

  const handleAddCondition = () => {
    const val = newConditionInput.trim();
    if (val && !conditions.includes(val)) {
      setConditions([...conditions, val]);
      setNewConditionInput('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const toggleAllergyPreset = (item: string) => {
    if (item === '无已知药物食物过敏') {
      setAllergies(['无已知药物食物过敏']);
      return;
    }
    const clean = allergies.filter((a) => a !== '无已知药物食物过敏');
    if (clean.includes(item)) {
      setAllergies(clean.filter((a) => a !== item));
    } else {
      setAllergies([...clean, item]);
    }
  };

  const handleAddAllergy = () => {
    const val = newAllergyInput.trim();
    if (val) {
      const clean = allergies.filter((a) => a !== '无已知药物食物过敏');
      if (!clean.includes(val)) {
        setAllergies([...clean, val]);
        setNewAllergyInput('');
      }
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      if (onShowToast) onShowToast('请填写成员姓名');
      return;
    }

    const updatedMember: FamilyMember = {
      ...member,
      name: name.trim(),
      nickname: nickname.trim() || name.trim(),
      relation: relation.trim() || '家人',
      age: Number(age) || member.age,
      bloodType,
      height: Number(height),
      weight: Number(weight),
      bmi: calculatedBmi,
      bmiStatus: getBmiStatus(calculatedBmi),
      avatar,
      chronicConditions: conditions,
      allergies: allergies.length > 0 ? allergies : ['无已知过敏'],
    };

    onSave(updatedMember);
    if (onShowToast) onShowToast(`已成功保存【${updatedMember.name}】的健康档案`);
    onClose();
  };

  return (
    <div
      id="edit-member-modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#00685d]/15 max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#00685d]/10 flex items-center justify-between bg-linear-to-r from-[#f0fcf5] to-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00685d]/10 text-[#00685d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">edit_note</span>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
                编辑成员健康档案
              </h2>
              <p className="text-[12px] text-[#6f7975] mt-0.5">
                更新 {member.name} 的基本信息、身体指标与病史标签
              </p>
            </div>
          </div>

          <button
            id="close-edit-member-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6f7975] hover:bg-[#f0fcf5] hover:text-[#131e1a] transition"
            aria-label="关闭"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Member Card Preview with Avatar */}
          <div className="flex items-center gap-3.5 bg-[#f0fcf5] p-3.5 rounded-2xl border border-[#00685d]/15">
            <img
              src={avatar}
              alt={name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-[#00685d]/20 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-[#131e1a] truncate">
                  {name || '未命名'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00685d]/10 text-[#00685d] font-bold">
                  {relation} · {age}岁
                </span>
              </div>
              <p className="text-[11px] text-[#6f7975] mt-0.5">
                BMI: {calculatedBmi} ({getBmiStatus(calculatedBmi)}) · 血型: {bloodType}
              </p>
            </div>
          </div>

          {/* Name & Relation Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-[#131e1a] mb-1">
                姓名 *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：陈建国"
                className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[13px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#131e1a] mb-1">
                家庭称呼 / 昵称
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="如：爸爸、建国"
                className="w-full bg-white border border-[#00685d]/20 rounded-xl px-3 py-2 text-[13px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              />
            </div>
          </div>

          {/* Relation & Age & Blood Type */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                家庭关系
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2.5 py-2 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              >
                <option value="父亲">父亲</option>
                <option value="母亲">母亲</option>
                <option value="本人">本人</option>
                <option value="配偶">配偶</option>
                <option value="儿子">儿子</option>
                <option value="女儿">女儿</option>
                <option value="爷爷">爷爷</option>
                <option value="奶奶">奶奶</option>
                <option value="外公">外公</option>
                <option value="外婆">外婆</option>
                <option value="其他长辈">其他长辈</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                年龄 (周岁)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2.5 py-2 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3e4946] mb-1">
                血型
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2.5 py-2 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              >
                <option value="A型 (Rh阳性)">A型 (Rh+)</option>
                <option value="B型 (Rh阳性)">B型 (Rh+)</option>
                <option value="O型 (Rh阳性)">O型 (Rh+)</option>
                <option value="AB型 (Rh阳性)">AB型 (Rh+)</option>
                <option value="A型 (Rh阴性)">A型 (Rh-)</option>
                <option value="B型 (Rh阴性)">B型 (Rh-)</option>
                <option value="O型 (Rh阴性)">O型 (Rh-)</option>
                <option value="AB型 (Rh阴性)">AB型 (Rh-)</option>
                <option value="暂未检测">暂未检测</option>
              </select>
            </div>
          </div>

          {/* Height, Weight & Calculated BMI */}
          <div className="bg-[#f8f9ff] p-3 rounded-2xl border border-[#00685d]/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#131e1a]">身体形态指标</span>
              <span className="text-[11px] text-[#00685d] font-semibold">
                自动计算 BMI 指数
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <label className="block text-[10px] text-[#6f7975] mb-0.5">身高 (cm)</label>
                <input
                  type="number"
                  min="40"
                  max="230"
                  step="0.5"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2 py-1.5 text-[13px] text-center font-bold text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#6f7975] mb-0.5">体重 (kg)</label>
                <input
                  type="number"
                  min="2"
                  max="200"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-white border border-[#00685d]/20 rounded-xl px-2 py-1.5 text-[13px] text-center font-bold text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
                />
              </div>

              <div className="bg-white rounded-xl border border-[#00685d]/15 p-1.5 flex flex-col justify-center">
                <span className="text-[10px] text-[#6f7975]">体质指数 (BMI)</span>
                <span className="text-[13px] font-bold text-[#00685d]">
                  {calculatedBmi}{' '}
                  <span className="text-[10px] font-normal text-[#3e4946]">
                    ({getBmiStatus(calculatedBmi)})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#131e1a]">
              基础慢性病 / 慢病关注
            </label>
            <div className="flex flex-wrap gap-1.5">
              {conditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#e5eeff] text-[#005047] text-[11px] font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">monitor_heart</span>
                  <span>{cond}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(idx)}
                    className="hover:text-red-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Presets */}
            <div className="pt-1">
              <span className="text-[11px] text-[#6f7975] block mb-1">常用慢病选择：</span>
              <div className="flex flex-wrap gap-1">
                {presetConditions.map((pc) => {
                  const isSel = conditions.includes(pc);
                  return (
                    <button
                      key={pc}
                      type="button"
                      onClick={() => toggleConditionPreset(pc)}
                      className={`text-[11px] px-2 py-0.5 rounded-md transition cursor-pointer ${
                        isSel
                          ? 'bg-[#00685d] text-white font-medium'
                          : 'bg-[#f0fcf5] text-[#3e4946] border border-[#00685d]/15 hover:bg-[#e0f7ef]'
                      }`}
                    >
                      {isSel ? '✓ ' : '+ '}
                      {pc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                placeholder="输入其他基础病症..."
                value={newConditionInput}
                onChange={(e) => setNewConditionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCondition();
                  }
                }}
                className="flex-1 bg-white border border-[#00685d]/20 rounded-xl px-3 py-1.5 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="text-[12px] font-semibold px-3 py-1.5 bg-[#00685d]/10 text-[#00685d] rounded-xl hover:bg-[#00685d]/20"
              >
                添加
              </button>
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#131e1a]">
              药物与食物过敏史 (重要预警)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allergies.map((alg, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#ffdad2]/60 text-[#a7391e] text-[11px] font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  <span>{alg}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(idx)}
                    className="hover:text-red-700 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Allergy presets */}
            <div className="pt-1">
              <span className="text-[11px] text-[#6f7975] block mb-1">常用过敏源选择：</span>
              <div className="flex flex-wrap gap-1">
                {presetAllergies.map((pa) => {
                  const isSel = allergies.includes(pa);
                  return (
                    <button
                      key={pa}
                      type="button"
                      onClick={() => toggleAllergyPreset(pa)}
                      className={`text-[11px] px-2 py-0.5 rounded-md transition cursor-pointer ${
                        isSel
                          ? 'bg-[#a7391e] text-white font-medium'
                          : 'bg-[#fff5f3] text-[#a7391e] border border-[#a7391e]/20 hover:bg-[#ffdad2]'
                      }`}
                    >
                      {isSel ? '✓ ' : '+ '}
                      {pa}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Allergy Input */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                placeholder="输入其他过敏源..."
                value={newAllergyInput}
                onChange={(e) => setNewAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllergy();
                  }
                }}
                className="flex-1 bg-white border border-[#00685d]/20 rounded-xl px-3 py-1.5 text-[12px] text-[#131e1a] focus:outline-hidden focus:border-[#00685d]"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="text-[12px] font-semibold px-3 py-1.5 bg-[#a7391e]/10 text-[#a7391e] rounded-xl hover:bg-[#a7391e]/20"
              >
                添加
              </button>
            </div>
          </div>
        </form>

        {/* Modal Bottom Buttons */}
        <div className="px-5 py-3 border-t border-[#00685d]/10 bg-[#f0fcf5]/60 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] text-[#6f7975] hover:bg-[#e5f1ea] transition"
          >
            取消
          </button>
          <button
            id="save-member-profile-btn"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-[#00685d] text-white shadow-sm hover:bg-[#005249] transition active:scale-95 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            保存档案
          </button>
        </div>
      </div>
    </div>
  );
};
