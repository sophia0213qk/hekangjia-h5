import React, { useEffect, useState } from 'react';
import { FamilyMember } from '../types';
import { hasRecordedVitals } from '../utils/vitals';

interface RecordVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  initialMemberId?: string;
  onSaveVitals: (
    memberId: string,
    vitalType: 'bp' | 'glucose' | 'temp' | 'heartRate',
    data: any
  ) => void;
}

export const RecordVitalsModal: React.FC<RecordVitalsModalProps> = ({
  isOpen,
  onClose,
  members,
  initialMemberId = 'father',
  onSaveVitals,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMemberId);
  const [vitalCategory, setVitalCategory] = useState<'bp' | 'glucose' | 'temp' | 'heartRate'>('bp');

  // BP state
  const [systolic, setSystolic] = useState<number>(122);
  const [diastolic, setDiastolic] = useState<number>(80);

  // Glucose state
  const [glucose, setGlucose] = useState<number>(5.6);
  const [glucoseTiming, setGlucoseTiming] = useState<string>('空腹');

  // Temp state
  const [temperature, setTemperature] = useState<number>(36.6);

  // Heart rate state
  const [heartRate, setHeartRate] = useState<number>(72);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedMemberId(initialMemberId);
  }, [isOpen, initialMemberId]);

  useEffect(() => {
    if (!isOpen) return;
    const member = members.find((item) => item.id === selectedMemberId);
    const bp = member?.vitals?.bloodPressure;
    const bpRecorded =
      !!bp && bp.status !== '待录入' && !!bp.measuredAt && bp.measuredAt !== '暂无';
    setSystolic(bpRecorded ? bp.systolic : 122);
    setDiastolic(bpRecorded ? bp.diastolic : 80);
    setGlucose(member?.vitals?.bloodSugar?.value ?? 5.6);
    const timing = member?.vitals?.bloodSugar?.timing || '空腹';
    setGlucoseTiming(
      timing === '餐后2小时' || timing === '睡前' || timing === '空腹' ? timing : '空腹'
    );
    setTemperature(member?.vitals?.temperature?.value ?? 36.6);
    setHeartRate(member?.vitals?.heartRate?.value ?? 72);
  }, [isOpen, selectedMemberId, members]);

  if (!isOpen) return null;

  const selectedMember = members.find((item) => item.id === selectedMemberId);
  const editingExisting = hasRecordedVitals(selectedMember);

  const handleSave = () => {
    let data: any = {};
    if (vitalCategory === 'bp') {
      data = { systolic, diastolic };
    } else if (vitalCategory === 'glucose') {
      data = { value: glucose, timing: glucoseTiming };
    } else if (vitalCategory === 'temp') {
      data = { value: temperature };
    } else {
      data = { value: heartRate };
    }

    onSaveVitals(selectedMemberId, vitalCategory, data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#00685d]/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685d] text-[22px]">
              add_chart
            </span>
            <h3 className="text-[17px] font-bold text-[#131e1a]">
              {editingExisting ? '修改体征' : '录入体征'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Member Selector */}
        <div className="space-y-1.5">
          <label className="text-[12px] text-[#6f7975] font-medium">选择成员</label>
          <div className="grid grid-cols-4 gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMemberId(m.id)}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  selectedMemberId === m.id
                    ? 'bg-[#00685d] text-white shadow-sm'
                    : 'bg-[#f0fcf5] text-[#3e4946] border border-[#00685d]/10'
                }`}
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-white/50"
                />
                <span className="text-[11px] font-semibold truncate w-full text-center">
                  {m.nickname}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Vital Category Tabs */}
        <div className="space-y-1.5">
          <label className="text-[12px] text-[#6f7975] font-medium">体征类别</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'bp', label: '血压', icon: 'monitor_heart' },
              { id: 'glucose', label: '血糖', icon: 'opacity' },
              { id: 'temp', label: '体温', icon: 'device_thermostat' },
              { id: 'heartRate', label: '心率', icon: 'favorite' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setVitalCategory(cat.id as any)}
                className={`py-2 rounded-xl text-[12px] font-semibold flex flex-col items-center gap-0.5 transition-all ${
                  vitalCategory === cat.id
                    ? 'bg-[#00685d] text-white shadow-xs'
                    : 'bg-[#f8f9ff] text-[#3e4946] border border-[#00685d]/10'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs according to vitalCategory */}
        {vitalCategory === 'bp' && (
          <div className="p-4 rounded-2xl bg-[#f0fcf5] border border-[#00685d]/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#6f7975]">收缩压 (高压)</span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setSystolic(Math.max(80, systolic - 2))}
                    className="w-7 h-7 rounded-full bg-white shadow-xs text-bold"
                  >
                    -
                  </button>
                  <span className="text-[24px] font-extrabold text-[#131e1a]">{systolic}</span>
                  <button
                    onClick={() => setSystolic(systolic + 2)}
                    className="w-7 h-7 rounded-full bg-[#00685d] text-white shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-[#6f7975]">舒张压 (低压)</span>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <button
                    onClick={() => setDiastolic(Math.max(50, diastolic - 2))}
                    className="w-7 h-7 rounded-full bg-white shadow-xs text-bold"
                  >
                    -
                  </button>
                  <span className="text-[24px] font-extrabold text-[#131e1a]">{diastolic}</span>
                  <button
                    onClick={() => setDiastolic(diastolic + 2)}
                    className="w-7 h-7 rounded-full bg-[#00685d] text-white shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#00685d] font-semibold text-center pt-1 border-t border-[#00685d]/10">
              当前处于稳态理想水平 (mmHg)
            </p>
          </div>
        )}

        {vitalCategory === 'glucose' && (
          <div className="p-4 rounded-2xl bg-[#f0fcf5] border border-[#00685d]/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#6f7975]">测量时段</span>
              <div className="flex gap-1.5">
                {['空腹', '餐后2小时', '睡前'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGlucoseTiming(t)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                      glucoseTiming === t ? 'bg-[#00685d] text-white' : 'bg-white text-gray-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                onClick={() => setGlucose(Math.max(3.0, parseFloat((glucose - 0.1).toFixed(1))))}
                className="w-8 h-8 rounded-full bg-white shadow-xs font-bold"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-[32px] font-extrabold text-[#131e1a]">{glucose}</span>
                <span className="text-[12px] text-[#6f7975] ml-1">mmol/L</span>
              </div>
              <button
                onClick={() => setGlucose(parseFloat((glucose + 0.1).toFixed(1)))}
                className="w-8 h-8 rounded-full bg-[#00685d] text-white shadow-xs"
              >
                +
              </button>
            </div>
          </div>
        )}

        {vitalCategory === 'temp' && (
          <div className="p-4 rounded-2xl bg-[#f0fcf5] border border-[#00685d]/10 space-y-3">
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                onClick={() =>
                  setTemperature(Math.max(35.0, parseFloat((temperature - 0.1).toFixed(1))))
                }
                className="w-8 h-8 rounded-full bg-white shadow-xs font-bold"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-[32px] font-extrabold text-[#131e1a]">{temperature}</span>
                <span className="text-[12px] text-[#6f7975] ml-1">℃</span>
              </div>
              <button
                onClick={() => setTemperature(parseFloat((temperature + 0.1).toFixed(1)))}
                className="w-8 h-8 rounded-full bg-[#00685d] text-white shadow-xs"
              >
                +
              </button>
            </div>
            <p className="text-[11px] text-[#00685d] font-semibold text-center">
              体温平稳，无发热征兆
            </p>
          </div>
        )}

        {vitalCategory === 'heartRate' && (
          <div className="p-4 rounded-2xl bg-[#f0fcf5] border border-[#00685d]/10 space-y-3">
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                onClick={() => setHeartRate(Math.max(45, heartRate - 1))}
                className="w-8 h-8 rounded-full bg-white shadow-xs font-bold"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-[32px] font-extrabold text-[#131e1a]">{heartRate}</span>
                <span className="text-[12px] text-[#6f7975] ml-1">次/分</span>
              </div>
              <button
                onClick={() => setHeartRate(heartRate + 1)}
                className="w-8 h-8 rounded-full bg-[#00685d] text-white shadow-xs"
              >
                +
              </button>
            </div>
            <p className="text-[11px] text-[#00685d] font-semibold text-center">
              窦性心律，节律平稳
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#f0fcf5] text-[#3e4946] font-semibold text-[14px]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-[#00685d] hover:bg-[#005047] text-white font-bold text-[14px] shadow-md active:scale-95 transition-all"
          >
            {editingExisting ? '保存修改' : '保存录入'}
          </button>
        </div>
      </div>
    </div>
  );
};
