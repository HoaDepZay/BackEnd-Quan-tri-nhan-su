# HUIT ERP - Tài liệu API (Backend)

Tài liệu này tổng hợp các danh sách endpoint của hệ thống Quản trị Nhân sự (ERP).

**Cấu hình chung:**
- **URL cơ sở:** `http://localhost:5000/api`
- **Swagger UI:** `http://localhost:5000/api-docs`

---

## 1. Xác thực & Tài khoản (Authentication)
*Cơ sở: `/api/auth`*

| Phương thức | Endpoint | Mô tả | Yêu cầu (Body) |
|:--- |:--- |:--- |:--- |
| **POST** | `/register` | Đăng ký tài khoản mới | `email`, `password`, `manv`, `username`, ... |
| **POST** | `/verify-otp` | Xác thực mã OTP | `email`, `otpCode` |
| **POST** | `/login` | Đăng nhập hệ thống | `email`, `password` |
| **PUT** | `/change-password` | Đổi mật khẩu | `email`, `oldPassword`, `newPassword` |
| **PUT** | `/update-profile` | Cập nhật thông tin profile | `email`, các trường thông tin khác |

---

## 2. Quản lý Nhân viên (Employees)
*Cơ sở: `/api/employees`*

| Phương thức | Endpoint | Mô tả | Ghi chú |
|:--- |:--- |:--- |:--- |
| **GET** | `/` | Lấy danh sách toàn bộ nhân viên | |
| **GET** | `/:id` | Xem chi tiết 1 nhân viên / Profile | |
| **POST** | `/` | Thêm nhân viên mới | |
| **PUT** | `/:id` | Cập nhật thông tin nhân viên | |
| **DELETE** | `/:id` | Xóa/Khóa hồ sơ nhân viên | |
| **GET** | `/my-projects/:manv` | Xem danh sách dự án tham gia | Cần Token |
| **GET** | `/coworkers/:maphg` | Xem danh sách đồng nghiệp cùng phòng | Cần Token |
| **PUT** | `/update-info` | NV tự cập nhật Email | |

---

## 3. Quản trị (Admin)
*Cơ sở: `/api/admin`*

| Phương thức | Endpoint | Mô tả | Yêu cầu (Body) |
|:--- |:--- |:--- |:--- |
| **PUT** | `/nhan-vien/edit` | Admin chỉnh sửa thông tin NV | `manv`, `hoten`, `maphg`, `luong`, `chucvu` |
| **DELETE** | `/nhan-vien/:manv` | Admin xóa NV | |
| **GET** | `/phong-ban` | Admin xem danh sách phòng ban | |
| **POST** | `/phong-ban/create` | Tạo phòng ban mới | `tenpb` |
| **PUT** | `/phong-ban/edit` | Sửa tên phòng ban | `maphg`, `tenpb` |
| **DELETE** | `/phong-ban/:maphg` | Xóa phòng ban (phải trống NV) | |

---

## 4. Quản lý Phòng ban (Departments)
*Cơ sở: `/api/departments`*

| Phương thức | Endpoint | Mô tả |
|:--- |:--- |:--- |
| **GET** | `/` | Lấy danh sách phòng ban |
| **GET** | `/:id` | Xem chi tiết phòng ban |
| **POST** | `/` | Thêm mới phòng ban |
| **PUT** | `/:id` | Cập nhật phòng ban |
| **DELETE** | `/:id` | Xóa phòng ban |

---

## 5. Quản lý Dự án (Projects)
*Cơ sở: `/api/projects`*

| Phương thức | Endpoint | Mô tả |
|:--- |:--- |:--- |
| **GET** | `/` | Lấy danh sách dự án |
| **GET** | `/:id` | Xem chi tiết dự án & thành viên |
| **POST** | `/` | Thêm dự án mới |
| **PUT** | `/:id` | Cập nhật thông tin dự án |
| **DELETE** | `/:id` | Xóa dự án |
| **GET** | `/employee/:id` | Xem dự án của 1 nhân viên |
| **POST** | `/:id/members` | Thêm nhân viên vào dự án |
| **DELETE** | `/:id/members/:employeeId` | Xóa nhân viên khỏi dự án |

---

## 6. Quản lý Lương (Payroll)
*Cơ sở: `/api/payroll`*

| Phương thức | Endpoint | Mô tả | Yêu cầu (Body/Params) |
|:--- |:--- |:--- |:--- |
| **GET** | `/:year/:month` | Lấy danh sách bảng lương tháng | |
| **GET** | `/employee/:id/:year/:month`| Lấy phiếu lương cá nhân | |
| **POST** | `/generate` | Tính lương tự động cho tháng | `{ "month": 3, "year": 2026 }` |
| **PUT** | `/:maBl` | Cập nhật thưởng/khấu trừ | |

---

## Định dạng Dữ liệu (Dự kiến)

### Đăng nhập thành công:
```json
{
  "success": true,
  "token": "...",
  "user": {
    "MANV": "NV001",
    "HOTEN": "Nguyen Van A",
    "EMAIL": "a@gmail.com",
    "ROLE": "Admin"
  }
}
```

### Lỗi trả về:
```json
{
  "success": false,
  "message": "Chi tiết lỗi ở đây"
}
```
