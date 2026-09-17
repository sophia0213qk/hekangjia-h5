import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember } from '../types';
import { api } from '../api/client';

interface ScanReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  initialMemberId?: string;
  initialScanType?: 'medicine' | 'lab';
  onApplyMedicine?: (medData: any) => void;
  onApplyReport?: (reportData: any) => void;
}

export const ScanReportModal: React.FC<ScanReportModalProps> = ({
  isOpen,
  onClose,
  members,
  initialMemberId,
  initialScanType,
  onApplyMedicine,
  onApplyReport,
}) => {
  const [scanType, setScanType] = useState<'medicine' | 'lab'>(initialScanType || 'lab');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    initialMemberId || members[0]?.id || 'father'
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [recognizedResult, setRecognizedResult] = useState<any | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [scanError, setScanError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialScanType) setScanType(initialScanType);
      if (initialMemberId && initialMemberId !== 'all') {
        setSelectedMemberId(initialMemberId);
      } else if (!selectedMemberId && members.length > 0) {
        setSelectedMemberId(members[0].id);
      }
      setRecognizedResult(null);
      setUploadedFileName('');
      setScanError('');
    }
  }, [isOpen, initialMemberId, initialScanType, members]);

  if (!isOpen) return null;

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  const handleStartScan = async (
    preset: 'box' | 'lab1' | 'lab2' | 'custom',
    customName?: string,
    file?: File
  ) => {
    setIsScanning(true);
    setRecognizedResult(null);
    setScanError('');

    try {
      if (preset === 'custom' && file) {
        const res = await api.scan(scanType, file);
        const data = res.data || {};
        if (scanType === 'medicine') {
          setRecognizedResult({
            type: 'medicine',
            title: data.title || customName || '识别药品',
            spec: data.spec || '',
            manufacturer: data.manufacturer || '',
            approval: data.approval || '',
            indications: data.indications || [],
            suggestedDose: data.suggestedDose || '',
            confidence: `${Math.round((res.confidence || 0) * 1000) / 10}%`,
          });
        } else {
          const items = (data.items as Array<Record<string, string>> | undefined) || [];
          setRecognizedResult({
            type: 'lab',
            title: data.title || customName || '化验报告',
            date: data.date || new Date().toISOString().split('T')[0],
            lab: data.lab || '',
            items: items.map((it) => ({
              name: it.name,
              value: it.value,
              status: it.status === 'abnormal' ? '异常' : it.status || '正常',
            })),
            confidence: `${Math.round((res.confidence || 0) * 1000) / 10}%`,
          });
        }
        return;
      }

      // Demo presets (offline sample cards)
      await new Promise((r) => setTimeout(r, 600));
      if (preset === 'box') {
        setRecognizedResult({
          type: 'medicine',
          title: '苯磺酸氨氯地平片 (络活喜)',
          spec: '5mg * 28片 / 盒',
          manufacturer: '辉瑞制药 (大连) 有限公司',
          approval: '国药准字 H10950224',
          indications: ['高血压', '慢性稳定性心绞痛'],
          suggestedDose: '一次 5mg (1片)，一日 1 次',
          confidence: '99.4%',
        });
      } else if (preset === 'lab1') {
        setRecognizedResult({
          type: 'lab',
          title: '四川大学华西医院 · 生化全项检验报告单',
          date: new Date().toISOString().split('T')[0],
          lab: '四川大学华西医院检验科',
          items: [
            { name: '空腹血糖 (FBG)', value: '5.62 mmol/L', status: '正常' },
            { name: '总胆固醇 (TC)', value: '4.21 mmol/L', status: '达标' },
            { name: '低密度脂蛋白 (LDL-C)', value: '1.98 mmol/L', status: '优质' },
            { name: '血肌酐 (Cr)', value: '78 μmol/L', status: '正常' },
          ],
          confidence: '98.8%',
        });
      } else if (preset === 'lab2') {
        setRecognizedResult({
          type: 'lab',
          title: '华西医院 · 24小时动态心电监测报告',
          date: new Date().toISOString().split('T')[0],
          lab: '华西医院心功能检查室',
          items: [
            { name: '全程总心搏', value: '102,480次', status: '正常' },
            { name: '平均心率', value: '71 次/分', status: '平稳' },
            { name: 'ST-T 改变', value: '无明显缺血型下移', status: '良性' },
          ],
          confidence: '99.1%',
        });
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : '识别失败');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    handleStartScan('custom', file.name.replace(/\.[^/.]+$/, ''), file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl border border-[#00685d]/10 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#00685d]/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685d] text-[22px]">
              document_scanner
            </span>
            <h3 className="text-[17px] font-bold text-[#131e1a]">
              {scanType === 'lab' ? '上传并识别化验单' : '智能识别 · 扫化验单/药盒'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 重点：选择是哪个家庭成员 */}
        <div className="space-y-2 bg-[#f0fcf5] p-3.5 rounded-2xl border border-[#00685d]/20">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#00685d] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
              请选择所属家庭成员：
            </span>
            <span className="text-[11px] text-[#00685d] bg-white px-2 py-0.5 rounded-full border border-[#00685d]/20 font-semibold">
              归入：{selectedMember?.nickname} ({selectedMember?.name})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {members.map((m) => {
              const isSelected = selectedMemberId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`p-2 rounded-xl flex items-center gap-2 border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#00685d] text-white border-[#00685d] shadow-xs scale-102 ring-2 ring-[#00685d]/30'
                      : 'bg-white text-[#3e4946] border-[#00685d]/15 hover:bg-[#e5f1ea]'
                  }`}
                >
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className={`w-7 h-7 rounded-full object-cover shrink-0 ${
                      isSelected ? 'ring-2 ring-white' : ''
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold truncate">{m.nickname}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[14px] text-[#9af3e3]">
                          check_circle
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] block truncate ${
                        isSelected ? 'text-white/80' : 'text-[#6f7975]'
                      }`}
                    >
                      {m.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scan Mode Toggle */}
        <div className="flex rounded-xl bg-[#f0fcf5] p-1 border border-[#00685d]/10">
          <button
            type="button"
            onClick={() => {
              setScanType('lab');
              setRecognizedResult(null);
            }}
            className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              scanType === 'lab' ? 'bg-white text-[#00685d] shadow-xs' : 'text-[#6f7975]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">lab_research</span>
            化验单 / 心电图 / 检验报告
          </button>
          <button
            type="button"
            onClick={() => {
              setScanType('medicine');
              setRecognizedResult(null);
            }}
            className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              scanType === 'medicine' ? 'bg-white text-[#00685d] shadow-xs' : 'text-[#6f7975]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">medication</span>
            识别药盒 / 处方
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="hidden"
        />

        {/* Camera Viewfinder / Upload Action Box */}
        <div className="relative h-44 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden flex flex-col items-center justify-center text-white border-2 border-dashed border-[#00685d]/40 space-y-2">
          {isScanning && (
            <div className="absolute inset-x-0 top-0 h-1 bg-[#2E9E6D] shadow-[0_0_12px_#2E9E6D] animate-bounce"></div>
          )}

          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] text-[#9af3e3]">
              {scanType === 'medicine' ? 'qr_code_scanner' : 'cloud_upload'}
            </span>
          </div>

          <div className="text-center px-4">
            <span className="text-[13px] font-semibold text-gray-100 block">
              {isScanning
                ? 'AI 正在分析提取化验单各项指标...'
                : uploadedFileName
                ? `已选文件：${uploadedFileName}`
                : '请拍照或选择化验单/检验报告文件'}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              支持清晰图片 (JPG, PNG) 与 PDF 格式 · 自动校正倾斜与提取异常指标
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="px-4 py-1.5 rounded-full bg-[#00685d] hover:bg-[#005047] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">file_upload</span>
              <span>从手机/电脑选取报告</span>
            </button>
          </div>
        </div>

        {scanError && (
          <div className="flex items-start gap-1.5 text-[12px] text-[#a7391e] bg-[#fdecea] rounded-xl px-3 py-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
            <span>{scanError}</span>
          </div>
        )}

        {/* Preset sample buttons for instant testing */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-[#6f7975] font-medium">或体验智能识别示例报告：</span>
          <div className="flex flex-wrap gap-2">
            {scanType === 'medicine' ? (
              <button
                type="button"
                onClick={() => handleStartScan('box')}
                className="px-3 py-1.5 rounded-lg bg-[#f0fcf5] hover:bg-[#e5f1ea] text-[#00685d] border border-[#00685d]/15 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">pill</span>
                示例：络活喜药盒
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleStartScan('lab1')}
                  className="px-3 py-1.5 rounded-lg bg-[#f0fcf5] hover:bg-[#e5f1ea] text-[#00685d] border border-[#00685d]/15 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">description</span>
                  示例：华西生化血脂全套
                </button>
                <button
                  type="button"
                  onClick={() => handleStartScan('lab2')}
                  className="px-3 py-1.5 rounded-lg bg-[#f0fcf5] hover:bg-[#e5f1ea] text-[#00685d] border border-[#00685d]/15 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">ecg_heart</span>
                  示例：动态心电报告单
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recognized Result Panel */}
        {recognizedResult && (
          <div className="p-3.5 rounded-2xl bg-[#f0fcf5] border border-[#00685d]/20 space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#00685d] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                识别成功 (准确率 {recognizedResult.confidence})
              </span>
              <span className="text-[11px] text-[#131e1a] font-semibold">
                归属：{selectedMember?.nickname} ({selectedMember?.name})
              </span>
            </div>

            <h4 className="text-[14px] font-bold text-[#131e1a]">{recognizedResult.title}</h4>

            {recognizedResult.type === 'medicine' ? (
              <div className="text-[12px] text-[#3e4946] space-y-1">
                <p>
                  <strong>推荐用法：</strong> {recognizedResult.suggestedDose}
                </p>
                <p>
                  <strong>适应症：</strong> {recognizedResult.indications.join('、')}
                </p>
                <p className="text-[11px] text-[#6f7975]">
                  批号：{recognizedResult.approval} · {recognizedResult.spec}
                </p>
              </div>
            ) : (
              <div className="space-y-1 pt-1">
                {recognizedResult.items.map((it: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-[11px] p-2 bg-white rounded-lg border border-[#00685d]/10"
                  >
                    <span className="font-medium text-[#131e1a]">{it.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#00685d]">{it.value}</span>
                      <span className="text-[10px] px-1.5 rounded bg-[#9af3e3]/50 text-[#005047] font-semibold">
                        {it.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (recognizedResult.type === 'medicine' && onApplyMedicine) {
                    onApplyMedicine({
                      ...recognizedResult,
                      memberId: selectedMemberId,
                    });
                  } else if (onApplyReport) {
                    onApplyReport({
                      ...recognizedResult,
                      memberId: selectedMemberId,
                    });
                  }
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-[#00685d] hover:bg-[#005047] text-white text-[13px] font-bold shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                <span>
                  {recognizedResult.type === 'medicine'
                    ? `一键代入【${selectedMember?.nickname}】用药档案`
                    : `确认归档至【${selectedMember?.nickname} · ${selectedMember?.name}】化验单`}
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold transition-colors cursor-pointer"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
