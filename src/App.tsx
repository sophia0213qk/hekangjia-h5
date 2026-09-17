import React, { useState, useEffect } from 'react';
import {
  INITIAL_MEMBERS,
  INITIAL_MEDICATIONS,
  INITIAL_RECORDS,
  INITIAL_LAB_REPORTS,
  INITIAL_SCHEDULES,
} from './data/mockData';
import { FamilyMember, Medication, MedicalRecord, LabReport, MedicalSchedule } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MemberSwitcher } from './components/MemberSwitcher';
import { CareReminderBanner } from './components/CareReminderBanner';
import { MedicationChecklist } from './components/MedicationChecklist';
import { VitalsGrid } from './components/VitalsGrid';
import { LifestyleVignette } from './components/LifestyleVignette';
import { UpcomingEvents } from './components/UpcomingEvents';
import { QuickActionDrawer } from './components/QuickActionDrawer';
import { AddMedicationView } from './components/AddMedicationView';
import { MemberProfileView } from './components/MemberProfileView';
import { RecordsTimelineView } from './components/RecordsTimelineView';
import { RecordVitalsModal } from './components/RecordVitalsModal';
import { ScanReportModal } from './components/ScanReportModal';
import { ExportBriefModal } from './components/ExportBriefModal';
import { AddMemberModal } from './components/AddMemberModal';
import { NotificationsModal, HealthNotification } from './components/NotificationsModal';
import { LabReportDetailModal } from './components/LabReportDetailModal';
import { AddRecordModal } from './components/AddRecordModal';
import { ScheduleModal } from './components/ScheduleModal';
import { LoginPage } from './components/LoginPage';
import {
  AuthUser,
  api,
  clearSession,
  getStoredUser,
  getToken,
} from './api/client';

