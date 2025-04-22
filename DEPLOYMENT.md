# Hướng dẫn triển khai Website Xem Phim

Tài liệu này hướng dẫn chi tiết cách triển khai website xem phim lên các nền tảng Render và Glitch.

## Mục lục
1. [Chuẩn bị](#chuẩn-bị)
2. [Triển khai lên Render](#triển-khai-lên-render)
3. [Triển khai lên Glitch](#triển-khai-lên-glitch)
4. [Cấu hình môi trường](#cấu-hình-môi-trường)
5. [Khắc phục sự cố](#khắc-phục-sự-cố)

## Chuẩn bị

Trước khi triển khai, hãy đảm bảo bạn đã có:

1. Tài khoản MongoDB Atlas (cơ sở dữ liệu)
2. Tài khoản Render hoặc Glitch
3. File dự án đã được giải nén
4. (Tùy chọn) Tài khoản Google Cloud Platform nếu bạn muốn sử dụng tính năng Google Drive

### Chuẩn bị MongoDB Atlas

1. Đăng ký tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo một cluster mới (có thể sử dụng tier miễn phí)
3. Tạo database user với quyền đọc và ghi
4. Thêm địa chỉ IP `0.0.0.0/0` vào whitelist (hoặc IP cụ thể của máy chủ nếu biết)
5. Lấy connection string từ Atlas, sẽ có dạng:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

## Triển khai lên Render

### Bước 1: Đăng ký tài khoản Render

1. Truy cập [Render](https://render.com/) và đăng ký tài khoản mới
2. Xác nhận email và đăng nhập vào tài khoản

### Bước 2: Triển khai Backend

1. Từ Dashboard, chọn "New" > "Web Service"
2. Chọn "Build and deploy from a Git repository" hoặc tải lên mã nguồn trực tiếp
3. Nếu sử dụng Git, kết nối với repository của bạn
4. Cấu hình dịch vụ:
   - **Name**: movie-website-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node src/server.js`
   - **Root Directory**: (để trống nếu repository chỉ chứa backend, hoặc chỉ định thư mục chứa backend)

5. Trong phần "Environment Variables", thêm các biến môi trường sau:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=<MongoDB connection string của bạn>
   JWT_SECRET=<một chuỗi bí mật ngẫu nhiên>
   CLIENT_URL=<URL của frontend sau khi triển khai>
   GOOGLE_CLIENT_ID=<Google Client ID nếu sử dụng>
   GOOGLE_CLIENT_SECRET=<Google Client Secret nếu sử dụng>
   ```

6. Chọn plan phù hợp (có thể sử dụng Free plan cho mục đích thử nghiệm)
7. Nhấn "Create Web Service"

### Bước 3: Triển khai Frontend

1. Từ Dashboard, chọn "New" > "Static Site"
2. Chọn "Build and deploy from a Git repository" hoặc tải lên mã nguồn trực tiếp
3. Cấu hình dịch vụ:
   - **Name**: movie-website-frontend
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Root Directory**: (để trống nếu repository chỉ chứa frontend, hoặc chỉ định thư mục chứa frontend)

4. Trong phần "Environment Variables", thêm:
   ```
   REACT_APP_API_URL=<URL của backend đã triển khai>
   ```

5. Nhấn "Create Static Site"

### Bước 4: Cấu hình CORS và Kết nối

1. Sau khi cả frontend và backend đã được triển khai, cập nhật biến môi trường `CLIENT_URL` trong backend để trỏ đến URL của frontend
2. Cập nhật biến môi trường `REACT_APP_API_URL` trong frontend để trỏ đến URL của backend
3. Khởi động lại cả hai dịch vụ để áp dụng thay đổi

## Triển khai lên Glitch

### Bước 1: Đăng ký tài khoản Glitch

1. Truy cập [Glitch](https://glitch.com/) và đăng ký tài khoản mới
2. Xác nhận email và đăng nhập vào tài khoản

### Bước 2: Tạo dự án mới

1. Từ Dashboard, chọn "New Project" > "Import from GitHub"
2. Nhập URL của GitHub repository hoặc chọn "Upload your code" để tải lên mã nguồn

### Bước 3: Cấu hình dự án

1. Sau khi dự án được tạo, mở file `.env` hoặc tạo mới nếu chưa có
2. Thêm các biến môi trường sau:
   ```
   NODE_ENV=production
   PORT=3000
   MONGO_URI=<MongoDB connection string của bạn>
   JWT_SECRET=<một chuỗi bí mật ngẫu nhiên>
   CLIENT_URL=<URL của dự án Glitch>
   GOOGLE_CLIENT_ID=<Google Client ID nếu sử dụng>
   GOOGLE_CLIENT_SECRET=<Google Client Secret nếu sử dụng>
   ```

3. Mở file `package.json` và đảm bảo script start trỏ đến file server chính:
   ```json
   "scripts": {
     "start": "node backend/src/server.js"
   }
   ```

4. Nếu cần, cập nhật file `backend/src/server.js` để phục vụ cả frontend và backend từ cùng một dự án:
   ```javascript
   // Thêm vào cuối file server.js
   app.use(express.static(path.join(__dirname, '../../frontend/build')));
   app.get('*', (req, res) => {
     res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
   });
   ```

### Bước 4: Xây dựng frontend

1. Mở Terminal trong Glitch (Tools > Terminal)
2. Chạy các lệnh sau:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   refresh
   ```

3. Sau khi quá trình xây dựng hoàn tất, dự án sẽ tự động khởi động lại

## Cấu hình môi trường

### Biến môi trường cần thiết

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| NODE_ENV | Môi trường chạy | production |
| PORT | Cổng máy chủ | 5000 |
| MONGO_URI | Chuỗi kết nối MongoDB | mongodb+srv://... |
| JWT_SECRET | Khóa bí mật cho JWT | mysecretkey123 |
| CLIENT_URL | URL của frontend | https://movie-website-frontend.onrender.com |
| GOOGLE_CLIENT_ID | ID Client Google OAuth | 123456789-abcdef.apps.googleusercontent.com |
| GOOGLE_CLIENT_SECRET | Secret Client Google OAuth | GOCSPX-abcdefg123456 |
| API_MOVIE_URL | URL của API phim bên ngoài | https://api.example.com/movies |

### Cấu hình Google OAuth (tùy chọn)

Nếu bạn muốn sử dụng tính năng đăng nhập bằng Google:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo một dự án mới
3. Vào "APIs & Services" > "Credentials"
4. Tạo "OAuth client ID" mới
5. Cấu hình Authorized redirect URIs:
   - `https://<your-backend-url>/api/auth/google/callback`
6. Lưu Client ID và Client Secret vào biến môi trường

### Cấu hình Google Drive API (tùy chọn)

Nếu bạn muốn sử dụng tính năng tích hợp Google Drive:

1. Trong Google Cloud Console, vào "APIs & Services" > "Library"
2. Tìm và kích hoạt "Google Drive API"
3. Tạo API Key mới từ "Credentials"
4. Lưu API Key vào biến môi trường `GOOGLE_API_KEY`

## Khắc phục sự cố

### Vấn đề kết nối cơ sở dữ liệu

- Kiểm tra lại connection string MongoDB
- Đảm bảo IP của máy chủ đã được thêm vào whitelist
- Kiểm tra tài khoản và mật khẩu database

### Vấn đề CORS

- Đảm bảo `CLIENT_URL` đã được cấu hình chính xác
- Kiểm tra cấu hình CORS trong file `server.js`

### Vấn đề xác thực

- Kiểm tra `JWT_SECRET` đã được cấu hình
- Đảm bảo các endpoint xác thực hoạt động đúng

### Vấn đề tích hợp Google

- Kiểm tra các thông tin xác thực Google đã chính xác
- Đảm bảo redirect URI đã được cấu hình đúng

### Liên hệ hỗ trợ

Nếu bạn gặp vấn đề không thể giải quyết, vui lòng liên hệ qua email hoặc tạo issue trên GitHub repository.
