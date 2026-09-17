import React from 'react';
import { FamilyMember } from '../types';

interface VitalsGridProps {
  members: FamilyMember[];
  onOpenDetails: (memberId: string) => void;
  onRecordVitals: () => void;
}

export const VitalsGrid: React.FC<VitalsGridProps> = ({
  members,
  onOpenDetails,
  onRecordVitals,
}) => {
  const father = members.find((m) => m.id === 'father');
  const son = members.find((m) => m.id === 'son');
  const wan = members.find((m) => m.id === 'wan');
  const mother = members.find((m) => m.id === 'mother');

  return (
    <section className="flex flex-col space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00685d] text-[20px]">
            favorite
          </span>
          <h2 className="text-[17px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
            家庭体征看板
          </h2>
        </div>
        <button
          onClick={() => onOpenDetails('father')}
          className="text-[12px] text-[#00685d] font-semibold flex items-center hover:underline"
        >
          全部数据
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Father's Blood Pressure */}
        <div
          onClick={() => onOpenDetails('father')}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#00685d]/10 flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#00685d]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00685d]"></span>
              <span className="text-[12px] text-[#6f7975] font-medium">父亲 · 血压</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#e5f1ea] flex items-center justify-center text-[#00685d] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[14px]">monitor_heart</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] leading-tight font-extrabold text-[#131e1a] tracking-tight font-['Plus_Jakarta_Sans']">
                {father?.vitals.bloodPressure.systolic || 124}/
                {father?.vitals.bloodPressure.diastolic || 82}
              </span>
              <span className="text-[11px] text-[#6f7975]">mmHg</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="bg-[#9af3e3]/60 text-[#005047] text-[11px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center">
                <span className="material-symbols-outlined text-[12px]">trending_down</span>
                {father?.vitals.bloodPressure.changeText || '-4 昨日'}
              </span>
              <span className="text-[11px] text-[#00685d] font-medium">
                {father?.vitals.bloodPressure.status || '稳态正常'}
              </span>
            </div>
          </div>

          {/* Inline Soft Spline SVG Trend */}
          <div className="w-full h-8 pt-1">
            <svg
              className="w-full h-full text-[#00685d]"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 100 24"
            >
              <path
                d="M0,18 Q18,6 35,14 T70,9 T100,12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
              <path
                d="M0,18 Q18,6 35,14 T70,9 T100,12 L100,24 L0,24 Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Son's Temperature */}
        <div
          onClick={() => onOpenDetails('son')}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#00685d]/10 flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#00685d]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#208275]"></span>
              <span className="text-[12px] text-[#6f7975] font-medium">睿睿 · 耳温</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#e5f1ea] flex items-center justify-center text-[#208275] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[14px]">device_thermostat</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] leading-tight font-extrabold text-[#131e1a] tracking-tight font-['Plus_Jakarta_Sans']">
                {son?.vitals.temperature?.value || 36.6}
              </span>
              <span className="text-[11px] text-[#6f7975]">℃</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="bg-[#e5eeff] text-[#3e4946] text-[11px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center">
                {son?.vitals.temperature?.timeAgo || '4小时前'}
              </span>
              <span className="text-[11px] text-[#00685d] font-medium">
                {son?.vitals.temperature?.status || '体温平稳'}
              </span>
            </div>
          </div>

          {/* Visual Thermometer Gauge Bar */}
          <div className="w-full flex flex-col space-y-1 pt-2">
            <div className="w-full h-2 rounded-full bg-[#e5f1ea] overflow-hidden flex">
              <div
                className="bg-[#00685d] h-full rounded-full transition-all duration-500"
                style={{ width: '55%' }}
              ></div>
            </div>
            <div className="flex justify-between text-[#6f7975] text-[10px]">
              <span>36.0°</span>
              <span className="text-[#a7391e] font-medium">37.2°警戒</span>
            </div>
          </div>
        </div>

        {/* Card 3: Lin Wan's Sleep Score */}
        <div
          onClick={() => onOpenDetails('wan')}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#00685d]/10 flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#00685d]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#208275]"></span>
              <span className="text-[12px] text-[#6f7975] font-medium">我 · 昨晚睡眠</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#208275] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[14px]">bedtime</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] leading-tight font-extrabold text-[#131e1a] tracking-tight font-['Plus_Jakarta_Sans']">
                {wan?.vitals.sleep?.score || 88}
              </span>
              <span className="text-[11px] text-[#6f7975]">分</span>
            </div>
            <p className="text-[11px] text-[#6f7975] mt-0.5 truncate">
              {wan?.vitals.sleep?.duration || '7小时42分'} · 深睡 {wan?.vitals.sleep?.deepSleep || '2h10m'}
            </p>
          </div>

          <div className="pt-1">
            <span className="w-full block py-1 text-center text-[11px] font-semibold rounded-lg bg-[#e5f1ea] text-[#00685d]">
              {wan?.vitals.sleep?.status || '精力恢复充沛'}
            </span>
          </div>
        </div>

        {/* Card 4: Mother's Fasting Glucose */}
        <div
          onClick={() => onOpenDetails('mother')}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#00685d]/10 flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#00685d]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#904800]"></span>
              <span className="text-[12px] text-[#6f7975] font-medium">母亲 · 空腹血糖</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#ffdcc5] flex items-center justify-center text-[#904800] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[14px]">opacity</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] leading-tight font-extrabold text-[#131e1a] tracking-tight font-['Plus_Jakarta_Sans']">
                {mother?.vitals.bloodSugar?.value || 5.6}
              </span>
              <span className="text-[11px] text-[#6f7975]">mmol/L</span>
            </div>
            <p className="text-[11px] text-[#6f7975] mt-0.5">
              标准范围 3.9 ~ 6.1
            </p>
          </div>

          <div className="pt-1">
            <span className="w-full block py-1 text-center text-[11px] font-semibold rounded-lg bg-[#9af3e3]/50 text-[#00685d]">
              {mother?.vitals.bloodSugar?.status || '达标且平稳'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
