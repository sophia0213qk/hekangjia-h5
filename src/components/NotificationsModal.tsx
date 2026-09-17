import React from 'react';

export interface HealthNotification {
  id: string;
  title: string;
  time: string;
  desc: string;
  type: 'warning' | 'info' | 'normal';
  actionLabel: string;
  actionType: string;
  isRead?: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick: (type: string, id?: string) => void;
  notifications: HealthNotification[];
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onActionClick,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#00685d]/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685d] text-[22px]">
              notifications
            </span>
            <h3 className="text-[17px] font-bold text-[#131e1a]">家庭健康消息通知</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#a7391e]/10 text-[#a7391e] text-[11px] font-bold">
                {unreadCount} 条未读
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-[#6f7975] space-y-2">
            <span className="material-symbols-outlined text-[36px] text-[#00685d]/40">
              task_alt
            </span>
            <p className="text-[13px] font-medium">暂无未处理的健康通知</p>
            <p className="text-[11px] text-gray-400">全家成员健康状况正常稳定</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex flex-col space-y-2 transition-all ${
                  item.isRead
                    ? 'bg-[#f7faf8] border-gray-200/80 opacity-70'
                    : item.type === 'warning'
                    ? 'bg-[#fff7f4] border-[#ffdad2]'
                    : item.type === 'info'
                    ? 'bg-[#f0fcf5] border-[#00685d]/15'
                    : 'bg-[#f8f9ff] border-[#00685d]/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {!item.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a7391e] shrink-0"></span>
                    )}
                    <span
                      className={`text-[13px] font-bold ${
                        item.isRead
                          ? 'text-[#6f7975]'
                          : item.type === 'warning'
                          ? 'text-[#a7391e]'
                          : 'text-[#131e1a]'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6f7975]">{item.time}</span>
                </div>
                <p className="text-[12px] text-[#3e4946] leading-relaxed">{item.desc}</p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      onActionClick(item.actionType, item.id);
                      onClose();
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-xs transition-transform active:scale-95 ${
                      item.type === 'warning'
                        ? 'bg-[#a7391e] text-white'
                        : 'bg-[#00685d] text-white'
                    }`}
                  >
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[13px] font-semibold hover:bg-gray-200 active:scale-98 transition-all"
            >
              全部标为已读
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

