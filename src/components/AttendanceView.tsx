import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus, AttendanceRecord, Student } from '../types';
import { exportAttendanceToCSV } from '../utils/exportHelpers';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Edit3,
  Check,
  FileSpreadsheet,
  Award,
  AlertTriangle,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    students,
    attendanceRecords,
    markAttendance,
    markAllPresent,
    deleteAttendanceRecord,
    setSelectedStudentForProfile,
    addToast,
  } = useApp();

  // Ngày được chọn (mặc định hôm nay YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

  // Bộ lọc
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Chế độ xem: 'daily' (Điểm danh hàng ngày) hoặc 'report' (Báo cáo tổng hợp)
  const [viewMode, setViewMode] = useState<'daily' | 'report'>('daily');

  // Modal ghi chú lý do nghỉ/muộn
  const [noteModalStudent, setNoteModalStudent] = useState<{
    student: Student;
    record?: AttendanceRecord;
    status: AttendanceStatus;
  } | null>(null);
  const [noteInputText, setNoteInputText] = useState<string>('');

  // Map học sinh & lớp
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  // Danh sách học sinh theo lớp đã chọn
  const classStudents = useMemo(() => {
    if (selectedClassId === 'ALL') return students;
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Bản đồ điểm danh của ngày được chọn: studentId -> AttendanceRecord
  const dateAttendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords
      .filter((r) => r.date === selectedDate)
      .forEach((r) => {
        map.set(r.studentId, r);
      });
    return map;
  }, [attendanceRecords, selectedDate]);

  // Thống kê nhanh cho ngày và lớp đang chọn
  const dailyStats = useMemo(() => {
    const total = classStudents.length;
    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;
    let unrecorded = 0;

    classStudents.forEach((s) => {
      const rec = dateAttendanceMap.get(s.id);
      if (!rec) {
        unrecorded++;
      } else {
        if (rec.status === 'present') present++;
        else if (rec.status === 'excused') excused++;
        else if (rec.status === 'unexcused') unexcused++;
        else if (rec.status === 'late') late++;
      }
    });

    const recorded = total - unrecorded;
    const rate = recorded > 0 ? Math.round(((present + late) / recorded) * 100) : 0;

    return { total, present, excused, unexcused, late, unrecorded, recorded, rate };
  }, [classStudents, dateAttendanceMap]);

  // Danh sách học sinh hiển thị sau khi lọc
  const filteredStudents = useMemo(() => {
    return classStudents.filter((s) => {
      const rec = dateAttendanceMap.get(s.id);
      const studentStatus = rec ? rec.status : 'unrecorded';

      // Lọc trạng thái
      if (selectedStatusFilter !== 'ALL' && studentStatus !== selectedStatusFilter) {
        return false;
      }

      // Lọc từ khóa
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = s.fullName.toLowerCase().includes(q);
        const matchCode = s.code.toLowerCase().includes(q);
        const matchNote = rec?.note ? rec.note.toLowerCase().includes(q) : false;
        if (!matchName && !matchCode && !matchNote) return false;
      }

      return true;
    });
  }, [classStudents, dateAttendanceMap, selectedStatusFilter, searchTerm]);

  // Báo cáo chuyên cần tổng hợp theo từng học sinh
  const studentReports = useMemo(() => {
    return classStudents.map((s) => {
      const studentAtt = attendanceRecords.filter((a) => a.studentId === s.id);
      const totalDays = studentAtt.length;
      const presentDays = studentAtt.filter((a) => a.status === 'present').length;
      const excusedDays = studentAtt.filter((a) => a.status === 'excused').length;
      const unexcusedDays = studentAtt.filter((a) => a.status === 'unexcused').length;
      const lateDays = studentAtt.filter((a) => a.status === 'late').length;
      const rate =
        totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 100;

      return {
        student: s,
        totalDays,
        presentDays,
        excusedDays,
        unexcusedDays,
        lateDays,
        rate,
      };
    });
  }, [classStudents, attendanceRecords]);

  // Chuyển ngày (+1 hoặc -1)
  const handleShiftDate = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Đổi trạng thái trực tiếp khi click
  const handleToggleStatus = (student: Student, newStatus: AttendanceStatus) => {
    const currentRec = dateAttendanceMap.get(student.id);

    // Nếu chuyển sang Nghỉ hoặc Đi muộn mà chưa có lý do, có thể mở modal gợi ý nhập lý do
    if (
      (newStatus === 'excused' || newStatus === 'unexcused' || newStatus === 'late') &&
      (!currentRec || !currentRec.note)
    ) {
      setNoteModalStudent({
        student,
        record: currentRec,
        status: newStatus,
      });
      setNoteInputText(
        newStatus === 'excused'
          ? 'Nghỉ ốm / Phụ huynh xin phép'
          : newStatus === 'late'
          ? 'Đến muộn tiết 1'
          : ''
      );
      markAttendance(student.id, selectedDate, newStatus);
      return;
    }

    markAttendance(student.id, selectedDate, newStatus);
  };

  const handleOpenNoteModal = (student: Student) => {
    const rec = dateAttendanceMap.get(student.id);
    setNoteModalStudent({
      student,
      record: rec,
      status: rec ? rec.status : 'excused',
    });
    setNoteInputText(rec?.note || '');
  };

  const handleSaveNote = () => {
    if (!noteModalStudent) return;
    markAttendance(
      noteModalStudent.student.id,
      selectedDate,
      noteModalStudent.status,
      noteInputText.trim()
    );
    setNoteModalStudent(null);
  };

  // Xuất CSV
  const handleExportCSV = () => {
    const targetRecords = attendanceRecords.filter((r) => {
      const matchDate = viewMode === 'daily' ? r.date === selectedDate : true;
      const matchClass = selectedClassId === 'ALL' || r.classId === selectedClassId;
      return matchDate && matchClass;
    });

    const cls = classes.find((c) => c.id === selectedClassId);
    exportAttendanceToCSV(
      targetRecords,
      students,
      classes,
      viewMode === 'daily' ? selectedDate : undefined,
      cls ? cls.name : 'Tat_ca'
    );
    addToast('info', 'Đã xuất dữ liệu', 'Bảng điểm danh chuyên cần CSV đã được tải xuống.');
  };

  const formatDateDisplay = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayOfWeek = days[d.getDay()];
      return `${dayOfWeek}, ngày ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return isoStr;
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Quản lý Điểm danh & Chuyên cần
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Sư phạm Tiểu học
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi sĩ số lớp hàng ngày, ghi nhận học sinh vắng, đi muộn và lý do phụ huynh xin phép
          </p>
        </div>

        {/* View mode toggle & Export button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Điểm danh ngày
            </button>
            <button
              onClick={() => setViewMode('report')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'report'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Báo cáo chuyên cần
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Xuất bảng điểm danh CSV để mở trên Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* DATE & CLASS CONTROLLER TOOLBAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          {/* Date Navigator */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => handleShiftDate(-1)}
                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Ngày hôm trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => handleShiftDate(1)}
                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Ngày tiếp theo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSetToday}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                isToday
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Hôm nay
            </button>

            <span className="text-xs font-medium text-slate-500 pl-1">
              {formatDateDisplay(selectedDate)}
            </span>
          </div>

          {/* Quick Mark All Present Button */}
          {viewMode === 'daily' && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => markAllPresent(selectedClassId, selectedDate)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                title="Đánh dấu tất cả học sinh trong lớp đang chọn là Có mặt"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tất cả có mặt</span>
              </button>
            </div>
          )}
        </div>

        {/* Secondary filters: Class selector, status filter & search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Lớp học */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Lớp học
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="ALL">Tất cả lớp học ({classes.length} lớp - {students.length} HS)</option>
              {classes.map((cls) => {
                const count = students.filter((s) => s.classId === cls.id).length;
                return (
                  <option key={cls.id} value={cls.id}>
                    Lớp {cls.name} (Khối {cls.grade} · {count} HS)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Trạng thái điểm danh (chỉ ở chế độ daily) */}
          {viewMode === 'daily' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Lọc trạng thái
              </label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="present">Có mặt</option>
                <option value="excused">Nghỉ có phép</option>
                <option value="unexcused">Nghỉ không phép</option>
                <option value="late">Đi muộn</option>
                <option value="unrecorded">Chưa điểm danh</option>
              </select>
            </div>
          )}

          {/* Tìm kiếm tên học sinh */}
          <div className={viewMode === 'daily' ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Tìm kiếm học sinh
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên học sinh, mã HS hoặc ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS CHO NGÀY ĐANG CHỌN */}
      {viewMode === 'daily' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Tổng sĩ số */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Sĩ số lớp</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {dailyStats.total}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Đã ghi nhận: {dailyStats.recorded}/{dailyStats.total}
            </div>
          </div>

          {/* Card 2: Có mặt */}
          <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-700 font-semibold">Có mặt</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1 tabular-nums">
              {dailyStats.present}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Tỷ lệ: {dailyStats.recorded > 0 ? Math.round((dailyStats.present / dailyStats.recorded) * 100) : 0}%
            </div>
          </div>

          {/* Card 3: Nghỉ có phép */}
          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-700 font-semibold">Nghỉ có phép</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1 tabular-nums">
              {dailyStats.excused}
            </div>
            <div className="text-[11px] text-amber-600 mt-0.5">
              Phụ huynh đã xin phép
            </div>
          </div>

          {/* Card 4: Nghỉ không phép */}
          <div className="bg-white p-4 rounded-xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/30 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-700 font-semibold">Nghỉ không phép</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-rose-700 mt-1 tabular-nums">
              {dailyStats.unexcused}
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">
              Cần liên hệ gia đình
            </div>
          </div>

          {/* Card 5: Đi muộn */}
          <div className="bg-white p-4 rounded-xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/30 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sky-700 font-semibold">Đi muộn</span>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-extrabold text-sky-700 mt-1 tabular-nums">
              {dailyStats.late}
            </div>
            <div className="text-[11px] text-sky-600 mt-0.5">
              Đến sau giờ vào lớp
            </div>
          </div>
        </div>
      )}

      {/* NỘI DUNG CHÍNH: CHẾ ĐỘ ĐIỂM DANH HÀNG NGÀY */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-800">
                Danh sách học sinh điểm danh ngày {formatDateDisplay(selectedDate)}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                ({filteredStudents.length} học sinh)
              </span>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Có mặt
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Có phép
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Không phép
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Đi muộn
              </span>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-600 font-medium">Không tìm thấy học sinh phù hợp.</p>
              <p className="text-xs text-slate-400 mt-1">
                Hãy kiểm tra lại từ khóa tìm kiếm hoặc chọn lớp khác.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4 w-28">Mã HS</th>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4 w-24">Lớp</th>
                    <th className="py-3 px-4 min-w-[340px]">Trạng thái điểm danh (Bấm để chọn)</th>
                    <th className="py-3 px-4">Ghi chú / Lý do</th>
                    <th className="py-3 px-4 text-right w-20">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student, idx) => {
                    const rec = dateAttendanceMap.get(student.id);
                    const currentStatus: AttendanceStatus | 'unrecorded' = rec
                      ? rec.status
                      : 'unrecorded';
                    const cls = classMap.get(student.classId);

                    return (
                      <tr
                        key={student.id}
                        className={`transition-colors ${
                          currentStatus === 'unexcused'
                            ? 'bg-rose-50/30 hover:bg-rose-50/50'
                            : currentStatus === 'excused'
                            ? 'bg-amber-50/20 hover:bg-amber-50/40'
                            : currentStatus === 'late'
                            ? 'bg-sky-50/20 hover:bg-sky-50/40'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                          {student.code}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedStudentForProfile(student)}
                            className="hover:text-blue-700 hover:underline text-left cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{student.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({student.gender})
                            </span>
                          </button>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          Lớp {cls ? cls.name : '---'}
                        </td>

                        {/* Cụm nút chọn nhanh trạng thái điểm danh */}
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                            {/* Có mặt */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student, 'present')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white/80'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Có mặt</span>
                            </button>

                            {/* Nghỉ có phép */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student, 'excused')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'excused'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-amber-700 hover:bg-white/80'
                              }`}
                            >
                              <span>Có phép</span>
                            </button>

                            {/* Nghỉ không phép */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student, 'unexcused')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'unexcused'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-white/80'
                              }`}
                            >
                              <span>Không phép</span>
                            </button>

                            {/* Đi muộn */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student, 'late')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'late'
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-sky-700 hover:bg-white/80'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>Đi muộn</span>
                            </button>
                          </div>
                        </td>

                        {/* Ghi chú lý do */}
                        <td className="py-3 px-4 max-w-xs">
                          {rec?.note ? (
                            <div className="flex items-center gap-1.5 group">
                              <span className="text-slate-700 italic truncate" title={rec.note}>
                                "{rec.note}"
                              </span>
                              <button
                                onClick={() => handleOpenNoteModal(student)}
                                className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 p-0.5 rounded cursor-pointer"
                                title="Sửa ghi chú"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenNoteModal(student)}
                              className="text-[11px] text-slate-400 hover:text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>+ Thêm ghi chú</span>
                            </button>
                          )}
                        </td>

                        {/* Thao tác xóa bản ghi nếu cần đặt lại */}
                        <td className="py-3 px-4 text-right">
                          {rec && (
                            <button
                              onClick={() => deleteAttendanceRecord(rec.id)}
                              className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Hủy điểm danh ngày này"
                            >
                              Đặt lại
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* NỘI DUNG PHỤ: CHẾ ĐỘ BÁO CÁO CHUYÊN CẦN TỔNG HỢP THEO HỌC SINH */}
      {viewMode === 'report' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bảng tổng hợp chuyên cần học sinh
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Năm học 2025 - 2026 · Trường TH Nguyễn Hữu Dực
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4">Mã HS</th>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Lớp</th>
                    <th className="py-3 px-4 text-center">Số buổi ghi nhận</th>
                    <th className="py-3 px-4 text-center text-emerald-700">Có mặt</th>
                    <th className="py-3 px-4 text-center text-amber-700">Có phép</th>
                    <th className="py-3 px-4 text-center text-rose-700">Không phép</th>
                    <th className="py-3 px-4 text-center text-sky-700">Đi muộn</th>
                    <th className="py-3 px-4 text-center min-w-[140px]">Tỷ lệ chuyên cần</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentReports.map((item, idx) => {
                    const cls = classMap.get(item.student.classId);
                    const isWarning = item.unexcusedDays > 0 || item.rate < 90;

                    return (
                      <tr
                        key={item.student.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isWarning ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                          {item.student.code}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedStudentForProfile(item.student)}
                            className="hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{item.student.fullName}</span>
                            {isWarning && (
                              <span
                                title="Cần lưu ý: Học sinh có nghỉ không phép hoặc tỷ lệ chuyên cần dưới 90%"
                                className="inline-flex text-amber-600"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          Lớp {cls ? cls.name : '---'}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700 tabular-nums">
                          {item.totalDays} buổi
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700 tabular-nums">
                          {item.presentDays}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-amber-700 tabular-nums">
                          {item.excusedDays}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-rose-700 tabular-nums">
                          {item.unexcusedDays}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-sky-700 tabular-nums">
                          {item.lateDays}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${item.rate}%` }}
                                className={`h-full rounded-full ${
                                  item.rate >= 95
                                    ? 'bg-emerald-500'
                                    : item.rate >= 85
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-800 tabular-nums">
                              {item.rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GHI CHÚ LÝ DO NGHỈ / ĐI MUỘN */}
      {noteModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Ghi chú điểm danh: {noteModalStudent.student.fullName}
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-500">Ngày điểm danh:</span>{' '}
                <strong className="text-slate-800">{formatDateDisplay(selectedDate)}</strong>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Trạng thái:</label>
                <select
                  value={noteModalStudent.status}
                  onChange={(e) =>
                    setNoteModalStudent({
                      ...noteModalStudent,
                      status: e.target.value as AttendanceStatus,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="present">Có mặt</option>
                  <option value="excused">Nghỉ có phép</option>
                  <option value="unexcused">Nghỉ không phép</option>
                  <option value="late">Đi muộn</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Lý do / Ghi chú của giáo viên:
                </label>
                <textarea
                  rows={3}
                  value={noteInputText}
                  onChange={(e) => setNoteInputText(e.target.value)}
                  placeholder="Ví dụ: Phụ huynh xin phép qua điện thoại do bị sốt; Đi viện khám sức khỏe; Xe hư đến muộn..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Gợi ý lý do nhanh */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Nghỉ ốm / Bị sốt',
                  'Gia đình có việc bận',
                  'Đi khám sức khỏe',
                  'Đến muộn do thời tiết',
                ].map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => setNoteInputText(hint)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] cursor-pointer"
                  >
                    + {hint}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setNoteModalStudent(null)}
                className="px-3.5 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer shadow-xs shadow-blue-500/20"
              >
                Lưu ghi chú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
