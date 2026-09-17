import React from 'react';
import { Medication } from '../types';

interface MedicationChecklistProps {
  medications: Medication[];
  onToggleTaken: (id: string) => void;
  onAddNewMed: () => void;
}

/** Display takenAt as YYYY-MM-DD HH:mm:ss (accepts ISO or already-formatted). */
function formatTakenAt(value?: string | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const MedicationChecklist: React.FC<MedicationChecklistProps> = ({
  medications,
  onToggleTaken,
  onAddNewMed,
}) => {
  const completedCount = medications.filter((m) => m.isTakenToday).length;
  const totalCount = medications.length;

  return (
    <section className="flex flex-col space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00685d] text-[20px]">
            medication
          </span>
          <h2 className="text-[17px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
            今日服药清单
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#00685d] font-semibold bg-[#e5f1ea] px-2.5 py-0.5 rounded-full">
            已完成 {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#00685d]/10 flex flex-col space-y-3">
        {/* Morning Slot Header */}
        <div className="flex items-center justify-between pb-1 border-b border-[#f0fcf5]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00685d]"></span>
            <span className="text-[14px] text-[#131e1a] font-bold">
              早晨计划 · 08:00
            </span>
          </div>
          <span className="text-[12px] text-[#6f7975]">饭后 30 分钟</span>
        </div>

        {/* Medication Cards List */}
        <div className="space-y-2.5">
          {medications.map((med) => {
            const isCompleted = med.isTakenToday;
            return (
              <div
                key={med.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#f0fcf5]/70 opacity-80 border border-[#00685d]/15'
                    : 'bg-[#f8f9ff] border border-transparent hover:border-[#00685d]/20 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-[#9af3e3]/60 text-[#00685d]'
                        : 'bg-[#ffdcc5]/60 text-[#a7391e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isCompleted ? 'water_drop' : 'pill'}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-[#3e4946] bg-[#e5eeff] px-1.5 py-0.5 rounded">
                        {med.memberId === 'father'
                          ? '父亲'
                          : med.memberId === 'son'
                          ? '睿睿'
                          : med.memberId === 'mother'
                          ? '母亲'
                          : '本人'}
                      </span>
                      <span
                        className={`text-[13px] font-semibold truncate ${
                          isCompleted
                            ? 'line-through text-[#6f7975]'
                            : 'text-[#131e1a]'
                        }`}
                      >
                        {med.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6f7975] mt-0.5 truncate">
                      {med.dosage} · {med.timeLabel || med.mealTiming}
                    </span>
                  </div>
                </div>

                {isCompleted ? (
                  <button
                    onClick={() => onToggleTaken(med.id)}
                    title="点击可撤销"
                    className="flex items-center gap-1 text-[#00685d] bg-[#9af3e3]/40 hover:bg-[#9af3e3]/70 px-2.5 py-1.5 rounded-full shrink-0 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      done_all
                    </span>
                    <span className="text-[11px] font-bold">
                      {formatTakenAt(med.takenAt) || '已服'}
                    </span>
                  </button>
                ) : (
                  <button
                    id={`dose-btn-${med.id}`}
                    onClick={() => onToggleTaken(med.id)}
                    className="bg-[#00685d] hover:bg-[#005047] text-white px-3 py-1.5 rounded-full text-[12px] font-semibold shadow-xs shrink-0 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      check
                    </span>
                    <span>标为已服</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
