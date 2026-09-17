import React from 'react';
import { MedicalSchedule } from '../types';

interface UpcomingEventsProps {
  schedules: MedicalSchedule[];
  onOpenScheduleDetail?: (schedule: MedicalSchedule) => void;
  onOpenScheduleList?: () => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  schedules,
  onOpenScheduleDetail,
  onOpenScheduleList,
}) => {
  const pendingSchedules = schedules.filter((s) => !s.isCompleted);
  const displayList = pendingSchedules.length > 0 ? pendingSchedules.slice(0, 3) : schedules.slice(0, 2);

  return (
    <section className="flex flex-col space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00685d] text-[20px]">
            calendar_month
          </span>
          <h2 className="text-[17px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
            就医与随访日程
          </h2>
        </div>
        <button
          id="overview-open-schedule-btn"
          onClick={onOpenScheduleList}
          className="text-[12px] text-[#00685d] font-semibold flex items-center hover:underline cursor-pointer group"
        >
          日程表
          <span className="material-symbols-outlined text-[15px] group-hover:translate-x-0.5 transition-transform">
            chevron_right
          </span>
        </button>
      </div>

      <div className="flex flex-col space-y-2.5">
        {displayList.length === 0 ? (
          <div
            onClick={onOpenScheduleList}
            className="bg-white rounded-2xl p-5 shadow-sm border border-dashed border-[#00685d]/20 text-center cursor-pointer hover:border-[#00685d]/40 transition"
          >
            <span className="material-symbols-outlined text-[28px] text-[#00685d]/60 mb-1">
              event_available
            </span>
            <p className="text-[13px] text-[#3e4946] font-medium">暂无近期就医随访事项</p>
            <span className="text-[11px] text-[#00685d] font-semibold mt-1 inline-block">
              + 查看家庭完整日程表
            </span>
          </div>
        ) : (
          displayList.map((item) => {
          const isPrimary = item.themeColor === 'primary';
          return (
            <div
              key={item.id}
              onClick={() => {
                if (onOpenScheduleDetail) {
                  onOpenScheduleDetail(item);
                } else if (onOpenScheduleList) {
                  onOpenScheduleList();
                }
              }}
              className={`bg-white rounded-2xl p-4 shadow-sm border border-[#00685d]/10 flex items-start gap-3.5 relative border-l-4 ${
                isPrimary ? 'border-l-[#00685d]' : 'border-l-[#b55d00]'
              } hover:border-[#00685d]/30 transition-all cursor-pointer group`}
            >
              {/* Date Box */}
              <div className="flex flex-col items-center justify-center bg-[#f0fcf5] px-3 py-2 rounded-xl shrink-0 min-w-[54px]">
                <span
                  className={`text-[11px] font-bold ${
                    isPrimary ? 'text-[#00685d]' : 'text-[#904800]'
                  }`}
                >
                  {item.month}
                </span>
                <span className="text-[22px] font-bold text-[#131e1a] leading-none my-0.5 font-['Plus_Jakarta_Sans']">
                  {item.day}
                </span>
                <span className="text-[10px] text-[#6f7975]">{item.weekday}</span>
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0 flex flex-col space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-bold text-[#131e1a] truncate">
                    {item.title}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isPrimary
                        ? 'bg-[#9af3e3]/50 text-[#005047]'
                        : 'bg-[#ffdcc5] text-[#713700]'
                    }`}
                  >
                    {item.countdown}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[#3e4946] text-[12px]">
                  <span
                    className={`material-symbols-outlined text-[15px] ${
                      isPrimary ? 'text-[#00685d]' : 'text-[#904800]'
                    }`}
                  >
                    {isPrimary ? 'schedule' : 'vaccines'}
                  </span>
                  <span>{item.time}</span>
                </div>

                {item.location && (
                  <div className="flex items-center gap-1.5 text-[#6f7975] text-[11px]">
                    <span className="material-symbols-outlined text-[15px] text-[#00685d]">
                      location_on
                    </span>
                    <span className="truncate">{item.location}</span>
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-1 pt-1 flex items-center flex-wrap gap-1.5">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          idx === 0 && isPrimary
                            ? 'text-[#a7391e] bg-[#ffdad2]/50'
                            : 'text-[#3e4946] bg-[#f0fcf5]'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }))}
      </div>
    </section>
  );
};
