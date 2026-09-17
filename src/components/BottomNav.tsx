import React from 'react';

interface BottomNavProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: '总览',
      icon: 'grid_view',
    },
    {
      id: 'health-profile',
      label: '档案',
      icon: 'vital_signs',
    },
    {
      id: 'medication',
      label: '用药',
      icon: 'pill',
    },
    {
      id: 'records',
      label: '病历',
      icon: 'folder_shared',
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#00685d]/10 shadow-[0_-4px_20px_rgba(0,104,93,0.06)]">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] h-14 transition-all duration-200 relative ${
                isActive
                  ? 'text-[#00685d] font-semibold scale-105'
                  : 'text-[#6f7975] hover:text-[#00685d] font-normal'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
              </div>
              <span className="text-[11px] tracking-wide mt-0.5">{item.label}</span>
              {isActive && (
                <span className="w-4 h-1 rounded-full bg-[#00685d] mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
