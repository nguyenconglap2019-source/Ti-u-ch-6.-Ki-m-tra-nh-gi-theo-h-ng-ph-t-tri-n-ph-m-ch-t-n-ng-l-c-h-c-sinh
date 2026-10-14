import { ClassRoom, Student, ProgressRecord, AttendanceRecord, AppBackupData } from '../types';

/**
 * Xuất danh sách điểm danh ra file CSV có gắn BOM UTF-8
 */
export function exportAttendanceToCSV(
  attendanceRecords: AttendanceRecord[],
  students: Student[],
  classes: ClassRoom[],
  filterDate?: string,
  filterClassName?: string
) {
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const classMap = new Map(classes.map((c) => [c.id, c]));

  const statusMap = {
    present: 'Có mặt',
    excused: 'Nghỉ có phép',
    unexcused: 'Nghỉ không phép',
    late: 'Đi muộn',
  };

  const headers = [
    'STT',
    'Ngày điểm danh',
    'Mã học sinh',
    'Họ và tên',
    'Lớp',
    'Trạng thái điểm danh',
    'Ghi chú / Lý do',
  ];

  const rows = attendanceRecords.map((att, idx) => {
    const std = studentMap.get(att.studentId);
    const cls = classMap.get(att.classId);
    const dateFormatted = new Date(att.date).toLocaleDateString('vi-VN');

    return [
      idx + 1,
      `"${dateFormatted}"`,
      `"${std ? std.code : ''}"`,
      `"${std ? std.fullName.replace(/"/g, '""') : '---'}"`,
      `"${cls ? cls.name : '---'}"`,
      `"${statusMap[att.status] || att.status}"`,
      `"${(att.note || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = filterDate
    ? filterDate.replace(/-/g, '')
    : `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
      ).padStart(2, '0')}`;
  const suffix = filterClassName ? `_Lop_${filterClassName}` : '';
  link.setAttribute('href', url);
  link.setAttribute('download', `Bang_diem_danh_chuyen_can${suffix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Xuất danh sách học sinh ra file CSV có gắn BOM UTF-8 để mở tiếng Việt không bị lỗi font trên Excel
 */
export function exportStudentsToCSV(
  students: Student[],
  classes: ClassRoom[],
  progressRecords: ProgressRecord[]
) {
  const classMap = new Map(classes.map((c) => [c.id, c]));

  // Header CSV
  const headers = [
    'STT',
    'Mã học sinh',
    'Họ và tên',
    'Lớp',
    'Khối',
    'Năm học',
    'Giới tính',
    'Ngày sinh',
    'Số nhiệm vụ học tập',
    'Tỷ lệ hoàn thành (%)',
    'Ghi chú',
  ];

  const rows = students.map((std, idx) => {
    const cls = classMap.get(std.classId);
    const stdRecords = progressRecords.filter((p) => p.studentId === std.id);
    const completedRecords = stdRecords.filter((p) => p.status === 'Hoàn thành');
    const completionRate =
      stdRecords.length > 0
        ? Math.round((completedRecords.length / stdRecords.length) * 100)
        : 'Chưa có';

    return [
      idx + 1,
      `"${std.code}"`,
      `"${std.fullName.replace(/"/g, '""')}"`,
      `"${cls ? cls.name : 'Chưa phân lớp'}"`,
      cls ? `Khối ${cls.grade}` : '',
      cls ? cls.schoolYear : '',
      std.gender,
      std.birthDate || '',
      stdRecords.length,
      completionRate,
      `"${(std.note || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  link.setAttribute('href', url);
  link.setAttribute('download', `Danh_sach_hoc_sinh_TH_Nguyen_Huu_Duc_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Xuất dữ liệu sao lưu dự phòng sang định dạng JSON
 */
export function exportBackupJSON(backupData: AppBackupData) {
  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
  link.setAttribute('href', url);
  link.setAttribute('download', `Sao_luu_quan_tri_lop_hoc_Nguyen_Cong_Lap_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Kiểm tra cấu trúc tệp sao lưu JSON có hợp lệ không
 */
export function validateBackupData(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Định dạng tệp không phải là đối tượng JSON hợp lệ.' };
  }

  const obj = data as Partial<AppBackupData>;

  if (!Array.isArray(obj.classes)) {
    return { valid: false, error: 'Thiếu hoặc sai định dạng danh sách lớp học (classes).' };
  }

  if (!Array.isArray(obj.students)) {
    return { valid: false, error: 'Thiếu hoặc sai định dạng danh sách học sinh (students).' };
  }

  if (!Array.isArray(obj.progressRecords)) {
    return { valid: false, error: 'Thiếu hoặc sai định dạng dữ liệu tiến độ (progressRecords).' };
  }

  // Validate ít nhất 1 phần tử mẫu nếu có
  for (const c of obj.classes) {
    if (!c.id || !c.name || typeof c.grade !== 'number') {
      return { valid: false, error: 'Dữ liệu lớp học chứa bản ghi không đúng trường bắt buộc.' };
    }
  }

  for (const s of obj.students) {
    if (!s.id || !s.code || !s.fullName || !s.classId) {
      return { valid: false, error: 'Dữ liệu học sinh chứa bản ghi không đúng trường bắt buộc.' };
    }
  }

  return { valid: true };
}
