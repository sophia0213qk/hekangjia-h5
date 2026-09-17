import React, { useState } from 'react';
import { FamilyMember, Medication, MedicalRecord } from '../types';

interface ExportBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
  medications: Medication[];
  records: MedicalRecord[];
}

export const ExportBriefModal: React.FC<ExportBriefModalProps> = ({
  isOpen,
  onClose,
  member,
  medications,
  records,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const memberMeds = medications.filter((m) => m.memberId === member.id);
  const memberRecords = records.filter((r) => r.memberId === member.id);

  const handleCopySummary = () => {
    const text = `【禾康家 · 门诊就医健康简报】\n患者：${member.name} (${member.relation}，${member.age}岁)\n血型：${member.bloodType} | 身高：${member.height}cm | 体重：${member.weight}kg | BMI：${member.bmi}\n慢病关注：${member.chronicConditions?.join('、') || '无'}\n药物过敏：${member.allergies?.join('、') || '无'}\n近期体征：血压 ${member.vitals.bloodPressure.systolic}/${member.vitals.bloodPressure.diastolic} mmHg，空腹血糖 ${member.vitals.bloodSugar?.value || 5.6} mmol/L，心率 ${member.vitals.heartRate?.value || 72} bpm\n当前服药：${memberMeds.map((m) => `${m.name} (${m.dosage}，${m.frequency})`).join('；')}\n最近复查：${memberRecords[0]?.hospital || '华西医院'} (${memberRecords[0]?.diagnosis || '高血压2级'})`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#00685d]/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685d] text-[22px]">
              local_hospital
            </span>
            <h3 className="text-[17px] font-bold text-[#131e1a]">门诊就医健康简报</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Printable Card Container */}
        <div
          id="printable-brief-card"
          className="p-4 rounded-2xl bg-[#f8f9ff] border-2 border-[#00685d]/20 space-y-3 font-sans"
        >
          {/* Top Stamp & Member */}
          <div className="flex items-center justify-between border-b border-[#00685d]/10 pb-2.5">
            <div className="flex items-center gap-2.5">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00685d]/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[18px] font-bold text-[#131e1a]">{member.name}</h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#005047]">
                    {member.relation} · {member.age}岁
                  </span>
                </div>
                <span className="text-[10px] text-[#6f7975]">
                  家庭健康档案编号：HK-{member.id.toUpperCase()}-2025
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] bg-[#9af3e3]/60 text-[#005047] font-bold px-2 py-0.5 rounded-full">
                状态安好
              </span>
              <span className="block text-[10px] text-[#6f7975] mt-1">禾康家云端认证</span>
            </div>
          </div>

          {/* Quick Vitals Snapshot */}
          <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-xl bg-white border border-[#00685d]/10">
            <div>
              <span className="text-[10px] text-[#6f7975] block">自测血压</span>
              <span className="text-[14px] font-extrabold text-[#131e1a] block">
                {member.vitals.bloodPressure.systolic}/{member.vitals.bloodPressure.diastolic}
              </span>
              <span className="text-[9px] text-[#00685d] font-semibold">mmHg · 稳定</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6f7975] block">空腹血糖</span>
              <span className="text-[14px] font-extrabold text-[#131e1a] block">
                {member.vitals.bloodSugar?.value || 5.8}
              </span>
              <span className="text-[9px] text-[#00685d] font-semibold">mmol/L · 达标</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6f7975] block">静息心率</span>
              <span className="text-[14px] font-extrabold text-[#131e1a] block">
                {member.vitals.heartRate?.value || 72}
              </span>
              <span className="text-[9px] text-[#00685d] font-semibold">bpm · 窦性</span>
            </div>
          </div>

          {/* Chronic conditions & Allergies */}
          <div className="space-y-1 text-[12px]">
            <div className="flex items-center gap-1.5">
              <strong className="text-[#131e1a]">慢病诊断：</strong>
              <span className="text-[#3e4946]">
                {member.chronicConditions?.join('，') || '无已知慢性病'}
              </span>
            </div>
            {member.allergies && member.allergies.length > 0 && (
              <div className="flex items-center gap-1.5 text-[#a7391e]">
                <strong className="text-[#a7391e]">过敏史：</strong>
                <span>{member.allergies.join('，')}</span>
              </div>
            )}
          </div>

          {/* Current medications */}
          <div className="p-2.5 rounded-xl bg-white border border-[#00685d]/10 space-y-1">
            <span className="text-[11px] font-bold text-[#131e1a] block">
              当前正在服用药物清单 ({memberMeds.length}项)
            </span>
            <div className="space-y-1">
              {memberMeds.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#131e1a]">· {m.name}</span>
                  <span className="text-[#6f7975]">
                    {m.dosage} · {m.frequency} ({m.mealTiming})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Consultation Note */}
          {memberRecords[0] && (
            <div className="text-[11px] text-[#3e4946] space-y-0.5 p-2 rounded-xl bg-white border border-[#00685d]/10">
              <span className="font-bold text-[#131e1a] block">
                最近一次复诊记录 ({memberRecords[0].date})
              </span>
              <p>
                <strong>医院：</strong> {memberRecords[0].hospital} · {memberRecords[0].department}
              </p>
              <p>
                <strong>诊断：</strong> {memberRecords[0].diagnosis}
              </p>
            </div>
          )}

          {/* Bottom sharing footer with QR Code */}
          <div className="pt-2 border-t border-[#00685d]/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#00685d]">
                禾康家 · 守护三代人的温润生活
              </span>
              <span className="text-[10px] text-[#6f7975]">
                就诊时出示本页，医生扫码即可浏览历史动态心电与化验单
              </span>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg border border-[#00685d]/20 p-1 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px] text-[#00685d]">
                qr_code_2
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex-1 py-2.5 rounded-xl bg-[#f0fcf5] text-[#00685d] border border-[#00685d]/20 font-bold text-[13px] flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'done' : 'content_copy'}
            </span>
            <span>{copied ? '已复制文本摘要' : '复制摘要'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.print?.();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#00685d] text-white font-bold text-[13px] shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>打印 / 存为 PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
