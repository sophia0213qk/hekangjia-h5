import React from 'react';

interface QuickActionDrawerProps {
  onAddMedication: () => void;
  onScanReport: () => void;
}

export const QuickActionDrawer: React.FC<QuickActionDrawerProps> = ({
  onAddMedication,
  onScanReport,
}) => {
  return (
    <section className="pt-1">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-sm border border-[#00685d]/10 flex items-center justify-around gap-2">
        {/* 1. 添加用药 */}
        <button
          id="quick-action-medication"
          onClick={onAddMedication}
          className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-[#e5f1ea]/50 active:bg-[#e5f1ea] transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-[#f0fcf5] text-[#00685d] flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform mb-1 shadow-xs border border-[#00685d]/10">
            <span className="material-symbols-outlined text-[20px]">prescriptions</span>
          </div>
          <span className="text-[12px] text-[#131e1a] font-semibold">添加用药</span>
        </button>

        <div className="w-[1px] h-8 bg-[#e5f1ea]"></div>

        {/* 2. 扫化验单 */}
        <button
          id="quick-action-scan"
          onClick={onScanReport}
          className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-[#e5f1ea]/50 active:bg-[#e5f1ea] transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-[#f0fcf5] text-[#00685d] flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform mb-1 shadow-xs border border-[#00685d]/10">
            <span className="material-symbols-outlined text-[20px]">document_scanner</span>
          </div>
          <span className="text-[12px] text-[#131e1a] font-semibold">扫化验单</span>
        </button>
      </div>
    </section>
  );
};
