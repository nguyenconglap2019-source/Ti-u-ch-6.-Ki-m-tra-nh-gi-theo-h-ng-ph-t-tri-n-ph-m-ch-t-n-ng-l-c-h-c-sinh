import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClassRoom } from '../types';
import {
  Plus,
  Search,
  School,
  Edit2,
  Trash2,
  Users,
  Calendar,
  UserCheck,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  AlertCircle,
  X,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const ClassesView: React.FC = () => {
  const {
    classes,
    students,
    stats,
    addClass,
    updateClass,
    deleteClass,
    setSelectedClassForDetail,
    setActiveTab,
    setSelectedClassIdForFilter,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal thêm/sửa lớp
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: 4,
    schoolYear: '2025 - 2026',
    teacherName: 'Nguyễn Công Lập',
    note: '',
  });

  // Modal xác nhận xóa
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);

  // Lọc danh sách lớp
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesGrade =
      selectedGradeFilter === 'ALL' || cls.grade.toString() === selectedGradeFilter;
    return matchesSearch && matchesGrade;
  });

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      grade: 4,
      schoolYear: '2025 - 2026',
      teacherName: 'Nguyễn Công Lập',
      note: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassRoom, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade: cls.grade,
      schoolYear: cls.schoolYear,
      teacherName: cls.teacherName,
      note: cls.note || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      const ok = updateClass(editingClass.id, {
        name: formData.name,
        grade: Number(formData.grade) as 1 | 2 | 3 | 4 | 5,
        schoolYear: formData.schoolYear,
        teacherName: formData.teacherName,
        note: formData.note,
      });
      if (ok) setIsModalOpen(false);
    } else {
      const ok = addClass({
        name: formData.name,
        grade: Number(formData.grade),
        schoolYear: formData.schoolYear,
        teacherName: formData.teacherName,
        note: formData.note,
      });
      if (ok) setIsModalOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!classToDelete) return;
    deleteClass(classToDelete.id);
    setClassToDelete(null);
  };

  const handleViewStudentsInClass = (cls: ClassRoom) => {
    setSelectedClassForDetail(cls);
  };

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản lý Lớp học
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trường Tiểu học Nguyễn Hữu Dực · Năm học 2025 - 2026 (Tổng cộng: {classes.length} lớp)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Grid / Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng bảng"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm lớp học</span>
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên lớp (ví dụ: 4A, 1B) hoặc giáo viên..."
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

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Lọc theo khối:</span>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', '1', '2', '3', '4', '5'].map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGradeFilter(grade)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedGradeFilter === grade
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {grade === 'ALL' ? 'Tất cả' : `Khối ${grade}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content display */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy lớp học nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedGradeFilter !== 'ALL'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc khối lớp.'
              : 'Hiện chưa có lớp học nào trong hệ thống. Hãy tạo lớp học mới để bắt đầu quản lý.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            + Thêm lớp học mới
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const studentCount = stats.classStudentCountMap[cls.id] || 0;

            return (
              <div
                key={cls.id}
                onClick={() => handleViewStudentsInClass(cls)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-slate-900 group-hover:text-blue-700">
                          Lớp {cls.name}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 rounded-md">
                          Khối {cls.grade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Năm học: {cls.schoolYear}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleOpenEdit(cls, e)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa thông tin lớp"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setClassToDelete(cls);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa lớp học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sĩ số học sinh tự động tính */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Sĩ số học sinh:</span>
                    </div>
                    <span className="text-sm font-extrabold text-blue-800 font-mono tabular-nums">
                      {studentCount} học sinh
                    </span>
                  </div>

                  {/* Teacher in charge */}
                  <div className="mt-3 text-xs text-slate-600 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">GV: <strong>{cls.teacherName}</strong></span>
                  </div>

                  {/* Note */}
                  {cls.note && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 italic bg-slate-50/50 p-2 rounded-lg">
                      "{cls.note}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold group-hover:text-blue-700">
                  <span>Xem danh sách học sinh ({studentCount})</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Tên lớp</th>
                  <th className="py-3.5 px-4">Khối lớp</th>
                  <th className="py-3.5 px-4">Năm học</th>
                  <th className="py-3.5 px-4">Giáo viên phụ trách</th>
                  <th className="py-3.5 px-4 text-center">Sĩ số (Tự động)</th>
                  <th className="py-3.5 px-4">Ghi chú</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.map((cls) => {
                  const studentCount = stats.classStudentCountMap[cls.id] || 0;

                  return (
                    <tr
                      key={cls.id}
                      onClick={() => handleViewStudentsInClass(cls)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        Lớp {cls.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Khối {cls.grade}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">{cls.schoolYear}</td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">{cls.teacherName}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md tabular-nums">
                          {studentCount} HS
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {cls.note || '---'}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewStudentsInClass(cls)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(cls, e)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setClassToDelete(cls);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md"
                            title="Xóa"
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

      {/* MODAL THÊM / SỬA LỚP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingClass ? `Chỉnh sửa Lớp ${editingClass.name}` : 'Thêm lớp học mới'}
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
                  Tên lớp học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 1A, 2A, 3B, 4A, 5A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khối lớp <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value={1}>Khối 1</option>
                    <option value={2}>Khối 2</option>
                    <option value={3}>Khối 3</option>
                    <option value={4}>Khối 4</option>
                    <option value={5}>Khối 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Năm học <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2025 - 2026"
                    value={formData.schoolYear}
                    onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giáo viên phụ trách <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Công Lập"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú lớp học
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về phân công bộ môn, phòng học, đặc điểm lớp..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
                  {editingClass ? 'Lưu thay đổi' : 'Tạo lớp học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(classToDelete)}
        title={`Xác nhận xóa Lớp ${classToDelete?.name || ''}`}
        message={
          (stats.classStudentCountMap[classToDelete?.id || ''] || 0) > 0
            ? `CẢNH BÁO: Lớp ${classToDelete?.name} hiện đang có ${
                stats.classStudentCountMap[classToDelete?.id || '']
              } học sinh! Vui lòng chuyển học sinh sang lớp khác trước khi xóa để không mất thông tin.`
            : `Bạn có chắc chắn muốn xóa lớp ${classToDelete?.name}? Thao tác này không thể hoàn tác.`
        }
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setClassToDelete(null)}
      />
    </div>
  );
};
