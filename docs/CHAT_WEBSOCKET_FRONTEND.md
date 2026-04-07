# Huong dan Frontend tich hop Chat Realtime (Socket.IO)

## 1) Tong quan

Backend hien tai ho tro song song:

- REST API cho tao phong, lay lich su, quan ly thanh vien
- WebSocket (Socket.IO) cho nhan/gui tin nhan realtime

Khuyen nghi FE:

1. Mo man hinh chat: goi REST de lay lich su
2. Sau do connect socket de nhan tin nhan moi realtime

## 2) Cai dat FE

Cai thu vien:

```bash
npm install socket.io-client
```

## 3) Ket noi Socket

URL socket: `http://localhost:5000`

Gui token theo 1 trong 2 cach:

1. `auth.token` (khuyen nghi)
2. header `Authorization: Bearer <access_token>`

Vi du:

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  auth: {
    token: accessToken,
  },
});
```

## 4) Events ho tro

### 4.1 Join room

Client emit:

- Event: `chat:join_room`
- Payload:

```json
{ "maPhong": 12 }
```

- Ack response:

```json
{ "success": true, "maPhong": 12, "channel": "chat_room_12" }
```

hoac

```json
{ "success": false, "message": "..." }
```

### 4.2 Leave room

Client emit:

- Event: `chat:leave_room`
- Payload:

```json
{ "maPhong": 12 }
```

- Ack response:

```json
{ "success": true, "maPhong": 12 }
```

### 4.3 Send message realtime

Client emit:

- Event: `chat:send_message`
- Payload:

```json
{
  "maPhong": 12,
  "noiDung": "Xin chao team"
}
```

- Ack response (gui thanh cong):

```json
{
  "success": true,
  "data": {
    "MaTN": 101,
    "MaPhong": 12,
    "MaNV_Gui": "NV0001",
    "NoiDung": "Xin chao team",
    "ThoiGianGui": "2026-04-06T09:01:23.000Z",
    "maPhong": 12,
    "maNvGui": "NV0001"
  }
}
```

Server broadcast cho tat ca client trong room:

- Event: `chat:new_message`
- Payload giong `ack.data` o tren.

## 5) Chi tiet tạo các loại phòng chat

### 5.1) Phòng chat 1-1 (Direct)

- Endpoint: `POST /api/chat/direct-room`
- Body:

```json
{ "targetMaNv": "NV0002" }
```

- Response:

```json
{
  "success": true,
  "data": {
    "MaPhong": 5,
    "TenPhong": "Tiep Vu - Tuan Anh",  // Tên của 2 người dùng
    "LoaiPhong": 1,
    "MaThamChieu": "ROOM_1712394083000_ab2c3f4",  // Random ID
    "NgayTao": "2026-04-06T09:00:00.000Z",
    "thanhVien": [...]
  }
}
```

**Logic**: Tự động tạo với tên = "UserA - UserB", MaThamChieu = random ID.

### 5.2) Phòng chat tự tạo (Group)

- Endpoint: `POST /api/chat/groups`
- Body:

```json
{
  "tenPhong": "Team FrontEnd",
  "memberIds": ["NV0001", "NV0002", "NV0003"]
}
```

- Response:

```json
{
  "success": true,
  "message": "Tạo nhóm chat thành công",
  "data": {
    "MaPhong": 10,
    "TenPhong": "Team FrontEnd",
    "LoaiPhong": 4,  // GROUP
    "MaThamChieu": "ROOM_1712394090000_x7y8z9a",  // Random ID
    "NgayTao": "2026-04-06T09:05:00.000Z",
    "thanhVien": [...]
  }
}
```

**Logic**: Tên từ request body, MaThamChieu = random ID, creator là "Trưởng nhóm".

### 5.3) Phòng chat dự án

- Endpoint: `GET /api/chat/projects/:projectId/room`
- Response:

```json
{
  "success": true,
  "data": {
    "MaPhong": 15,
    "TenPhong": "Dự án: Quản trị nhân sự",  // Tên dự án
    "LoaiPhong": 3,  // PROJECT
    "MaThamChieu": "DA001",  // Mã dự án
    "NgayTao": "2026-04-06T08:00:00.000Z",
    "thanhVien": [...]
  }
}
```

**Logic**: Tự động tạo/lấy. Tên = tên dự án, MaThamChieu = mã dự án.

### 5.4) Phòng chat phòng ban

- Endpoint: `GET /api/chat/departments/:departmentId/room`
- Response:

```json
{
  "success": true,
  "data": {
    "MaPhong": 12,
    "TenPhong": "Phòng ban: Phòng IT",  // Tên phòng ban
    "LoaiPhong": 2,  // DEPARTMENT
    "MaThamChieu": "PB002",  // Mã phòng ban
    "NgayTao": "2026-04-06T07:30:00.000Z",
    "thanhVien": [...]
  }
}
```

**Logic**: Tự động tạo/lấy khi tạo phòng ban mới. Tên = tên phòng ban, MaThamChieu = mã phòng ban.

## 6) REST API cụ thể

### 6.1) Danh sách các endpoint

- GET `/api/chat/rooms` - Lấy danh sách phòng của user
- GET `/api/chat/rooms/:roomId/messages?limit=50` - Lấy lịch sử tin nhắn
- POST `/api/chat/rooms/:roomId/messages` - Gửi tin nhắn qua API (dùng websocket là ưu tiên)
- POST `/api/chat/direct-room` - Tạo/lấy phòng chat 1-1
- POST `/api/chat/groups` - Tạo nhóm chat tự tạo
- POST `/api/chat/groups/:roomId/members` - Thêm thành viên vào nhóm tự tạo
- DELETE `/api/chat/groups/:roomId/members/:memberId` - Xóa thành viên khỏi nhóm tự tạo
- GET `/api/chat/projects/:projectId/room` - Lấy/tạo phòng chat dự án
- GET `/api/chat/departments/:departmentId/room` - Lấy/tạo phòng chat phòng ban

### 6.2) Chi tiết các API

#### **GET /api/chat/rooms** - Danh sách phòng của user

- Phương thức: `GET`
- Header: `Authorization: Bearer <accessToken>`
- Response:

```json
{
  "success": true,
  "data": [
    {
      "MaPhong": 5,
      "TenPhong": "Tiep Vu - Tuan Anh",
      "LoaiPhong": 1,
      "MaThamChieu": "ROOM_1712394083000_ab2c3f4",
      "NgayTao": "2026-04-06T09:00:00.000Z",
      "SoThanhVien": 2,
      "TinNhanGanNhat": "2026-04-06T10:30:00.000Z"
    },
    {
      "MaPhong": 12,
      "TenPhong": "Phòng ban: Phòng IT",
      "LoaiPhong": 2,
      "MaThamChieu": "PB002",
      "NgayTao": "2026-04-06T07:30:00.000Z",
      "SoThanhVien": 5,
      "TinNhanGanNhat": "2026-04-06T11:15:00.000Z"
    }
  ]
}
```

#### **GET /api/chat/rooms/:roomId/messages** - Lịch sử tin nhắn

- Phương thức: `GET`
- URL params: `roomId` (mã phòng)
- Query params: `limit` (số lượng tin nhắn, mặc định 50, tối đa 200)
- Header: `Authorization: Bearer <accessToken>`
- Ví dụ: `GET /api/chat/rooms/5/messages?limit=20`
- Response:

```json
{
  "success": true,
  "data": {
    "room": {
      "MaPhong": 5,
      "TenPhong": "Tiep Vu - Tuan Anh",
      "LoaiPhong": 1,
      "MaThamChieu": "ROOM_1712394083000_ab2c3f4",
      "NgayTao": "2026-04-06T09:00:00.000Z"
    },
    "messages": [
      {
        "MaTN": 101,
        "MaPhong": 5,
        "MaNV_Gui": "NV0001",
        "TenNguoiGui": "Tiếp Vụ",
        "NoiDung": "Xin chào bạn",
        "ThoiGianGui": "2026-04-06T09:05:00.000Z"
      },
      {
        "MaTN": 102,
        "MaPhong": 5,
        "MaNV_Gui": "NV0002",
        "TenNguoiGui": "Tuấn Anh",
        "NoiDung": "Xin chào, cách mạng nào?",
        "ThoiGianGui": "2026-04-06T09:06:00.000Z"
      },
      {
        "MaTN": 103,
        "MaPhong": 5,
        "MaNV_Gui": "NV0001",
        "TenNguoiGui": "Tiếp Vụ",
        "NoiDung": "Khỏe, cảm ơn bạn",
        "ThoiGianGui": "2026-04-06T09:07:00.000Z"
      }
    ]
  }
}
```

#### **POST /api/chat/direct-room** - Tạo/lấy phòng chat 1-1

- Phương thức: `POST`
- Body:

```json
{ "targetMaNv": "NV0002" }
```

- Response:

```json
{
  "success": true,
  "data": {
    "MaPhong": 5,
    "TenPhong": "Tiep Vu - Tuan Anh",
    "LoaiPhong": 1,
    "MaThamChieu": "ROOM_1712394083000_ab2c3f4",
    "NgayTao": "2026-04-06T09:00:00.000Z",
    "thanhVien": [
      {
        "MaNV": "NV0001",
        "HOTEN": "Tiếp Vụ",
        "EMAIL": "tiepvu@company.com",
        "VaiTro": "Thành viên",
        "NgayThamGia": "2026-04-06T09:00:00.000Z"
      },
      {
        "MaNV": "NV0002",
        "HOTEN": "Tuấn Anh",
        "EMAIL": "tuananh@company.com",
        "VaiTro": "Thành viên",
        "NgayThamGia": "2026-04-06T09:00:00.000Z"
      }
    ]
  }
}
```

#### **POST /api/chat/groups** - Tạo nhóm chat tự tạo

- Phương thức: `POST`
- Body:

```json
{
  "tenPhong": "Team FrontEnd",
  "memberIds": ["NV0001", "NV0002", "NV0003"]
}
```

- Response:

```json
{
  "success": true,
  "message": "Tạo nhóm chat thành công",
  "data": {
    "MaPhong": 10,
    "TenPhong": "Team FrontEnd",
    "LoaiPhong": 4,
    "MaThamChieu": "ROOM_1712394090000_x7y8z9a",
    "NgayTao": "2026-04-06T09:05:00.000Z",
    "thanhVien": [...]
  }
}
```

#### **GET /api/chat/projects/:projectId/room** - Phòng chat dự án

- Phương thức: `GET`
- URL params: `projectId` (mã dự án)
- Response:

```json
{
  "success": true,
  "data": {
    "MaPhong": 15,
    "TenPhong": "Dự án: Quản trị nhân sự",
    "LoaiPhong": 3,
    "MaThamChieu": "1003",
    "NgayTao": "2026-04-06T08:00:00.000Z",
    "thanhVien": [...]
  }
}
```

#### **GET /api/chat/departments/:departmentId/room** - Phòng chat phòng ban

- Phương thức: `GET`
- URL params: `departmentId` (mã phòng ban)
- Response:

```json
{
  "success": true,
  "data": {
    "MaPhong": 12,
    "TenPhong": "Phòng ban: Phòng IT",
    "LoaiPhong": 2,
    "MaThamChieu": "PB002",
    "NgayTao": "2026-04-06T07:30:00.000Z",
    "thanhVien": [...]
  }
}
```

## 7) Flow để FE triển khai

### 7.1) Khởi tạo chat - chi tiết steps

1. **Login**: Lấy `accessToken`

   ```ts
   const { accessToken } = await login(username, password);
   sessionStorage.setItem("accessToken", accessToken);
   ```

2. **Connect socket**: Dùng token

   ```ts
   const socket = io("http://localhost:5000", {
     transports: ["websocket"],
     auth: {
       token: sessionStorage.getItem("accessToken"),
     },
   });
   ```

3. **Hiển thị danh sách phòng chat**:

   ```ts
   // GET danh sách phòng
   const { data: rooms } = await fetch("/api/chat/rooms", {
     headers: { Authorization: `Bearer ${accessToken}` },
   }).then((r) => r.json());

   // Render danh sách phòng
   rooms.forEach((room) => {
     console.log(`${room.TenPhong} (${room.SoThanhVien} thành viên)`);
   });
   ```

4. **Click vào 1 phòng để mở chat**:

   ```ts
   const roomId = 5; // MaPhong

   // GET lịch sử tin nhắn
   const { data } = await fetch(`/api/chat/rooms/${roomId}/messages?limit=50`, {
     headers: { Authorization: `Bearer ${accessToken}` },
   }).then((r) => r.json());

   const { room, messages } = data;

   // Hiển thị phòng & tin nhắn trước đó
   renderRoomHeader(room);
   renderMessageHistory(messages);

   // Join room realtime
   socket.emit("chat:join_room", { maPhong: roomId }, (ack) => {
     if (ack.success) {
       console.log("Đã join phòng realtime");
     }
   });
   ```

5. **Gửi tin nhắn qua WebSocket (ưu tiên)**:

   ```ts
   socket.emit(
     "chat:send_message",
     {
       maPhong: 5,
       noiDung: "Xin chào mọi người",
     },
     (ack) => {
       if (ack.success) {
         console.log("Tin nhắn đã gửi");
       }
     },
   );
   ```

6. **Nhận tin nhắn mới từ WebSocket**:

   ```ts
   socket.on("chat:new_message", (message) => {
     const { MaTN, MaPhong, MaNV_Gui, NoiDung, ThoiGianGui } = message;
     addMessageToUI({
       id: MaTN,
       sender: MaNV_Gui,
       text: NoiDung,
       time: ThoiGianGui,
     });
   });
   ```

7. **Rời phòng chat** (khi user chuyển sang phòng khác hoặc đóng mà hình):
   ```ts
   socket.emit("chat:leave_room", { maPhong: roomId });
   ```

### 7.2) Tạo phòng chat mới

#### Tạo chat 1-1 với user khác:

```ts
const response = await fetch("/api/chat/direct-room", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ targetMaNv: "NV0002" }),
});

