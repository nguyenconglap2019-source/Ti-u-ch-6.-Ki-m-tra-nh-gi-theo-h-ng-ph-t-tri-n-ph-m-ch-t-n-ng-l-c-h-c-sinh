import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  School,
  Users,
  Calendar,
  UserCheck,
  Search,
  Plus,
  ArrowRightLeft,
  GraduationCap,
} from 'lucide-react';
import { Student } from '../types';

export const ClassDetailModal: React.FC = () => {
  const {
    selectedClassForDetail,
    setSelectedClassForDetail,
    students,
    classes,
    stats,
    setActiveTab,
    setSelectedStudentForProfile,
    addStudent,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newStudentBirth, setNewStudentBirth] = useState('');
  const [newStudentNote, setNewStudentNote] = useState('');

  if (!selectedClassForDetail) return null;

  const cls = selectedClassForDetail;
  const classStudents = students.filter((s) => s.classId === cls.id);
  const filteredStudents = classStudents.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleAddStudentToClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    addStudent({
      fullName: newStudentName.trim(),
      classId: cls.id,
      gender: newStudentGender,
      birthDate: newStudentBirth,
      note: newStudentNote.trim(),
    });

    setNewStudentName('');
    setNewStudentBirth('');
    setNewStudentNote('');
    setIsAddStudentOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {cls.name}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Chi tiết Lớp {cls.name}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-800">
                  Khối {cls.grade}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Năm học: {cls.schoolYear} · Giáo viên phụ trách: <strong>{cls.teacherName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedClassForDetail(null)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thống kê sĩ số */}
        <div className="mt-4 grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400">Sĩ số hiện tại:</span>
            <div className="font-extrabold text-blue-700 text-base mt-0.5 font-mono tabular-nums">
              {classStudents.length} học sinh
            </div>
          </div>
          <div>
            <span className="text-slate-400">Nam / Nữ:</span>
            <div className="font-bold text-slate-800 text-sm mt-0.5">
              {classStudents.filter((s) => s.gender === 'Nam').length} Nam /{' '}
              {classStudents.filter((s) => s.gender === 'Nữ').length} Nữ
            </div>
          </div>
          <div>
            <span className="text-slate-400">Ghi chú lớp:</span>
            <div className="text-slate-600 mt-0.5 truncate italic">
              {cls.note || 'Không có ghi chú'}
            </div>
          </div>
        </div>

        {/* Danh sách học sinh trong lớp */}
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Danh sách học sinh lớp {cls.name} ({classStudents.length})
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm học sinh trong lớp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-44"
                />
              </div>

              <button
                onClick={() => setIsAddStudentOpen(!isAddStudentOpen)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddStudentOpen ? 'Đóng' : 'Thêm HS'}</span>
              </button>
            </div>
          </div>

          {/* Form thêm nhanh học sinh vào lớp */}
          {isAddStudentOpen && (
            <form onSubmit={handleAddStudentToClass} className="mt-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3 text-xs">
              <div className="font-bold text-blue-900">Thêm học sinh mới vào lớp {cls.name}:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Giới tính</label>
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Ngày sinh</label>
                  <input
                    type="date"
                    value={newStudentBirth}
                    onChange={(e) => setNewStudentBirth(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Ghi chú</label>
                  <input
                    type="text"
                    placeholder="Ghi chú sở trường, tính cách..."
                    value={newStudentNote}
                    onChange={(e) => setNewStudentNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-3 py-1 text-slate-600 bg-white border border-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Lưu vào lớp
                </button>
              </div>
            </form>
          )}

          {/* Danh sách học sinh */}
          <div className="mt-3 divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Chưa có học sinh nào trong lớp {cls.name}.
              </p>
            ) : (
              filteredStudents.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedClassForDetail(null);
                    setSelectedStudentForProfile(s);
                  }}
                  className="py-2.5 px-2 hover:bg-blue-50/50 rounded-lg transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 w-6 tabular-nums">
                      {idx + 1}.
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                        {s.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {s.code} · {s.gender} · {s.birthDate || 'Chưa nhập ngày sinh'}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                    Xem hồ sơ →
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedClassForDetail(null);
              setActiveTab('attendance');
            }}
            className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Điểm danh lớp {cls.name}</span>
          </button>

          <button
            onClick={() => setSelectedClassForDetail(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
