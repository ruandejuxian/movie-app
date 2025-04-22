# Hướng dẫn sử dụng Website Xem Phim

Chào mừng bạn đến với Website Xem Phim! Tài liệu này sẽ hướng dẫn bạn cách sử dụng và quản lý website.

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Chức năng người dùng](#chức-năng-người-dùng)
3. [Chức năng Moderator](#chức-năng-moderator)
4. [Chức năng Admin](#chức-năng-admin)
5. [Cấu hình hệ thống](#cấu-hình-hệ-thống)

## Tổng quan

Website Xem Phim là nền tảng xem phim trực tuyến với các tính năng:
- Xem phim trực tuyến từ nhiều nguồn
- Hệ thống đánh giá và bình luận
- Danh sách phim yêu thích và lịch sử xem
- Chế độ tối/sáng
- Hệ thống thông báo
- Quản lý người dùng bằng mã mời

## Chức năng người dùng

### Đăng ký và đăng nhập
- Đăng ký tài khoản bằng email/mật khẩu (yêu cầu mã mời)
- Đăng nhập bằng tài khoản đã đăng ký
- Đăng nhập bằng Google

### Xem phim
- Duyệt danh sách phim trên trang chủ
- Lọc phim theo thể loại, năm phát hành
- Tìm kiếm phim theo tên
- Xem chi tiết phim và phát video

### Tương tác với phim
- Đánh giá phim (1-5 sao)
- Bình luận về phim
- Thích và trả lời bình luận
- Thêm phim vào danh sách yêu thích

### Quản lý tài khoản
- Xem và chỉnh sửa thông tin cá nhân
- Đổi mật khẩu
- Xem danh sách phim yêu thích
- Xem lịch sử xem phim
- Xem và quản lý thông báo

### Giao diện
- Chuyển đổi giữa chế độ sáng và tối
- Giao diện responsive trên mọi thiết bị

## Chức năng Moderator

Moderator có tất cả quyền của người dùng thông thường, cộng thêm:

### Quản lý phim
- Thêm phim mới vào hệ thống
- Chỉnh sửa thông tin phim
- Nhập phim từ API bên ngoài
- Nhập phim từ Google Drive

### Quản lý bình luận
- Xem tất cả bình luận
- Xóa bình luận không phù hợp

### Quản lý người dùng
- Xem danh sách người dùng
- Chặn/bỏ chặn người dùng vi phạm
- Tạo mã mời cho người dùng mới

### Bảng điều khiển Moderator
- Xem thống kê tổng quan
- Quản lý nội dung từ một giao diện tập trung

## Chức năng Admin

Admin có tất cả quyền của Moderator, cộng thêm:

### Quản lý hệ thống
- Xem thống kê chi tiết hệ thống
- Xóa phim khỏi hệ thống
- Xóa người dùng khỏi hệ thống

### Quản lý quyền
- Thay đổi vai trò người dùng (User/Mod/Admin)
- Quản lý tất cả mã mời trong hệ thống

### Cấu hình API
- Cấu hình kết nối với API phim bên ngoài
- Cấu hình kết nối với Google Drive API

## Cấu hình hệ thống

### Biến môi trường
Các biến môi trường cần thiết được mô tả trong file [DEPLOYMENT.md](./DEPLOYMENT.md).

### Cấu trúc dự án
```
movie-website/
├── frontend/           # Mã nguồn React frontend
│   ├── public/         # Tài nguyên tĩnh
│   ├── src/            # Mã nguồn
│   │   ├── components/ # Các component React
│   │   ├── pages/      # Các trang
│   │   ├── context/    # Context API
│   │   ├── hooks/      # Custom hooks
│   │   ├── utils/      # Tiện ích
│   │   └── assets/     # Hình ảnh, CSS
│   └── tests/          # Unit tests
│
├── backend/            # Mã nguồn Node.js backend
│   ├── src/            # Mã nguồn
│   │   ├── config/     # Cấu hình
│   │   ├── controllers/# Controllers
│   │   ├── middleware/ # Middleware
│   │   ├── models/     # Mongoose models
│   │   ├── routes/     # API routes
│   │   └── utils/      # Tiện ích
│   └── tests/          # Unit tests
│
├── DEPLOYMENT.md       # Hướng dẫn triển khai
└── README.md           # Thông tin dự án
```

### Bảo mật
- Tất cả mật khẩu được mã hóa bằng bcrypt
- Xác thực sử dụng JWT
- Phân quyền rõ ràng giữa User, Mod và Admin
- Hệ thống mã mời để kiểm soát đăng ký

### Tùy chỉnh
Bạn có thể tùy chỉnh giao diện và chức năng bằng cách chỉnh sửa mã nguồn. Các file chính cần lưu ý:
- `frontend/src/context/ThemeContext.js`: Tùy chỉnh màu sắc chế độ sáng/tối
- `backend/src/config/config.js`: Cấu hình hệ thống
- `frontend/public/styles.css`: CSS toàn cục

### Khắc phục sự cố
Xem phần "Khắc phục sự cố" trong file [DEPLOYMENT.md](./DEPLOYMENT.md) để biết cách giải quyết các vấn đề thường gặp.
