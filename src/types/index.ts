export type GradeLevel = 1 | 2 | 3 | 4 | 5;

export type Gender = 'Nam' | 'Nữ';

export type ProgressStatus = 'Chưa bắt đầu' | 'Đang thực hiện' | 'Hoàn thành' | 'Cần hỗ trợ';

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface ClassRoom {
  id: string;
  name: string; // e.g. "4A", "1B", "5A"
  grade: GradeLevel;
  schoolYear: string; // e.g. "2025 - 2026"
  teacherName: string; // e.g. "Nguyễn Công Lập"
  note?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  code: string; // e.g. "HS4A01"
  fullName: string;
  classId: string;
  birthDate?: string; // YYYY-MM-DD
  gender: Gender;
  note?: string;
  createdAt: string;
}

export interface ProgressRecord {
  id: string;
  studentId: string;
  classId: string;
  subject: string; // "Toán", "Tiếng Việt", "Tự nhiên & Xã hội", "Khoa học", "Lịch sử & Địa lý", "Tiếng Anh", "Đạo đức", "Âm nhạc", "Mĩ thuật", "Tin học & Công nghệ", "Hoạt động trải nghiệm"
  date: string; // YYYY-MM-DD
  task: string; // Nội dung / Mục tiêu học tập
  status: ProgressStatus;
  completionRate?: number; // 0 - 100
  teacherFeedback?: string; // Nhận xét của giáo viên
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string; // Lý do vắng hoặc ghi chú đi muộn
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  type: 'class' | 'student' | 'progress' | 'attendance' | 'system';
}

export type ActiveTab = 'overview' | 'classes' | 'students' | 'progress' | 'attendance';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface AppBackupData {
  version: string;
  systemName: string;
  teacher: string;
  school: string;
  exportedAt: string;
  classes: ClassRoom[];
  students: Student[];
  progressRecords: ProgressRecord[];
  attendanceRecords?: AttendanceRecord[];
  activityLogs: ActivityLog[];
}

