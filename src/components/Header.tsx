import React from 'react';
import { useApp } from '../context/AppContext';
import { Download, Database, Menu, Sparkles, BookOpen } from 'lucide-react';
import { buildStandaloneHtmlContent } from '../utils/generateStandaloneHtml';

interface HeaderProps {
  onOpenBackupModal: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBackupModal, onToggleMobileMenu }) => {
  const { classes, students, progressRecords, attendanceRecords, activityLogs, addToast } = useApp();

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
        'Đã tải về "quan-tri-lop-hoc-nguyen-cong-lap.html". Bạn có thể mở trực tiếp bằng bất kỳ trình duyệt nào mà không cần kết nối mạng!'
      );
    } catch (e) {
      console.error(e);
      addToast('error', 'Lỗi tải tệp', 'Không thể tạo tệp HTML độc lập.');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Mở thanh điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                HỆ THỐNG QUẢN TRỊ LỚP HỌC
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
                Tiểu học
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Giáo viên: <strong className="text-slate-700 font-semibold">Nguyễn Công Lập</strong></span>
              <span>·</span>
              <span className="text-slate-600">Trường Tiểu học Nguyễn Hữu Dực</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={handleDownloadStandaloneHtml}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
          title="Tải tệp HTML độc lập chạy không cần mạng internet"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Tải file HTML Offline</span>
        </button>

        <button
          onClick={onOpenBackupModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          title="Sao lưu hoặc khôi phục dữ liệu hệ thống"
        >
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Dữ liệu & Sao lưu</span>
          <span className="sm:hidden">Dữ liệu</span>
        </button>
      </div>
    </header>
  );
};
