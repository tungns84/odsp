# 📊 Project Management - Hướng dẫn sử dụng

> **Dự án:** Open Data Sharing Platform (ODSP)
> **PM Framework:** PMP-based Project Management
> **Version:** 1.0

---

## 🚀 Quick Start cho AI Assistant

**Mỗi conversation mới, nói:**
```
Đọc workflow và tiếp tục làm việc
```
hoặc
```
Đọc docs/project-management/PROGRESS_DASHBOARD.md và CURRENT_SPRINT.md để nắm tiến độ
```

---

## 📁 Cấu trúc thư mục quản lý dự án

```
docs/project-management/
├── README.md                    # Hướng dẫn sử dụng (file này)
├── WORKFLOW.md                 # 🤖 Workflow cho AI Assistant
├── MASTER_PLAN.md              # Kế hoạch tổng thể (WBS, Timeline)
├── CURRENT_SPRINT.md           # Sprint hiện tại (chi tiết công việc)
├── PROGRESS_DASHBOARD.md       # Dashboard tiến độ (cập nhật real-time)
├── BACKLOG.md                  # Product Backlog
└── CHANGELOG.md                # Lịch sử thay đổi
```

---

## 🎯 Cách sử dụng

### 1. Xem tiến độ tổng thể
Mở file: `docs/project-management/PROGRESS_DASHBOARD.md`

### 2. Xem kế hoạch chi tiết Sprint hiện tại
Mở file: `docs/project-management/CURRENT_SPRINT.md`

### 3. Xem kế hoạch tổng thể (WBS)
Mở file: `docs/project-management/MASTER_PLAN.md`

### 1. Xem tiến độ tổng thể
Mở file: `docs/project-management/PROGRESS_DASHBOARD.md`

### 2. Xem kế hoạch chi tiết Sprint hiện tại
Mở file: `docs/project-management/CURRENT_SPRINT.md`

### 3. Xem kế hoạch tổng thể (WBS)
Mở file: `docs/project-management/MASTER_PLAN.md`

---

## 📌 Quy tắc cập nhật

| Tình huống | File cần cập nhật |
|------------|-------------------|
| Bắt đầu Sprint mới | `CURRENT_SPRINT.md`, `PROGRESS_DASHBOARD.md` |
| Hoàn thành task | `CURRENT_SPRINT.md` |
| Thêm yêu cầu mới | `BACKLOG.md` |
| Hoàn thành Sprint | `PROGRESS_DASHBOARD.md`, `CHANGELOG.md` |
| Thay đổi timeline | `MASTER_PLAN.md` |

---

## 🤖 Tích hợp với AI Assistant

Sử dụng các prompt sau để quản lý dự án:

| Prompt | Mục đích |
|--------|----------|
| "Cho tôi xem tiến độ dự án" | Xem dashboard tiến độ |
| "Cập nhật: hoàn thành [task]" | Cập nhật tiến độ task |
| "Lên kế hoạch sprint mới" | Tạo sprint mới |
| "Xem backlog" | Xem danh sách backlog |
