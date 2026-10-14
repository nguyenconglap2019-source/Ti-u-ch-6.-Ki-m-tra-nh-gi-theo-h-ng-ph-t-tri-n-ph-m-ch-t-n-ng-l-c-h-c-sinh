import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ClassRoom,
  Student,
  ProgressRecord,
  AttendanceRecord,
  AttendanceStatus,
  ActivityLog,
  ActiveTab,
  ToastMessage,
  AppBackupData,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_PROGRESS_RECORDS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';
import { exportBackupJSON, validateBackupData } from '../utils/exportHelpers';

const STORAGE_KEY = 'ql_lop_hoc_nguyen_cong_lap_v1';

interface AppContextType {
  classes: ClassRoom[];
  students: Student[];
  progressRecords: ProgressRecord[];
  attendanceRecords: AttendanceRecord[];
  activityLogs: ActivityLog[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedClassIdForFilter: string | null;
  setSelectedClassIdForFilter: (id: string | null) => void;
  selectedStudentForProfile: Student | null;
  setSelectedStudentForProfile: (std: Student | null) => void;
  selectedClassForDetail: ClassRoom | null;
  setSelectedClassForDetail: (cls: ClassRoom | null) => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // CRUD Classes
  addClass: (data: { name: string; grade: number; schoolYear: string; teacherName: string; note?: string }) => boolean;
  updateClass: (id: string, data: Partial<ClassRoom>) => boolean;
  deleteClass: (id: string) => { success: boolean; error?: string };

  // CRUD Students
  addStudent: (data: { fullName: string; classId: string; birthDate?: string; gender: 'Nam' | 'Nữ'; note?: string; customCode?: string }) => boolean;
  updateStudent: (id: string, data: Partial<Student>) => boolean;
  deleteStudent: (id: string) => boolean;
  transferStudent: (studentId: string, newClassId: string) => boolean;

  // CRUD Progress
  addProgressRecord: (data: Omit<ProgressRecord, 'id' | 'createdAt'>) => boolean;
  updateProgressRecord: (id: string, data: Partial<ProgressRecord>) => boolean;
  deleteProgressRecord: (id: string) => boolean;

  // Điểm danh (Attendance)
  markAttendance: (studentId: string, date: string, status: AttendanceStatus, note?: string) => boolean;
  batchMarkAttendance: (records: Array<{ studentId: string; classId: string; date: string; status: AttendanceStatus; note?: string }>) => boolean;
  markAllPresent: (classId: string, date: string) => boolean;
  deleteAttendanceRecord: (id: string) => boolean;

  // Data & Backup
  exportBackup: () => void;
  importBackup: (data: unknown) => { success: boolean; message: string };
  resetSampleData: () => void;
  clearAllData: () => void;

  // Computed metrics
  stats: {
    totalClasses: number;
    totalStudents: number;
    studentsTrackedCount: number;
    averageCompletionRate: number;
    totalTasks: number;
    completedTasksCount: number;
    inProgressTasksCount: number;
    needsHelpTasksCount: number;
    notStartedTasksCount: number;
    studentsNeedingAttention: Array<{
      student: Student;
      className: string;
      reason: string;
      needsHelpCount: number;
    }>;
    classStudentCountMap: Record<string, number>;
    // Thống kê điểm danh hôm nay
    todayAttendanceRate: number;
    todayPresentCount: number;
    todayAbsentExcusedCount: number;
    todayAbsentUnexcusedCount: number;
    todayLateCount: number;
    totalAttendanceRecordsCount: number;
  };
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.classes)) return parsed.classes;
      }
    } catch (e) {
      console.error('Lỗi khi tải dữ liệu lớp học từ localStorage', e);
    }
    return INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.students)) return parsed.students;
      }
    } catch (e) {
      console.error('Lỗi khi tải học sinh từ localStorage', e);
    }
    return INITIAL_STUDENTS;
  });

  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.progressRecords)) return parsed.progressRecords;
      }
    } catch (e) {
      console.error('Lỗi khi tải tiến độ từ localStorage', e);
    }
    return INITIAL_PROGRESS_RECORDS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.attendanceRecords)) return parsed.attendanceRecords;
      }
    } catch (e) {
      console.error('Lỗi khi tải dữ liệu điểm danh từ localStorage', e);
    }
    return INITIAL_ATTENDANCE_RECORDS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.activityLogs)) return parsed.activityLogs;
      }
    } catch (e) {
      console.error('Lỗi khi tải lịch sử từ localStorage', e);
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedClassIdForFilter, setSelectedClassIdForFilter] = useState<string | null>(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedClassForDetail, setSelectedClassForDetail] = useState<ClassRoom | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Tự động lưu dữ liệu vào localStorage
  useEffect(() => {
    try {
      const payload: AppBackupData = {
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Không thể lưu vào localStorage', err);
    }
  }, [classes, students, progressRecords, attendanceRecords, activityLogs]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logActivity = (
    action: string,
    detail: string,
    type: 'class' | 'student' | 'progress' | 'attendance' | 'system'
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      action,
      detail,
      timestamp: new Date().toISOString(),
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]); // giữ tối đa 50 log gần nhất
  };

  // --- CRUD Lớp học ---
  const addClass = (data: { name: string; grade: number; schoolYear: string; teacherName: string; note?: string }): boolean => {
    const cleanName = data.name.trim();
    if (!cleanName) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng nhập tên lớp học (ví dụ: 1A, 4B).');
      return false;
    }

    // Kiểm tra trùng tên trong cùng năm học
    const duplicate = classes.some(
      (c) => c.name.toLowerCase() === cleanName.toLowerCase() && c.schoolYear.trim() === data.schoolYear.trim()
    );
    if (duplicate) {
      addToast('error', 'Trùng tên lớp', `Lớp "${cleanName}" đã tồn tại trong năm học ${data.schoolYear}.`);
      return false;
    }

    const newClass: ClassRoom = {
      id: `cls-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: cleanName,
      grade: data.grade as 1 | 2 | 3 | 4 | 5,
      schoolYear: data.schoolYear.trim() || '2025 - 2026',
      teacherName: data.teacherName.trim() || 'Nguyễn Công Lập',
      note: data.note?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    setClasses((prev) => [...prev, newClass]);
    logActivity('Thêm lớp học mới', `Đã tạo lớp ${newClass.name} (Khối ${newClass.grade})`, 'class');
    addToast('success', 'Thành công', `Đã thêm lớp ${newClass.name} vào hệ thống.`);
    return true;
  };

  const updateClass = (id: string, data: Partial<ClassRoom>): boolean => {
    const existing = classes.find((c) => c.id === id);
    if (!existing) {
      addToast('error', 'Không tìm thấy', 'Lớp học không tồn tại.');
      return false;
    }

    if (data.name) {
      const cleanName = data.name.trim();
      const schoolYear = data.schoolYear || existing.schoolYear;
      const duplicate = classes.some(
        (c) => c.id !== id && c.name.toLowerCase() === cleanName.toLowerCase() && c.schoolYear.trim() === schoolYear.trim()
      );
      if (duplicate) {
        addToast('error', 'Trùng tên lớp', `Đã có lớp "${cleanName}" trong năm học ${schoolYear}.`);
        return false;
      }
    }

    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, name: data.name?.trim() || c.name } : c))
    );
    logActivity('Cập nhật lớp học', `Cập nhật thông tin lớp ${existing.name}`, 'class');
    addToast('success', 'Thành công', `Đã lưu cập nhật thông tin lớp.`);
    return true;
  };

  const deleteClass = (id: string): { success: boolean; error?: string } => {
    const existing = classes.find((c) => c.id === id);
    if (!existing) return { success: false, error: 'Lớp không tồn tại' };

    // Kiểm tra học sinh trong lớp
    const studentCount = students.filter((s) => s.classId === id).length;
    if (studentCount > 0) {
      return {
        success: false,
        error: `Lớp ${existing.name} đang có ${studentCount} học sinh. Vui lòng chuyển học sinh sang lớp khác trước khi xóa.`,
      };
    }

    setClasses((prev) => prev.filter((c) => c.id !== id));
    logActivity('Xóa lớp học', `Đã xóa lớp ${existing.name}`, 'class');
    addToast('success', 'Đã xóa lớp', `Đã xóa thành công lớp ${existing.name}.`);
    return { success: true };
  };

  // --- CRUD Học sinh ---
  const addStudent = (data: {
    fullName: string;
    classId: string;
    birthDate?: string;
    gender: 'Nam' | 'Nữ';
    note?: string;
    customCode?: string;
  }): boolean => {
    const cleanName = data.fullName.trim();
    if (!cleanName) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng nhập họ và tên học sinh.');
      return false;
    }

    const cls = classes.find((c) => c.id === data.classId);
    if (!cls) {
      addToast('error', 'Lớp học không hợp lệ', 'Vui lòng chọn một lớp học hợp lệ.');
      return false;
    }

    // Tự sinh mã học sinh nếu không cung cấp
    let code = data.customCode?.trim();
    if (!code) {
      const currentClassStudents = students.filter((s) => s.classId === data.classId);
      const nextNum = currentClassStudents.length + 1;
      const cleanClassName = cls.name.replace(/\s+/g, '').toUpperCase();
      code = `HS${cleanClassName}-${String(nextNum).padStart(2, '0')}`;

      // Đảm bảo không trùng code
      let suffix = 1;
      while (students.some((s) => s.code === code)) {
        code = `HS${cleanClassName}-${String(nextNum + suffix).padStart(2, '0')}`;
        suffix++;
      }
    } else {
      if (students.some((s) => s.code.toLowerCase() === code!.toLowerCase())) {
        addToast('error', 'Trùng mã học sinh', `Mã "${code}" đã thuộc về học sinh khác.`);
        return false;
      }
    }

    const newStudent: Student = {
      id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      code,
      fullName: cleanName,
      classId: data.classId,
      birthDate: data.birthDate || '',
      gender: data.gender,
      note: data.note?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    setStudents((prev) => [...prev, newStudent]);
    logActivity('Thêm học sinh', `Đã thêm học sinh ${newStudent.fullName} (${newStudent.code}) vào lớp ${cls.name}`, 'student');
    addToast('success', 'Thành công', `Đã thêm học sinh ${newStudent.fullName} vào lớp ${cls.name}.`);
    return true;
  };

  const updateStudent = (id: string, data: Partial<Student>): boolean => {
    const existing = students.find((s) => s.id === id);
    if (!existing) {
      addToast('error', 'Không tìm thấy', 'Hồ sơ học sinh không tồn tại.');
      return false;
    }

    if (data.code && data.code.trim() !== existing.code) {
      const codeDuplicate = students.some(
        (s) => s.id !== id && s.code.toLowerCase() === data.code!.trim().toLowerCase()
      );
      if (codeDuplicate) {
        addToast('error', 'Trùng mã học sinh', `Mã "${data.code}" đã được sử dụng.`);
        return false;
      }
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              ...data,
              fullName: data.fullName ? data.fullName.trim() : s.fullName,
              code: data.code ? data.code.trim() : s.code,
            }
          : s
      )
    );
    logActivity('Cập nhật hồ sơ', `Cập nhật thông tin học sinh ${existing.fullName}`, 'student');
    addToast('success', 'Thành công', 'Đã lưu thay đổi hồ sơ học sinh.');
    return true;
  };

  const deleteStudent = (id: string): boolean => {
    const existing = students.find((s) => s.id === id);
    if (!existing) return false;

    // Xóa học sinh, các bản ghi tiến độ và dữ liệu điểm danh của học sinh đó
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setProgressRecords((prev) => prev.filter((p) => p.studentId !== id));
    setAttendanceRecords((prev) => prev.filter((a) => a.studentId !== id));

    logActivity('Xóa học sinh', `Đã xóa học sinh ${existing.fullName} (${existing.code})`, 'student');
    addToast('success', 'Đã xóa', `Đã xóa hồ sơ của học sinh ${existing.fullName}.`);
    return true;
  };

  const transferStudent = (studentId: string, newClassId: string): boolean => {
    const student = students.find((s) => s.id === studentId);
    const newClass = classes.find((c) => c.id === newClassId);
    if (!student || !newClass) {
      addToast('error', 'Lỗi chuyển lớp', 'Không tìm thấy học sinh hoặc lớp học đích.');
      return false;
    }

    if (student.classId === newClassId) {
      addToast('info', 'Thông báo', `Học sinh ${student.fullName} hiện đã ở trong lớp ${newClass.name}.`);
      return false;
    }

    const oldClass = classes.find((c) => c.id === student.classId);

    // Cập nhật classId cho học sinh và cập nhật cả classId trong các bản ghi tiến độ & điểm danh
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, classId: newClassId } : s))
    );
    setProgressRecords((prev) =>
      prev.map((p) => (p.studentId === studentId ? { ...p, classId: newClassId } : p))
    );
    setAttendanceRecords((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, classId: newClassId } : a))
    );

    logActivity(
      'Chuyển lớp học sinh',
      `Chuyển ${student.fullName} từ lớp ${oldClass?.name || '---'} sang lớp ${newClass.name}`,
      'student'
    );
    addToast('success', 'Chuyển lớp thành công', `Đã chuyển ${student.fullName} sang lớp ${newClass.name}.`);
    return true;
  };

  // --- CRUD Tiến độ học tập ---
  const addProgressRecord = (data: Omit<ProgressRecord, 'id' | 'createdAt'>): boolean => {
    if (!data.task.trim()) {
      addToast('error', 'Thiếu nội dung', 'Vui lòng nhập nhiệm vụ hoặc mục tiêu học tập.');
      return false;
    }

    const student = students.find((s) => s.id === data.studentId);
    if (!student) {
      addToast('error', 'Không hợp lệ', 'Không tìm thấy học sinh được chọn.');
      return false;
    }

    const newRecord: ProgressRecord = {
      id: `prg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      ...data,
      task: data.task.trim(),
      classId: student.classId, // Luôn đồng bộ lớp hiện tại của học sinh
      createdAt: new Date().toISOString(),
    };

    setProgressRecords((prev) => [newRecord, ...prev]);
    logActivity(
      'Ghi nhận tiến độ',
      `Đánh giá môn ${newRecord.subject} cho học sinh ${student.fullName} (${newRecord.status})`,
      'progress'
    );
    addToast('success', 'Thành công', 'Đã lưu bản ghi tiến độ học tập mới.');
    return true;
  };

  const updateProgressRecord = (id: string, data: Partial<ProgressRecord>): boolean => {
    const existing = progressRecords.find((p) => p.id === id);
    if (!existing) {
      addToast('error', 'Không tìm thấy', 'Bản ghi tiến độ không tồn tại.');
      return false;
    }

    setProgressRecords((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, task: data.task ? data.task.trim() : p.task } : p))
    );

    logActivity('Cập nhật tiến độ', `Chỉnh sửa bản ghi môn ${existing.subject}`, 'progress');
    addToast('success', 'Thành công', 'Đã lưu chỉnh sửa tiến độ học tập.');
    return true;
  };

  const deleteProgressRecord = (id: string): boolean => {
    const existing = progressRecords.find((p) => p.id === id);
    if (!existing) return false;

    setProgressRecords((prev) => prev.filter((p) => p.id !== id));
    logActivity('Xóa tiến độ', `Xóa bản ghi tiến độ môn ${existing.subject}`, 'progress');
    addToast('success', 'Đã xóa', 'Đã xóa bản ghi tiến độ học tập.');
    return true;
  };

  // --- CRUD Điểm danh (Attendance) ---
  const markAttendance = (
    studentId: string,
    date: string,
    status: AttendanceStatus,
    note?: string
  ): boolean => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      addToast('error', 'Lỗi điểm danh', 'Không tìm thấy học sinh.');
      return false;
    }

    setAttendanceRecords((prev) => {
      const idx = prev.findIndex((a) => a.studentId === studentId && a.date === date);
      if (idx >= 0) {
        return prev.map((item, index) =>
          index === idx
            ? {
                ...item,
                status,
                classId: student.classId,
                note: note !== undefined ? note : item.note,
              }
            : item
        );
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId,
          classId: student.classId,
          date,
          status,
          note: note || '',
          createdAt: new Date().toISOString(),
        };
        return [newRecord, ...prev];
      }
    });

    const statusLabels: Record<AttendanceStatus, string> = {
      present: 'Có mặt',
      excused: 'Nghỉ có phép',
      unexcused: 'Nghỉ không phép',
      late: 'Đi muộn',
    };

    logActivity(
      'Điểm danh học sinh',
      `Điểm danh em ${student.fullName}: ${statusLabels[status]} (Ngày ${new Date(date).toLocaleDateString('vi-VN')})`,
      'attendance'
    );
    return true;
  };

  const batchMarkAttendance = (
    records: Array<{ studentId: string; classId: string; date: string; status: AttendanceStatus; note?: string }>
  ): boolean => {
    setAttendanceRecords((prev) => {
      const updated = [...prev];
      for (const item of records) {
        const idx = updated.findIndex((r) => r.studentId === item.studentId && r.date === item.date);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            status: item.status,
            classId: item.classId,
            note: item.note !== undefined ? item.note : updated[idx].note,
          };
        } else {
          updated.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            studentId: item.studentId,
            classId: item.classId,
            date: item.date,
            status: item.status,
            note: item.note || '',
            createdAt: new Date().toISOString(),
          });
        }
      }
      return updated;
    });
    return true;
  };

  const markAllPresent = (classId: string, date: string): boolean => {
    const targetStudents =
      classId === 'ALL' ? students : students.filter((s) => s.classId === classId);

    if (targetStudents.length === 0) {
      addToast('info', 'Thông báo', 'Không có học sinh nào trong lớp để điểm danh.');
      return false;
    }

    const recordsToBatch = targetStudents.map((s) => ({
      studentId: s.id,
      classId: s.classId,
      date,
      status: 'present' as AttendanceStatus,
    }));

    batchMarkAttendance(recordsToBatch);
    const cls = classes.find((c) => c.id === classId);
    const className = cls ? `lớp ${cls.name}` : 'tất cả các lớp';
    logActivity(
      'Điểm danh nhanh',
      `Đã điểm danh tất cả ${targetStudents.length} học sinh ${className} Có mặt (Ngày ${new Date(date).toLocaleDateString('vi-VN')})`,
      'attendance'
    );
    addToast('success', 'Điểm danh nhanh', `Đã đánh dấu ${targetStudents.length} học sinh Có mặt.`);
    return true;
  };

  const deleteAttendanceRecord = (id: string): boolean => {
    setAttendanceRecords((prev) => prev.filter((a) => a.id !== id));
    addToast('success', 'Đã xóa', 'Đã xóa bản ghi điểm danh.');
    return true;
  };

  // --- Sao lưu & Khôi phục ---
  const exportBackup = () => {
    const backup: AppBackupData = {
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
    exportBackupJSON(backup);
    addToast('info', 'Đã xuất dữ liệu', 'Tệp sao lưu JSON đã được tải về máy của bạn.');
  };

  const importBackup = (data: unknown): { success: boolean; message: string } => {
    const validation = validateBackupData(data);
    if (!validation.valid) {
      addToast('error', 'Lỗi tệp sao lưu', validation.error || 'Dữ liệu không hợp lệ.');
      return { success: false, message: validation.error || 'Dữ liệu không hợp lệ.' };
    }

    const payload = data as AppBackupData;
    setClasses(payload.classes);
    setStudents(payload.students);
    setProgressRecords(payload.progressRecords);
    if (Array.isArray(payload.attendanceRecords)) {
      setAttendanceRecords(payload.attendanceRecords);
    }
    if (Array.isArray(payload.activityLogs)) {
      setActivityLogs(payload.activityLogs);
    }

    logActivity('Khôi phục dữ liệu', 'Đã nạp dữ liệu từ tệp sao lưu JSON bên ngoài', 'system');
    addToast('success', 'Khôi phục thành công', 'Đã khôi phục toàn bộ danh sách lớp, học sinh, tiến độ và điểm danh.');
    return { success: true, message: 'Khôi phục thành công!' };
  };

  const resetSampleData = () => {
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setProgressRecords(INITIAL_PROGRESS_RECORDS);
    setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    logActivity('Khôi phục dữ liệu mẫu', 'Đã thiết lập lại bộ dữ liệu minh họa ban đầu', 'system');
    addToast('info', 'Đã thiết lập lại', 'Đã khôi phục lại dữ liệu mẫu minh họa.');
  };

  const clearAllData = () => {
    setClasses([]);
    setStudents([]);
    setProgressRecords([]);
    setAttendanceRecords([]);
    setActivityLogs([
      {
        id: `act-${Date.now()}`,
        action: 'Xóa toàn bộ dữ liệu',
        detail: 'Giáo viên đã làm trống hệ thống để nhập dữ liệu mới từ đầu',
        timestamp: new Date().toISOString(),
        type: 'system',
      },
    ]);
    addToast('warning', 'Đã xóa tất cả', 'Toàn bộ dữ liệu lớp học, học sinh và điểm danh đã được làm trống.');
  };

  // --- Tính toán thống kê tự động ---
  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const totalStudents = students.length;

    // Số học sinh đang có ít nhất 1 bản ghi tiến độ
    const studentsWithRecordsSet = new Set(progressRecords.map((p) => p.studentId));
    const studentsTrackedCount = students.filter((s) => studentsWithRecordsSet.has(s.id)).length;

    // Tổng số nhiệm vụ & phân loại
    const totalTasks = progressRecords.length;
    const completedTasksCount = progressRecords.filter((p) => p.status === 'Hoàn thành').length;
    const inProgressTasksCount = progressRecords.filter((p) => p.status === 'Đang thực hiện').length;
    const needsHelpTasksCount = progressRecords.filter((p) => p.status === 'Cần hỗ trợ').length;
    const notStartedTasksCount = progressRecords.filter((p) => p.status === 'Chưa bắt đầu').length;

    const averageCompletionRate =
      totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    // Sĩ số từng lớp
    const classStudentCountMap: Record<string, number> = {};
    classes.forEach((c) => {
      classStudentCountMap[c.id] = 0;
    });
    students.forEach((s) => {
      if (classStudentCountMap[s.classId] !== undefined) {
        classStudentCountMap[s.classId]++;
      }
    });

    // Thống kê điểm danh hôm nay
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceRecords.filter((a) => a.date === todayStr);
    const todayPresentCount = todayAttendance.filter((a) => a.status === 'present').length;
    const todayAbsentExcusedCount = todayAttendance.filter((a) => a.status === 'excused').length;
    const todayAbsentUnexcusedCount = todayAttendance.filter((a) => a.status === 'unexcused').length;
    const todayLateCount = todayAttendance.filter((a) => a.status === 'late').length;
    const todayRecordedTotal = todayAttendance.length;
    const todayAttendanceRate =
      todayRecordedTotal > 0
        ? Math.round(((todayPresentCount + todayLateCount) / todayRecordedTotal) * 100)
        : totalStudents > 0
        ? 0
        : 100;

    // Học sinh cần giáo viên quan tâm (có nhiệm vụ 'Cần hỗ trợ' hoặc tỷ lệ hoàn thành dưới 50% khi có >= 2 nhiệm vụ)
    const classMap = new Map(classes.map((c) => [c.id, c.name]));
    const needsAttentionList: Array<{
      student: Student;
      className: string;
      reason: string;
      needsHelpCount: number;
    }> = [];

    students.forEach((std) => {
      const stdRecords = progressRecords.filter((p) => p.studentId === std.id);
      const helpRecords = stdRecords.filter((p) => p.status === 'Cần hỗ trợ');
      const completedCount = stdRecords.filter((p) => p.status === 'Hoàn thành').length;

      if (helpRecords.length > 0) {
        needsAttentionList.push({
          student: std,
          className: classMap.get(std.classId) || 'Chưa xếp lớp',
          reason: `Có ${helpRecords.length} nhiệm vụ đang ở mức "Cần hỗ trợ" (Môn: ${[
            ...new Set(helpRecords.map((r) => r.subject)),
          ].join(', ')})`,
          needsHelpCount: helpRecords.length,
        });
      } else if (stdRecords.length >= 2 && completedCount / stdRecords.length < 0.5) {
        needsAttentionList.push({
          student: std,
          className: classMap.get(std.classId) || 'Chưa xếp lớp',
          reason: `Tiến độ hoàn thành nhiệm vụ chỉ đạt ${Math.round(
            (completedCount / stdRecords.length) * 100
          )}%`,
          needsHelpCount: 1,
        });
      }
    });

    return {
      totalClasses,
      totalStudents,
      studentsTrackedCount,
      averageCompletionRate,
      totalTasks,
      completedTasksCount,
      inProgressTasksCount,
      needsHelpTasksCount,
      notStartedTasksCount,
      studentsNeedingAttention: needsAttentionList,
      classStudentCountMap,
      todayAttendanceRate,
      todayPresentCount,
      todayAbsentExcusedCount,
      todayAbsentUnexcusedCount,
      todayLateCount,
      totalAttendanceRecordsCount: attendanceRecords.length,
    };
  }, [classes, students, progressRecords, attendanceRecords]);

  return (
    <AppContext.Provider
      value={{
        classes,
        students,
        progressRecords,
        attendanceRecords,
        activityLogs,
        activeTab,
        setActiveTab,
        selectedClassIdForFilter,
        setSelectedClassIdForFilter,
        selectedStudentForProfile,
        setSelectedStudentForProfile,
        selectedClassForDetail,
        setSelectedClassForDetail,
        toasts,
        addToast,
        removeToast,
        addClass,
        updateClass,
        deleteClass,
        addStudent,
        updateStudent,
        deleteStudent,
        transferStudent,
        addProgressRecord,
        updateProgressRecord,
        deleteProgressRecord,
        markAttendance,
        batchMarkAttendance,
        markAllPresent,
        deleteAttendanceRecord,
        exportBackup,
        importBackup,
        resetSampleData,
        clearAllData,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
