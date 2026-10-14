import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  School,
  GraduationCap,
  TrendingUp,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
  BookOpen,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { ClassRoom, Student } from '../types';

export const OverviewView: React.FC = () => {
  const {
    classes,
    students,
    progressRecords,
    attendanceRecords,
    activityLogs,
    stats,
    setActiveTab,
    setSelectedClassIdForFilter,
    setSelectedStudentForProfile,
    setSelectedClassForDetail,
  } = useApp();

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const handleClassClick = (cls: ClassRoom) => {
    setSelectedClassIdForFilter(cls.id);
    setSelectedClassForDetail(cls);
    setActiveTab('classes');
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudentForProfile(student);
  };

  // Tính toán dữ liệu biểu đồ cột: Sĩ số theo lớp
  const classChartData = classes.map((c) => ({
    id: c.id,
    name: c.name,
    count: stats.classStudentCountMap[c.id] || 0,
    grade: c.grade,
  }));

  const maxStudentCount = Math.max(...classChartData.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs mb-2">
            <span>Chào mừng Thầy Nguyễn Công Lập</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Hệ thống Quản trị Lớp học & Theo dõi Tiến độ
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Đơn vị: Trường Tiểu học Nguyễn Hữu Dực · Năm học 2025 - 2026. Quản lý lớp học, hồ sơ học sinh, điểm danh chuyên cần và theo dõi tiến độ một cách khoa học.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('attendance')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Điểm danh hôm nay</span>
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className="px-4 py-2.5 bg-white text-blue-800 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
          >
            <School className="w-4 h-4" />
            <span>Quản lý Lớp học</span>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all border border-white/20 cursor-pointer flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ghi nhận Tiến độ</span>
          </button>
        </div>
      </div>

      {/* 5 THẺ THỐNG KÊ CHÍNH (Đã tích hợp mục Điểm danh chuyên cần) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-4">
        {/* Card 1: Tổng số lớp học */}
        <div
          onClick={() => setActiveTab('classes')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">1. Lớp học</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {stats.totalClasses}
            </span>
            <span className="text-xs text-slate-500 font-medium">lớp</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 flex items-center gap-1 font-medium group-hover:underline">
            <span>Danh sách lớp</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 2: Tổng số học sinh */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">2. Học sinh</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {stats.totalStudents}
            </span>
            <span className="text-xs text-slate-500 font-medium">học sinh</span>
          </div>
          <div className="mt-2 text-xs text-sky-600 flex items-center gap-1 font-medium group-hover:underline">
            <span>Xem hồ sơ</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Điểm danh chuyên cần hôm nay */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">3. Điểm danh hôm nay</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 tabular-nums">
              {stats.todayAttendanceRate}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({stats.todayPresentCount}/{stats.totalStudents} có mặt)
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1 font-semibold group-hover:underline">
            <span>
              {stats.todayAbsentExcusedCount + stats.todayAbsentUnexcusedCount > 0
                ? `${stats.todayAbsentExcusedCount + stats.todayAbsentUnexcusedCount} em vắng · Xem ngay`
                : 'Đi học đầy đủ · Xem sổ'}
            </span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Học sinh được theo dõi tiến độ */}
        <div
          onClick={() => setActiveTab('progress')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">4. Đang theo dõi tiến độ</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {stats.studentsTrackedCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {stats.totalStudents} HS ({stats.totalStudents > 0 ? Math.round((stats.studentsTrackedCount / stats.totalStudents) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 flex items-center gap-1 font-medium group-hover:underline">
            <span>Cập nhật kết quả</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 5: Tỷ lệ hoàn thành nhiệm vụ trung bình */}
        <div
          onClick={() => setActiveTab('progress')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">5. Hoàn thành nhiệm vụ TB</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {stats.totalTasks > 0 ? `${stats.averageCompletionRate}%` : 'Chưa có'}
            </span>
            {stats.totalTasks > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                ({stats.completedTasksCount}/{stats.totalTasks} bài)
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-teal-700 flex items-center gap-1 font-medium group-hover:underline">
            <span>{stats.totalTasks > 0 ? 'Dựa trên thực tế' : 'Thêm nhiệm vụ'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* KHU VỰC BIỂU ĐỒ TRỰC QUAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ số lượng học sinh theo lớp */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Biểu đồ số lượng học sinh theo lớp
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tự động tính từ số lượng hồ sơ học sinh đã gán vào từng lớp
              </p>
            </div>
            <button
              onClick={() => setActiveTab('classes')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Xem lớp học
            </button>
          </div>

          <div className="pt-6">
            {classChartData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4">
                <School className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Chưa có lớp học nào trong hệ thống.</p>
                <button
                  onClick={() => setActiveTab('classes')}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  + Thêm lớp học đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-52 flex items-end gap-3 sm:gap-6 pt-6 px-2 border-b border-slate-200">
                  {classChartData.map((item, index) => {
                    const heightPercent = maxStudentCount > 0
                      ? Math.max(Math.round((item.count / maxStudentCount) * 100), 8)
                      : 8;
                    const isHovered = hoveredBarIndex === index;

                    return (
                      <div
                        key={item.id}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                        onClick={() => {
                          const cls = classes.find((c) => c.id === item.id);
                          if (cls) handleClassClick(cls);
                        }}
                      >
                        {/* Tooltip on top of bar */}
                        <div
                          className={`text-xs font-bold transition-all tabular-nums mb-1.5 ${
                            isHovered
                              ? 'text-blue-700 scale-110 font-mono'
                              : 'text-slate-600 font-mono'
                          }`}
                        >
                          {item.count} HS
                        </div>

                        {/* Bar */}
                        <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-lg transition-all duration-300 ${
                              isHovered
                                ? 'bg-blue-700 shadow-md shadow-blue-500/20'
                                : 'bg-gradient-to-t from-blue-600 to-sky-500'
                            }`}
                          />
                        </div>

                        {/* Label */}
                        <div className="mt-2 text-center">
                          <div className="text-xs font-bold text-slate-800">
                            Lớp {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Khối {item.grade}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                  <span>Trục tung: Số lượng học sinh (sĩ số)</span>
                  <span className="text-blue-600 font-medium">Bấm vào cột để xem danh sách lớp</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Biểu đồ tổng hợp tiến độ học tập */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tổng hợp tiến độ học tập
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân bố theo trạng thái nhiệm vụ
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md tabular-nums">
                {stats.totalTasks} nhiệm vụ
              </span>
            </div>

            <div className="pt-5 space-y-4">
              {stats.totalTasks === 0 ? (
                <div className="py-8 text-center">
                  <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Chưa có bản ghi tiến độ học tập nào.</p>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    + Thêm bản ghi tiến độ đầu tiên
                  </button>
                </div>
              ) : (
                <>
                  {/* Hoàn thành */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-800">Hoàn thành</span>
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {stats.completedTasksCount} ({Math.round((stats.completedTasksCount / stats.totalTasks) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(stats.completedTasksCount / stats.totalTasks) * 100}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Đang thực hiện */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                        <span className="font-semibold text-slate-800">Đang thực hiện</span>
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {stats.inProgressTasksCount} ({Math.round((stats.inProgressTasksCount / stats.totalTasks) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(stats.inProgressTasksCount / stats.totalTasks) * 100}%` }}
                        className="h-full bg-sky-500 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Cần hỗ trợ */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="font-semibold text-slate-800">Cần hỗ trợ</span>
                      </div>
                      <span className="font-bold text-amber-700 tabular-nums">
                        {stats.needsHelpTasksCount} ({Math.round((stats.needsHelpTasksCount / stats.totalTasks) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(stats.needsHelpTasksCount / stats.totalTasks) * 100}%` }}
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Chưa bắt đầu */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span className="font-semibold text-slate-800">Chưa bắt đầu</span>
                      </div>
                      <span className="font-bold text-slate-600 tabular-nums">
                        {stats.notStartedTasksCount} ({Math.round((stats.notStartedTasksCount / stats.totalTasks) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(stats.notStartedTasksCount / stats.totalTasks) * 100}%` }}
                        className="h-full bg-slate-400 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Giáo viên: Nguyễn Công Lập</span>
            <button
              onClick={() => setActiveTab('progress')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem báo cáo chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DANH SÁCH LỚP GẦN ĐÂY & HỌC SINH CẦN QUAN TÂM & HOẠT ĐỘNG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Danh sách lớp học gần đây */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Danh sách lớp học</h3>
            <button
              onClick={() => setActiveTab('classes')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Xem tất cả ({classes.length})
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {classes.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Chưa có lớp học nào.</p>
            ) : (
              classes.slice(0, 4).map((cls) => {
                const count = stats.classStudentCountMap[cls.id] || 0;
                return (
                  <div
                    key={cls.id}
                    onClick={() => handleClassClick(cls)}
                    className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                          Lớp {cls.name}
                        </span>
                        <span className="text-[11px] text-slate-500">Khối {cls.grade}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">
                        {cls.teacherName} · {cls.schoolYear}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md tabular-nums">
                        {count} HS
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Học sinh cần giáo viên quan tâm, hỗ trợ */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Cần quan tâm, hỗ trợ</h3>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {stats.studentsNeedingAttention.length} em
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {stats.studentsNeedingAttention.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                <p className="text-xs text-slate-600 font-medium">Hiện không có học sinh cần hỗ trợ đặc biệt.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tất cả tiến độ đều đạt hoặc đang ổn định.</p>
              </div>
            ) : (
              stats.studentsNeedingAttention.slice(0, 4).map((item) => (
                <div
                  key={item.student.id}
                  onClick={() => handleStudentClick(item.student)}
                  className="p-3 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-amber-800">
                      {item.student.fullName}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Lớp {item.className}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 line-clamp-2 leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hoạt động gần đây */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900">Hoạt động gần đây</h3>
            </div>
            <span className="text-xs text-slate-400">Thời gian thực</span>
          </div>

          <div className="mt-4 space-y-3">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Chưa có nhật ký hoạt động nào.</p>
            ) : (
              activityLogs.slice(0, 4).map((log) => {
                const dateObj = new Date(log.timestamp);
                const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(
                  dateObj.getMinutes()
                ).padStart(2, '0')} · ${dateObj.toLocaleDateString('vi-VN')}`;

                return (
                  <div key={log.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span className="text-[11px] text-slate-400">{timeStr}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 line-clamp-2 leading-normal">
                      {log.detail}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
