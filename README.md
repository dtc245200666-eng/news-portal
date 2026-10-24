# NewsPortal – Cổng Thông Tin Điện Tử Toàn Diện

Hệ thống Website Tin tức / Cổng thông tin điện tử chuyên nghiệp, hiện đại, chuẩn kiến trúc doanh nghiệp với đầy đủ Backend RESTful API, Cơ sở dữ liệu PostgreSQL (Prisma ORM), Frontend React SPA (Vite + TypeScript + Tailwind CSS), Phân quyền Role-based Access Control (RBAC), Hệ thống kiểm duyệt biên tập tin tức và Trang quản trị Admin hoàn chỉnh.

---

## 1. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ SỬ DỤNG

### Frontend
- **Framework**: React 18 + TypeScript + Vite.
- **Styling**: Tailwind CSS với bảng màu chuyên dụng báo chí điện tử (Đỏ đậm `#991b1b` / `#7f1d1d`, Trắng, Xám nhạt).
- **Icons**: Lucide React.
- **State & Data Fetching**: TanStack React Query v5.
- **Form & Validation**: React Hook Form + Zod.
- **Routing**: React Router v7.
- **Kiểm thử**: Vitest, React Testing Library, Playwright (E2E).

### Backend
- **Nền tảng**: Node.js + Express.js + TypeScript.
- **ORM & Database**: Prisma ORM + PostgreSQL 18.
- **Xác thực & Bảo mật**: JWT (Access Token + Refresh Token), Cookie HttpOnly, bcryptjs, Helmet, Express Rate Limit, DOM/HTML Sanitizer chống XSS.
- **Tài liệu API**: OpenAPI 3.0 / Swagger UI tích hợp sẵn tại `/api-docs`.
- **Feed & SEO**: RSS Feed 2.0 (`/rss.xml`), Dynamic XML Sitemap (`/sitemap.xml`), `robots.txt`.
- **Kiểm thử**: Vitest + Supertest (18 automated integration tests).

---

## 2. TÀI KHOẢN MẪU PHÁT TRIỂN (DEVELOPMENT SEED)

Hệ thống đã được nạp sẵn dữ liệu mẫu thực tế tiếng Việt với 5 vai trò khác nhau:

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | `admin@newsportal.vn` | `Admin@Password123!` | Toàn quyền quản trị hệ thống, quản lý người dùng, phân quyền, cấu hình site, xem nhật ký. |
| **ADMIN** | `editor_manager@newsportal.vn` | `EditorManager@123!` | Quản lý nội dung, duyệt bài, danh mục, thẻ tag, media. |
| **EDITOR** | `editor@newsportal.vn` | `Editor@Password123!` | Biên tập viên duyệt bài, xuất bản bài viết, kiểm duyệt bình luận. |
| **AUTHOR** | `author_nam@newsportal.vn` | `Author@Password123!` | Phóng viên tạo bản nháp và gửi bài viết chờ duyệt. |
| **AUTHOR** | `author_lan@newsportal.vn` | `Author@Password123!` | Phóng viên Văn hóa & Đời sống. |
| **USER** | `reader@newsportal.vn` | `Reader@Password123!` | Độc giả đọc tin, thích bài viết, lưu bài viết, gửi bình luận. |

