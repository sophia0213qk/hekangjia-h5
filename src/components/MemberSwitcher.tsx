import React, { useRef, useState, useEffect } from 'react';
import { FamilyMember } from '../types';

interface MemberSwitcherProps {
  members: FamilyMember[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onAddMember: () => void;
}

export const MemberSwitcher: React.FC<MemberSwitcherProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onAddMember,
}) => {
  const isAllSelected = selectedMemberId === 'all';
  const totalPendingTodos = members.reduce((sum, m) => sum + (m.pendingTodos || 0), 0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isAllMembersModalOpen, setIsAllMembersModalOpen] = useState(false);

  // Mouse drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const hasMovedRef = useRef(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();

    // Initial small delay to ensure layout is settled
    const timer = setTimeout(checkScroll, 100);

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [members]);

  // Auto-scroll to selected member into center
  useEffect(() => {
    const selectedEl = document.getElementById(`member-btn-${selectedMemberId}`);
    if (selectedEl && scrollContainerRef.current) {
      selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedMemberId]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -220 : 220;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Convert vertical mouse wheel into horizontal scroll over the carousel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && e.deltaY !== 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY * 0.9;
      checkScroll();
    }
  };

  // Drag to scroll
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setStartScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.3;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    scrollContainerRef.current.scrollLeft = startScrollLeft - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative group">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-[#00685d] shadow-md border border-[#00685d]/20 flex items-center justify-center hover:bg-[#e5f1ea] active:scale-95 transition-all cursor-pointer"
          title="向左滚动查看成员"
          aria-label="向左滚动查看成员"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
      )}

      {/* Left Gradient Mask */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#f0fcf5] via-[#f0fcf5]/70 to-transparent pointer-events-none z-10" />
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 -mx-1 px-1 select-none scroll-smooth ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* 全部成员 */}
        <button
          type="button"
          id="btn-open-all-members-modal"
          onClick={() => {
            if (hasMovedRef.current) return;
            setIsAllMembersModalOpen(true);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f0fcf5] text-[#00685d] hover:bg-[#e5f1ea] border border-[#00685d]/20 shrink-0 transition-all cursor-pointer active:scale-95 shadow-2xs"
          title="查看全部家庭成员"
        >
          <span className="material-symbols-outlined text-[16px]">group</span>
          <span className="text-[12px] font-semibold whitespace-nowrap">全部成员</span>
        </button>

        {/* 添加 */}
        <button
          type="button"
          id="add-member-btn"
          onClick={() => {
            if (hasMovedRef.current) return;
            onAddMember();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e5f1ea] text-[#00685d] hover:bg-[#d9e5de] shrink-0 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
          <span className="text-[12px] font-semibold whitespace-nowrap">添加</span>
        </button>
      </div>

      {/* Right Gradient Mask */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#f0fcf5] via-[#f0fcf5]/70 to-transparent pointer-events-none z-10" />
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-[#00685d] shadow-md border border-[#00685d]/20 flex items-center justify-center hover:bg-[#e5f1ea] active:scale-95 transition-all cursor-pointer"
          title="向右滚动查看更多成员"
          aria-label="向右滚动查看更多成员"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      )}

      {/* Quick All Members Popover / Modal */}
      {isAllMembersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#00685d]/15 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#00685d]/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685d] text-[22px]">diversity_3</span>
                <h3 className="text-[16px] font-bold text-[#131e1a]">选择家庭成员</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAllMembersModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Overview Option */}
            <button
              type="button"
              onClick={() => {
                onSelectMember('all');
                setIsAllMembersModalOpen(false);
              }}
              className={`w-full p-3 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${
                isAllSelected
                  ? 'bg-[#00685d] text-white border-[#00685d] shadow-xs'
                  : 'bg-[#f0fcf5] text-[#131e1a] border-[#00685d]/15 hover:bg-[#e5f1ea]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isAllSelected ? 'bg-white/20 text-white' : 'bg-[#00685d]/10 text-[#00685d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">diversity_3</span>
                </div>
                <div className="text-left">
                  <span className="text-[14px] font-bold block">全家健康总览</span>
                  <span
                    className={`text-[11px] ${
                      isAllSelected ? 'text-white/80' : 'text-[#6f7975]'
                    }`}
                  >
                    查看所有家人的综合健康待办与提醒
                  </span>
                </div>
              </div>
              {totalPendingTodos > 0 && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isAllSelected ? 'bg-[#a7391e] text-white' : 'bg-[#ffdcc5] text-[#713700]'
                  }`}
                >
                  {totalPendingTodos}条
                </span>
              )}
            </button>

            {/* Individual Members List */}
            <div className="space-y-2">
              <span className="text-[12px] font-bold text-[#6f7975] block">家庭成员 ({members.length}人)：</span>
              <div className="grid grid-cols-1 gap-2 max-h-[48vh] overflow-y-auto pr-0.5">
                {members.map((m) => {
                  const isSelected = selectedMemberId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSelectMember(m.id);
                        setIsAllMembersModalOpen(false);
                      }}
                      className={`p-2.5 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00685d] text-white border-[#00685d] shadow-xs'
                          : 'bg-white text-[#131e1a] border-[#00685d]/15 hover:bg-[#f0fcf5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-[#00685d]/20">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-bold">{m.name}</span>
                            <span
                              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[#e5f1ea] text-[#00685d] font-semibold'
                              }`}
                            >
                              {m.nickname}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] block mt-0.5 ${
                              isSelected
                                ? 'text-white/80'
                                : m.statusType === 'warning'
                                ? 'text-[#a7391e] font-medium'
                                : 'text-[#6f7975]'
                            }`}
                          >
                            {m.statusText}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <span className="material-symbols-outlined text-[18px] text-[#9af3e3]">
                            check_circle
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add member button in modal */}
            <div className="pt-2 border-t border-[#00685d]/10 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAllMembersModalOpen(false);
                  onAddMember();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#00685d] hover:bg-[#005047] text-white text-[13px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>添加新家庭成员</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

