import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import { buildStandaloneHtmlContent } from '../utils/generateStandaloneHtml';
import { ConfirmModal } from './ConfirmModal';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const {
    classes,
    students,
    progressRecords,
    attendanceRecords,
    activityLogs,
    exportBackup,
    importBackup,
    resetSampleData,
    clearAllData,
    addToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (!isOpen) return null;

  const handleDownloadStandaloneHtml = () => {
    try {
      const backupData = {
        version: '1.0.0',
        systemName: 'HỆ THỐNG QUẢN TRỊ LỚP HỌC – NGUYỄN CÔNG LẬP',
        teacher: 'Nguyễn Công Lập',
        school: 'Trường Tiểu học Nguyễn Hữu Dực',
        exportedAt: new Date().toISOString(),
        classes,
        students,
        progressRecords,
        attendanceRecords,
        activityLogs,
      };

      const htmlContent = buildStandaloneHtmlContent(backupData);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'quan-tri-lop-hoc-nguyen-cong-lap.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(
        'success',
        'Tải tệp thành công',
        'Đã tải về "quan-tri-lop-hoc-nguyen-cong-lap.html". Bạn có thể mở trực tiếp không cần mạng!'
      );
    } catch (e) {
      console.error(e);
      addToast('error', 'Lỗi tải tệp', 'Không thể tạo tệp HTML.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const result = importBackup(json);
        if (result.success) {
          onClose();
        }
      } catch (err: any) {
        addToast('error', 'Tệp không hợp lệ', 'Không thể đọc nội dung tệp JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Quản lý Dữ liệu & Sao lưu</h3>
              <p className="text-xs text-slate-500">
                Lưu trữ trình duyệt (localStorage) an toàn & bảo mật
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cảnh báo tính chất lưu trữ của trình duyệt */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Lưu ý quan trọng về dữ liệu:</span>
            <p className="mt-0.5 text-amber-800">
              Dữ liệu của giáo viên được lưu trữ an toàn trong bộ nhớ trình duyệt (localStorage) trên máy này. Để chuyển sang máy tính khác hoặc phòng máy chiếu của trường, thầy/cô vui lòng bấm <strong>"Xuất tệp sao lưu JSON"</strong> để lưu dự phòng.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {/* Mục 1: Xuất sao lưu JSON */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Xuất dữ liệu dự phòng (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tải tệp JSON chứa toàn bộ danh sách lớp, học sinh và bản ghi tiến độ về máy tính.
              </p>
            </div>
            <button
              onClick={exportBackup}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Tải JSON
            </button>
          </div>

          {/* Mục 2: Nhập dữ liệu khôi phục JSON */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Khôi phục dữ liệu từ tệp JSON</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Chọn tệp JSON sao lưu đã xuất trước đó để khôi phục dữ liệu nguyên vẹn.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Chọn tệp
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Mục 3: Tải file HTML Offline duy nhất */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-blue-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-700" />
                <span>Tải file HTML chạy ngoại tuyến (Offline)</span>
              </div>
              <p className="text-[11px] text-blue-800/80 mt-1">
                Tệp <code>quan-tri-lop-hoc-nguyen-cong-lap.html</code> đóng gói toàn bộ HTML, CSS và JS để mở trực tiếp bất cứ lúc nào.
              </p>
            </div>
            <button
              onClick={handleDownloadStandaloneHtml}
              className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Tải HTML
            </button>
          </div>

          {/* Mục 4: Khôi phục mẫu ban đầu & Xóa trắng */}
          <div className="pt-2 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="p-3 text-left rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Khôi phục mẫu</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Nạp lại dữ liệu minh họa ban đầu của trường TH Nguyễn Hữu Dực.
              </p>
            </button>

            <button
              onClick={() => setConfirmClearOpen(true)}
              className="p-3 text-left rounded-xl border border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Xóa toàn bộ</span>
              </div>
              <p className="text-[10px] text-rose-600 mt-0.5">
                Xóa sạch dữ liệu để nhập hồ sơ mới hoàn toàn từ đầu.
              </p>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>

      {/* CONFIRM RESET TO SAMPLE */}
      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Xác nhận khôi phục dữ liệu mẫu ban đầu"
        message="Hệ thống sẽ nạp lại dữ liệu lớp học và học sinh mẫu của Trường Tiểu học Nguyễn Hữu Dực. Thao tác này sẽ ghi đè dữ liệu hiện tại."
        confirmText="Đồng ý khôi phục"
        cancelText="Hủy"
        onConfirm={() => {
          resetSampleData();
          setConfirmResetOpen(false);
          onClose();
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />

      {/* CONFIRM CLEAR ALL */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        title="CẢNH BÁO: Xóa toàn bộ dữ liệu"
        message="Bạn có chắc chắn muốn xóa TOÀN BỘ danh sách lớp, hồ sơ học sinh và các bản ghi tiến độ học tập? Hãy đảm bảo bạn đã bấm 'Tải JSON' để lưu dự phòng trước khi xóa!"
        confirmText="Xóa toàn bộ dữ liệu"
        cancelText="Hủy bỏ"
        isDestructive={true}
        onConfirm={() => {
          clearAllData();
          setConfirmClearOpen(false);
          onClose();
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
