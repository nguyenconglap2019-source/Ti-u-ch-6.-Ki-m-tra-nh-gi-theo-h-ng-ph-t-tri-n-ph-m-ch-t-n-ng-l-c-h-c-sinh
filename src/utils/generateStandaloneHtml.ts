import { AppBackupData } from '../types';

/**
 * Tạo nội dung mã nguồn HTML duy nhất (HTML + CSS + JS) có thể chạy ngoại tuyến 100% không cần server
 */
export function buildStandaloneHtmlContent(currentData: AppBackupData): string {
  const jsonState = JSON.stringify(currentData).replace(/<\/script>/g, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HỆ THỐNG QUẢN TRỊ LỚP HỌC – NGUYỄN CÔNG LẬP | Trường TH Nguyễn Hữu Dực</title>
  <style>
    :root {
      --primary: #1e40af;
      --primary-light: #eff6ff;
      --primary-hover: #1d4ed8;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --border-color: #e2e8f0;
      --success: #16a34a;
      --warning: #d97706;
      --info: #0284c7;
      --danger: #dc2626;
      --radius: 12px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.5;
    }
    .app-container { display: flex; min-height: 100vh; }
    .sidebar {
      width: 260px;
      background: #ffffff;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 10;
    }
    .brand-box {
      padding: 24px 20px;
      border-bottom: 1px solid var(--border-color);
      background: #f8fafc;
    }
    .brand-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .brand-teacher { font-size: 15px; font-weight: 700; color: #1e293b; }
    .brand-school { font-size: 12px; color: var(--text-muted); }
    .nav-list { list-style: none; padding: 16px 12px; flex: 1; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: var(--text-muted);
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
      transition: all 0.2s ease;
    }
    .nav-item:hover { background: var(--primary-light); color: var(--primary); }
    .nav-item.active { background: #dbeafe; color: var(--primary); font-weight: 700; }
    .nav-icon { width: 18px; height: 18px; fill: currentColor; }
    .main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .header-bar {
      height: 70px;
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
    }
    .header-title-box h1 { font-size: 18px; font-weight: 700; color: #0f172a; }
    .header-title-box p { font-size: 12px; color: var(--text-muted); }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-outline { background: #fff; border-color: var(--border-color); color: #334155; }
    .btn-outline:hover { background: #f1f5f9; }
    .btn-danger { background: #fee2e2; border-color: #fca5a5; color: var(--danger); }
    .btn-danger:hover { background: #fecaca; }
    .view-container { padding: 32px; flex: 1; overflow-y: auto; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card {
      background: #fff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }
    .stat-value { font-size: 28px; font-weight: 700; color: #0f172a; margin-top: 4px; font-variant-numeric: tabular-nums; }
    .stat-hint { font-size: 12px; color: #64748b; margin-top: 4px; }
    .card {
      background: #fff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .card-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #1e293b; display: flex; justify-content: space-between; align-items: center; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { background: #f8fafc; padding: 12px 16px; font-weight: 600; color: #475569; border-bottom: 1px solid var(--border-color); }
    td { padding: 14px 16px; border-bottom: 1px solid var(--border-color); color: #334155; vertical-align: middle; }
    tr:hover td { background-color: #f8fafc; }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-warning { background: #fef3c7; color: #b45309; }
    .badge-info { background: #e0f2fe; color: #0369a1; }
    .badge-gray { background: #f1f5f9; color: #475569; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #334155; }
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      font-size: 14px;
      outline: none;
    }
    .form-control:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15); }
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-backdrop.open { display: flex; }
    .modal-card {
      background: #fff;
      border-radius: 14px;
      width: 100%;
      max-width: 540px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 28px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 2000; display: flex; flex-direction: column; gap: 10px; }
    .toast-item {
      background: #0f172a;
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
    }
    .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 900px) {
      .app-container { flex-direction: column; }
      .sidebar { width: 100%; height: auto; position: static; }
      .grid-2col { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <nav class="sidebar">
      <div class="brand-box">
        <div class="brand-title">Quản trị lớp học</div>
        <div class="brand-teacher">Thầy Nguyễn Công Lập</div>
        <div class="brand-school">Trường TH Nguyễn Hữu Dực</div>
      </div>
      <ul class="nav-list">
        <li class="nav-item active" onclick="switchTab('overview')">1. Tổng quan</li>
        <li class="nav-item" onclick="switchTab('classes')">2. Lớp học</li>
        <li class="nav-item" onclick="switchTab('students')">3. Học sinh</li>
        <li class="nav-item" onclick="switchTab('progress')">4. Tiến độ học tập</li>
        <li class="nav-item" onclick="switchTab('attendance')">5. Điểm danh</li>
      </ul>
      <div style="padding: 16px; border-top: 1px solid var(--border-color); font-size: 11px; color: #64748b;">
        <div>Dữ liệu lưu trữ trình duyệt (Offline)</div>
        <div style="margin-top: 6px;">Năm học: <strong>2025 - 2026</strong></div>
      </div>
    </nav>

    <main class="main-content">
      <header class="header-bar">
        <div class="header-title-box">
          <h1 id="page-title">1. Tổng quan hệ thống</h1>
          <p id="page-sub">Trường Tiểu học Nguyễn Hữu Dực · Giáo viên: Nguyễn Công Lập</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline" onclick="exportDataJSON()">Sao lưu JSON</button>
          <button class="btn btn-outline" onclick="triggerImportJSON()">Khôi phục JSON</button>
          <input type="file" id="json-file-input" style="display: none;" accept=".json" onchange="handleImportFile(event)">
        </div>
      </header>

      <div class="view-container">
        <!-- TAB 1: TỔNG QUAN -->
        <section id="view-overview">
          <div class="stats-grid">
            <div class="stat-card" style="border-top: 3px solid var(--primary);">
              <div class="stat-label">Tổng số lớp học</div>
              <div class="stat-value" id="stat-total-classes">0</div>
              <div class="stat-hint">Khối lớp tiểu học</div>
            </div>
            <div class="stat-card" style="border-top: 3px solid #0284c7;">
              <div class="stat-label">Tổng số học sinh</div>
              <div class="stat-value" id="stat-total-students">0</div>
              <div class="stat-hint">Hồ sơ đã phân lớp</div>
            </div>
            <div class="stat-card" style="border-top: 3px solid #16a34a;">
              <div class="stat-label">Đang theo dõi tiến độ</div>
              <div class="stat-value" id="stat-tracked-students">0</div>
              <div class="stat-hint">Có bản ghi đánh giá</div>
            </div>
            <div class="stat-card" style="border-top: 3px solid #f59e0b;">
              <div class="stat-label">Tỷ lệ hoàn thành TB</div>
              <div class="stat-value" id="stat-completion-rate">0%</div>
              <div class="stat-hint">Dựa trên nhiệm vụ đã giao</div>
            </div>
          </div>

          <div class="grid-2col">
            <div class="card">
              <div class="card-title">
                <span>Số lượng học sinh theo lớp</span>
              </div>
              <div id="chart-classes-bar" style="height: 220px; display: flex; align-items: flex-end; gap: 16px; padding-top: 20px;"></div>
            </div>
            <div class="card">
              <div class="card-title">
                <span>Tổng hợp trạng thái tiến độ học tập</span>
              </div>
              <div id="progress-status-summary" style="padding: 10px 0;"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">
              <span>Học sinh cần giáo viên quan tâm, hỗ trợ</span>
            </div>
            <div id="attention-list"></div>
          </div>
        </section>

        <!-- TAB 2: LỚP HỌC -->
        <section id="view-classes" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <input type="text" id="class-search" class="form-control" style="max-width: 300px;" placeholder="Tìm kiếm lớp..." oninput="renderClasses()">
            <button class="btn btn-primary" onclick="openAddClassModal()">+ Thêm lớp học mới</button>
          </div>
          <div class="card" style="padding: 0; overflow: hidden;">
            <table>
              <thead>
                <tr>
                  <th>Tên lớp</th>
                  <th>Khối</th>
                  <th>Năm học</th>
                  <th>Giáo viên phụ trách</th>
                  <th>Sĩ số</th>
                  <th>Ghi chú</th>
                  <th style="text-align: right;">Thao tác</th>
                </tr>
              </thead>
              <tbody id="classes-table-body"></tbody>
            </table>
          </div>
        </section>

        <!-- TAB 3: HỌC SINH -->
        <section id="view-students" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; gap: 10px; flex: 1; max-width: 500px;">
              <input type="text" id="student-search" class="form-control" placeholder="Tìm theo tên hoặc mã HS..." oninput="renderStudents()">
              <select id="student-class-filter" class="form-control" style="max-width: 180px;" onchange="renderStudents()"></select>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-outline" onclick="exportStudentsCSV()">Xuất bảng tính CSV</button>
              <button class="btn btn-primary" onclick="openAddStudentModal()">+ Thêm học sinh</button>
            </div>
          </div>
          <div class="card" style="padding: 0; overflow: hidden;">
            <table>
              <thead>
                <tr>
                  <th>Mã HS</th>
                  <th>Họ và tên</th>
                  <th>Lớp</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Ghi chú</th>
                  <th style="text-align: right;">Thao tác</th>
                </tr>
              </thead>
              <tbody id="students-table-body"></tbody>
            </table>
          </div>
        </section>

        <!-- TAB 4: TIẾN ĐỘ HỌC TẬP -->
        <section id="view-progress" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; gap: 10px; flex: 1;">
              <select id="progress-class-filter" class="form-control" style="max-width: 180px;" onchange="renderProgress()"></select>
              <select id="progress-status-filter" class="form-control" style="max-width: 180px;" onchange="renderProgress()">
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Cần hỗ trợ">Cần hỗ trợ</option>
                <option value="Chưa bắt đầu">Chưa bắt đầu</option>
              </select>
            </div>
            <button class="btn btn-primary" onclick="openAddProgressModal()">+ Thêm bản ghi tiến độ</button>
          </div>
          <div class="card" style="padding: 0; overflow: hidden;">
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Học sinh</th>
                  <th>Lớp</th>
                  <th>Môn học</th>
                  <th>Nhiệm vụ / Mục tiêu</th>
                  <th>Trạng thái</th>
                  <th>Nhận xét của giáo viên</th>
                  <th style="text-align: right;">Thao tác</th>
                </tr>
              </thead>
              <tbody id="progress-table-body"></tbody>
            </table>
          </div>
        </section>

        <!-- TAB 5: ĐIỂM DANH -->
        <section id="view-attendance" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <input type="date" id="attendance-date" class="form-control" style="max-width: 170px;" onchange="renderAttendance()">
              <select id="attendance-class-filter" class="form-control" style="max-width: 180px;" onchange="renderAttendance()"></select>
              <button class="btn btn-primary" onclick="markAllPresentOffline()">Tất cả có mặt</button>
            </div>
            <button class="btn btn-outline" onclick="exportAttendanceCSVOffline()">Xuất CSV Điểm danh</button>
          </div>

          <div class="stats-grid" style="margin-bottom: 20px;">
            <div class="stat-card" style="border-top: 3px solid #16a34a;">
              <div class="stat-label">Có mặt</div>
              <div class="stat-value" id="stat-att-present" style="color: #16a34a;">0</div>
            </div>
            <div class="stat-card" style="border-top: 3px solid #f59e0b;">
              <div class="stat-label">Nghỉ có phép</div>
              <div class="stat-value" id="stat-att-excused" style="color: #d97706;">0</div>
            </div>
            <div class="stat-card" style="border-top: 3px solid #dc2626;">
              <div class="stat-label">Nghỉ không phép</div>
              <div class="stat-value" id="stat-att-unexcused" style="color: #dc2626;">0</div>
            </div>
            <div class="stat-card" style="border-top: 3px solid #0284c7;">
              <div class="stat-label">Đi muộn</div>
              <div class="stat-value" id="stat-att-late" style="color: #0284c7;">0</div>
            </div>
          </div>

          <div class="card" style="padding: 0; overflow: hidden;">
            <table>
              <thead>
                <tr>
                  <th>Mã HS</th>
                  <th>Họ và tên</th>
                  <th>Lớp</th>
                  <th>Điểm danh</th>
                  <th>Lý do / Ghi chú</th>
                </tr>
              </thead>
              <tbody id="attendance-table-body"></tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </div>

  <!-- MODAL THÊM / SỬA LỚP -->
  <div class="modal-backdrop" id="modal-class">
    <div class="modal-card">
      <h3 id="modal-class-title" style="font-size: 18px; margin-bottom: 20px;">Thêm lớp học mới</h3>
      <div class="form-group">
        <label class="form-label">Tên lớp *</label>
        <input type="text" id="class-input-name" class="form-control" placeholder="Ví dụ: 4A, 1B, 5C">
      </div>
      <div class="form-group">
        <label class="form-label">Khối lớp *</label>
        <select id="class-input-grade" class="form-control">
          <option value="1">Khối 1</option>
          <option value="2">Khối 2</option>
          <option value="3">Khối 3</option>
          <option value="4" selected>Khối 4</option>
          <option value="5">Khối 5</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Năm học</label>
        <input type="text" id="class-input-year" class="form-control" value="2025 - 2026">
      </div>
      <div class="form-group">
        <label class="form-label">Giáo viên phụ trách</label>
        <input type="text" id="class-input-teacher" class="form-control" value="Nguyễn Công Lập">
      </div>
      <div class="form-group">
        <label class="form-label">Ghi chú</label>
        <textarea id="class-input-note" class="form-control" rows="2" placeholder="Ghi chú về lớp học..."></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal('modal-class')">Hủy</button>
        <button class="btn btn-primary" onclick="saveClass()">Lưu lớp học</button>
      </div>
    </div>
  </div>

  <!-- MODAL THÊM / SỬA HỌC SINH -->
  <div class="modal-backdrop" id="modal-student">
    <div class="modal-card">
      <h3 id="modal-student-title" style="font-size: 18px; margin-bottom: 20px;">Thêm học sinh</h3>
      <div class="form-group">
        <label class="form-label">Họ và tên *</label>
        <input type="text" id="std-input-name" class="form-control" placeholder="Ví dụ: Nguyễn Văn An">
      </div>
      <div class="form-group">
        <label class="form-label">Lớp học *</label>
        <select id="std-input-class" class="form-control"></select>
      </div>
      <div class="form-group">
        <label class="form-label">Giới tính</label>
        <select id="std-input-gender" class="form-control">
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Ngày sinh</label>
        <input type="date" id="std-input-birth" class="form-control">
      </div>
      <div class="form-group">
        <label class="form-label">Ghi chú sư phạm</label>
        <textarea id="std-input-note" class="form-control" rows="2" placeholder="Nhận xét đặc điểm học sinh..."></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal('modal-student')">Hủy</button>
        <button class="btn btn-primary" onclick="saveStudent()">Lưu học sinh</button>
      </div>
    </div>
  </div>

  <!-- MODAL THÊM / SỬA TIẾN ĐỘ -->
  <div class="modal-backdrop" id="modal-progress">
    <div class="modal-card">
      <h3 id="modal-progress-title" style="font-size: 18px; margin-bottom: 20px;">Thêm bản ghi tiến độ học tập</h3>
      <div class="form-group">
        <label class="form-label">Chọn học sinh *</label>
        <select id="prg-input-student" class="form-control" onchange="onProgressStudentChange()"></select>
      </div>
      <div class="form-group">
        <label class="form-label">Môn học / Nội dung *</label>
        <select id="prg-input-subject" class="form-control">
          <option value="Toán">Toán</option>
          <option value="Tiếng Việt">Tiếng Việt</option>
          <option value="Tự nhiên & Xã hội">Tự nhiên & Xã hội</option>
          <option value="Khoa học">Khoa học</option>
          <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
          <option value="Tiếng Anh">Tiếng Anh</option>
          <option value="Đạo đức">Đạo đức</option>
          <option value="Tin học & Công nghệ">Tin học & Công nghệ</option>
          <option value="Mĩ thuật">Mĩ thuật</option>
          <option value="Âm nhạc">Âm nhạc</option>
          <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Ngày ghi nhận</label>
        <input type="date" id="prg-input-date" class="form-control">
      </div>
      <div class="form-group">
        <label class="form-label">Nhiệm vụ / Mục tiêu học tập *</label>
        <textarea id="prg-input-task" class="form-control" rows="2" placeholder="Nội dung bài học hoặc kỹ năng cần hoàn thành..."></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Trạng thái học tập *</label>
        <select id="prg-input-status" class="form-control">
          <option value="Chưa bắt đầu">Chưa bắt đầu</option>
          <option value="Đang thực hiện">Đang thực hiện</option>
          <option value="Hoàn thành" selected>Hoàn thành</option>
          <option value="Cần hỗ trợ">Cần hỗ trợ</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Nhận xét của giáo viên</label>
        <textarea id="prg-input-feedback" class="form-control" rows="2" placeholder="Nhận xét cụ thể hướng dẫn học sinh tiến bộ..."></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal('modal-progress')">Hủy</button>
        <button class="btn btn-primary" onclick="saveProgress()">Lưu tiến độ</button>
      </div>
    </div>
  </div>

  <div class="toast-container" id="toast-box"></div>

  <script>
    // Dữ liệu ứng dụng
    const INITIAL_STATE = ${jsonState};
    const STORAGE_KEY = 'ql_lop_hoc_nguyen_cong_lap_offline_v1';

    let appData = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        appData = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Không tải được localStorage', e);
    }

    if (!appData || !Array.isArray(appData.classes)) {
      appData = INITIAL_STATE;
    }
    appData.attendanceRecords = appData.attendanceRecords || [];

    function saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      } catch (e) {
        console.error('Lỗi lưu localStorage', e);
      }
      renderAll();
    }

    function showToast(msg) {
      const box = document.getElementById('toast-box');
      const item = document.createElement('div');
      item.className = 'toast-item';
      item.textContent = msg;
      box.appendChild(item);
      setTimeout(() => item.remove(), 3500);
    }

    function switchTab(tabId) {
      ['overview', 'classes', 'students', 'progress', 'attendance'].forEach(t => {
        const view = document.getElementById('view-' + t);
        if (view) view.style.display = (t === tabId ? 'block' : 'none');
      });
      document.querySelectorAll('.nav-item').forEach((item, idx) => {
        const tabs = ['overview', 'classes', 'students', 'progress', 'attendance'];
        if (tabs[idx] === tabId) item.classList.add('active');
        else item.classList.remove('active');
      });
      const titles = {
        overview: '1. Tổng quan hệ thống',
        classes: '2. Quản lý danh sách lớp học',
        students: '3. Quản lý hồ sơ học sinh',
        progress: '4. Theo dõi tiến độ học tập',
        attendance: '5. Quản lý Điểm danh & Chuyên cần'
      };
      document.getElementById('page-title').textContent = titles[tabId] || 'Quản lý';
      renderAll();
    }

    function renderAll() {
      renderOverview();
      renderClasses();
      renderStudents();
      renderProgress();
      renderAttendance();
    }

    function renderOverview() {
      const totalCls = appData.classes.length;
      const totalStd = appData.students.length;
      const trackedSet = new Set(appData.progressRecords.map(p => p.studentId));
      const totalTasks = appData.progressRecords.length;
      const completed = appData.progressRecords.filter(p => p.status === 'Hoàn thành').length;
      const compRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

      document.getElementById('stat-total-classes').textContent = totalCls;
      document.getElementById('stat-total-students').textContent = totalStd;
      document.getElementById('stat-tracked-students').textContent = trackedSet.size;
      document.getElementById('stat-completion-rate').textContent = compRate + '%';

      // Bar chart
      const chartEl = document.getElementById('chart-classes-bar');
      if (chartEl) {
        chartEl.innerHTML = '';
        if (totalCls === 0) {
          chartEl.innerHTML = '<div style="color: #94a3b8; font-size: 13px;">Chưa có dữ liệu lớp học.</div>';
        } else {
          const maxCount = Math.max(...appData.classes.map(c => appData.students.filter(s => s.classId === c.id).length), 5);
          appData.classes.forEach(c => {
            const count = appData.students.filter(s => s.classId === c.id).length;
            const heightPct = Math.round((count / maxCount) * 100);
            const col = document.createElement('div');
            col.style.flex = '1';
            col.style.display = 'flex';
            col.style.flexDirection = 'column';
            col.style.alignItems = 'center';
            col.style.height = '100%';
            col.style.justifyContent = 'flex-end';
            col.innerHTML = \`
              <span style="font-size: 12px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">\${count} HS</span>
              <div style="width: 100%; max-width: 48px; background: #3b82f6; border-radius: 6px 6px 0 0; height: \${Math.max(heightPct, 6)}%;"></div>
              <span style="font-size: 13px; font-weight: 600; margin-top: 8px;">\${c.name}</span>
            \`;
            chartEl.appendChild(col);
          });
        }
      }

      // Trạng thái
      const statusBox = document.getElementById('progress-status-summary');
      if (statusBox) {
        const cDone = appData.progressRecords.filter(p => p.status === 'Hoàn thành').length;
        const cProg = appData.progressRecords.filter(p => p.status === 'Đang thực hiện').length;
        const cHelp = appData.progressRecords.filter(p => p.status === 'Cần hỗ trợ').length;
        const cWait = appData.progressRecords.filter(p => p.status === 'Chưa bắt đầu').length;
        statusBox.innerHTML = \`
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <span>Hoàn thành nhiệm vụ</span>
                <strong>\${cDone} (\${totalTasks ? Math.round((cDone/totalTasks)*100) : 0}%)</strong>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background: #16a34a; width: \${totalTasks ? (cDone/totalTasks)*100 : 0}%;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <span>Đang thực hiện</span>
                <strong>\${cProg} (\${totalTasks ? Math.round((cProg/totalTasks)*100) : 0}%)</strong>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background: #0284c7; width: \${totalTasks ? (cProg/totalTasks)*100 : 0}%;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <span>Cần hỗ trợ từ giáo viên</span>
                <strong style="color: #d97706;">\${cHelp} (\${totalTasks ? Math.round((cHelp/totalTasks)*100) : 0}%)</strong>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background: #f59e0b; width: \${totalTasks ? (cHelp/totalTasks)*100 : 0}%;"></div>
              </div>
            </div>
          </div>
        \`;
      }

      // Attention list
      const attnEl = document.getElementById('attention-list');
      if (attnEl) {
        const helpRecords = appData.progressRecords.filter(p => p.status === 'Cần hỗ trợ');
        if (helpRecords.length === 0) {
          attnEl.innerHTML = '<div style="color: #64748b; font-size: 13px; padding: 12px 0;">Hiện tại tất cả học sinh đều tiến độ tốt, không có trường hợp cần hỗ trợ đặc biệt.</div>';
        } else {
          attnEl.innerHTML = helpRecords.map(r => {
            const std = appData.students.find(s => s.id === r.studentId);
            const cls = std ? appData.classes.find(c => c.id === std.classId) : null;
            return \`
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                <div>
                  <strong>\${std ? std.fullName : 'Học sinh'}</strong> (\${cls ? cls.name : '---'})
                  <div style="font-size: 12px; color: #64748b;">Môn: <strong>\${r.subject}</strong> · Nhiệm vụ: \${r.task}</div>
                </div>
                <span class="badge badge-warning">Cần hỗ trợ</span>
              </div>
            \`;
          }).join('');
        }
      }
    }

    function renderClasses() {
      const tbody = document.getElementById('classes-table-body');
      if (!tbody) return;
      const q = (document.getElementById('class-search')?.value || '').toLowerCase().trim();
      const filtered = appData.classes.filter(c => c.name.toLowerCase().includes(q) || c.teacherName.toLowerCase().includes(q));
      
      tbody.innerHTML = filtered.map(c => {
        const count = appData.students.filter(s => s.classId === c.id).length;
        return \`
          <tr>
            <td><strong>\${c.name}</strong></td>
            <td>Khối \${c.grade}</td>
            <td>\${c.schoolYear}</td>
            <td>\${c.teacherName}</td>
            <td><strong style="color: #1e40af;">\${count}</strong> học sinh</td>
            <td style="color: #64748b; font-size: 12px;">\${c.note || '---'}</td>
            <td style="text-align: right;">
              <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="deleteClassRow('\${c.id}')">Xóa</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function renderStudents() {
      const tbody = document.getElementById('students-table-body');
      if (!tbody) return;
      const q = (document.getElementById('student-search')?.value || '').toLowerCase().trim();
      const clsFilter = document.getElementById('student-class-filter')?.value || 'ALL';

      // Update dropdown filter
      const filterSelect = document.getElementById('student-class-filter');
      if (filterSelect && filterSelect.options.length <= 1) {
        filterSelect.innerHTML = '<option value="ALL">Tất cả lớp học</option>' + 
          appData.classes.map(c => \`<option value="\${c.id}">Lớp \${c.name}</option>\`).join('');
      }

      const filtered = appData.students.filter(s => {
        const matchQ = s.fullName.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
        const matchCls = clsFilter === 'ALL' || s.classId === clsFilter;
        return matchQ && matchCls;
      });

      tbody.innerHTML = filtered.map(s => {
        const cls = appData.classes.find(c => c.id === s.classId);
        return \`
          <tr>
            <td><code>\${s.code}</code></td>
            <td><strong>\${s.fullName}</strong></td>
            <td>\${cls ? cls.name : '---'}</td>
            <td>\${s.gender}</td>
            <td>\${s.birthDate || '---'}</td>
            <td style="color: #64748b; font-size: 12px;">\${s.note || '---'}</td>
            <td style="text-align: right;">
              <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="deleteStudentRow('\${s.id}')">Xóa</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function renderProgress() {
      const tbody = document.getElementById('progress-table-body');
      if (!tbody) return;
      const clsFilter = document.getElementById('progress-class-filter')?.value || 'ALL';
      const stFilter = document.getElementById('progress-status-filter')?.value || 'ALL';

      // Update dropdown filter
      const filterSelect = document.getElementById('progress-class-filter');
      if (filterSelect && filterSelect.options.length <= 1) {
        filterSelect.innerHTML = '<option value="ALL">Tất cả các lớp</option>' + 
          appData.classes.map(c => \`<option value="\${c.id}">Lớp \${c.name}</option>\`).join('');
      }

      const filtered = appData.progressRecords.filter(p => {
        const matchCls = clsFilter === 'ALL' || p.classId === clsFilter;
        const matchSt = stFilter === 'ALL' || p.status === stFilter;
        return matchCls && matchSt;
      });

      tbody.innerHTML = filtered.map(p => {
        const std = appData.students.find(s => s.id === p.studentId);
        const cls = appData.classes.find(c => c.id === p.classId);
        const stBadge = {
          'Hoàn thành': 'badge-success',
          'Đang thực hiện': 'badge-info',
          'Cần hỗ trợ': 'badge-warning',
          'Chưa bắt đầu': 'badge-gray'
        }[p.status] || 'badge-gray';

        return \`
          <tr>
            <td style="font-size: 12px; color: #64748b;">\${p.date}</td>
            <td><strong>\${std ? std.fullName : '---'}</strong></td>
            <td>\${cls ? cls.name : '---'}</td>
            <td>\${p.subject}</td>
            <td>\${p.task}</td>
            <td><span class="badge \${stBadge}">\${p.status}</span></td>
            <td style="color: #64748b; font-size: 12px;">\${p.teacherFeedback || '---'}</td>
            <td style="text-align: right;">
              <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="deleteProgressRow('\${p.id}')">Xóa</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function renderAttendance() {
      const tbody = document.getElementById('attendance-table-body');
      if (!tbody) return;

      const dateInput = document.getElementById('attendance-date');
      if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }
      const curDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
      const clsFilter = document.getElementById('attendance-class-filter')?.value || 'ALL';

      // Update dropdown filter
      const filterSelect = document.getElementById('attendance-class-filter');
      if (filterSelect && filterSelect.options.length <= 1) {
        filterSelect.innerHTML = '<option value="ALL">Tất cả các lớp</option>' + 
          appData.classes.map(c => \`<option value="\${c.id}">Lớp \${c.name}</option>\`).join('');
      }

      const filteredStudents = appData.students.filter(s => {
        return clsFilter === 'ALL' || s.classId === clsFilter;
      });

      const dayAttRecords = (appData.attendanceRecords || []).filter(r => r.date === curDate);
      const attMap = new Map(dayAttRecords.map(r => [r.studentId, r]));

      let pCount = 0, eCount = 0, uCount = 0, lCount = 0;
      filteredStudents.forEach(s => {
        const r = attMap.get(s.id);
        if (r) {
          if (r.status === 'present') pCount++;
          else if (r.status === 'excused') eCount++;
          else if (r.status === 'unexcused') uCount++;
          else if (r.status === 'late') lCount++;
        }
      });

      const statPres = document.getElementById('stat-att-present');
      const statExc = document.getElementById('stat-att-excused');
      const statUnex = document.getElementById('stat-att-unexcused');
      const statLate = document.getElementById('stat-att-late');
      if (statPres) statPres.textContent = pCount;
      if (statExc) statExc.textContent = eCount;
      if (statUnex) statUnex.textContent = uCount;
      if (statLate) statLate.textContent = lCount;

      tbody.innerHTML = filteredStudents.map(s => {
        const cls = appData.classes.find(c => c.id === s.classId);
        const r = attMap.get(s.id);
        const st = r ? r.status : '';

        return \`
          <tr>
            <td><code>\${s.code}</code></td>
            <td><strong>\${s.fullName}</strong></td>
            <td>\${cls ? cls.name : '---'}</td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn" style="padding: 3px 8px; font-size: 11px; \${st === 'present' ? 'background: #16a34a; color: #fff;' : 'background: #f1f5f9; color: #334155;'}" onclick="markAttOffline('\${s.id}', 'present')">Có mặt</button>
                <button type="button" class="btn" style="padding: 3px 8px; font-size: 11px; \${st === 'excused' ? 'background: #f59e0b; color: #fff;' : 'background: #f1f5f9; color: #334155;'}" onclick="markAttOffline('\${s.id}', 'excused')">Có phép</button>
                <button type="button" class="btn" style="padding: 3px 8px; font-size: 11px; \${st === 'unexcused' ? 'background: #dc2626; color: #fff;' : 'background: #f1f5f9; color: #334155;'}" onclick="markAttOffline('\${s.id}', 'unexcused')">Không phép</button>
                <button type="button" class="btn" style="padding: 3px 8px; font-size: 11px; \${st === 'late' ? 'background: #0284c7; color: #fff;' : 'background: #f1f5f9; color: #334155;'}" onclick="markAttOffline('\${s.id}', 'late')">Đi muộn</button>
              </div>
            </td>
            <td>
              <input type="text" class="form-control" style="padding: 4px 8px; font-size: 12px; width: 100%; max-width: 220px;" placeholder="Lý do..." value="\${r?.note || ''}" onchange="updateAttNoteOffline('\${s.id}', this.value)">
            </td>
          </tr>
        \`;
      }).join('');
    }

    function markAttOffline(studentId, status) {
      const curDate = document.getElementById('attendance-date').value;
      appData.attendanceRecords = appData.attendanceRecords || [];
      const idx = appData.attendanceRecords.findIndex(r => r.studentId === studentId && r.date === curDate);
      const std = appData.students.find(s => s.id === studentId);

      if (idx >= 0) {
        appData.attendanceRecords[idx].status = status;
      } else {
        appData.attendanceRecords.push({
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          studentId,
          classId: std ? std.classId : '',
          date: curDate,
          status,
          note: status === 'excused' ? 'Có phép' : '',
          createdAt: new Date().toISOString()
        });
      }
      saveToStorage();
    }

    function updateAttNoteOffline(studentId, note) {
      const curDate = document.getElementById('attendance-date').value;
      appData.attendanceRecords = appData.attendanceRecords || [];
      const idx = appData.attendanceRecords.findIndex(r => r.studentId === studentId && r.date === curDate);
      if (idx >= 0) {
        appData.attendanceRecords[idx].note = note.trim();
        saveToStorage();
      }
    }

    function markAllPresentOffline() {
      const curDate = document.getElementById('attendance-date').value;
      const clsFilter = document.getElementById('attendance-class-filter')?.value || 'ALL';
      const targetList = appData.students.filter(s => clsFilter === 'ALL' || s.classId === clsFilter);

      appData.attendanceRecords = appData.attendanceRecords || [];
      targetList.forEach(s => {
        const idx = appData.attendanceRecords.findIndex(r => r.studentId === s.id && r.date === curDate);
        if (idx >= 0) {
          appData.attendanceRecords[idx].status = 'present';
        } else {
          appData.attendanceRecords.push({
            id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            studentId: s.id,
            classId: s.classId,
            date: curDate,
            status: 'present',
            note: '',
            createdAt: new Date().toISOString()
          });
        }
      });
      saveToStorage();
      showToast('Đã đánh dấu tất cả có mặt');
    }

    function exportAttendanceCSVOffline() {
      const curDate = document.getElementById('attendance-date').value;
      const headers = ['STT', 'Ngày', 'Mã HS', 'Họ và tên', 'Lớp', 'Trạng thái', 'Ghi chú'];
      const stMap = { present: 'Có mặt', excused: 'Nghỉ có phép', unexcused: 'Nghỉ không phép', late: 'Đi muộn' };
      
      const rows = appData.students.map((s, i) => {
        const cls = appData.classes.find(c => c.id === s.classId);
        const r = (appData.attendanceRecords || []).find(a => a.studentId === s.id && a.date === curDate);
        return [
          i + 1,
          curDate,
          s.code,
          '"' + s.fullName.replace(/"/g, '""') + '"',
          cls ? cls.name : '',
          r ? (stMap[r.status] || r.status) : 'Chưa điểm danh',
          '"' + (r?.note || '').replace(/"/g, '""') + '"'
        ].join(',');
      });

      const csv = '\\uFEFF' + [headers.join(','), ...rows].join('\\r\\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'Diem_danh_' + curDate + '.csv';
      a.click();
    }

    // Modal controls
    function openModal(id) { document.getElementById(id).classList.add('open'); }
    function closeModal(id) { document.getElementById(id).classList.remove('open'); }

    function openAddClassModal() {
      document.getElementById('class-input-name').value = '';
      document.getElementById('class-input-note').value = '';
      openModal('modal-class');
    }

    function saveClass() {
      const name = document.getElementById('class-input-name').value.trim();
      const grade = parseInt(document.getElementById('class-input-grade').value, 10);
      const year = document.getElementById('class-input-year').value.trim();
      const teacher = document.getElementById('class-input-teacher').value.trim();
      const note = document.getElementById('class-input-note').value.trim();

      if (!name) { alert('Vui lòng nhập tên lớp'); return; }
      if (appData.classes.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert('Tên lớp này đã tồn tại!');
        return;
      }

      appData.classes.push({
        id: 'cls-' + Date.now(),
        name,
        grade,
        schoolYear: year || '2025 - 2026',
        teacherName: teacher || 'Nguyễn Công Lập',
        note,
        createdAt: new Date().toISOString()
      });
      saveToStorage();
      closeModal('modal-class');
      showToast('Đã thêm lớp học ' + name);
    }

    function deleteClassRow(id) {
      const count = appData.students.filter(s => s.classId === id).length;
      if (count > 0) {
        alert('Lớp đang có ' + count + ' học sinh. Hãy chuyển hoặc xóa học sinh trước!');
        return;
      }
      if (confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
        appData.classes = appData.classes.filter(c => c.id !== id);
        saveToStorage();
        showToast('Đã xóa lớp học');
      }
    }

    function openAddStudentModal() {
      if (appData.classes.length === 0) {
        alert('Vui lòng tạo lớp học trước khi thêm học sinh!');
        return;
      }
      const sel = document.getElementById('std-input-class');
      sel.innerHTML = appData.classes.map(c => \`<option value="\${c.id}">\${c.name}</option>\`).join('');
      document.getElementById('std-input-name').value = '';
      document.getElementById('std-input-note').value = '';
      openModal('modal-student');
    }

    function saveStudent() {
      const name = document.getElementById('std-input-name').value.trim();
      const classId = document.getElementById('std-input-class').value;
      const gender = document.getElementById('std-input-gender').value;
      const birth = document.getElementById('std-input-birth').value;
      const note = document.getElementById('std-input-note').value.trim();

      if (!name) { alert('Vui lòng nhập họ và tên học sinh'); return; }
      const cls = appData.classes.find(c => c.id === classId);
      const curCount = appData.students.filter(s => s.classId === classId).length + 1;
      const code = 'HS' + (cls ? cls.name : '0') + '-' + String(curCount).padStart(2, '0');

      appData.students.push({
        id: 'std-' + Date.now(),
        code,
        fullName: name,
        classId,
        gender,
        birthDate: birth,
        note,
        createdAt: new Date().toISOString()
      });
      saveToStorage();
      closeModal('modal-student');
      showToast('Đã thêm học sinh ' + name);
    }

    function deleteStudentRow(id) {
      if (confirm('Xác nhận xóa học sinh này? Tất cả tiến độ liên quan cũng sẽ bị xóa.')) {
        appData.students = appData.students.filter(s => s.id !== id);
        appData.progressRecords = appData.progressRecords.filter(p => p.studentId !== id);
        saveToStorage();
        showToast('Đã xóa học sinh');
      }
    }

    function openAddProgressModal() {
      if (appData.students.length === 0) {
        alert('Cần có học sinh trong hệ thống trước khi thêm tiến độ!');
        return;
      }
      const sel = document.getElementById('prg-input-student');
      sel.innerHTML = appData.students.map(s => {
        const cls = appData.classes.find(c => c.id === s.classId);
        return \`<option value="\${s.id}">\${s.fullName} (\${cls ? cls.name : '---'})\</option>\`;
      }).join('');
      document.getElementById('prg-input-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('prg-input-task').value = '';
      document.getElementById('prg-input-feedback').value = '';
      openModal('modal-progress');
    }

    function onProgressStudentChange() {}

    function saveProgress() {
      const studentId = document.getElementById('prg-input-student').value;
      const subject = document.getElementById('prg-input-subject').value;
      const date = document.getElementById('prg-input-date').value;
      const task = document.getElementById('prg-input-task').value.trim();
      const status = document.getElementById('prg-input-status').value;
      const feedback = document.getElementById('prg-input-feedback').value.trim();

      if (!task) { alert('Vui lòng nhập nhiệm vụ học tập!'); return; }
      const std = appData.students.find(s => s.id === studentId);

      appData.progressRecords.push({
        id: 'prg-' + Date.now(),
        studentId,
        classId: std ? std.classId : '',
        subject,
        date: date || new Date().toISOString().split('T')[0],
        task,
        status,
        teacherFeedback: feedback,
        createdAt: new Date().toISOString()
      });
      saveToStorage();
      closeModal('modal-progress');
      showToast('Đã lưu tiến độ học tập');
    }

    function deleteProgressRow(id) {
      if (confirm('Xác nhận xóa bản ghi tiến độ này?')) {
        appData.progressRecords = appData.progressRecords.filter(p => p.id !== id);
        saveToStorage();
        showToast('Đã xóa bản ghi tiến độ');
      }
    }

    function exportStudentsCSV() {
      const headers = ['Mã HS', 'Họ và tên', 'Lớp', 'Giới tính', 'Ngày sinh', 'Ghi chú'];
      const rows = appData.students.map(s => {
        const cls = appData.classes.find(c => c.id === s.classId);
        return [
          s.code,
          '"' + s.fullName.replace(/"/g, '""') + '"',
          cls ? cls.name : '',
          s.gender,
          s.birthDate || '',
          '"' + (s.note || '').replace(/"/g, '""') + '"'
        ].join(',');
      });
      const csv = '\\uFEFF' + [headers.join(','), ...rows].join('\\r\\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'Danh_sach_hoc_sinh_Nguyen_Huu_Duc.csv';
      a.click();
    }

    function exportDataJSON() {
      const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'Sao_luu_quan_tri_lop_hoc_' + new Date().toISOString().split('T')[0] + '.json';
      a.click();
    }

    function triggerImportJSON() {
      document.getElementById('json-file-input').click();
    }

    function handleImportFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed.classes) && Array.isArray(parsed.students)) {
            appData = parsed;
            saveToStorage();
            showToast('Đã khôi phục dữ liệu thành công!');
          } else {
            alert('Tệp sao lưu không đúng định dạng!');
          }
        } catch (err) {
          alert('Không đọc được tệp JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    }

    // Khởi chạy khi nạp trang
    window.addEventListener('DOMContentLoaded', () => {
      renderAll();
    });
  </script>
</body>
</html>`;
}
