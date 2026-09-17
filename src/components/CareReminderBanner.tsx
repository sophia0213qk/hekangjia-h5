import React, { useState } from 'react';

interface CareReminderBannerProps {
  onRemindFather?: () => void;
}

export const CareReminderBanner: React.FC<CareReminderBannerProps> = ({
  onRemindFather,
}) => {
  const [isNotified, setIsNotified] = useState(false);
  const [isSnoozed, setIsSnoozed] = useState(false);

  if (isSnoozed) {
    return (
      <div className="bg-[#fff7f4] border border-[#ffdad2] rounded-2xl p-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 text-[12px] text-[#7a4f00]">
          <span className="material-symbols-outlined text-[16px] text-[#904800]">schedule</span>
          <span>已设为 30 分钟后再次提醒晨间用药</span>
        </div>
        <button
          onClick={() => setIsSnoozed(false)}
          className="text-[11px] text-[#00685d] hover:underline font-semibold"
        >
          查看提醒
        </button>
      </div>
    );
  }

  const handleRemindClick = () => {
    setIsNotified(true);
    if (onRemindFather) onRemindFather();
  };

  return (
    <section
      id="domestic-care-banner"
      className="bg-[#ffdad2]/50 border border-[#ffdad2] rounded-2xl p-4 shadow-sm flex items-start gap-3.5 relative overflow-hidden transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-[#a7391e] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
        <span className="material-symbols-outlined text-[22px] animate-pulse">
          notifications_active
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#3c0700]">家庭温情提醒</span>
          <span className="text-[11px] text-[#a7391e] font-semibold bg-white/70 px-2 py-0.5 rounded-full">
            晨间用药
          </span>
        </div>

        <p className="text-[13px] text-[#3c0700] leading-relaxed">
          父亲今日尚未服用降压药（络活喜），监测到早晨静息心率略有波动。
        </p>

        <div className="pt-2 flex items-center flex-wrap gap-2">
          {isNotified ? (
            <div className="bg-[#00685d] text-white px-3.5 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              <span>已提醒父亲微信、手环及平板</span>
            </div>
          ) : (
            <button
              id="notify-father-btn"
              onClick={handleRemindClick}
              className="bg-[#a7391e] hover:bg-[#862208] text-white px-3.5 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">send</span>
              <span>一键拨号 / 提醒父亲</span>
            </button>
          )}

          <button
            onClick={() => setIsSnoozed(true)}
            className="bg-white/80 hover:bg-white text-[#3c0700] px-3 py-1.5 rounded-full text-[12px] font-medium active:scale-95 transition-colors"
          >
            稍后提示
          </button>
        </div>
      </div>
    </section>
  );
};