> [!WARNING]
> Các tài khoản và mật khẩu trên chỉ phục vụ môi trường kiểm thử và phát triển cục bộ. Không sử dụng mật khẩu mặc định trên môi trường sản xuất (Production).

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
BAITAP THI T2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # 17 models/enums: User, Article, Category, Tag, Comment, Like, Bookmark, Media, etc.
│   │   └── seed.ts             # Script nạp dữ liệu mẫu tiếng Việt phong phú
│   ├── src/
│   │   ├── config/             # Cấu hình biến môi trường và Prisma client
│   │   ├── controllers/        # Điều khiển nghiệp vụ (Auth, Article, Category, Admin, Media, v.v.)
│   │   ├── middlewares/        # Xác thực JWT, RBAC phân quyền, kiểm tra upload an toàn, rate limit
│   │   ├── routes/             # Định tuyến REST API v1
│   │   ├── swagger/            # Tài liệu OpenAPI / Swagger JSON
│   │   ├── utils/              # Tiện ích slugify tiếng Việt, mã hóa, sanitize HTML, JWT
│   │   ├── validators/         # Kiểm tra schema dữ liệu đầu vào với Zod
│   │   ├── app.ts              # Khởi tạo Express app
│   │   └── server.ts           # Điểm khởi chạy HTTP server
│   ├── tests/                  # Bộ kiểm thử tích hợp Supertest + Vitest
│   ├── uploads/                # Thư mục lưu trữ media ảnh tải lên
│   ├── Dockerfile              # Multi-stage Dockerfile cho Backend
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Header, Navbar, Footer, ArticleCard, Pagination, CommentSection, etc.
│   │   ├── context/            # AuthContext quản lý phiên đăng nhập
│   │   ├── hooks/              # useAuth hook
│   │   ├── layouts/            # MainLayout, AdminLayout, AuthLayout
│   │   ├── pages/              # Trang chủ, Chi tiết bài viết, Chuyên mục, Tìm kiếm, Admin pages, etc.
│   │   ├── routes/             # AppRoutes và ProtectedRoute kiểm tra vai trò
│   │   ├── services/           # Axios API client cấu hình interceptor
│   │   └── types/              # Định nghĩa kiểu dữ liệu TypeScript
│   ├── e2e/                    # Kiểm thử đầu cuối Playwright (Chrome)
│   ├── Dockerfile              # Multi-stage Dockerfile cho Frontend (Nginx)
│   ├── nginx.conf              # Cấu hình Reverse Proxy Nginx cho SPA
│   ├── tailwind.config.js      # Cấu hình Tailwind CSS
│   ├── vite.config.ts          # Cấu hình Vite bundler
│   └── package.json
├── docker-compose.yml          # Triển khai toàn bộ hệ thống bằng Docker Compose
├── .env.example                # File mẫu biến môi trường
├── .env                        # File biến môi trường cục bộ
└── README.md                   # Hướng dẫn chi tiết
```

---

## 4. HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY

### Cách 1: Khởi chạy trực tiếp trên máy tính cá nhân

#### Bước 1: Khởi động cơ sở dữ liệu PostgreSQL
Đảm bảo dịch vụ PostgreSQL đang chạy trên cổng `5432` với database `newsportal` (hoặc thông qua WSL/PostgreSQL cục bộ).
Chuỗi kết nối trong file `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/newsportal?schema=public"
```

#### Bước 2: Chạy Migration và Nạp Dữ liệu mẫu (Seed)
Tại thư mục `backend/`:
```powershell
cd backend
npm install
npx prisma db push
npx tsx prisma/seed.ts
```

#### Bước 3: Khởi chạy Backend
```powershell
# Chế độ phát triển (Hot reload)
npm run dev

