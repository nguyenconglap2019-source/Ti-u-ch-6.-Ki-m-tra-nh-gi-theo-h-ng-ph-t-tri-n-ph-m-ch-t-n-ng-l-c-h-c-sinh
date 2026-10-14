import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  CalendarCheck,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HelpCircle,
  Plus,
  ArrowRightLeft,
} from 'lucide-react';
import { ProgressStatus } from '../types';

export const StudentProfileModal: React.FC = () => {
  const {
    selectedStudentForProfile,
    setSelectedStudentForProfile,
    classes,
    progressRecords,
    attendanceRecords,
    addProgressRecord,
  } = useApp();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickForm, setQuickForm] = useState({
    subject: 'Toán',
    task: '',
    status: 'Hoàn thành' as ProgressStatus,
    date: new Date().toISOString().split('T')[0],
    feedback: '',
  });

  if (!selectedStudentForProfile) return null;

  const std = selectedStudentForProfile;
  const cls = classes.find((c) => c.id === std.classId);
  const studentRecords = progressRecords.filter((p) => p.studentId === std.id);
  const completedCount = studentRecords.filter((p) => p.status === 'Hoàn thành').length;
  const needsHelpCount = studentRecords.filter((p) => p.status === 'Cần hỗ trợ').length;
  const completionRate =
    studentRecords.length > 0
      ? Math.round((completedCount / studentRecords.length) * 100)
      : 0;

  // Điểm danh của học sinh này
  const stdAttendance = attendanceRecords.filter((a) => a.studentId === std.id);
  const presentDays = stdAttendance.filter((a) => a.status === 'present').length;
  const excusedDays = stdAttendance.filter((a) => a.status === 'excused').length;
  const unexcusedDays = stdAttendance.filter((a) => a.status === 'unexcused').length;
  const lateDays = stdAttendance.filter((a) => a.status === 'late').length;
  const attendanceRate =
    stdAttendance.length > 0
      ? Math.round(((presentDays + lateDays) / stdAttendance.length) * 100)
      : 100;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickForm.task.trim()) return;

    addProgressRecord({
      studentId: std.id,
      classId: std.classId,
      subject: quickForm.subject,
      date: quickForm.date,
      task: quickForm.task,
      status: quickForm.status,
      completionRate: quickForm.status === 'Hoàn thành' ? 100 : 50,
      teacherFeedback: quickForm.feedback,
    });

    setQuickForm({
      subject: 'Toán',
      task: '',
      status: 'Hoàn thành',
      date: new Date().toISOString().split('T')[0],
      feedback: '',
    });
    setIsQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-100 shrink-0">
              {std.gender === 'Nam' ? '👦' : '👧'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{std.fullName}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700">
                  {std.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Lớp <strong>{cls ? cls.name : '---'}</strong> (Khối {cls ? cls.grade : '-'}) · Trường Tiểu học Nguyễn Hữu Dực
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedStudentForProfile(null)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin hồ sơ chi tiết */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400">Giới tính:</span>
            <div className="font-bold text-slate-800 mt-0.5">{std.gender}</div>
          </div>
          <div>
            <span className="text-slate-400">Ngày sinh:</span>
            <div className="font-bold text-slate-800 font-mono mt-0.5">
              {std.birthDate ? new Date(std.birthDate).toLocaleDateString('vi-VN') : 'Chưa nhập'}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Nhiệm vụ học tập:</span>
            <div className="font-bold text-slate-800 mt-0.5 tabular-nums">
              {completedCount} / {studentRecords.length} đạt
            </div>
          </div>
          <div>
            <span className="text-slate-400">Tỷ lệ hoàn thành:</span>
            <div className="font-bold text-emerald-700 font-mono mt-0.5 tabular-nums">
              {studentRecords.length > 0 ? `${completionRate}%` : 'Chưa có'}
            </div>
          </div>
        </div>

        {/* Thông tin chuyên cần & điểm danh */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Theo dõi chuyên cần & điểm danh ({stdAttendance.length} buổi)</span>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Chuyên cần: {attendanceRate}%
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-4 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-400">Có mặt</div>
              <div className="text-sm font-extrabold text-emerald-700 mt-0.5">{presentDays}</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-400">Có phép</div>
              <div className="text-sm font-extrabold text-amber-700 mt-0.5">{excusedDays}</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-400">Không phép</div>
              <div className="text-sm font-extrabold text-rose-700 mt-0.5">{unexcusedDays}</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-400">Đi muộn</div>
              <div className="text-sm font-extrabold text-sky-700 mt-0.5">{lateDays}</div>
            </div>
          </div>
        </div>

        {/* Ghi chú sư phạm */}
        {std.note && (
          <div className="mt-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/60 text-xs">
            <span className="font-bold text-blue-900">Ghi chú sư phạm:</span>
            <p className="text-slate-700 mt-0.5 italic leading-relaxed">"{std.note}"</p>
          </div>
        )}

        {/* Lịch sử tiến độ học tập */}
        <div className="mt-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Lịch sử tiến độ học tập ({studentRecords.length} bản ghi)
              </h4>
            </div>

            <button
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isQuickAddOpen ? 'Đóng form' : 'Ghi nhận tiến độ'}</span>
            </button>
          </div>

          {/* Quick add form */}
          {isQuickAddOpen && (
            <form onSubmit={handleQuickAdd} className="mt-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="text-xs font-bold text-blue-900">Thêm bản ghi tiến độ cho {std.fullName}:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Môn học</label>
                  <select
                    value={quickForm.subject}
                    onChange={(e) => setQuickForm({ ...quickForm, subject: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Toán">Toán</option>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Khoa học">Khoa học</option>
                    <option value="Tự nhiên & Xã hội">Tự nhiên & Xã hội</option>
                    <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Tin học & Công nghệ">Tin học & Công nghệ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Trạng thái</label>
                  <select
                    value={quickForm.status}
                    onChange={(e) => setQuickForm({ ...quickForm, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Cần hỗ trợ">Cần hỗ trợ</option>
                    <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Ngày ghi</label>
                  <input
                    type="date"
                    value={quickForm.date}
                    onChange={(e) => setQuickForm({ ...quickForm, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Nội dung bài học hoặc nhiệm vụ cần đánh giá..."
                  value={quickForm.task}
                  onChange={(e) => setQuickForm({ ...quickForm, task: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Nhận xét của giáo viên (tùy chọn)..."
                  value={quickForm.feedback}
                  onChange={(e) => setQuickForm({ ...quickForm, feedback: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Lưu bản ghi
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="mt-3 space-y-2.5">
            {studentRecords.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Chưa có bản ghi tiến độ học tập nào cho học sinh này.
              </p>
            ) : (
              studentRecords.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{r.subject}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(r.date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        r.status === 'Hoàn thành'
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.status === 'Cần hỗ trợ'
                          ? 'bg-amber-50 text-amber-700 font-bold'
                          : r.status === 'Đang thực hiện'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium mt-1">{r.task}</p>
                  {r.teacherFeedback && (
                    <p className="text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg leading-relaxed">
                      "Nhận xét GV: {r.teacherFeedback}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setSelectedStudentForProfile(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Đóng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};
