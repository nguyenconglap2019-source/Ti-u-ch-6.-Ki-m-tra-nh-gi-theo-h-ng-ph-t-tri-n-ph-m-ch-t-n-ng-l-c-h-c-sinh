import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProgressRecord, ProgressStatus } from '../types';
import { SUBJECTS_LIST } from '../data/initialData';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  Edit2,
  Trash2,
  Calendar,
  BookOpen,
  User,
  X,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const ProgressView: React.FC = () => {
  const {
    classes,
    students,
    progressRecords,
    addProgressRecord,
    updateProgressRecord,
    deleteProgressRecord,
    setSelectedStudentForProfile,
  } = useApp();

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal thêm/sửa bản ghi tiến độ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProgressRecord | null>(null);
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    subject: 'Toán',
    date: new Date().toISOString().split('T')[0],
    task: '',
    status: 'Hoàn thành' as ProgressStatus,
    completionRate: 100,
    teacherFeedback: '',
  });

  // Modal xác nhận xóa
  const [recordToDelete, setRecordToDelete] = useState<ProgressRecord | null>(null);

  // Mappings
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  // Học sinh thuộc lớp đang chọn trong bộ lọc (nếu có)
  const availableStudentsForFilter = useMemo(() => {
    if (selectedClassFilter === 'ALL') return students;
    return students.filter((s) => s.classId === selectedClassFilter);
  }, [students, selectedClassFilter]);

  // Lọc dữ liệu tiến độ
  const filteredRecords = useMemo(() => {
    return progressRecords.filter((rec) => {
      const student = studentMap.get(rec.studentId);
      const matchesClass =
        selectedClassFilter === 'ALL' || rec.classId === selectedClassFilter;
      const matchesStudent =
        selectedStudentFilter === 'ALL' || rec.studentId === selectedStudentFilter;
      const matchesSubject =
        selectedSubjectFilter === 'ALL' || rec.subject === selectedSubjectFilter;
      const matchesStatus =
        selectedStatusFilter === 'ALL' || rec.status === selectedStatusFilter;
      const matchesSearch =
        rec.task.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (rec.teacherFeedback &&
          rec.teacherFeedback.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (student &&
          student.fullName.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      return (
        matchesClass &&
        matchesStudent &&
        matchesSubject &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    progressRecords,
    selectedClassFilter,
    selectedStudentFilter,
    selectedSubjectFilter,
    selectedStatusFilter,
    searchTerm,
    studentMap,
  ]);

  // Thống kê riêng cho tập dữ liệu đang lọc
  const filteredStats = useMemo(() => {
    const total = filteredRecords.length;
    const completed = filteredRecords.filter((r) => r.status === 'Hoàn thành').length;
    const inProgress = filteredRecords.filter((r) => r.status === 'Đang thực hiện').length;
    const needsHelp = filteredRecords.filter((r) => r.status === 'Cần hỗ trợ').length;
    const notStarted = filteredRecords.filter((r) => r.status === 'Chưa bắt đầu').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, needsHelp, notStarted, rate };
  }, [filteredRecords]);

  // Danh sách các ngày gần đây để vẽ biểu đồ tiến độ theo thời gian (Line / Trend SVG)
  const timelineData = useMemo(() => {
    const sorted = [...progressRecords].sort((a, b) => a.date.localeCompare(b.date));
    const datesMap: Record<string, { total: number; completed: number; needsHelp: number }> = {};

    sorted.forEach((r) => {
      if (!datesMap[r.date]) {
        datesMap[r.date] = { total: 0, completed: 0, needsHelp: 0 };
      }
      datesMap[r.date].total++;
      if (r.status === 'Hoàn thành') datesMap[r.date].completed++;
      if (r.status === 'Cần hỗ trợ') datesMap[r.date].needsHelp++;
    });

    const entries = Object.entries(datesMap).slice(-7); // 7 mốc ngày gần nhất
    return entries.map(([date, val]) => ({
      date,
      displayDate: new Date(date).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }),
      ...val,
      rate: Math.round((val.completed / val.total) * 100),
    }));
  }, [progressRecords]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      studentId: students[0]?.id || '',
      subject: 'Toán',
      date: new Date().toISOString().split('T')[0],
      task: '',
      status: 'Hoàn thành',
      completionRate: 100,
      teacherFeedback: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: ProgressRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingRecord(rec);
    setFormData({
      studentId: rec.studentId,
      subject: rec.subject,
      date: rec.date,
      task: rec.task,
      status: rec.status,
      completionRate: rec.completionRate !== undefined ? rec.completionRate : 100,
      teacherFeedback: rec.teacherFeedback || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const student = studentMap.get(formData.studentId);
    if (!student) return;

    if (editingRecord) {
      const ok = updateProgressRecord(editingRecord.id, {
        studentId: formData.studentId,
        classId: student.classId,
        subject: formData.subject,
        date: formData.date,
        task: formData.task,
        status: formData.status,
        completionRate: Number(formData.completionRate),
        teacherFeedback: formData.teacherFeedback,
      });
      if (ok) setIsModalOpen(false);
    } else {
      const ok = addProgressRecord({
        studentId: formData.studentId,
        classId: student.classId,
        subject: formData.subject,
        date: formData.date,
        task: formData.task,
        status: formData.status,
        completionRate: Number(formData.completionRate),
        teacherFeedback: formData.teacherFeedback,
      });
      if (ok) setIsModalOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!recordToDelete) return;
    deleteProgressRecord(recordToDelete.id);
    setRecordToDelete(null);
  };

  const getStatusBadge = (status: ProgressStatus) => {
    switch (status) {
      case 'Hoàn thành':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hoàn thành</span>
          </span>
        );
      case 'Đang thực hiện':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Đang thực hiện</span>
          </span>
        );
      case 'Cần hỗ trợ':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cần hỗ trợ</span>
          </span>
        );
      case 'Chưa bắt đầu':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Chưa bắt đầu</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Theo dõi Tiến độ Học tập
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận mục tiêu, mức độ hoàn thành nhiệm vụ và nhận xét sư phạm của giáo viên
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm bản ghi tiến độ</span>
        </button>
      </div>

      {/* TỔNG HỢP NHANH THEO BỘ LỌC HIỆN TẠI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Tổng nhiệm vụ</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {filteredStats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Theo tiêu chí lọc</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-emerald-600 font-medium">Đã hoàn thành</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 tabular-nums">
            {filteredStats.completed}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Tỷ lệ: {filteredStats.rate}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-sky-600 font-medium">Đang thực hiện</span>
          <div className="text-2xl font-extrabold text-sky-700 mt-1 tabular-nums">
            {filteredStats.inProgress}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Đang rèn luyện</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-amber-600 font-medium">Cần hỗ trợ</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 tabular-nums">
            {filteredStats.needsHelp}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cần thầy cô kèm thêm</div>
        </div>
      </div>

      {/* BIỂU ĐỒ TIẾN ĐỘ THEO THỜI GIAN (SVG Timeline) */}
      {timelineData.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Biểu đồ tiến độ hoàn thành theo thời gian
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Hoàn thành (%)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Cần hỗ trợ (nhiệm vụ)
              </span>
            </div>
          </div>

          <div className="pt-4 overflow-x-auto">
            <div className="min-w-[500px] h-36 flex items-end justify-between gap-4 px-2">
              {timelineData.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end">
                  <div className="text-[11px] font-bold text-emerald-700 tabular-nums mb-1 font-mono">
                    {d.rate}%
                  </div>
                  <div className="w-full max-w-[40px] bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end h-24">
                    <div
                      style={{ height: `${Math.max(d.rate, 6)}%` }}
                      className="w-full bg-emerald-500 rounded-t-md transition-all duration-300"
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-semibold text-slate-700">{d.displayDate}</div>
                    <div className="text-[10px] text-slate-400">{d.total} nhiệm vụ</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BỘ LỌC ĐA NĂNG */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Lọc theo lớp */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Lớp học</label>
            <select
              value={selectedClassFilter}
              onChange={(e) => {
                setSelectedClassFilter(e.target.value);
                setSelectedStudentFilter('ALL');
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả lớp học ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Lớp {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo học sinh */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Học sinh</label>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả học sinh ({availableStudentsForFilter.length})</option>
              {availableStudentsForFilter.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo môn học */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Môn học</label>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả môn học</option>
              {SUBJECTS_LIST.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo trạng thái */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Trạng thái</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đang thực hiện">Đang thực hiện</option>
              <option value="Cần hỗ trợ">Cần hỗ trợ</option>
              <option value="Chưa bắt đầu">Chưa bắt đầu</option>
            </select>
          </div>

          {/* Tìm kiếm từ khóa */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nhiệm vụ, nhận xét..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DANH SÁCH BẢN GHI TIẾN ĐỘ */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Không có bản ghi tiến độ phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Thử điều chỉnh lại bộ lọc hoặc tạo bản ghi tiến độ học tập mới cho học sinh.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            + Ghi nhận tiến độ mới
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Ngày ghi</th>
                  <th className="py-3.5 px-4">Học sinh</th>
                  <th className="py-3.5 px-4">Lớp</th>
                  <th className="py-3.5 px-4">Môn học</th>
                  <th className="py-3.5 px-4">Nhiệm vụ / Mục tiêu học tập</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Nhận xét của giáo viên</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const student = studentMap.get(rec.studentId);
                  const cls = classMap.get(rec.classId);

                  return (
                    <tr key={rec.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap">
                        {new Date(rec.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {student ? (
                          <button
                            onClick={() => setSelectedStudentForProfile(student)}
                            className="hover:text-blue-700 hover:underline text-left cursor-pointer"
                          >
                            {student.fullName}
                          </button>
                        ) : (
                          '---'
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">
                          Lớp {cls ? cls.name : '---'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {rec.subject}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium max-w-sm">
                        {rec.task}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(rec.status)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed italic">
                        {rec.teacherFeedback ? `"${rec.teacherFeedback}"` : <span className="text-slate-400 not-italic">---</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => handleOpenEdit(rec, e)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md"
                            title="Sửa bản ghi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(rec)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md"
                            title="Xóa bản ghi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA BẢN GHI TIẾN ĐỘ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingRecord ? 'Chỉnh sửa bản ghi tiến độ' : 'Thêm bản ghi tiến độ học tập'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn học sinh <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
                >
                  {students.map((s) => {
                    const c = classMap.get(s.classId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.code} - Lớp {c ? c.name : '---'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Môn học / Nội dung <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {SUBJECTS_LIST.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày cập nhật <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhiệm vụ hoặc mục tiêu học tập <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ví dụ: Đọc diễn cảm bài thơ Bè xuôi sông La; Phép nhân số có 2 chữ số..."
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trạng thái tiến độ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ProgressStatus,
                        completionRate: e.target.value === 'Hoàn thành' ? 100 : e.target.value === 'Chưa bắt đầu' ? 0 : 50,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Cần hỗ trợ">Cần hỗ trợ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mức độ hoàn thành (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.completionRate}
                    onChange={(e) => setFormData({ ...formData, completionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhận xét sư phạm của giáo viên
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhận xét cụ thể, động viên và chỉ rõ phương pháp giúp học sinh khắc phục điểm yếu..."
                  value={formData.teacherFeedback}
                  onChange={(e) => setFormData({ ...formData, teacherFeedback: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs shadow-blue-500/20 cursor-pointer"
                >
                  {editingRecord ? 'Lưu cập nhật' : 'Ghi nhận tiến độ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(recordToDelete)}
        title="Xác nhận xóa bản ghi tiến độ"
        message={`Bạn có chắc chắn muốn xóa bản ghi đánh giá môn ${recordToDelete?.subject} ("${recordToDelete?.task}")?`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
};
