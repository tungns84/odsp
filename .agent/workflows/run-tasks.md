---
description: Hướng dẫn AI Assistant quản lý task một cách nhất quán
---

# 🤖 AI Workflow - Quản lý Task Dự án

> **Mục đích:** Hướng dẫn AI Assistant quản lý task một cách nhất quán
> **Sử dụng:** Đầu mỗi conversation, nói: *"Đọc workflow và tiếp tục làm việc"*

---

## 📌 Khi bắt đầu conversation mới

**LUÔN thực hiện:**

```
1. Đọc PROGRESS_DASHBOARD.md → Nắm tiến độ tổng thể
2. Đọc CURRENT_SPRINT.md → Biết sprint hiện tại và tasks
3. Tóm tắt cho user: 
   - Overall progress: X%
   - Current sprint: Sprint N (X% complete)
   - Tasks đang In Progress: [list]
```

---

## 📌 Khi nhận task mới từ user

```
1. Kiểm tra task có trong CURRENT_SPRINT.md hoặc BACKLOG.md không
2. Nếu là task mới:
   - Thêm vào CURRENT_SPRINT.md (phần To Do)
   - Assign Story Points (1-8)
   - Gán ID format: S[sprint]-[number]
3. Khi bắt đầu làm:
   - Đổi status từ "📋 Todo" → "🔄 In Progress"
```

---

## 📌 Khi hoàn thành task

```
1. Cập nhật CURRENT_SPRINT.md:
   - Đổi status → "✅ Done"
   - Thêm ngày hoàn thành
   - Di chuyển task lên phần "Completed"

2. Cập nhật PROGRESS_DASHBOARD.md:
   - Cập nhật "Current Sprint" section
   - Cập nhật progress bar nếu milestone đạt được

3. Cập nhật CHANGELOG.md:
   - Thêm entry dưới sprint hiện tại
   - Format: "- [Mô tả ngắn gọn]"
```

---

## 📌 Khi user hỏi về tiến độ

**Đọc PROGRESS_DASHBOARD.md và trả lời với:**
- Overall project progress: X%
- Current sprint: Sprint N
- Sprint progress: X/Y tasks done
- Tasks đang In Progress

---

## 📌 Format chuẩn

### Task trong CURRENT_SPRINT.md:
```markdown
| S5-XX | [Task name] | [1-8] | 📋 Todo / 🔄 In Progress / ✅ Done |
```

### Entry trong CHANGELOG.md:
```markdown
### Added / Changed / Fixed
- [Mô tả ngắn gọn task đã hoàn thành]
```

---

## 📁 File References

| File | Purpose |
|------|---------|
| `PROGRESS_DASHBOARD.md` | Overall progress, sprint status |
| `CURRENT_SPRINT.md` | Active sprint tasks |
| `BACKLOG.md` | Future tasks |
| `CHANGELOG.md` | Completed work history |
| `MASTER_PLAN.md` | WBS, timeline, milestones |