const { data: room } = await response.json();
// Bây giờ có room.MaPhong để join
```

#### Tạo nhóm chat tự tạo:

```ts
const response = await fetch("/api/chat/groups", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    tenPhong: "Team FrontEnd",
    memberIds: ["NV0001", "NV0003", "NV0005"],
  }),
});

const { data: room } = await response.json();
// room.MaPhong để join vào phòng mới tạo
```

### 7.3) Quản lý thành viên nhóm tự tạo

- **Thêm thành viên**: `POST /api/chat/groups/:roomId/members`

  ```json
  { "memberMaNv": "NV0004" }
  ```

  (Chỉ Trưởng nhóm được thêm)

- **Xóa thành viên**: `DELETE /api/chat/groups/:roomId/members/:memberId`
  (Chỉ Trưởng nhóm được xóa)

## 8) Lưu ý quan trọng

### 8.1) Logic tạo phòng chat

3 loại phòng chat, mỗi loại có quy tắc tên và mã phòng khác nhau:

| Loại                    | Tên Phòng                    | MaThamChieu  | Khi nào tạo                   |
| ----------------------- | ---------------------------- | ------------ | ----------------------------- |
| **1-1 (Direct)**        | "User A - User B" (tên user) | Random ID    | Khi user bắt đầu chat 1-1     |
| **Nhóm tự tạo (Group)** | Nhập từ request              | Random ID    | POST `/api/chat/groups`       |
| **Dự án**               | "Dự án: Tên Dự Án"           | Mã dự án     | Tự động khi tạo dự án mới     |
| **Phòng ban**           | "Phòng ban: Tên Phòng Ban"   | Mã phòng ban | Tự động khi tạo phòng ban mới |

**Ví dụ thực tế:**

- **1-1**: TenPhong = "Tiếp Vụ - Tuấn Anh", MaThamChieu = "ROOM_1712394083000_ab2c3f4"
- **Group**: TenPhong = "Team FrontEnd", MaThamChieu = "ROOM_1712394090000_x7y8z9a"
- **Dự án**: TenPhong = "Dự án: Quản trị nhân sự", MaThamChieu = "1003"
- **Phòng ban**: TenPhong = "Phòng ban: Phòng IT", MaThamChieu = "2"

### 8.2) Quản lý membership và tự động sync

**Phòng chat dự án / phòng ban:**

- ✅ Tự động tạo phòng chat khi tạo dự án / phòng ban mới
- ✅ Tự động thêm nhân viên vào phòng chat khi thêm vào dự án / phòng ban
- ✅ Tự động xóa nhân viên khỏi phòng chat khi xóa khỏi dự án / phòng ban
- ✅ Tên phòng chat luôn = tên dự án / tên phòng ban (track tự động)

**Phòng chat nhóm tự tạo (Group):**

- Chỉ Trưởng nhóm được thêm/xóa thành viên (POST/DELETE `/api/chat/groups/:roomId/members`)

**Phòng chat 1-1 (Direct):**

- 2 người luôn cố định khi phòng được tạo

### 8.3) Lỗi thường gặp

- Nếu `chat:join_room` bị từ chối (error "Bạn không phải thành viên"): Kiểm tra user đã được thêm vào phòng hay chưa.
- Nếu socket disconnect: Socket.IO sẽ auto-reconnect nếu FE cấu hình đúng.
- Luôn có fallback REST API khi realtime gặp sự cố.

### 8.4) Đặc tính mã phòng

- **MaPhong**: ID duy nhất của phòng (auto-increment), dùng trong tất cả socket events.
- **MaThamChieu**: Tham chiếu để identify room type:
  - Dự án/Phòng ban: = mã dự án / mã phòng ban (string)
  - 1-1 / Nhóm: = random ID (dùng để phân biệt đơn, không có ý nghĩa business)
