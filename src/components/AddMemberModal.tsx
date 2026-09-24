import React, { useRef, useState } from 'react';
import { FamilyMember } from '../types';
import { api } from '../api/client';
import { DEFAULT_AVATAR, resolveAvatar } from '../utils/avatar';
import { MemberAvatar } from './MemberAvatar';

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
  const [relation, setRelation] = useState('父亲');
  const [age, setAge] = useState(70);
  const [bloodType, setBloodType] = useState('O型 (Rh阳性)');
  const [chronic, setChronic] = useState('日常保健');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    setUploading(true);
    try {
      const res = await api.uploadAvatar(file);
      setSelectedAvatar(res.url);
    } catch {
      /* toast not wired here */
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `member-${Date.now()}`;
    const newMember: FamilyMember = {
      id,
      name: name.trim() || relation,
      nickname: relation,
      relation,
      age: Number(age) || 60,
      avatar: resolveAvatar(selectedAvatar),
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
          diastolic: 80,
          changeText: '暂无',
          status: '待录入',
          history: [],
          measuredAt: '暂无',
        },
      },
    };

    onAddMember(newMember);
    setName('');
    setSelectedAvatar(DEFAULT_AVATAR);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#00685d]/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685d] text-[22px]">
              person_add
            </span>
            <h3 className="text-[17px] font-bold text-[#131e1a]">添加家庭成员档案</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[12px] text-[#6f7975] font-medium">成员头像</label>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <MemberAvatar
                  src={selectedAvatar}
                  alt="头像预览"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#00685d]/20"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00685d] text-white flex items-center justify-center shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    void handleAvatarFile(e.target.files?.[0] || null);
                    e.target.value = '';
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[12px] font-semibold text-[#00685d] hover:underline text-left"
                >
                  {uploading ? '上传中…' : '上传照片'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAvatar(DEFAULT_AVATAR)}
                  className="text-[11px] text-[#6f7975] hover:underline text-left"
                >
                  使用默认头像
                </button>
              </div>
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
                <option value="父亲">父亲</option>
                <option value="母亲">母亲</option>
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
            <label className="text-[12px] text-[#6f7975] font-medium">健康关注点</label>
            <input
              type="text"
              value={chronic}
              onChange={(e) => setChronic(e.target.value)}
              placeholder="如：高血压随访"
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
              className="flex-1 py-3 rounded-xl bg-[#00685d] hover:bg-[#005047] text-white font-bold text-[14px] shadow-md"
            >
              创建健康档案
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
