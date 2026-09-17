import React, { useState } from 'react';
import { LabReport } from '../types';
import { api } from '../api/client';

interface LabReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: LabReport | null;
  onShowToast?: (msg: string) => void;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function guessExt(report: LabReport, blob: Blob): string {
  const fromUrl = report.sourceFileUrl?.match(/\.(jpe?g|png|webp|gif|bmp|pdf)$/i)?.[0];
  if (fromUrl) return fromUrl.toLowerCase();
  const mime = blob.type || '';
  if (mime.includes('png')) return '.png';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('gif')) return '.gif';
  if (mime.includes('pdf')) return '.pdf';
  return '.jpg';
}

export const LabReportDetailModal: React.FC<LabReportDetailModalProps> = ({
  isOpen,
  onClose,
  report,
  onShowToast,
}) => {
  const [exporting, setExporting] = useState(false);

  if (!isOpen || !report) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      // Always fetch original uploaded image from server (not HTML)
      const blob = await api.downloadLabOriginal(report.id);
      const safeTitle = (report.title || '化验报告原单').replace(/[\\/:*?"<>|]/g, '_');
      downloadBlob(blob, `${safeTitle}${guessExt(report, blob)}`);
      onShowToast?.('已导出上传的原报告图片');
    } catch (e) {
      onShowToast?.(
        e instanceof Error
          ? e.message
          : '导出失败：未找到上传原图，请重新拍照/上传化验单后再归档'
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#00685d]/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685d] text-[22px]">
              lab_research
            </span>
            <h3 className="text-[17px] font-bold text-[#131e1a]">化验检查详细报告</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#f0fcf5] border border-[#00685d]/15 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-[15px] font-bold text-[#131e1a]">{report.title}</h4>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                report.statusType === 'success'
                  ? 'bg-[#9af3e3]/60 text-[#005047]'
                  : 'bg-[#ffdcc5] text-[#713700]'
              }`}
            >
              {report.statusTag}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#6f7975]">
            <span>采样日期：{report.date}</span>
            <span>检验机构：{report.lab}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[12px] font-bold text-[#131e1a]">检测项目与参考值比对</span>
          <div className="border border-[#00685d]/10 rounded-2xl overflow-hidden">
            <table className="w-full text-[12px] text-left">
              <thead className="bg-[#f0fcf5] text-[#6f7975] text-[11px] border-b border-[#00685d]/10">
                <tr>
                  <th className="p-2.5">项目名称</th>
                  <th className="p-2.5">测定结果</th>
                  <th className="p-2.5">参考区间</th>
                  <th className="p-2.5 text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00685d]/5">
                {report.metrics.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#f0fcf5]/40 transition-colors">
                    <td className="p-2.5 font-medium text-[#131e1a]">{m.name}</td>
                    <td className="p-2.5 font-bold text-[#00685d]">{m.value}</td>
                    <td className="p-2.5 text-[#6f7975]">{m.reference}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          m.isNormal
                            ? 'bg-[#9af3e3]/50 text-[#005047]'
                            : 'bg-[#ffdad2] text-[#a7391e]'
                        }`}
                      >
                        {m.statusLabel || (m.isNormal ? '正常' : '异常')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold"
          >
            返回
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => void handleExport()}
            className="flex-1 py-2.5 rounded-xl bg-[#00685d] hover:bg-[#005047] text-white text-[13px] font-bold shadow-sm disabled:opacity-60"
          >
            {exporting ? '导出中…' : '导出报告原单'}
          </button>
        </div>
      </div>
    </div>
  );
};