const INITIAL_HEALTH_NOTIFICATIONS: HealthNotification[] = [
  {
    id: 'notif-1',
    title: '父亲晨间降压药待服提醒',
    time: '08:00 (已过20分钟)',
    desc: '监测到早晨静息心率略有波动，请及时提醒父亲温开水送服络活喜。',
    type: 'warning',
    actionLabel: '一键呼叫提醒',
    actionType: 'remind-father',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: '华西医院门诊复查随访日程',
    time: '5月22日 周四 09:30',
    desc: '心内科复查前需空腹8小时，请提前准备过往心电图报告单。',
    type: 'info',
    actionLabel: '查看随访日程',
    actionType: 'view-schedule',
    isRead: false,
  },
];

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    getToken() ? getStoredUser() : null
  );
  const [authChecking, setAuthChecking] = useState(() => !!getToken());

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthChecking(false);
      return;
    }
    api
      .me()
      .then((user) => setAuthUser(user))
      .catch(() => {
        clearSession();
        setAuthUser(null);
      })
      .finally(() => setAuthChecking(false));
  }, []);

  // Persistent or Local State
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('hk_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('hk_medications');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('hk_records');
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [labReports, setLabReports] = useState<LabReport[]>(() => {
    const saved = localStorage.getItem('hk_lab_reports');
    return saved ? JSON.parse(saved) : INITIAL_LAB_REPORTS;
  });

  const [schedules, setSchedules] = useState<MedicalSchedule[]>(() => {
    const saved = localStorage.getItem('hk_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [notifications, setNotifications] = useState<HealthNotification[]>(() => {
    const saved = localStorage.getItem('hk_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(
          (n: HealthNotification) =>
            !n.title.includes('药箱') && n.actionType !== 'manage-stock'
        );
      } catch {
        return INITIAL_HEALTH_NOTIFICATIONS;
      }
    }
    return INITIAL_HEALTH_NOTIFICATIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('hk_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('hk_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('hk_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('hk_lab_reports', JSON.stringify(labReports));
  }, [labReports]);

  useEffect(() => {
    localStorage.setItem('hk_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('hk_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('所有健康通知已标为已读');
  };

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [activeProfileMemberId, setActiveProfileMemberId] = useState<string>('father');

  // Modal States
  const [isRecordVitalsOpen, setIsRecordVitalsOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [scanInitialMemberId, setScanInitialMemberId] = useState<string>('father');
  const [scanInitialType, setScanInitialType] = useState<'medicine' | 'lab'>('lab');
  const [isExportBriefOpen, setIsExportBriefOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedScheduleDetailId, setSelectedScheduleDetailId] = useState<string | undefined>(undefined);
  const [selectedLabReport, setSelectedLabReport] = useState<LabReport | null>(null);

  const handleOpenUploadReport = (memberId?: string) => {
    setScanInitialType('lab');
    if (memberId && memberId !== 'all') {
      setScanInitialMemberId(memberId);
    } else if (activeProfileMemberId) {
      setScanInitialMemberId(activeProfileMemberId);
    } else {
      setScanInitialMemberId('father');
    }
    setIsScanOpen(true);
  };

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Schedule Handlers
  const handleToggleCompleteSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const handleToggleReminderSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, reminderSet: !s.reminderSet } : s))
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddSchedule = (scheduleData: Omit<MedicalSchedule, 'id'>) => {
    const newSch: MedicalSchedule = {
      ...scheduleData,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [newSch, ...prev]);
  };

  // Handlers
  const handleToggleMedTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextTaken = !m.isTakenToday;
          const nowTime = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          });
          if (nextTaken) {
            showToast(`已标为已服：${m.name}`);
          }
          return {
            ...m,
            isTakenToday: nextTaken,
            takenAt: nextTaken ? nowTime : undefined,
          };
        }
        return m;
      })
    );
  };

  const handleSaveMedication = (newMed: Partial<Medication>) => {
    const fullMed: Medication = {
      id: newMed.id || `med-${Date.now()}`,
      memberId: newMed.memberId || 'father',
      memberName: newMed.memberName || '父亲 · 陈建国',
      name: newMed.name || '新药品',
      genericName: newMed.genericName,
      dosage: newMed.dosage || '1片 / 次',
      dosageForm: newMed.dosageForm || '片剂 (片)',
      frequency: newMed.frequency || '每日 1 次',
      timeSlot: newMed.timeSlot || '08:00',
      timeLabel: newMed.timeLabel || '晨起餐后 30 分钟',
      mealTiming: newMed.mealTiming || '餐后半小时',
      tags: newMed.tags || ['家庭常备'],
      notes: newMed.notes || '',
      stockCurrent: newMed.stockCurrent || 30,
      stockWarning: newMed.stockWarning || 7,
      remainingDays: newMed.remainingDays || 30,
      isTakenToday: false,
      scheduleMode: newMed.scheduleMode || 'continuous',
      startDate: newMed.startDate || new Date().toISOString().split('T')[0],
      duration: newMed.duration || '长期遵医嘱',
    };

    setMedications((prev) => [fullMed, ...prev]);
    showToast(`新药品已保存并开启提醒：${fullMed.name}`);
    setCurrentTab('overview');
  };

  const handleSaveVitals = (
    memberId: string,
    vitalType: 'bp' | 'glucose' | 'temp' | 'heartRate',
    data: any
  ) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const updatedVitals = { ...m.vitals };
          if (vitalType === 'bp') {
            const currentHist = updatedVitals.bloodPressure.history || [126, 128, 124];
            updatedVitals.bloodPressure = {
              ...updatedVitals.bloodPressure,
              systolic: data.systolic,
              diastolic: data.diastolic,
              changeText: '自测更新',
              measuredAt: '刚刚',
              history: [...currentHist.slice(-6), data.systolic],
            };
          } else if (vitalType === 'glucose') {
            updatedVitals.bloodSugar = {
              value: data.value,
              unit: 'mmol/L',
              status: '达标 · 自测记录',
              timing: data.timing,
            };
          } else if (vitalType === 'temp') {
            updatedVitals.temperature = {
              value: data.value,
              unit: '℃',
              status: '正常稳定',
              timeAgo: '刚刚',
            };
          } else if (vitalType === 'heartRate') {
            updatedVitals.heartRate = {
              value: data.value,
              unit: '次/分',
              status: '节律规整',
              rhythm: '窦性',
            };
          }
          return { ...m, vitals: updatedVitals };
        }
        return m;
      })
    );
    showToast('体征数据已成功记录并校准');
  };

  const handleAddMember = (newMem: FamilyMember) => {
    setMembers((prev) => [...prev, newMem]);
    showToast(`已建立【${newMem.name}】的家庭健康档案`);
  };

  const handleUpdateMember = (updatedMem: FamilyMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updatedMem.id ? updatedMem : m)));
    showToast(`已成功保存【${updatedMem.name}】的健康档案`);
  };

  const handleUpdateMedication = (updatedMed: Medication) => {
    setMedications((prev) => prev.map((med) => (med.id === updatedMed.id ? updatedMed : med)));
    showToast(`已更新【${updatedMed.name}】的用药与提醒设置`);
  };

  const handleDeleteMedication = (medId: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== medId));
    showToast('已停用并移出该药物');
  };

  const handleAddRecord = (newRec: MedicalRecord) => {
    setRecords((prev) => [newRec, ...prev]);
    showToast(`已录入：${newRec.hospital} 复诊病历`);
  };

  const handleApplyScannedMedicine = (medData: any) => {
    setCurrentTab('medication');
    showToast(`已提取：${medData.title}`);
  };

  const handleApplyScannedReport = (repData: any) => {
    const targetMember =
      members.find((m) => m.id === repData.memberId) ||
      members.find((m) => m.id === activeProfileMemberId) ||
      members[0];

    const newReport: LabReport = {
      id: `lab-${Date.now()}`,
      memberId: targetMember.id,
      title: repData.title || '化验检验报告单',
      date: repData.date || new Date().toISOString().split('T')[0],
      lab: repData.lab || '四川大学华西医院检验科',
      statusTag: repData.statusTag || '指标正常',
      statusType: repData.statusType || 'success',
      metrics: (repData.items || []).map((it: any) => ({
        name: it.name,
        value: it.value,
        reference: '参考区间内',
        isNormal: it.status === '正常' || it.status === '达标' || it.status === '优质',
      })),
    };
    setLabReports((prev) => [newReport, ...prev]);
    showToast(`化验单已归档至【${targetMember.nickname} · ${targetMember.name}】健康档案`);
  };

  // Active member for profile view
  const activeProfileMember =
    members.find((m) => m.id === activeProfileMemberId) || members[0];

  // Active member for overview filter
  const activeOverviewMember =
    selectedMemberId === 'all'
      ? null
      : members.find((m) => m.id === selectedMemberId) || null;

  // Filtered meds for overview
  const displayedMedications =
    selectedMemberId === 'all'
      ? medications
      : medications.filter((m) => m.memberId === selectedMemberId);

  const pendingMedCount = medications.filter((m) => !m.isTakenToday).length;

  const displayName = authUser?.display_name || '林婉';

  if (authChecking) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#f0fcf5] gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#00685d]/20 border-t-[#00685d] animate-spin" />
        <p className="text-[13px] text-[#6f7975] font-medium">正在恢复登录状态…</p>
      </div>
    );
  }

  if (!authUser) {
    return <LoginPage onLoginSuccess={(user) => setAuthUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#f0fcf5] text-[#131e1a] font-['Plus_Jakarta_Sans','Inter',sans-serif]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#131e1a] text-white px-4 py-2.5 rounded-full text-[13px] font-semibold shadow-xl flex items-center gap-2 animate-fade-in border border-white/20">
          <span className="material-symbols-outlined text-[18px] text-[#9af3e3]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      {currentTab !== 'medication' && currentTab !== 'health-profile' && (
        <Header
          currentTab={currentTab}
          activeMember={activeOverviewMember}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={unreadNotifCount}
          userName={displayName}
          onLogout={() => {
            clearSession();
            setAuthUser(null);
          }}
        />
      )}

      {/* MAIN VIEW ROUTING */}
      {currentTab === 'overview' && (
        <main className="max-w-2xl mx-auto pt-16 pb-28 px-4 space-y-4">
          {/* 1. Atmospheric Greeting & Status Badge */}
          <section className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#00685d] bg-[#e5f1ea] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <span className="inline-block w-2 h-2 rounded-full bg-[#00685d] animate-pulse"></span>
                5月18日 · 星期日
              </span>
              <span className="text-[12px] text-[#6f7975] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#00685d]">
                  eco
                </span>
                全家状态良好
              </span>
            </div>

            <div>
              <h1 className="text-[26px] font-extrabold text-[#131e1a] tracking-tight font-['Plus_Jakarta_Sans']">
                早安，{displayName}
              </h1>
            </div>

            <p className="text-[14px] text-[#3e4946]">
              为家人注满关怀，今天有{' '}
              <span className="text-[#a7391e] font-bold">{pendingMedCount} 项</span>{' '}
              健康待办需跟进。
            </p>
          </section>

          {/* 2. Family Member Switcher Carousel */}
          <MemberSwitcher
            members={members}
            selectedMemberId={selectedMemberId}
            onSelectMember={(id) => {
              setSelectedMemberId(id);
              if (id !== 'all') {
                setActiveProfileMemberId(id);
              }
            }}
            onAddMember={() => setIsAddMemberOpen(true)}
          />

          {/* 3. Urgent Domestic Care Banner */}
          <CareReminderBanner
            onRemindFather={() =>
              showToast('已向父亲健康屏及微信发送晨服提示')
            }
          />

          {/* 4. Today's Medication Checklist */}
          <MedicationChecklist
            medications={displayedMedications}
            onToggleTaken={handleToggleMedTaken}
            onAddNewMed={() => setCurrentTab('medication')}
          />

          {/* 5. Key Family Vitals Snapshot Cards */}
          <VitalsGrid
            members={members}
            onOpenDetails={(memberId) => {
              setActiveProfileMemberId(memberId);
              setCurrentTab('health-profile');
            }}
            onRecordVitals={() => setIsRecordVitalsOpen(true)}
          />

          {/* 6. Lifestyle Atmosphere Vignette */}
          <LifestyleVignette />

          {/* 7. Upcoming Medical Events & Vaccination */}
          <UpcomingEvents
            schedules={schedules}
            onOpenScheduleDetail={(sch) => {
              setSelectedScheduleDetailId(sch.id);
              setIsScheduleModalOpen(true);
            }}
            onOpenScheduleList={() => {
              setSelectedScheduleDetailId(undefined);
              setIsScheduleModalOpen(true);
            }}
          />

          {/* 8. Quick Action Floating Bar */}
          <QuickActionDrawer
            onRecordVitals={() => setIsRecordVitalsOpen(true)}
            onAddMedication={() => setCurrentTab('medication')}
            onScanReport={() => setIsScanOpen(true)}
          />

          {/* Gentle Footer Affirmation */}
          <div className="text-center py-4">
            <span className="text-[12px] text-[#6f7975] flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[#00685d] text-[16px]">
                nest_eco_leaf
              </span>
              禾康家 · 守护三代人的温润生活
            </span>
          </div>
        </main>
      )}

      {/* VIEW: ADD MEDICATION (Mockup 2) */}
      {currentTab === 'medication' && (
        <AddMedicationView
          members={members}
          onBack={() => setCurrentTab('overview')}
          onSave={handleSaveMedication}
          onOpenScanCamera={() => {
            setScanInitialType('medicine');
            setScanInitialMemberId(activeProfileMemberId);
            setIsScanOpen(true);
          }}
        />
      )}

      {/* VIEW: MEMBER HEALTH PROFILE (Mockup 3) */}
      {currentTab === 'health-profile' && (
        <MemberProfileView
          member={activeProfileMember}
          allMembers={members}
          onSelectMember={(id) => setActiveProfileMemberId(id)}
          medications={medications}
          records={records}
          labReports={labReports}
          onBack={() => setCurrentTab('overview')}
          onRecordVitals={(memId) => {
            setActiveProfileMemberId(memId);
            setIsRecordVitalsOpen(true);
          }}
          onExportBrief={(mem) => {
            setActiveProfileMemberId(mem.id);
            setIsExportBriefOpen(true);
          }}
          onViewReportDetail={(report) => setSelectedLabReport(report)}
          onUploadReport={() => handleOpenUploadReport(activeProfileMember.id)}
          onAddMedication={() => setCurrentTab('medication')}
          onUpdateMember={handleUpdateMember}
          onUpdateMedication={handleUpdateMedication}
          onDeleteMedication={handleDeleteMedication}
          onShowToast={showToast}
        />
      )}

      {/* VIEW: MEDICAL RECORDS & LAB REPORTS */}
      {currentTab === 'records' && (
        <div>
          <Header
            currentTab={currentTab}
            activeMember={null}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            unreadCount={unreadNotifCount}
            userName={displayName}
            onLogout={() => {
              clearSession();
              setAuthUser(null);
            }}
          />
          <div className="pt-16">
            <RecordsTimelineView
              records={records}
              labReports={labReports}
              members={members}
              onSelectReport={(rep) => setSelectedLabReport(rep)}
              onAddRecord={() => setIsAddRecordOpen(true)}
              onUploadReport={(memberId) => handleOpenUploadReport(memberId)}
            />
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation */}
      {currentTab !== 'medication' && (
        <BottomNav
          currentTab={currentTab}
          onChangeTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* MODALS */}
      <RecordVitalsModal
        isOpen={isRecordVitalsOpen}
        onClose={() => setIsRecordVitalsOpen(false)}
        members={members}
        initialMemberId={activeProfileMemberId}
        onSaveVitals={handleSaveVitals}
      />

      <ScanReportModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        members={members}
        initialMemberId={scanInitialMemberId}
        initialScanType={scanInitialType}
        onApplyMedicine={handleApplyScannedMedicine}
        onApplyReport={handleApplyScannedReport}
      />

      <ExportBriefModal
        isOpen={isExportBriefOpen}
        onClose={() => setIsExportBriefOpen(false)}
        member={activeProfileMember}
        medications={medications}
        records={records}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onActionClick={(actionType, notifId) => {
          if (notifId) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
            );
          }
          if (actionType === 'remind-father') {
            showToast('已向父亲健康屏发送即时提醒');
          } else if (actionType === 'view-schedule') {
            setIsNotificationsOpen(false);
            setIsScheduleModalOpen(true);
          }
        }}
      />

      <LabReportDetailModal
        isOpen={!!selectedLabReport}
        onClose={() => setSelectedLabReport(null)}
        report={selectedLabReport}
      />

      <AddRecordModal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        members={members}
        onAddRecord={handleAddRecord}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedScheduleDetailId(undefined);
        }}
        schedules={schedules}
        members={members}
        initialSelectedId={selectedScheduleDetailId}
        onToggleComplete={handleToggleCompleteSchedule}
        onToggleReminder={handleToggleReminderSchedule}
        onDeleteSchedule={handleDeleteSchedule}
        onAddSchedule={handleAddSchedule}
        onShowToast={showToast}
      />
    </div>
  );
}
