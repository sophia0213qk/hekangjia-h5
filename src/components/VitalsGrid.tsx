import React from 'react';
import { FamilyMember } from '../types';
import { hasRecordedVitals } from '../utils/vitals';

interface VitalsGridProps {
  members: FamilyMember[];
  onOpenDetails: (memberId: string) => void;
  onRecordVitals: () => void;
}

type VitalCard = {
  memberId: string;
  label: string;
  value: string;
  unit: string;
  detail: string;
  status: string;
  icon: string;
  accent: string;
  kind: 'bp' | 'sugar' | 'hr' | 'temp' | 'sleep';
  history?: number[];
  tempValue?: number;
};

function memberLabel(m: FamilyMember): string {
  return m.nickname || m.relation || m.name;
}

function pickVitalCard(m: FamilyMember): VitalCard | null {
  const label = memberLabel(m);
  const v = m.vitals;
  if (!v) return null;

  const bp = v.bloodPressure;
  if (
    bp &&
    bp.status !== '待录入' &&
    bp.measuredAt &&
    bp.measuredAt !== '暂无' &&
    Number.isFinite(bp.systolic) &&
    Number.isFinite(bp.diastolic)
  ) {
    return {
      memberId: m.id,
      label: `${label} · 血压`,
      value: `${bp.systolic}/${bp.diastolic}`,
      unit: 'mmHg',
      detail: bp.changeText || bp.measuredAt,
      status: bp.status || '',
      icon: 'monitor_heart',
      accent: '#00685d',
      kind: 'bp',
      history: bp.history,
    };
  }

  if (v.bloodSugar?.value != null) {
    return {
      memberId: m.id,
      label: `${label} · ${v.bloodSugar.timing?.includes('餐后') ? '餐后血糖' : '空腹血糖'}`,
      value: String(v.bloodSugar.value),
      unit: v.bloodSugar.unit || 'mmol/L',
      detail: '标准范围 3.9 ~ 6.1',
      status: v.bloodSugar.status || '',
      icon: 'opacity',
      accent: '#904800',
      kind: 'sugar',
    };
  }

  if (v.heartRate?.value != null) {
    return {
      memberId: m.id,
      label: `${label} · 心率`,
      value: String(v.heartRate.value),
      unit: v.heartRate.unit || '次/分',
      detail: v.heartRate.rhythm || '',
      status: v.heartRate.status || '',
      icon: 'ecg',
      accent: '#00685d',
      kind: 'hr',
    };
  }

  if (v.temperature?.value != null) {
    return {
      memberId: m.id,
      label: `${label} · 体温`,
      value: String(v.temperature.value),
      unit: v.temperature.unit || '℃',
      detail: v.temperature.timeAgo || '',
      status: v.temperature.status || '',
      icon: 'device_thermostat',
      accent: '#208275',
      kind: 'temp',
      tempValue: v.temperature.value,
    };
  }

  if (v.sleep?.score != null) {
    return {
      memberId: m.id,
      label: `${label} · 昨晚睡眠`,
      value: String(v.sleep.score),
      unit: '分',
      detail: [v.sleep.duration, v.sleep.deepSleep ? `深睡 ${v.sleep.deepSleep}` : '']
        .filter(Boolean)
        .join(' · '),
      status: v.sleep.status || '',
      icon: 'bedtime',
      accent: '#208275',
      kind: 'sleep',
    };
  }

  return null;
}

function historyPath(history: number[] | undefined): string {
  if (!history || history.length < 2) {
    return 'M0,18 Q18,6 35,14 T70,9 T100,12';
  }
  const min = Math.min(...history);
  const max = Math.max(...history);
  const span = Math.max(max - min, 1);
  const step = 100 / (history.length - 1);
  return history
    .map((n, i) => {
      const x = i * step;
      const y = 22 - ((n - min) / span) * 18;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

export const VitalsGrid: React.FC<VitalsGridProps> = ({
  members,
  onOpenDetails,
  onRecordVitals,
}) => {
  const cards = members
    .map(pickVitalCard)
    .filter((c): c is VitalCard => c != null)
    .slice(0, 4);

  const firstMemberId = members[0]?.id;
  const hasAny = members.some(hasRecordedVitals);

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
        {firstMemberId ? (
          <button
            onClick={() => onOpenDetails(firstMemberId)}
            className="text-[12px] text-[#00685d] font-semibold flex items-center hover:underline"
          >
            全部数据
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        ) : null}
      </div>

      {!hasAny || cards.length === 0 ? (
        <button
          type="button"
          onClick={onRecordVitals}
          className="bg-white rounded-2xl p-5 shadow-sm border border-dashed border-[#00685d]/25 flex flex-col items-center justify-center gap-2 text-center hover:border-[#00685d]/50 transition-colors"
        >
          <span className="material-symbols-outlined text-[#00685d] text-[28px]">
            add_chart
          </span>
          <p className="text-[14px] font-semibold text-[#131e1a]">暂无体征数据</p>
          <p className="text-[12px] text-[#6f7975]">录入血压、血糖等，看板会显示家人最新状态</p>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card) => (
            <div
              key={`${card.memberId}-${card.kind}`}
              onClick={() => onOpenDetails(card.memberId)}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#00685d]/10 flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#00685d]/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: card.accent }}
                  />
                  <span className="text-[12px] text-[#6f7975] font-medium truncate">
                    {card.label}
                  </span>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"
                  style={{ backgroundColor: `${card.accent}18`, color: card.accent }}
                >
                  <span className="material-symbols-outlined text-[14px]">{card.icon}</span>
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[26px] leading-tight font-extrabold text-[#131e1a] tracking-tight font-['Plus_Jakarta_Sans']">
                    {card.value}
                  </span>
                  <span className="text-[11px] text-[#6f7975]">{card.unit}</span>
                </div>
                {(card.detail || card.status) && (
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {card.detail ? (
                      <span className="text-[11px] text-[#6f7975] font-medium truncate">
                        {card.detail}
                      </span>
                    ) : null}
                    {card.status ? (
                      <span className="text-[11px] text-[#00685d] font-medium truncate">
                        {card.status}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {card.kind === 'bp' ? (
                <div className="w-full h-8 pt-1">
                  <svg
                    className="w-full h-full text-[#00685d]"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 24"
                  >
                    <path
                      d={historyPath(card.history)}
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              ) : card.kind === 'temp' && card.tempValue != null ? (
                <div className="w-full flex flex-col space-y-1 pt-2">
                  <div className="w-full h-2 rounded-full bg-[#e5f1ea] overflow-hidden flex">
                    <div
                      className="bg-[#00685d] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((card.tempValue - 36) / 1.5) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[#6f7975] text-[10px]">
                    <span>36.0°</span>
                    <span className="text-[#a7391e] font-medium">37.2°警戒</span>
                  </div>
                </div>
              ) : card.status ? (
                <div className="pt-1">
                  <span className="w-full block py-1 text-center text-[11px] font-semibold rounded-lg bg-[#e5f1ea] text-[#00685d]">
                    {card.status}
                  </span>
                </div>
              ) : (
                <div className="h-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
