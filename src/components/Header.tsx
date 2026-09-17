import React from 'react';
import { APP_ICONS } from '../data/mockData';
import { FamilyMember } from '../types';

interface HeaderProps {
  currentTab: string;
  activeMember: FamilyMember | null;
  onOpenNotifications: () => void;
  unreadCount: number;
  userName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeMember,
  onOpenNotifications,
  unreadCount,
  userName = '用户',
  onLogout,
}) => {
  const getSubtitle = () => {
    switch (currentTab) {
      case 'overview':
        return activeMember ? `${activeMember.name} · 健康总览` : '全家健康总览';
      case 'health-profile':
        return '成员健康档案';
      case 'medication':
        return '家庭用药计划与提醒';
      case 'records':
        return '随访病历与化验单';
      default:
        return '家庭健康伴侣';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#f0fcf5]/90 backdrop-blur-xl border-b border-[#00685d]/5">
      <div className="max-w-2xl mx-auto h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className="text-[19px] font-bold text-[#00685d] tracking-tight font-['Plus_Jakarta_Sans']">
              禾康家
            </span>
            <span className="text-[11px] text-[#3e4946] font-medium leading-none">
              {getSubtitle()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="header-notification-btn"
            aria-label="消息通知"
            onClick={onOpenNotifications}
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#3e4946] hover:bg-[#e5f1ea] transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#a7391e] ring-2 ring-[#f0fcf5] animate-pulse"></span>
            )}
          </button>

          <div className="relative group">
            <button
              type="button"
              className="relative cursor-pointer"
              title={userName}
              aria-label="账户菜单"
            >
              <img
                alt={userName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-[0_2px_8px_rgba(46,125,104,0.15)]"
                src={APP_ICONS.userProfile}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2E9E6D] ring-1.5 ring-white"></span>
            </button>
            {onLogout && (
              <div className="absolute right-0 top-10 hidden group-hover:block group-focus-within:block z-50">
                <div className="bg-white rounded-xl shadow-lg border border-[#00685d]/10 py-1 min-w-[120px]">
                  <div className="px-3 py-1.5 text-[11px] text-[#6f7975] border-b border-[#00685d]/8">
                    {userName}
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-[13px] text-[#a7391e] hover:bg-[#fdecea] font-medium"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
