import React, { useState, useEffect, useCallback } from 'react';
import { FamilyMember, Medication, MedicalRecord, LabReport, MedicalSchedule } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MemberSwitcher } from './components/MemberSwitcher';
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
  clearLegacyBusinessCache,
  clearSession,
  getStoredUser,
  getToken,
} from './api/client';
import { resolveAvatar } from './utils/avatar';

function emptyVitals(): FamilyMember['vitals'] {
  return {
    bloodPressure: {
      systolic: 120,
      diastolic: 80,
      changeText: '暂无',
      status: '待录入',
      history: [],
      measuredAt: '暂无',
    },
  };
}

function normalizeMember(m: FamilyMember): FamilyMember {
  return {
    ...m,
    avatar: resolveAvatar(m.avatar),
    allergies: m.allergies || [],
    chronicConditions: m.chronicConditions || [],
    vitals: m.vitals?.bloodPressure ? m.vitals : { ...emptyVitals(), ...(m.vitals || {}) },
  };
}

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    getToken() ? getStoredUser() : null
  );
  const [authChecking, setAuthChecking] = useState(() => !!getToken());
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [schedules, setSchedules] = useState<MedicalSchedule[]>([]);
  const [notifications, setNotifications] = useState<HealthNotification[]>([]);

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [activeProfileMemberId, setActiveProfileMemberId] = useState<string>('');

  const [isRecordVitalsOpen, setIsRecordVitalsOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [scanInitialMemberId, setScanInitialMemberId] = useState<string>('');
  const [scanInitialType, setScanInitialType] = useState<'medicine' | 'lab'>('lab');
  const [isExportBriefOpen, setIsExportBriefOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedScheduleDetailId, setSelectedScheduleDetailId] = useState<string | undefined>();
  const [selectedLabReport, setSelectedLabReport] = useState<LabReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAllData = useCallback(async () => {
    setDataLoading(true);
    setDataError('');
    clearLegacyBusinessCache();
    try {
      const [mems, meds, recs, labs, schs, notifs] = await Promise.all([
        api.getMembers(),
        api.getMedications(),
        api.getRecords(),
        api.getLabReports(),
        api.getSchedules(),
        api.getNotifications(),
      ]);
      const normalized = mems.map(normalizeMember);
      setMembers(normalized);
      setMedications(meds);
      setRecords(recs);
      setLabReports(labs);
      setSchedules(schs);
      setNotifications(notifs);
      if (normalized.length > 0) {
        setActiveProfileMemberId((prev) =>
          prev && normalized.some((m) => m.id === prev) ? prev : normalized[0].id
        );
        setScanInitialMemberId((prev) =>
          prev && normalized.some((m) => m.id === prev) ? prev : normalized[0].id
        );
      }
    } catch (e) {
      setDataError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthChecking(false);
      return;
    }
    api
      .me()
      .then((user) => {
        setAuthUser(user);
      })
      .catch(() => {
        clearSession();
        setAuthUser(null);
      })
      .finally(() => setAuthChecking(false));
  }, []);

  useEffect(() => {
    if (authUser) {
      loadAllData();
    } else {
      setMembers([]);
      setMedications([]);
      setRecords([]);
      setLabReports([]);
      setSchedules([]);
      setNotifications([]);
    }
  }, [authUser, loadAllData]);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('所有健康通知已标为已读');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '操作失败');
    }
  };

  const handleOpenUploadReport = (memberId?: string) => {
    setScanInitialType('lab');
    if (memberId && memberId !== 'all') {
      setScanInitialMemberId(memberId);
    } else if (activeProfileMemberId) {
      setScanInitialMemberId(activeProfileMemberId);
    } else if (members[0]) {
      setScanInitialMemberId(members[0].id);
    }
    setIsScanOpen(true);
  };

  const handleToggleCompleteSchedule = async (id: string) => {
    const current = schedules.find((s) => s.id === id);
    if (!current) return;
    try {
      const updated = await api.updateSchedule(id, { isCompleted: !current.isCompleted });
      setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (e) {
      showToast(e instanceof Error ? e.message : '更新失败');
    }
  };

  const handleToggleReminderSchedule = async (id: string) => {
    const current = schedules.find((s) => s.id === id);
    if (!current) return;
    try {
      const updated = await api.updateSchedule(id, { reminderSet: !current.reminderSet });
      setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (e) {
      showToast(e instanceof Error ? e.message : '更新失败');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await api.deleteSchedule(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      showToast(e instanceof Error ? e.message : '删除失败');
    }
  };

  const handleAddSchedule = async (scheduleData: Omit<MedicalSchedule, 'id'>) => {
    const timeMatch = scheduleData.time?.match(/(\d{1,2}):(\d{2})/);
    const time = timeMatch
      ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`
      : '09:00';
    try {
      const created = await api.createSchedule({
        memberId: scheduleData.memberId,
        title: scheduleData.title,
        type: scheduleData.type || 'clinic',
        dateIso: scheduleData.dateIso || new Date().toISOString().split('T')[0],
        time,
        location: scheduleData.location,
        department: scheduleData.department,
        doctor: scheduleData.doctor,
        tags: scheduleData.tags,
        notes: scheduleData.notes,
        themeColor: scheduleData.themeColor,
        reminderSet: scheduleData.reminderSet ?? true,
      });
      setSchedules((prev) => [created, ...prev]);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '创建失败');
      throw e;
    }
  };

  const handleToggleMedTaken = async (id: string) => {
    try {
      const updated = await api.takeMedication(id);
      setMedications((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (updated.isTakenToday) {
        showToast(`已标为已服：${updated.name}`);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : '操作失败');
    }
  };

  const handleSaveMedication = async (newMed: Partial<Medication>) => {
    try {
      const memberId = newMed.memberId || members[0]?.id;
      if (!memberId) {
        showToast('请先添加家庭成员');
        return;
      }
      const created = await api.createMedication({
        memberId,
        name: newMed.name || '新药品',
        genericName: newMed.genericName || '',
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
        scheduleMode: newMed.scheduleMode || 'continuous',
        startDate: newMed.startDate || new Date().toISOString().split('T')[0],
        duration: newMed.duration || '长期遵医嘱',
      });
      setMedications((prev) => [created, ...prev]);
      showToast(`新药品已保存并开启提醒：${created.name}`);
      setCurrentTab('overview');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '保存失败');
    }
  };

  const handleSaveVitals = async (
    memberId: string,
    vitalType: 'bp' | 'glucose' | 'temp' | 'heartRate',
    data: Record<string, unknown>
  ) => {
    try {
      const updated = await api.recordVitals(memberId, { type: vitalType, data });
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? normalizeMember(updated) : m))
      );
      showToast('体征数据已保存');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '录入失败');
    }
  };

  const handleAddMember = async (newMem: FamilyMember) => {
    try {
      const created = await api.createMember({
        name: newMem.name,
        nickname: newMem.nickname,
        relation: newMem.relation,
        age: newMem.age,
        avatar: newMem.avatar,
        blood_type: newMem.bloodType,
        height: newMem.height,
        weight: newMem.weight,
        chronic_conditions: newMem.chronicConditions,
        allergies: newMem.allergies || [],
        status_text: newMem.statusText,
        status_type: newMem.statusType,
      });
      setMembers((prev) => [...prev, normalizeMember(created)]);
      showToast(`已建立【${created.name}】的家庭健康档案`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '添加失败');
    }
  };

  const handleUpdateMember = async (updatedMem: FamilyMember) => {
    try {
      const saved = await api.updateMember(updatedMem.id, {
        name: updatedMem.name,
        nickname: updatedMem.nickname,
        relation: updatedMem.relation,
        age: updatedMem.age,
        avatar: updatedMem.avatar,
        blood_type: updatedMem.bloodType,
        height: updatedMem.height,
        weight: updatedMem.weight,
        chronic_conditions: updatedMem.chronicConditions,
        allergies: updatedMem.allergies || [],
        status_text: updatedMem.statusText,
        status_type: updatedMem.statusType,
      });
      setMembers((prev) =>
        prev.map((m) => (m.id === saved.id ? normalizeMember({ ...saved, vitals: updatedMem.vitals || saved.vitals }) : m))
      );
      showToast(`已成功保存【${saved.name}】的健康档案`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '保存失败');
    }
  };

  const handleMemberAvatarChange = (memberId: string, avatarUrl: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, avatar: resolveAvatar(avatarUrl) } : m))
    );
  };

  const handleUpdateMedication = async (updatedMed: Medication) => {
    try {
      const saved = await api.updateMedication(updatedMed.id, {
        name: updatedMed.name,
        genericName: updatedMed.genericName || '',
        dosage: updatedMed.dosage,
        dosageForm: updatedMed.dosageForm,
        frequency: updatedMed.frequency,
        timeSlot: updatedMed.timeSlot,
        timeLabel: updatedMed.timeLabel,
        mealTiming: updatedMed.mealTiming,
        tags: updatedMed.tags,
        notes: updatedMed.notes,
        stockCurrent: updatedMed.stockCurrent,
        stockWarning: updatedMed.stockWarning,
        scheduleMode: updatedMed.scheduleMode,
        startDate: updatedMed.startDate,
        duration: updatedMed.duration,
      });
      setMedications((prev) => prev.map((med) => (med.id === saved.id ? saved : med)));
      showToast(`已更新【${saved.name}】的用药与提醒设置`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '更新失败');
    }
  };

  const handleDeleteMedication = async (medId: string) => {
    try {
      await api.deleteMedication(medId);
      setMedications((prev) => prev.filter((m) => m.id !== medId));
      showToast('已停用并移出该药物');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '删除失败');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await api.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast('已删除就诊记录');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '删除失败');
    }
  };

  const handleDeleteLabReport = async (id: string) => {
    try {
      await api.deleteLabReport(id);
      setLabReports((prev) => prev.filter((r) => r.id !== id));
      setSelectedLabReport((prev) => (prev?.id === id ? null : prev));
      showToast('已删除化验单');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '删除失败');
    }
  };

  const handleAddRecord = async (newRec: MedicalRecord) => {
    try {
      const created = await api.createRecord({
        memberId: newRec.memberId,
        hospital: newRec.hospital,
        department: newRec.department,
        date: newRec.date,
        doctor: newRec.doctor,
        status: newRec.status,
        complaint: newRec.complaint,
        diagnosis: newRec.diagnosis,
        orders: newRec.orders,
      });
      setRecords((prev) => [created, ...prev]);
      showToast(`已录入：${created.hospital} 复诊病历`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '录入失败');
      throw e;
    }
  };

  const handleApplyScannedMedicine = (medData: { title?: string }) => {
    setCurrentTab('medication');
    showToast(`已提取：${medData.title || '药品信息'}`);
  };

  const handleApplyScannedReport = async (repData: Record<string, unknown>) => {
    const targetMember =
      members.find((m) => m.id === repData.memberId) ||
      members.find((m) => m.id === activeProfileMemberId) ||
      members[0];
    if (!targetMember) {
      showToast('请先选择成员');
      return;
    }
    try {
      const items = (repData.items as Array<Record<string, string>>) || [];
      const metrics = items.map((it) => {
        const status = (it.status || '').trim();
        let statusLabel = '正常';
        if (['high', '偏高'].includes(status)) statusLabel = '偏高';
        else if (['low', '偏低'].includes(status)) statusLabel = '偏低';
        else if (['abnormal', '异常'].includes(status)) statusLabel = '异常';
        else if (['达标', '优质', '阴性', '正常', 'normal'].includes(status)) statusLabel = status === 'normal' ? '正常' : status;
        else if (status) statusLabel = status;

        const reference = (it.reference || '').trim();
        const badRef = new Set(['参考区间内', '正常', '异常', '偏高', '偏低', statusLabel]);
        return {
          name: it.name,
          value: it.value,
          reference: reference && !badRef.has(reference) ? reference : '—',
          isNormal: ['正常', '达标', '优质', '阴性'].includes(statusLabel),
          statusLabel,
        };
      });
      const hasAbnormal = metrics.some((m) => !m.isNormal);
      const created = await api.createLabReport({
        memberId: targetMember.id,
        title: (repData.title as string) || '化验检验报告单',
        date: (repData.date as string) || new Date().toISOString().split('T')[0],
        lab: (repData.lab as string) || '检验科',
        statusTag: (repData.statusTag as string) || (hasAbnormal ? '存在异常指标' : '指标正常'),
        statusType: (repData.statusType as string) || (hasAbnormal ? 'warning' : 'success'),
        sourceFileUrl:
          (repData.sourceFileUrl as string) ||
          (repData.source_file_url as string) ||
          '',
        metrics,
      });
      setLabReports((prev) => [created, ...prev]);
      setSelectedLabReport(created);
      showToast(`化验单已归档至【${targetMember.nickname} · ${targetMember.name}】健康档案`);
      if (!created.sourceFileUrl) {
        showToast('提示：本次未保存原图，导出报告原单将不可用');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : '归档失败');
    }
  };

  const handleRemindFather = async () => {
    try {
      await api.sendReminder();
      const notifs = await api.getNotifications();
      setNotifications(notifs);
      showToast('已向父亲健康屏及微信发送晨服提示');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '提醒失败');
    }
  };

  const activeProfileMember =
    members.find((m) => m.id === activeProfileMemberId) || members[0];

  const activeOverviewMember =
    selectedMemberId === 'all'
      ? null
      : members.find((m) => m.id === selectedMemberId) || null;

  const displayedMedications =
    selectedMemberId === 'all'
      ? medications
      : medications.filter((m) => m.memberId === selectedMemberId);

  const pendingMedCount = medications.filter((m) => !m.isTakenToday).length;
  const displayName = authUser?.display_name || '用户';
  const todayLabel = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  if (authChecking) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#f0fcf5] gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#00685d]/20 border-t-[#00685d] animate-spin" />
        <p className="text-[13px] text-[#6f7975] font-medium">正在恢复登录状态…</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setAuthUser(user);
        }}
      />
    );
  }

  if (dataLoading && members.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#f0fcf5] gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#00685d]/20 border-t-[#00685d] animate-spin" />
        <p className="text-[13px] text-[#6f7975] font-medium">正在同步家庭健康数据…</p>
      </div>
    );
  }

  if (dataError && members.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#f0fcf5] gap-3 px-6">
        <p className="text-[14px] text-[#a7391e] text-center">{dataError}</p>
        <button
          type="button"
          onClick={() => loadAllData()}
          className="px-4 py-2 rounded-xl bg-[#00685d] text-white text-[13px] font-bold"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0fcf5] text-[#131e1a] font-['Plus_Jakarta_Sans','Inter',sans-serif]">
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#131e1a] text-white px-4 py-2.5 rounded-full text-[13px] font-semibold shadow-xl flex items-center gap-2 animate-fade-in border border-white/20">
          <span className="material-symbols-outlined text-[18px] text-[#9af3e3]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

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

      {currentTab === 'overview' && (
        <main className="max-w-2xl mx-auto pt-16 pb-28 px-4 space-y-4">
          <section className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#00685d] bg-[#e5f1ea] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <span className="inline-block w-2 h-2 rounded-full bg-[#00685d] animate-pulse"></span>
                {todayLabel}
              </span>
              <span className="text-[12px] text-[#6f7975] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#00685d]">eco</span>
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
              <span className="text-[#a7391e] font-bold">{pendingMedCount} 项</span> 健康待办需跟进。
            </p>
          </section>

          <MemberSwitcher
            members={members}
            selectedMemberId={selectedMemberId}
            onSelectMember={(id) => {
              setSelectedMemberId(id);
              if (id !== 'all') setActiveProfileMemberId(id);
            }}
            onAddMember={() => setIsAddMemberOpen(true)}
          />

          <MedicationChecklist
            medications={displayedMedications}
            onToggleTaken={handleToggleMedTaken}
            onAddNewMed={() => setCurrentTab('medication')}
            onDelete={handleDeleteMedication}
          />

          <VitalsGrid
            members={members}
            onOpenDetails={(memberId) => {
              setActiveProfileMemberId(memberId);
              setCurrentTab('health-profile');
            }}
            onRecordVitals={() => setIsRecordVitalsOpen(true)}
          />

          <LifestyleVignette />

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

          <QuickActionDrawer
            onAddMedication={() => setCurrentTab('medication')}
            onScanReport={() => setIsScanOpen(true)}
          />

          <div className="text-center py-4">
            <span className="text-[12px] text-[#6f7975] flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[#00685d] text-[16px]">nest_eco_leaf</span>
              禾康家 · 守护三代人的温润生活
            </span>
          </div>
        </main>
      )}

      {currentTab === 'medication' && (
        <AddMedicationView
          members={members}
          onBack={() => setCurrentTab('overview')}
          onSave={handleSaveMedication}
          onOpenScanCamera={() => {
            setScanInitialType('medicine');
            setScanInitialMemberId(activeProfileMemberId || members[0]?.id || '');
            setIsScanOpen(true);
          }}
        />
      )}

      {currentTab === 'health-profile' && activeProfileMember && (
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
          onAvatarChange={handleMemberAvatarChange}
          onUpdateMedication={handleUpdateMedication}
          onDeleteMedication={handleDeleteMedication}
          onShowToast={showToast}
        />
      )}

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
              onDeleteReport={handleDeleteLabReport}
              onDeleteRecord={handleDeleteRecord}
            />
          </div>
        </div>
      )}

      <BottomNav
        currentTab={currentTab}
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <RecordVitalsModal
        isOpen={isRecordVitalsOpen}
        onClose={() => setIsRecordVitalsOpen(false)}
        members={members}
        initialMemberId={activeProfileMemberId || members[0]?.id}
        onSaveVitals={handleSaveVitals}
      />

      <ScanReportModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        members={members}
        initialMemberId={scanInitialMemberId || members[0]?.id}
        initialScanType={scanInitialType}
        onApplyMedicine={handleApplyScannedMedicine}
        onApplyReport={handleApplyScannedReport}
      />

      {activeProfileMember && (
        <ExportBriefModal
          isOpen={isExportBriefOpen}
          onClose={() => setIsExportBriefOpen(false)}
          member={activeProfileMember}
          medications={medications}
          records={records}
        />
      )}

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
        onActionClick={async (actionType, notifId) => {
          if (notifId) {
            try {
              await api.markNotificationRead(notifId);
              setNotifications((prev) =>
                prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
              );
            } catch {
              /* ignore */
            }
          }
          if (actionType === 'remind-father') {
            await handleRemindFather();
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
        onShowToast={showToast}
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
