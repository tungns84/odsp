# Hướng dẫn Thay đổi Log Level Runtime (SOP)

Tài liệu này hướng dẫn cách thay đổi mức độ log (Log Level) của ứng dụng đang chạy mà **không cần khởi động lại (restart)**. Tính năng này cực kỳ hữu ích để debug các vấn đề production.

## 1. Cơ chế
Backend sử dụng **Spring Boot Actuator** để expose endpoint quản lý logs:
- **Endpoint:** `POST /actuator/loggers/{package-name}`
- **Auth:** Yêu cầu quyền Admin (hiện tại trong Dev mode đang mở public)

## 2. Scenario (Kịch bản thực tế)

**Tình huống:**
Ứng dụng đang chạy trên Production/Staging. Người dùng báo lỗi khi **Test Connection** tới một Database lạ, nhưng logs hiện tại chỉ ghi `INFO` nên không rõ lỗi connection timeout hay authentication failure chi tiết.

**Yêu cầu:**
Bật logs mức `DEBUG` cho riêng service `ConnectorApplicationService` để xem chi tiết quá trình bắt tay (handshake) với DB, sau đó trả lại mức `INFO`.

## 3. Các bước thực hiện

### Bước 1: Kiểm tra Log Level hiện tại
Kiểm tra cấu hình log hiện tại của package `com.gs.dsp`.

```bash
curl -X GET http://localhost:8080/actuator/loggers/com.gs.dsp
```
**Kết quả mong đợi:**
```json
{
  "configuredLevel": "INFO",
  "effectiveLevel": "INFO"
}
```

### Bước 2: Thay đổi Log Level sang DEBUG
Gửi request `POST` để đổi level của package connectivity sang `DEBUG`.

```bash
curl -X POST http://localhost:8080/actuator/loggers/com.gs.dsp.connectivity \
     -H "Content-Type: application/json" \
     -d "{\"configuredLevel\": \"DEBUG\"}"
```
*Lưu ý: Bạn có thể set cụ thể cho 1 class hoặc cả package cha.*

### Bước 3: Thực hiện thao tác gây lỗi
Lên giao diện (Frontend) hoặc dùng Postman gọi API gây lỗi (ví dụ: nút "Test Connection").
Lúc này, trong file logs (`logs/application.log`) hoặc console sẽ xuất hiện các dòng DEBUG chi tiết mà bình thường không thấy.

### Bước 4: Revert về INFO (Quan trọng!)
Sau khi đã thu thập đủ logs, **BẮT BUỘC** trả lại level về `INFO` để tránh làm đầy ổ cứng và giảm hiệu năng hệ thống.

```bash
curl -X POST http://localhost:8080/actuator/loggers/com.gs.dsp.connectivity \
     -H "Content-Type: application/json" \
     -d "{\"configuredLevel\": \"INFO\"}"
```

### Bước 5: Kiểm tra lại
```bash
curl -X GET http://localhost:8080/actuator/loggers/com.gs.dsp.connectivity
```
Đảm bảo kết quả trả về là `INFO`.

## 4. Troubleshooting
- **404 Not Found**: Kiểm tra xem endpoint `/actuator/loggers` có được enable trong `application.properties` không (`management.endpoints.web.exposure.include=loggers`).
- **401/403 Unauthorized**: Kiểm tra xem user có quyền truy cập Actuator không (nếu có Security).

---
**Tip:** Luôn scope log modification ở mức nhỏ nhất có thể (ví dụ: theo package `com.gs.dsp.connectivity` thay vì root `com.gs.dsp`) để hạn chế noise.
