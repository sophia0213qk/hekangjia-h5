import React, { useState } from 'react';
import { MedicalRecord, LabReport, FamilyMember } from '../types';

interface RecordsTimelineViewProps {
  records: MedicalRecord[];
  labReports: LabReport[];
  members: FamilyMember[];
  onSelectReport: (report: LabReport) => void;
  onAddRecord: () => void;
  onUploadReport?: (memberId?: string) => void;
  onDeleteReport?: (id: string) => void;
  onDeleteRecord?: (id: string) => void;
}

export const RecordsTimelineView: React.FC<RecordsTimelineViewProps> = ({
  records,
  labReports,
  members,
  onSelectReport,
  onAddRecord,
  onUploadReport,
  onDeleteReport,
  onDeleteRecord,
}) => {
  const [filterMemberId, setFilterMemberId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<
    { type: 'report' | 'record'; id: string; title: string } | null
  >(null);

  const filteredRecords = records.filter((r) => {
    const matchMember = filterMemberId === 'all' || r.memberId === filterMemberId;
    const matchSearch =
      !searchQuery.trim() ||
      r.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMember && matchSearch;
  });

  const filteredReports = labReports.filter(
    (l) => filterMemberId === 'all' || l.memberId === filterMemberId
  );

  return (
    <div className="min-h-screen bg-[#f0fcf5] text-[#131e1a] pb-28">
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685d] text-[24px]">
              folder_shared
            </span>
            <h2 className="text-[18px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
              家庭就诊随访病历与化验单
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="records-upload-report-header-btn"
              onClick={() => onUploadReport && onUploadReport(filterMemberId !== 'all' ? filterMemberId : undefined)}
              className="text-[12px] bg-[#f0fcf5] hover:bg-[#e5f1ea] text-[#00685d] border border-[#00685d]/20 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer active:scale-95 shadow-2xs shrink-0 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              <span>上传化验单</span>
            </button>
            <button
              type="button"
              id="records-add-visit-btn"
              onClick={onAddRecord}
              className="text-[12px] bg-[#00685d] hover:bg-[#005047] text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>录入就诊</span>
            </button>
          </div>
        </div>

        {/* Member Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap py-1">
          <button
            type="button"
            onClick={() => setFilterMemberId('all')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all shrink-0 cursor-pointer ${
              filterMemberId === 'all'
                ? 'bg-[#00685d] text-white shadow-xs'
                : 'bg-white text-[#3e4946] border border-[#00685d]/10 hover:bg-[#e5f1ea]'
            }`}
          >
            全家全部记录
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setFilterMemberId(m.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                filterMemberId === m.id
                  ? 'bg-[#00685d] text-white shadow-xs'
                  : 'bg-white text-[#3e4946] border border-[#00685d]/10 hover:bg-[#e5f1ea]'
              }`}
            >
              <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
              <span>{m.nickname} ({m.name})</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined text-[20px] text-[#6f7975] absolute left-3.5 top-3">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索就诊医院、科室、诊断结论..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#00685d]/10 text-[13px] text-[#131e1a] focus:outline-none focus:ring-1 focus:ring-[#00685d]"
          />
        </div>

        {/* Lab Reports Section */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#00685d]/10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#00685d] text-[20px] shrink-0">
                description
              </span>
              <h3 className="text-[15px] font-bold text-[#131e1a] truncate">重要检查与化验单</h3>
              <span className="text-[11px] text-[#6f7975] whitespace-nowrap shrink-0">
                共 {filteredReports.length} 份报告
              </span>
            </div>

            <button
              type="button"
              id="upload-lab-report-card-header-btn"
              onClick={() => onUploadReport && onUploadReport(filterMemberId !== 'all' ? filterMemberId : undefined)}
              className="text-[12px] bg-[#f0fcf5] hover:bg-[#e5f1ea] text-[#00685d] border border-[#00685d]/20 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer active:scale-95 shadow-2xs shrink-0 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              <span>上传化验单</span>
            </button>
          </div>

          {filteredReports.length === 0 ? (
            <div className="py-6 px-4 text-center rounded-2xl bg-[#f8f9ff] border border-dashed border-[#00685d]/20 flex flex-col items-center justify-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#6f7975]">description</span>
              <p className="text-[13px] font-bold text-[#131e1a]">暂无该家庭成员的化验单记录</p>
              <p className="text-[11px] text-[#6f7975]">支持拍照或上传化验单，AI 自动提取关键指标并归档</p>
              <button
                type="button"
                onClick={() => onUploadReport && onUploadReport(filterMemberId !== 'all' ? filterMemberId : undefined)}
                className="mt-1 text-[12px] bg-[#00685d] hover:bg-[#005047] text-white px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">cloud_upload</span>
                <span>立即上传化验单</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredReports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => onSelectReport(rep)}
                role="button"
                tabIndex={0}
                className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#00685d]/10 shadow-xs hover:border-[#00685d]/30 hover:bg-white transition-all cursor-pointer flex flex-col justify-between space-y-2 group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 gap-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        rep.statusType === 'success'
                          ? 'bg-[#9af3e3]/60 text-[#005047]'
                          : 'bg-[#ffdcc5] text-[#713700]'
                      }`}
                    >
                      {rep.statusTag}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-[#6f7975]">{rep.date}</span>
                      {onDeleteReport && (
                        <button
                          type="button"
                          title="删除化验单"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete({ type: 'report', id: rep.id, title: rep.title });
                          }}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[#a7391e]/80 hover:bg-[#ffdad2] hover:text-[#a7391e] transition"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="text-[13px] font-bold text-[#131e1a] group-hover:text-[#00685d] transition-colors leading-snug line-clamp-2">
                    {rep.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6f7975] pt-1 border-t border-[#00685d]/5">
                  <span className="truncate">{rep.lab}</span>
                  <span className="material-symbols-outlined text-[15px] text-[#00685d] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>
          )}
        </section>

        {/* 就诊随访时间流 (完整置于病历页面中) */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#00685d]/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00685d] text-[20px]">
                timeline
              </span>
              <h3 className="text-[15px] font-bold text-[#131e1a]">历次门诊与就诊随访时间流</h3>
            </div>
            <span className="text-[11px] text-[#00685d] font-semibold">
              共 {filteredRecords.length} 次就诊档案
            </span>
          </div>

          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-[#f8f9ff] border border-dashed border-[#00685d]/20">
                <span className="material-symbols-outlined text-[32px] text-[#6f7975]">clinical_notes</span>
                <p className="mt-2 text-[13px] font-bold text-[#131e1a]">暂无就诊随访记录</p>
                <p className="text-[11px] text-[#6f7975] mt-1">点击上方「录入就诊」添加门诊与复查档案</p>
              </div>
            ) : (
              filteredRecords.map((rec) => {
              const mem = members.find((m) => m.id === rec.memberId);
              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#00685d]/10 shadow-xs space-y-2.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#005047] text-[11px] font-bold shrink-0">
                        {mem?.nickname || '家人'}
                      </span>
                      <h4 className="text-[15px] font-bold text-[#131e1a] truncate">{rec.hospital}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#9af3e3]/50 text-[#005047] font-bold">
                        {rec.status}
                      </span>
                      {onDeleteRecord && (
                        <button
                          type="button"
                          title="删除就诊记录"
                          onClick={() =>
                            setConfirmDelete({
                              type: 'record',
                              id: rec.id,
                              title: `${rec.hospital} · ${rec.department}`,
                            })
                          }
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[#a7391e]/80 hover:bg-[#ffdad2] hover:text-[#a7391e] transition"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#6f7975]">
                    <span className="font-semibold text-[#00685d]">{rec.department}</span>
                    <span>{rec.doctor}</span>
                    <span>{rec.date}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white text-[12px] space-y-1.5 text-[#3e4946] border border-[#00685d]/5">
                    <p>
                      <strong className="text-[#131e1a]">主诉：</strong> “{rec.complaint}”
                    </p>
                    <p>
                      <strong className="text-[#131e1a]">诊断：</strong> {rec.diagnosis}
                    </p>
                    <p className="text-[#00685d]">
                      <strong>医嘱：</strong> {rec.orders}
                    </p>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </section>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#a7391e] text-[28px]">warning</span>
              <div>
                <h4 className="text-[15px] font-bold text-[#131e1a]">确认删除？</h4>
                <p className="text-[12px] text-[#6f7975] mt-1 leading-relaxed">
                  将删除「{confirmDelete.title}」，删除后不可恢复。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#f0fcf5] text-[#3e4946] text-[13px] font-semibold"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDelete.type === 'report') onDeleteReport?.(confirmDelete.id);
                  else onDeleteRecord?.(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#a7391e] hover:bg-[#8c2f18] text-white text-[13px] font-bold"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