# Hoặc chế độ Production
npm run build
npm start
```
Server Backend sẽ chạy tại: **http://localhost:5000**
- Swagger API Docs: **http://localhost:5000/api-docs**
- RSS Feed: **http://localhost:5000/rss.xml**
- Sitemap: **http://localhost:5000/sitemap.xml**

#### Bước 4: Khởi chạy Frontend
Tại thư mục `frontend/`:
```powershell
cd frontend
npm install
npm run dev
```
Trang web sẽ sẵn sàng tại: **http://localhost:5173**

---

### Cách 2: Triển khai bằng Docker Compose (Khuyên dùng trên máy chủ)

Chỉ cần một lệnh duy nhất tại thư mục gốc:
```powershell
docker-compose up --build -d
```
Docker Compose sẽ tự động thiết lập:
1. Container `newsportal-postgres`: Cơ sở dữ liệu PostgreSQL 16 Alpine với volume lưu trữ độc lập.
2. Container `newsportal-backend`: REST API Node.js tự động kết nối và chờ database healthy.
3. Container `newsportal-frontend`: Nginx phục vụ giao diện tĩnh và reverse proxy các yêu cầu `/api/` về backend trên cổng `80`.

Truy cập: **http://localhost**

---

## 5. HƯỚNG DẪN CHẠY KIỂM THỬ (AUTOMATED TESTS)

Hệ thống được thiết kế với độ tin cậy cao và đi kèm 3 tầng kiểm thử:

### 1. Kiểm thử Backend API (Vitest + Supertest)
Kiểm tra luồng đăng ký, đăng nhập, bảo mật mật khẩu, phân quyền RBAC, CRUD bài viết, danh mục, bình luận, tương tác thích/lưu:
```powershell
cd backend
npm test
```
*Kết quả thực tế: 18/18 tests passed.*

### 2. Kiểm thử Giao diện Frontend (Vitest + React Testing Library)
Kiểm tra khả năng render của thẻ bài viết, định dạng ngày tháng, tính toán thời gian đọc:
```powershell
cd frontend
npm test
```
*Kết quả thực tế: 2/2 tests passed.*

### 3. Kiểm thử Đầu cuối End-to-End (Playwright)
Kiểm tra luồng người dùng truy cập trang chủ, chuyển chuyên mục, tìm kiếm và xác thực biểu mẫu đăng nhập:
```powershell
cd frontend
npx playwright test
```
*Kết quả thực tế: 4/4 tests passed.*

---

## 6. DANH SÁCH ENDPOINTS RESTFUL API CHÍNH

### Public Endpoints:
- `GET /api/v1/articles`: Danh sách bài viết đã xuất bản (hỗ trợ phân trang, lọc chuyên mục, thẻ tag, sắp xếp).
- `GET /api/v1/articles/:slug`: Chi tiết bài viết theo URL thân thiện.
- `GET /api/v1/articles/featured`: Danh sách tin tiêu điểm nổi bật.
- `GET /api/v1/articles/latest`: Danh sách tin mới cập nhật.
- `GET /api/v1/articles/most-viewed`: Danh sách tin được xem nhiều nhất.
- `GET /api/v1/articles/editor-picks`: Danh sách tin do ban biên tập tuyển chọn.
- `GET /api/v1/articles/:id/related`: Bài viết liên quan.
- `POST /api/v1/articles/:id/view`: Tăng số lượt xem bài viết có bảo vệ.
- `GET /api/v1/categories`: Cây danh mục phân cấp cha - con.
- `GET /api/v1/tags`: Danh sách thẻ từ khóa.
- `GET /api/v1/search?q=`: Tìm kiếm bài viết tiếng Việt có dấu và không dấu.
- `GET /api/v1/pages/:slug`: Nội dung các trang tĩnh (Giới thiệu, Chính sách, v.v.).
- `POST /api/v1/contact`: Độc giả gửi ý kiến liên hệ đến tòa soạn.

### Xác thực & Người dùng:
- `POST /api/v1/auth/register`: Đăng ký tài khoản độc giả mới.
- `POST /api/v1/auth/login`: Đăng nhập, cấp JWT và Cookie HttpOnly.
- `POST /api/v1/auth/logout`: Đăng xuất và hủy phiên làm việc an toàn.
- `GET /api/v1/auth/me`: Lấy thông tin tài khoản đang đăng nhập.
- `POST /api/v1/auth/forgot-password`: Yêu cầu mã khôi phục mật khẩu.
- `POST /api/v1/auth/reset-password`: Đặt lại mật khẩu với token một lần.
- `PATCH /api/v1/auth/change-password`: Đổi mật khẩu tài khoản.
- `GET /api/v1/users/me/bookmarks`: Danh sách bài viết người dùng đã lưu.
- `GET /api/v1/users/me/comments`: Lịch sử bình luận của người dùng.

### Tương tác Độc giả:
- `GET /api/v1/comments/articles/:articleId`: Danh sách bình luận và phản hồi lồng nhau.
- `POST /api/v1/comments/articles/:articleId`: Gửi bình luận mới hoặc phản hồi bình luận cũ.
- `DELETE /api/v1/comments/:id`: Xóa bình luận của chính mình hoặc theo quyền quản trị.
- `POST /api/v1/interactions/articles/:id/like`: Thích hoặc bỏ thích bài viết.
- `POST /api/v1/interactions/articles/:id/bookmark`: Lưu hoặc bỏ lưu bài viết.

### Khu vực Quản trị Admin (/admin):
- `GET /api/v1/admin/dashboard`: Thống kê tổng thể, lượt xem, bài viết mới và nhật ký hệ thống.
- `CRUD /api/v1/admin/articles`: Quản trị toàn diện bài viết (tạo mới, sửa, xuất bản, gỡ xuất bản, xóa).
- `CRUD /api/v1/admin/categories`: Thêm, sửa, xóa danh mục (kiểm tra bài viết trước khi xóa).
- `CRUD /api/v1/admin/tags`: Thêm, sửa, xóa thẻ tag từ khóa.
- `GET /api/v1/admin/users`: Danh sách người dùng, tìm kiếm và phân trang.
- `PATCH /api/v1/admin/users/:id/toggle-lock`: Khóa hoặc mở khóa tài khoản (ngăn tự khóa admin cuối cùng).
- `PATCH /api/v1/admin/users/:id/role`: Phân quyền vai trò người dùng (yêu cầu quyền SUPER_ADMIN).
- `GET /api/v1/admin/comments`: Quản lý kiểm duyệt bình luận (Duyệt, Từ chối, Đánh dấu Spam, Xóa).
- `POST /api/v1/media/upload`: Tải tệp ảnh lên hệ thống với kiểm duyệt MIME và kích thước.
- `GET /api/v1/media`: Thư viện tệp tin media.
- `GET & PATCH /api/v1/pages`: Quản lý nội dung các trang tĩnh.
- `GET & PATCH /api/v1/settings`: Quản lý cấu hình trang web.
- `GET /api/v1/admin/audit-logs`: Truy vết nhật ký các hành động của ban quản trị.
