import React, { useState } from 'react';
import { Medication } from '../types';

interface MedicationChecklistProps {
  medications: Medication[];
  onToggleTaken: (id: string) => void;
  onAddNewMed: () => void;
  onDelete?: (id: string) => void;
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
  onDelete,
}) => {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const completedCount = medications.filter((m) => m.isTakenToday).length;
  const totalCount = medications.length;
  const confirmMed = medications.find((m) => m.id === confirmId);

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
        <div className="flex items-center justify-between pb-1 border-b border-[#f0fcf5]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00685d]"></span>
            <span className="text-[14px] text-[#131e1a] font-bold">
              早晨计划 · 08:00
            </span>
          </div>
          <span className="text-[12px] text-[#6f7975]">饭后 30 分钟</span>
        </div>

        <div className="space-y-2.5">
          {medications.length === 0 ? (
            <div className="py-6 text-center text-[12px] text-[#6f7975]">
              今日暂无服药计划
              <button
                type="button"
                onClick={onAddNewMed}
                className="mt-2 block mx-auto text-[12px] text-[#00685d] font-semibold hover:underline"
              >
                + 添加药品
              </button>
            </div>
          ) : (
            medications.map((med) => {
              const isCompleted = med.isTakenToday;
              return (
                <div
                  key={med.id}
                  className={`flex items-center justify-between gap-2 p-3 rounded-xl transition-all duration-200 ${
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
                          {med.memberName || '家人'}
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

                  <div className="flex items-center gap-1 shrink-0">
                    {onDelete && (
                      <button
                        type="button"
                        title="删除药品"
                        onClick={() => setConfirmId(med.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#a7391e]/80 hover:bg-[#ffdad2] hover:text-[#a7391e] transition"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={() => onToggleTaken(med.id)}
                        title="点击可撤销"
                        className="flex items-center gap-1 text-[#00685d] bg-[#9af3e3]/40 hover:bg-[#9af3e3]/70 px-2.5 py-1.5 rounded-full transition-colors"
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
                        type="button"
                        id={`dose-btn-${med.id}`}
                        onClick={() => onToggleTaken(med.id)}
                        className="bg-[#00685d] hover:bg-[#005047] text-white px-3 py-1.5 rounded-full text-[12px] font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          check
                        </span>
                        <span>标为已服</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#a7391e] text-[28px]">warning</span>
              <div>
                <h4 className="text-[15px] font-bold text-[#131e1a]">确认删除药品？</h4>
                <p className="text-[12px] text-[#6f7975] mt-1">
                  将移出「{confirmMed?.name || '该药品'}」，删除后不可恢复。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#f0fcf5] text-[#3e4946] text-[13px] font-semibold"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete?.(confirmId);
                  setConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#a7391e] hover:bg-[#8c2f18] text-white text-[13px] font-bold"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
