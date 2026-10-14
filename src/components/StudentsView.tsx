import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  Plus,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  ArrowRightLeft,
  User,
  GraduationCap,
  Calendar,
  X,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { exportStudentsToCSV } from '../utils/exportHelpers';

export const StudentsView: React.FC = () => {
  const {
    classes,
    students,
    progressRecords,
    addStudent,
    updateStudent,
    deleteStudent,
    transferStudent,
    setSelectedStudentForProfile,
    selectedClassIdForFilter,
    setSelectedClassIdForFilter,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(
    selectedClassIdForFilter || 'ALL'
  );
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'class' | 'code'>('name-asc');

  // Modal thêm/sửa học sinh
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    classId: classes[0]?.id || '',
    birthDate: '',
    gender: 'Nam' as 'Nam' | 'Nữ',
    note: '',
    customCode: '',
  });

  // Modal chuyển lớp
  const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>('');

  // Modal xác nhận xóa
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Map lớp học
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  // Bộ lọc và sắp xếp
  const filteredAndSortedStudents = useMemo(() => {
    return students
      .filter((std) => {
        const matchesQuery =
          std.fullName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          std.code.toLowerCase().includes(searchTerm.toLowerCase().trim());
        const matchesClass =
          selectedClassFilter === 'ALL' || std.classId === selectedClassFilter;
        const matchesGender =
          selectedGenderFilter === 'ALL' || std.gender === selectedGenderFilter;

        return matchesQuery && matchesClass && matchesGender;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') {
          // So sánh theo tên tiếng Việt
          const nameA = a.fullName.split(' ').slice(-1)[0] || a.fullName;
          const nameB = b.fullName.split(' ').slice(-1)[0] || b.fullName;
          return nameA.localeCompare(nameB, 'vi');
        }
        if (sortBy === 'name-desc') {
          const nameA = a.fullName.split(' ').slice(-1)[0] || a.fullName;
          const nameB = b.fullName.split(' ').slice(-1)[0] || b.fullName;
          return nameB.localeCompare(nameA, 'vi');
        }
        if (sortBy === 'class') {
          const clsA = classMap.get(a.classId)?.name || '';
          const clsB = classMap.get(b.classId)?.name || '';
          return clsA.localeCompare(clsB);
        }
        if (sortBy === 'code') {
          return a.code.localeCompare(b.code);
        }
        return 0;
      });
  }, [students, searchTerm, selectedClassFilter, selectedGenderFilter, sortBy, classMap]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      classId: selectedClassFilter !== 'ALL' ? selectedClassFilter : (classes[0]?.id || ''),
      birthDate: '',
      gender: 'Nam',
      note: '',
      customCode: '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (std: Student, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingStudent(std);
    setFormData({
      fullName: std.fullName,
      classId: std.classId,
      birthDate: std.birthDate || '',
      gender: std.gender,
      note: std.note || '',
      customCode: std.code,
    });
    setIsFormModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const ok = updateStudent(editingStudent.id, {
        fullName: formData.fullName,
        classId: formData.classId,
        birthDate: formData.birthDate,
        gender: formData.gender,
        note: formData.note,
        code: formData.customCode,
      });
      if (ok) setIsFormModalOpen(false);
    } else {
      const ok = addStudent({
        fullName: formData.fullName,
        classId: formData.classId,
        birthDate: formData.birthDate,
        gender: formData.gender,
        note: formData.note,
        customCode: formData.customCode,
      });
      if (ok) setIsFormModalOpen(false);
    }
  };

  const handleOpenTransfer = (std: Student, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTransferringStudent(std);
    // Chọn lớp khác lớp hiện tại làm mặc định
    const otherClass = classes.find((c) => c.id !== std.classId);
    setTargetClassId(otherClass ? otherClass.id : '');
  };

  const handleConfirmTransfer = () => {
    if (!transferringStudent || !targetClassId) return;
    transferStudent(transferringStudent.id, targetClassId);
    setTransferringStudent(null);
  };

  const handleDeleteConfirm = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
  };

  const handleExportCSV = () => {
    exportStudentsToCSV(filteredAndSortedStudents, classes, progressRecords);
  };

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản lý Hồ sơ Học sinh
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng số: {students.length} học sinh · Đang hiển thị: {filteredAndSortedStudents.length} hồ sơ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Xuất bảng tính CSV mở trên Excel hỗ trợ tiếng Việt đầy đủ"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất file CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo họ tên hoặc mã học sinh (ví dụ: HS4A-01)..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Lọc theo lớp */}
          <div className="md:col-span-3">
            <select
              value={selectedClassFilter}
              onChange={(e) => {
                setSelectedClassFilter(e.target.value);
                setSelectedClassIdForFilter(e.target.value === 'ALL' ? null : e.target.value);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả lớp học ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Lớp {cls.name} (Khối {cls.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo giới tính */}
          <div className="md:col-span-2">
            <select
              value={selectedGenderFilter}
              onChange={(e) => setSelectedGenderFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="name-asc">Tên (A → Z)</option>
              <option value="name-desc">Tên (Z → A)</option>
              <option value="class">Theo lớp học</option>
              <option value="code">Mã học sinh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danh sách học sinh dạng bảng */}
      {filteredAndSortedStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy học sinh</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedClassFilter !== 'ALL' || selectedGenderFilter !== 'ALL'
              ? 'Thử điều chỉnh lại từ khóa tìm kiếm hoặc các tiêu chí bộ lọc.'
              : 'Chưa có hồ sơ học sinh nào. Thêm học sinh để bắt đầu theo dõi.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            + Thêm học sinh
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Mã HS</th>
                  <th className="py-3.5 px-4">Họ và tên</th>
                  <th className="py-3.5 px-4">Lớp đang học</th>
                  <th className="py-3.5 px-4">Giới tính</th>
                  <th className="py-3.5 px-4">Ngày sinh</th>
                  <th className="py-3.5 px-4">Tiến độ nhiệm vụ</th>
                  <th className="py-3.5 px-4">Ghi chú sư phạm</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedStudents.map((std) => {
                  const cls = classMap.get(std.classId);
                  const stdRecords = progressRecords.filter((p) => p.studentId === std.id);
                  const completedCount = stdRecords.filter((p) => p.status === 'Hoàn thành').length;
                  const helpCount = stdRecords.filter((p) => p.status === 'Cần hỗ trợ').length;

                  return (
                    <tr
                      key={std.id}
                      onClick={() => setSelectedStudentForProfile(std)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {std.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-blue-700">
                        {std.fullName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-100">
                          Lớp {cls ? cls.name : '---'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            std.gender === 'Nam'
                              ? 'text-sky-700 bg-sky-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {std.gender}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {std.birthDate ? new Date(std.birthDate).toLocaleDateString('vi-VN') : '---'}
                      </td>
                      <td className="py-3.5 px-4">
                        {stdRecords.length === 0 ? (
                          <span className="text-slate-400 text-[11px]">Chưa có bản ghi</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">
                              {completedCount}/{stdRecords.length}
                            </span>
                            {helpCount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                {helpCount} cần hỗ trợ
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {std.note || '---'}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedStudentForProfile(std)}
                            className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            title="Xem chi tiết hồ sơ học sinh"
                          >
                            Hồ sơ
                          </button>
                          <button
                            onClick={(e) => handleOpenTransfer(std, e)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Chuyển học sinh sang lớp khác"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(std, e)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStudentToDelete(std);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md"
                            title="Xóa học sinh"
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

      {/* MODAL THÊM / SỬA HỌC SINH */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? `Chỉnh sửa hồ sơ: ${editingStudent.fullName}` : 'Thêm học sinh mới'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp đang học <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name} (Khối {c.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giới tính <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã học sinh <span className="text-slate-400 font-normal">(Tự động nếu để trống)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Tự sinh: HS4A-01"
                    value={formData.customCode}
                    onChange={(e) => setFormData({ ...formData, customCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú sư phạm
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về năng lực, sở trường, mức độ tiếp thu bài học..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs shadow-blue-500/20 cursor-pointer"
                >
                  {editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHUYỂN HỌC SINH SANG LỚP KHÁC */}
      {transferringStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                <span>Chuyển lớp học sinh</span>
              </h3>
              <button
                onClick={() => setTransferringStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="text-slate-500">Học sinh:</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {transferringStudent.fullName} ({transferringStudent.code})
                </div>
                <div className="text-slate-600 mt-1">
                  Lớp hiện tại: <strong>{classMap.get(transferringStudent.classId)?.name || '---'}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn lớp học mới <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.id === transferringStudent.classId}>
                      Lớp {c.name} (Khối {c.grade}) {c.id === transferringStudent.classId ? '- [Lớp hiện tại]' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Lưu ý: Thao tác này sẽ chuyển học sinh và tự động cập nhật lại sĩ số các lớp tương ứng mà không tạo bản ghi học sinh trùng lặp.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTransferringStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTransfer}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shadow-indigo-500/20 cursor-pointer"
                >
                  Xác nhận chuyển lớp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(studentToDelete)}
        title={`Xác nhận xóa học sinh`}
        message={`Bạn có chắc chắn muốn xóa học sinh "${studentToDelete?.fullName}" (${studentToDelete?.code}) khỏi hệ thống? Tất cả bản ghi tiến độ học tập liên quan cũng sẽ được xóa.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};
