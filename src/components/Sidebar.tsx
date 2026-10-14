import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  School,
  GraduationCap,
  TrendingUp,
  CalendarCheck,
  X,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, stats } = useApp();

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badgeCount?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      label: 'Tổng quan',
      sublabel: 'Báo cáo & thống kê',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'classes',
      label: 'Lớp học',
      sublabel: 'Danh sách & sĩ số',
      icon: <School className="w-5 h-5" />,
      badgeCount: stats.totalClasses,
    },
    {
      id: 'students',
      label: 'Học sinh',
      sublabel: 'Hồ sơ & phân lớp',
      icon: <GraduationCap className="w-5 h-5" />,
      badgeCount: stats.totalStudents,
    },
    {
      id: 'progress',
      label: 'Tiến độ học tập',
      sublabel: 'Theo dõi & nhận xét',
      icon: <TrendingUp className="w-5 h-5" />,
      badgeCount: stats.needsHelpTasksCount > 0 ? stats.needsHelpTasksCount : undefined,
    },
    {
      id: 'attendance',
      label: 'Điểm danh',
      sublabel: 'Chuyên cần & sĩ số',
      icon: <CalendarCheck className="w-5 h-5" />,
      badgeCount:
        stats.todayAbsentExcusedCount + stats.todayAbsentUnexcusedCount > 0
          ? stats.todayAbsentExcusedCount + stats.todayAbsentUnexcusedCount
          : undefined,
      badgeColor: 'amber',
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 lg:w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand identity header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold text-base shadow-sm">
              NCL
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
                Quản trị sư phạm
              </div>
              <div className="text-sm font-bold text-slate-900">
                Nguyễn Công Lập
              </div>
              <div className="text-[11px] text-slate-500">
                TH Nguyễn Hữu Dực
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* School Year indicator */}
        <div className="mx-4 mt-4 px-3 py-2 bg-blue-50/60 rounded-xl border border-blue-100/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium">Năm học:</span>
          </div>
          <span className="font-bold text-blue-800 font-mono">2025 - 2026</span>
        </div>

        {/* 4 Main Navigation Items */}
        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Mục quản lý chính
          </div>
          <nav className="space-y-1">
            {navItems.map((item, index) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <div className="truncate">
                      <div className="text-sm leading-tight flex items-center gap-1.5">
                        <span className={`text-xs ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                          {index + 1}.
                        </span>
                        <span>{item.label}</span>
                      </div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </div>

                  {item.badgeCount !== undefined && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : item.id === 'progress' && stats.needsHelpTasksCount > 0
                          ? 'bg-amber-100 text-amber-700'
                          : item.id === 'attendance'
                          ? 'bg-rose-100 text-rose-700 font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.id === 'attendance' ? `${item.badgeCount} vắng` : item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Storage status & teacher credentials lockup */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Lưu trữ cục bộ (Offline)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-normal">
            Dữ liệu tự động lưu trên trình duyệt của giáo viên, bảo mật và an toàn.
          </p>
        </div>
      </aside>
    </>
  );
};
