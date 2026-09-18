import React, { useState, useRef } from 'react';
import { FamilyMember, ClanInfo } from '../types/family';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { parseExcelOrCsvData, exportToExcel, exportToCSV, downloadExcelTemplate } from '../utils/excelHelper';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  clanInfo: ClanInfo;
  onImportData: (newMembers: FamilyMember[]) => void;
  onResetToSample: () => void;
  onLoadLargeDemo: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  members,
  clanInfo,
  onImportData,
  onResetToSample,
  onLoadLargeDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'backup' | 'python_sqlite'>('import');
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    parsedMembers: FamilyMember[];
    errors: string[];
    warnings: string[];
    fileName: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const result = parseExcelOrCsvData(buffer);
        setImportResult({
          parsedMembers: result.members,
          errors: result.errors,
          warnings: result.warnings,
          fileName: file.name,
        });
      } catch (err: any) {
        setImportResult({
          parsedMembers: [],
          errors: ['Lỗi đọc file: ' + err.message],
          warnings: [],
          fileName: file.name,
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleApplyImport = () => {
    if (!importResult || importResult.parsedMembers.length === 0) return;
    onImportData(importResult.parsedMembers);
    alert(`Đã nhập thành công ${importResult.parsedMembers.length} thành viên vào cây gia phả!`);
    onClose();
  };

  // Sao lưu JSON
  const handleExportJSON = () => {
    const backupObj = {
      clanInfo,
      members,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_Gia_Pha_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Khôi phục JSON
  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed.members)) {
          onImportData(parsed.members);
          alert(`Đã khôi phục thành công ${parsed.members.length} thành viên từ bản sao lưu!`);
          onClose();
        } else if (Array.isArray(parsed)) {
          onImportData(parsed);
          alert(`Đã khôi phục thành công ${parsed.length} thành viên!`);
          onClose();
        } else {
          alert('File sao lưu JSON không đúng cấu trúc!');
        }
      } catch (err) {
        alert('File JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  // Đoạn mã Python Pandas + SQLite3 cho người dùng
  const pythonScript = `# ========================================================
# CHƯƠNG TRÌNH XỬ LÝ DỮ LIỆU GIA PHẢ (PANDAS + SQLITE3)
# Hướng dẫn chạy trên Thonny IDE hoặc Python:
# 1. pip install pandas openpyxl
# 2. Chạy file này cùng thư mục với giapha.xlsx
# ========================================================
import pandas as pd
import sqlite3

# 1. Đọc file Excel dữ liệu thô
df = pd.read_excel('giapha.xlsx')

# 2. Tự động làm sạch dữ liệu và khoảng trắng
for col in df.select_dtypes(include='object').columns:
    df[col] = df[col].astype(str).str.strip()

# 3. Chuẩn hóa ID và các trường số
df['ID'] = pd.to_numeric(df['ID'], errors='coerce')
df['DoiThu'] = pd.to_numeric(df['DoiThu'], errors='coerce').fillna(1)
df['ID_Cha'] = pd.to_numeric(df['ID_Cha'], errors='coerce')
df['ID_Me'] = pd.to_numeric(df['ID_Me'], errors='coerce')
df['ID_VoChong'] = pd.to_numeric(df['ID_VoChong'], errors='coerce')

# 4. Nạp vào cơ sở dữ liệu SQLite (giapha.db)
conn = sqlite3.connect('giapha.db')
df.to_sql('thanh_vien', conn, if_exists='replace', index=False)

print(f"Đã nạp thành công {len(df)} thành viên vào CSDL giapha.db!")
conn.close()
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#141414] rounded-2xl shadow-2xl border border-[#262626] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[#e5e5e5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1f1a14] border border-[#3d2f1f] text-[#c4a47c] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#e5e5e5] text-base">Quản Lý & Nhập Xuất Dữ Liệu Gia Phả</h3>
              <p className="text-xs text-[#8a8a8a]">Hỗ trợ Excel, CSV, JSON, SQLite và Tự động làm sạch dữ liệu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#222222] text-[#737373] hover:text-[#e5e5e5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#262626] bg-[#0f0f0f] px-6 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'import'
                ? 'border-[#c4a47c] text-[#c4a47c] bg-[#141414] rounded-t-lg'
                : 'border-transparent text-[#737373] hover:text-[#e5e5e5]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập File Excel / CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'export'
                ? 'border-[#c4a47c] text-[#c4a47c] bg-[#141414] rounded-t-lg'
                : 'border-transparent text-[#737373] hover:text-[#e5e5e5]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất File (Excel / CSV)</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'backup'
                ? 'border-[#c4a47c] text-[#c4a47c] bg-[#141414] rounded-t-lg'
                : 'border-transparent text-[#737373] hover:text-[#e5e5e5]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Sao Lưu & Mẫu Dữ Liệu</span>
          </button>
          <button
            onClick={() => setActiveTab('python_sqlite')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'python_sqlite'
                ? 'border-[#c4a47c] text-[#c4a47c] bg-[#141414] rounded-t-lg'
                : 'border-transparent text-[#737373] hover:text-[#e5e5e5]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Mã Nguồn Python / SQLite</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: IMPORT EXCEL / CSV */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-[#c4a47c] bg-[#1f1a14] scale-[0.99]'
                    : 'border-[#2e2e2e] hover:border-[#c4a47c]/60 bg-[#181818] hover:bg-[#1f1a14]/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                <div className="w-12 h-12 rounded-2xl bg-[#1f1a14] border border-[#3d2f1f] text-[#c4a47c] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-[#e5e5e5] mb-1">
                  Kéo thả file Excel (.xlsx) hoặc CSV vào đây
                </h4>
                <p className="text-[#8a8a8a] mb-3">
                  Hoặc nhấp chuột để chọn file từ máy tính của bạn
                </p>
                <div className="inline-flex items-center gap-2 text-[11px] text-[#c4a47c] bg-[#1f1a14] border border-[#3d2f1f] px-3 py-1 rounded-full">
                  <span>Hỗ trợ các cột: ID, MaGiaPha, HoTen, GioiTinh, ID_Cha, ID_Me, ID_VoChong, DoiThu, NamSinh, NamMat, GhiChu...</span>
                </div>
              </div>

              {/* Template Download Prompt */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#262626]">
                <div>
                  <div className="font-semibold text-[#e5e5e5]">Chưa có file mẫu chuẩn?</div>
                  <div className="text-[#8a8a8a] text-[11px]">Tải file Excel mẫu được thiết kế chuẩn các cột để điền thông tin</div>
                </div>
                <button
                  onClick={downloadExcelTemplate}
                  className="px-3 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] rounded-lg font-semibold text-[#e5e5e5] flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#c4a47c]" />
                  <span>Tải File Mẫu</span>
                </button>
              </div>

              {/* Preview Result */}
              {importResult && (
                <div className="space-y-3 pt-2">
                  <h5 className="font-bold text-[#e5e5e5] flex items-center gap-2">
                    {importResult.errors.length > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>Kết quả đọc file: {importResult.fileName}</span>
                  </h5>

                  {importResult.errors.length > 0 && (
                    <div className="p-3 bg-[#2d1417] text-[#f87171] border border-[#4d1f24] rounded-xl space-y-1">
                      {importResult.errors.map((err, idx) => (
                        <div key={idx}>• {err}</div>
                      ))}
                    </div>
                  )}

                  {importResult.warnings.length > 0 && (
                    <div className="p-3 bg-[#241c12] text-[#c4a47c] border border-[#42321e] rounded-xl space-y-1 max-h-28 overflow-y-auto">
                      <div className="font-semibold">Cảnh báo tự động làm sạch:</div>
                      {importResult.warnings.map((w, idx) => (
                        <div key={idx}>• {w}</div>
                      ))}
                    </div>
                  )}

                  {importResult.parsedMembers.length > 0 && (
                    <div className="p-4 bg-[#132219] border border-[#1f382a] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#4ade80] text-sm">
                          Tìm thấy {importResult.parsedMembers.length} thành viên hợp lệ!
                        </div>
                        <div className="text-[#86efac] text-[11px]">
                          Cây phả hệ sẽ được vẽ lại tự động ngay sau khi bạn áp dụng.
                        </div>
                      </div>
                      <button
                        onClick={handleApplyImport}
                        className="px-4 py-2 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] font-bold rounded-lg shadow-md transition-colors"
                      >
                        Áp Dụng Vào Cây Gia Phả
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-[#a3a3a3]">
                Xuất toàn bộ cơ sở dữ liệu gia phả hiện tại ra các định dạng chuẩn để in ấn, lưu trữ hoặc nạp vào phần mềm quản lý khác:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Excel Option */}
                <div className="p-4 rounded-xl border border-[#262626] bg-[#181818] hover:bg-[#1c1a16] transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#e5e5e5] text-sm mb-1">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                      <span>Xuất File Excel (.xlsx)</span>
                    </div>
                    <p className="text-[#8a8a8a] text-[11px] mb-3">
                      Định dạng chuẩn các cột: ID, MaGiaPha, HoTen, GioiTinh, ID_Cha, ID_Me, ID_VoChong, DoiThu, NamSinh, NamMat, GhiChu...
                    </p>
                  </div>
                  <button
                    onClick={() => exportToExcel(members, clanInfo.tenDongHo)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File Excel ({members.length} người)</span>
                  </button>
                </div>

                {/* CSV Option */}
                <div className="p-4 rounded-xl border border-[#262626] bg-[#181818] hover:bg-[#1c1a16] transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#e5e5e5] text-sm mb-1">
                      <FileText className="w-5 h-5 text-[#c4a47c]" />
                      <span>Xuất File CSV (.csv)</span>
                    </div>
                    <p className="text-[#8a8a8a] text-[11px] mb-3">
                      Chuẩn UTF-8 tương thích tốt với Pandas, R, Google Sheets, Excel và hệ cơ sở dữ liệu.
                    </p>
                  </div>
                  <button
                    onClick={() => exportToCSV(members, clanInfo.tenDongHo)}
                    className="w-full py-2 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File CSV ({members.length} người)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & DEMO DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#262626] bg-[#181818] space-y-3">
                <h5 className="font-bold text-[#e5e5e5]">Sao lưu & Khôi phục toàn diện (JSON Backup)</h5>
                <p className="text-[#8a8a8a] text-[11px]">
                  Tải về file sao lưu đầy đủ chứa toàn bộ thông tin dòng tộc, liên kết phả hệ và các ghi chú tưởng niệm để lưu trữ an toàn.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Bản Sao Lưu JSON</span>
                  </button>

                  <label className="px-4 py-2 bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] font-semibold rounded-lg text-[#e5e5e5] flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#c4a47c]" />
                    <span>Khôi Phục Từ File JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#3d2f1f] bg-[#1f1a14] space-y-3">
                <h5 className="font-bold text-[#c4a47c]">Dữ liệu mẫu thử nghiệm</h5>
                <p className="text-[#a3a3a3] text-[11px]">
                  Bạn có thể quay lại 15 thành viên mẫu gốc trong ảnh hoặc nạp dòng họ 120 thành viên đa thế hệ để kiểm tra sức chứa và giao diện.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      if (confirm('Khôi phục lại 15 thành viên mẫu ban đầu (như trong ảnh)?')) {
                        onResetToSample();
                        onClose();
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] border border-[#3d2f1f] font-semibold rounded-lg text-[#c4a47c] flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Mẫu gốc 15 người (Theo ảnh)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Nạp bộ dữ liệu thử nghiệm 120 thành viên (Đa thế hệ Đời 1 -> Đời 6)?')) {
                        onLoadLargeDemo();
                        onClose();
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#c4a47c] hover:bg-[#b5956d] font-bold rounded-lg text-[#0a0a0a] flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>Nạp Dòng Họ Lớn (120+ người)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PYTHON + SQLITE CODE GENERATOR */}
          {activeTab === 'python_sqlite' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[#a3a3a3]">
                  Mã nguồn Python sử dụng thư viện Pandas để tự động làm sạch và nạp file Excel vào cơ sở dữ liệu SQLite (<code className="bg-[#222222] text-[#c4a47c] px-1.5 py-0.5 rounded font-mono">giapha.db</code>) như bạn yêu cầu:
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pythonScript);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] rounded text-[#e5e5e5] flex items-center gap-1 font-medium transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#c4a47c]" />}
                  <span>{copiedCode ? 'Đã sao chép' : 'Sao chép mã'}</span>
                </button>
              </div>

              <pre className="p-4 bg-[#0a0a0a] text-[#d4d4d4] border border-[#262626] rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                {pythonScript}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
