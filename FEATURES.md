# 🚗 DỰ ÁN WEBSITE BÁN XE Ô TÔ - TÀI LIỆU CHỨC NĂNG

## 📋 Tổng Quan Dự Án

Đây là một dự án website bán xe ô tô toàn diện với kiến trúc **Client-Server**, sử dụng **React** cho frontend và **Node.js/Express** cho backend. Hệ thống cung cấp đầy đủ các tính năng từ quản lý sản phẩm, đặt cọc xe, đăng ký lái thử, đến hệ thống chat real-time và blog marketing.

### Kiến Trúc Hệ Thống

**Frontend (Client)**

- Framework: React 18 + Vite
- UI Components: Component-based architecture
- State Management: Redux
- Routing: React Router
- Styling: CSS modules + Tailwind CSS
- API Integration: Axios

**Backend (Server)**

- Runtime: Node.js
- Framework: Express.js
- Database: JSON-based storage
- Authentication: JWT + Cookie-based
- Real-time: Socket.IO
- Email Service: Nodemailer + Google OAuth2

**Database**

- File JSON để lưu trữ: users, cars, brands, categories, blogs, contacts, deposits, testdrives, chatsessions, conversations

---

## 🎯 CHỨC NĂNG CHÍNH

### 1. 👤 HỆ THỐNG QUẢN LÝ NGƯỜI DÙNG

#### 1.1. Xác Thực & Phân Quyền

- **Đăng nhập thông thường**: Email/password với JWT authentication
- **Đăng nhập Google OAuth2**: Tích hợp đăng nhập nhanh với Google
- **Đăng ký tài khoản**: Tạo tài khoản mới với xác thực email
- **Làm mới token**: Tự động refresh JWT token
- **Đăng xuất**: Clear session và token

**API Endpoints:**

```
POST   /api/users/login          - Đăng nhập
POST   /api/users/login-google   - Đăng nhập Google
POST   /api/users/register        - Đăng ký
POST   /api/users/refresh-token   - Làm mới token
POST   /api/users/logout          - Đăng xuất
GET    /api/users/auth            - Xác thực user
```

#### 1.2. Quản Lý Profile

- **Cập nhật thông tin cá nhân**: Tên, email, số điện thoại, địa chỉ
- **Upload avatar**: Tải ảnh đại diện
- **Quên mật khẩu**: Gửi OTP qua email để reset password
- **Đổi mật khẩu**: Cập nhật mật khẩu mới

**API Endpoints:**

```
GET    /api/users/profile         - Xem profile
PUT    /api/users/profile         - Cập nhật profile
POST   /api/users/upload-avatar   - Upload avatar
POST   /api/users/forgot-password - Quên mật khẩu
PUT    /api/users/change-password - Đổi mật khẩu
```

#### 1.3. Admin - Quản Lý Users

- **Xem danh sách người dùng**: Pagination, filter, search
- **Cập nhật thông tin user**: Edit user bởi admin
- **Phân quyền**: Gán/revoke admin role
- **Xóa user**: Soft delete hoặc hard delete
- **Xem thống kê user**: Số lượng user mới, active users

**API Endpoints:**

```
GET    /api/users                 - Danh sách users (admin)
PUT    /api/users/:id             - Cập nhật user (admin)
DELETE /api/users/:id             - Xóa user (admin)
GET    /api/users/stats           - Thống kê users
```

---

### 2. 🚗 HỆ THỐNG QUẢN LÝ XE Ô TÔ

#### 2.1. Tìm Kiếm & Xem Xe

- **Danh sách xe**: Hiển thị tất cả xe có sẵn
- **Tìm kiếm nâng cao**: Filter theo brand, category, giá, năm sản xuất, màu sắc, loại nhiên liệu
- **Xem chi tiết xe**: Thông tin đầy đủ, gallery ảnh, thông số kỹ thuật
- **Xe nổi bật**: Hiển thị xe được đề xuất trên trang chủ
- **So sánh xe**: So sánh 2-3 xe cùng lúc
- **Lọc và sắp xếp**: Theo giá, năm, mới nhất, phổ biến nhất

**API Endpoints:**

```
GET    /api/car                   - Danh sách xe (có filter)
GET    /api/car/:id               - Chi tiết xe theo ID
GET    /api/car/slug/:slug        - Chi tiết xe theo slug
GET    /api/car/featured          - Xe nổi bật
GET    /api/car/compare           - So sánh xe
```

**Filters hỗ trợ:**

- `brand`: Thương hiệu xe
- `category`: Danh mục (SUV, Sedan, Hatchback...)
- `minPrice` / `maxPrice`: Khoảng giá
- `year`: Năm sản xuất
- `color`: Màu sắc
- `fuelType`: Loại nhiên liệu (petrol, diesel, electric, hybrid)
- `transmission`: Hộp số (automatic, manual)
- `status`: Trạng thái (available, sold, reserved)

#### 2.2. Admin - Quản Lý Xe

- **Thêm xe mới**: Form đầy đủ thông tin, upload nhiều ảnh
- **Cập nhật thông tin xe**: Edit mọi thông tin của xe
- **Xóa xe**: Xóa xe khỏi hệ thống
- **Quản lý ảnh**: Upload, delete ảnh xe
- **Quản lý trạng thái**: Available, sold, reserved, maintenance
- **Import/Export**: Import dữ liệu xe từ CSV/Excel

**API Endpoints:**

```
POST   /api/car                   - Tạo xe mới (admin)
PUT    /api/car/:id               - Cập nhật xe (admin)
DELETE /api/car/:id               - Xóa xe (admin)
POST   /api/car/:id/images        - Upload ảnh xe
DELETE /api/car/:id/images/:imageId - Xóa ảnh xe
PUT    /api/car/:id/status        - Cập nhật trạng thái
```

**Thông tin xe bao gồm:**

- Thông tin cơ bản: Tên, slug, mô tả, giá
- Thông số kỹ thuật: Engine, horsepower, transmission, fuel type
- Đặc điểm: Seats, doors, color, year
- Gallery: Nhiều ảnh chất lượng cao
- SEO: Meta title, description, keywords

---

### 3. 🏷️ QUẢN LÝ THƯƠNG HIỆU & DANH MỤC

#### 3.1. Quản Lý Thương Hiệu (Brands)

- **Xem danh sách thương hiệu**: Honda, Toyota, Mercedes, BMW...
- **Thêm thương hiệu mới**: Tên, logo, mô tả
- **Cập nhật thương hiệu**: Edit thông tin và logo
- **Xóa thương hiệu**: Xóa brand (check xe liên quan)
- **Thống kê**: Số xe theo từng brand

**API Endpoints:**

```
GET    /api/brand                 - Danh sách brands
POST   /api/brand                 - Tạo brand (admin)
PUT    /api/brand/:id             - Cập nhật brand (admin)
DELETE /api/brand/:id             - Xóa brand (admin)
```

#### 3.2. Quản Lý Danh Mục (Categories)

- **Xem danh sách danh mục**: SUV, Sedan, Hatchback, Crossover...
- **Thêm danh mục mới**: Tên, slug, mô tả, icon
- **Cập nhật danh mục**: Edit thông tin
- **Xóa danh mục**: Xóa category (check xe liên quan)
- **Hierarchy**: Hỗ trợ category cha-con

**API Endpoints:**

```
GET    /api/category              - Danh sách categories
POST   /api/category              - Tạo category (admin)
PUT    /api/category/:id          - Cập nhật category (admin)
DELETE /api/category/:id          - Xóa category (admin)
```

---

### 4. 💰 HỆ THỐNG ĐẶT CỌC XE

#### 4.1. Đặt Cọc Cho Khách Hàng

- **Tạo đơn đặt cọc**: Chọn xe, nhập thông tin, thanh toán tiền cọc
- **Xem đơn đặt cọc của tôi**: Danh sách các đơn đã đặt
- **Chi tiết đơn đặt cọc**: Thông tin đầy đủ, trạng thái, lịch sử
- **Hủy đơn đặt cọc**: Hủy nếu chưa xác nhận
- **Theo dõi trạng thái**: Pending → Confirmed → Completed / Cancelled

**API Endpoints:**

```
POST   /api/deposit               - Tạo đơn đặt cọc
GET    /api/deposit/my-deposits   - Đơn cọc của tôi
GET    /api/deposit/:id           - Chi tiết đơn cọc
PUT    /api/deposit/:id/cancel    - Hủy đơn cọc
```

**Thông tin đặt cọc:**

- Xe được chọn
- Thông tin khách hàng: Họ tên, email, SĐT, địa chỉ
- Số tiền đặt cọc: Thường 10-30% giá xe
- Phương thức thanh toán: Bank transfer, credit card, cash
- Ghi chú: Yêu cầu đặc biệt

#### 4.2. Admin - Quản Lý Đặt Cọc

- **Xem tất cả đơn đặt cọc**: Filter, search, pagination
- **Xác nhận đơn**: Approve deposit
- **Từ chối đơn**: Reject với lý do
- **Cập nhật trạng thái**: Theo từng bước xử lý
- **Gửi email thông báo**: Auto email khi trạng thái thay đổi
- **Báo cáo thống kê**: Doanh thu từ đặt cọc, tỷ lệ chuyển đổi

**API Endpoints:**

```
GET    /api/deposit               - Danh sách đơn cọc (admin)
PUT    /api/deposit/:id/status    - Cập nhật trạng thái
GET    /api/deposit/stats         - Thống kê đặt cọc
```

**Trạng thái đặt cọc:**

- `pending`: Chờ xác nhận
- `confirmed`: Đã xác nhận
- `processing`: Đang xử lý
- `completed`: Hoàn tất
- `cancelled`: Đã hủy
- `refunded`: Đã hoàn tiền

---

### 5. 🚙 ĐĂNG KÝ LÁI THỬ XE

#### 5.1. Khách Hàng Đăng Ký

- **Form đăng ký lái thử**: Chọn xe, chọn thời gian, điền thông tin
- **Chọn lịch**: Calendar picker với available slots
- **Xác nhận thông tin**: Họ tên, SĐT, CMND/CCCD, bằng lái
- **Gửi yêu cầu**: Submit form đăng ký

**API Endpoints:**

```
POST   /api/test-drive            - Đăng ký lái thử
GET    /api/test-drive/my-bookings - Lịch hẹn của tôi
GET    /api/test-drive/:id        - Chi tiết lịch hẹn
PUT    /api/test-drive/:id/cancel - Hủy lịch hẹn
```

#### 5.2. Admin - Quản Lý Lái Thử

- **Xem danh sách đăng ký**: Tất cả yêu cầu lái thử
- **Duyệt đăng ký**: Approve booking
- **Từ chối đăng ký**: Reject với lý do
- **Quản lý lịch**: Calendar view, time slots
- **Gửi email xác nhận**: Email auto với thông tin lái thử
- **Theo dõi**: Check-in, feedback sau lái thử

**API Endpoints:**

```
GET    /api/test-drive            - Danh sách đăng ký (admin)
PUT    /api/test-drive/:id/approve - Duyệt đăng ký
PUT    /api/test-drive/:id/reject  - Từ chối
GET    /api/test-drive/calendar   - Xem lịch
```

**Email tự động:**

- Email xác nhận đăng ký
- Email khi được duyệt
- Email nhắc nhở trước 1 ngày
- Email cảm ơn sau khi lái thử

---

### 6. 📰 HỆ THỐNG BLOG & TIN TỨC

#### 6.1. Blog Công Khai

- **Danh sách bài viết**: Grid/list view, pagination
- **Xem chi tiết bài viết**: Full content, ảnh, related posts
- **Tìm kiếm bài viết**: Search by title, content, tags
- **Lọc theo danh mục**: Tips, news, reviews, guides
- **Bài viết liên quan**: Recommendations
- **Share social**: Facebook, Twitter, LinkedIn

**API Endpoints:**

```
GET    /api/blog                  - Danh sách blog
GET    /api/blog/:id              - Chi tiết blog
GET    /api/blog/slug/:slug       - Blog theo slug
GET    /api/blog/category/:id     - Blog theo category
GET    /api/blog/search           - Tìm kiếm blog
```

#### 6.2. Admin - Quản Lý Blog

- **Rich text editor**: WYSIWYG editor cho nội dung
- **Upload ảnh**: Featured image và inline images
- **SEO optimization**: Meta tags, slug, keywords
- **Lên lịch đăng**: Schedule publish date
- **Draft/Publish**: Lưu nháp hoặc publish ngay
- **Categories & Tags**: Phân loại bài viết
- **Analytics**: Views, likes, shares

**API Endpoints:**

```
POST   /api/blog                  - Tạo blog (admin)
PUT    /api/blog/:id              - Cập nhật blog (admin)
DELETE /api/blog/:id              - Xóa blog (admin)
POST   /api/blog/upload-image     - Upload ảnh
GET    /api/blog/:id/stats        - Thống kê blog
```

**Thông tin blog:**

- Title, slug, excerpt, content
- Featured image, gallery
- Author, publish date
- Categories, tags
- SEO: Meta title, description, keywords
- Status: Draft, published, scheduled

---

### 7. 💬 HỆ THỐNG CHAT REAL-TIME

#### 7.1. Chat với Khách Hàng

- **Live chat**: Real-time messaging với Socket.IO
- **Chat history**: Lưu lịch sử chat
- **Online/Offline status**: Hiển thị trạng thái admin
- **Typing indicator**: Hiển thị khi đang gõ
- **File sharing**: Gửi ảnh, file đính kèm
- **Quick replies**: Template trả lời nhanh

**Socket Events:**

```javascript
// Client emit
socket.emit('join_chat', { userId, userName });
socket.emit('send_message', { message, userId, timestamp });
socket.emit('typing', { userId });

// Server emit
socket.emit('receive_message', { message, from, timestamp });
socket.emit('user_typing', { userId });
socket.emit('admin_joined', { adminName });
```

#### 7.2. Admin - Quản Lý Chat

- **Dashboard chat**: Danh sách conversations
- **Multiple chats**: Quản lý nhiều chat cùng lúc
- **Auto-assign**: Tự động assign chat cho admin
- **Canned responses**: Câu trả lời có sẵn
- **Chat transfer**: Chuyển chat cho admin khác
- **Close chat**: Đóng conversation
- **Chat analytics**: Response time, satisfaction

**API Endpoints:**

```
GET    /api/chat/conversations    - Danh sách conversations
GET    /api/chat/:id              - Chi tiết conversation
POST   /api/chat/:id/message      - Gửi tin nhắn
PUT    /api/chat/:id/close        - Đóng chat
GET    /api/chat/stats            - Thống kê chat
```

---

### 8. 🤖 CHATBOT AI

#### 8.1. Chatbot Tự Động

- **Tạo chat session**: Bắt đầu chat với bot
- **Xem lịch sử**: Conversations đã chat
- **Gửi tin nhắn**: Tương tác với AI
- **Xóa session**: Clear chat history
- **Smart suggestions**: Gợi ý câu hỏi

**API Endpoints:**

```
POST   /api/chatbot/session       - Tạo session mới
GET    /api/chatbot/sessions      - Lịch sử sessions
GET    /api/chatbot/session/:id   - Chi tiết session
POST   /api/chatbot/message       - Gửi tin nhắn
DELETE /api/chatbot/session/:id   - Xóa session
```

#### 8.2. Chức Năng Chatbot

- **FAQ tự động**: Trả lời câu hỏi thường gặp
- **Tư vấn xe**: Gợi ý xe phù hợp
- **Tra cứu thông tin**: Giá xe, thông số kỹ thuật
- **Đặt lịch**: Book test drive qua chatbot
- **Chuyển sang live chat**: Escalate to human
- **Multi-language**: Hỗ trợ tiếng Việt, English

#### 8.3. Admin - Thống Kê Chatbot

- **Số lượng session**: Tổng số chat
- **Popular questions**: Câu hỏi phổ biến
- **Success rate**: Tỷ lệ giải quyết
- **Improvement insights**: Đề xuất cải thiện

**API Endpoints:**

```
GET    /api/chatbot/stats         - Thống kê chatbot (admin)
GET    /api/chatbot/popular-questions - Câu hỏi phổ biến
PUT    /api/chatbot/train         - Train chatbot
```

---

### 9. 📞 HỆ THỐNG LIÊN HỆ

#### 9.1. Form Liên Hệ

- **Gửi tin nhắn**: Form liên hệ trên website
- **Thông tin**: Họ tên, email, SĐT, nội dung
- **Chủ đề**: Tư vấn, khiếu nại, góp ý, khác
- **Auto-reply**: Email xác nhận đã nhận
- **reCAPTCHA**: Chống spam

**API Endpoints:**

```
POST   /api/contact               - Gửi liên hệ
GET    /api/contact/my-contacts   - Liên hệ của tôi
```

#### 9.2. Admin - Quản Lý Liên Hệ

- **Danh sách liên hệ**: Tất cả tin nhắn
- **Filter**: Theo status, category, date
- **Đọc/Chưa đọc**: Mark as read/unread
- **Trả lời**: Reply qua email
- **Cập nhật trạng thái**: New, in progress, resolved, closed
- **Assign**: Gán cho nhân viên xử lý
- **Xóa**: Delete contact

**API Endpoints:**

```
GET    /api/contact               - Danh sách liên hệ (admin)
GET    /api/contact/:id           - Chi tiết liên hệ
PUT    /api/contact/:id/status    - Cập nhật trạng thái
POST   /api/contact/:id/reply     - Trả lời
DELETE /api/contact/:id           - Xóa liên hệ
```

---

### 10. 📊 DASHBOARD & THỐNG KÊ ADMIN

#### 10.1. Dashboard Tổng Quan

- **Widgets**: Số liệu quan trọng (users, cars, deposits, revenue)
- **Charts**: Biểu đồ doanh thu, đơn hàng theo thời gian
- **Recent activity**: Hoạt động gần đây
- **Quick stats**: Thống kê nhanh

**API Endpoints:**

```
GET    /api/dashboard/stats       - Thống kê tổng quan
GET    /api/dashboard/charts      - Dữ liệu biểu đồ
GET    /api/dashboard/activity    - Hoạt động gần đây
```

#### 10.2. Báo Cáo Chi Tiết

- **Báo cáo doanh thu**: Theo ngày, tháng, năm
- **Báo cáo bán hàng**: Số xe bán được, tỷ lệ chuyển đổi
- **Báo cáo người dùng**: User growth, active users
- **Báo cáo xe**: Xe phổ biến, xe tồn kho
- **Export**: Xuất báo cáo PDF, Excel

**API Endpoints:**

```
GET    /api/dashboard/revenue     - Báo cáo doanh thu
GET    /api/dashboard/sales       - Báo cáo bán hàng
GET    /api/dashboard/users       - Báo cáo users
GET    /api/dashboard/cars        - Báo cáo xe
GET    /api/dashboard/export      - Export báo cáo
```

#### 10.3. Thống Kê Nâng Cao

- **Analytics integration**: Google Analytics
- **Conversion tracking**: Tracking đặt cọc, lái thử
- **Heatmaps**: User behavior analysis
- **A/B testing**: Test các tính năng mới

**API Endpoints:**

```
GET    /api/dashboard/advanced    - Thống kê nâng cao
GET    /api/dashboard/conversion  - Conversion tracking
```

---

## ✨ TÍNH NĂNG NỔI BẬT

### 🎨 1. Giao Diện & Trải Nghiệm Người Dùng

- **UI/UX hiện đại**: Thiết kế đẹp mắt với gradient backgrounds
- **Responsive design**: Tương thích mọi thiết bị (desktop, tablet, mobile)
- **Component library**: Tái sử dụng components
- **Loading states**: Skeleton loading, spinners
- **Animations**: Smooth transitions, hover effects
- **Dark mode**: Chế độ sáng/tối (optional)

**Components:**

- `Banner`: Hero section trang chủ
- `FeaturedCars`: Xe nổi bật
- `Promotions`: Khuyến mãi
- `Services`: Dịch vụ
- `News`: Tin tức mới nhất
- `SearchCard`: Tìm kiếm xe
- `CarComparison`: So sánh xe
- `Footer`: Footer với links, social
- `Header`: Navigation bar

### 🔐 2. Bảo Mật & Xác Thực

- **JWT Authentication**: Token-based auth
- **Refresh token**: Tự động làm mới token
- **Cookie-based session**: Secure cookies
- **Protected routes**: Route guards cho admin
- **CORS configuration**: Cấu hình CORS đúng cách
- **Input validation**: Validate request data
- **SQL injection prevention**: Parameterized queries
- **XSS protection**: Sanitize user input
- **Rate limiting**: Giới hạn request
- **Password hashing**: Bcrypt hash passwords

### 📧 3. Email Service

- **Nodemailer**: Gửi email qua SMTP
- **Google OAuth2**: Xác thực Gmail
- **Email templates**: HTML email templates
- **Forgot password OTP**: Gửi mã OTP
- **Test drive confirmation**: Xác nhận lái thử
- **Deposit notification**: Thông báo đặt cọc
- **Welcome email**: Email chào mừng user mới
- **Newsletter**: Gửi email marketing

**Email Types:**

- Forgot password OTP
- Test drive confirmation
- Deposit confirmation
- Order status updates
- Welcome new user
- Newsletter subscription

### 🚀 4. Real-time Features

- **Socket.IO**: WebSocket real-time
- **Live chat**: Chat trực tiếp
- **Notifications**: Thông báo real-time
- **Online status**: Hiển thị online/offline
- **Typing indicator**: Đang gõ...
- **Global socket**: `global.socketHandler`

### 📱 5. Multi-layout Support

- **Main Layout**: Layout chính cho trang public
- **Admin Layout**: Layout riêng cho admin panel
- **Account Layout**: Layout cho trang account
- **Nested routing**: Routes con trong routes

**Layouts:**

- `App.jsx`: Main public layout
- `AdminLayout`: Admin dashboard layout
- `AccountLayout`: User account layout

### 💳 6. Payment Integration

- **Payment gateway**: Tích hợp thanh toán (VNPay, MoMo, ZaloPay)
- **Payment success**: Trang xác nhận thanh toán
- **Payment history**: Lịch sử giao dịch
- **Refund**: Hoàn tiền
- **Invoice**: Hóa đơn điện tử

### 🔍 7. SEO Optimization

- **Slug URLs**: Friendly URLs với slug
- **Meta tags**: Title, description, keywords
- **Open Graph**: OG tags cho social sharing
- **Sitemap**: XML sitemap
- **Robots.txt**: SEO configuration
- **Structured data**: JSON-LD schema markup

### 📊 8. Analytics & Tracking

- **Google Analytics**: Tracking traffic
- **Events tracking**: Theo dõi hành vi user
- **Conversion tracking**: Theo dõi chuyển đổi
- **Heatmaps**: Bản đồ nhiệt
- **User journey**: Phân tích hành trình

### 🛠️ 9. Developer Experience

- **Clean code**: Code dễ đọc, dễ maintain
- **Modular architecture**: Chia thành modules
- **API documentation**: Swagger/OpenAPI docs
- **Error handling**: Unified error handling
- **Logging**: Winston logger
- **Environment variables**: .env configuration
- **Git workflow**: Git best practices

### 🌐 10. Performance Optimization

- **Lazy loading**: Load components on demand
- **Image optimization**: Compress và optimize images
- **Caching**: Cache API responses
- **Bundle optimization**: Code splitting
- **CDN**: Serve static assets qua CDN
- **Minification**: Minify CSS, JS
- **Gzip compression**: Compress responses

---

## 🗂️ CẤU TRÚC API ROUTES

### Server Routes Summary

| Route             | Module            | Chức năng                |
| ----------------- | ----------------- | ------------------------ |
| `/api/users`      | User Routes       | Quản lý người dùng, auth |
| `/api/brand`      | Brand Routes      | Quản lý thương hiệu xe   |
| `/api/category`   | Category Routes   | Quản lý danh mục xe      |
| `/api/car`        | Car Routes        | Quản lý xe ô tô          |
| `/api/chat`       | Chat Routes       | Chat real-time           |
| `/api/test-drive` | Test Drive Routes | Đăng ký lái thử          |
| `/api/deposit`    | Deposit Routes    | Đặt cọc xe               |
| `/api/blog`       | Blog Routes       | Quản lý blog             |
| `/api/dashboard`  | Dashboard Routes  | Thống kê admin           |
| `/api/contact`    | Contact Routes    | Liên hệ                  |
| `/api/chatbot`    | Chatbot Routes    | Chatbot AI               |

---

## 🎯 PAGES & ROUTING

### Public Pages (Client Routes)

**Trang chính:**

- `/` - Trang chủ (`App.jsx`)
- `/login` - Đăng nhập (`Login.jsx`)
- `/register` - Đăng ký (`Register.jsx`)
- `/cars` - Tìm kiếm xe (`CarSearch.jsx`)
- `/cars/:id` - Chi tiết xe (`CarDetail.jsx`)
- `/blogs` - Danh sách blog (`BlogListPage.jsx`)
- `/blogs/:slug` - Chi tiết blog (`BlogDetailPage.jsx`)
- `/contact` - Liên hệ (`ContactPage.jsx`)
- `/payment/success` - Thanh toán thành công (`PaymentSuccess.jsx`)
- `/chatbot` - Chatbot (`ChatbotPage.jsx`)

### Admin Pages

**Admin Panel (`/admin`):**

- `/admin/dashboard` - Dashboard tổng quan
- `/admin/brands` - Quản lý thương hiệu
- `/admin/categories` - Quản lý danh mục
- `/admin/cars` - Quản lý xe
- `/admin/users` - Quản lý người dùng
- `/admin/deposits` - Quản lý đặt cọc
- `/admin/test-drives` - Quản lý lái thử
- `/admin/blogs` - Quản lý blog
- `/admin/contacts` - Quản lý liên hệ
- `/admin/chat` - Quản lý chat

### User Account Pages

**Account (`/account`):**

- `/account/profile` - Thông tin cá nhân
- `/account/deposits` - Đơn đặt cọc của tôi
- `/account/test-drives` - Lịch hẹn lái thử
- `/account/orders` - Đơn hàng
- `/account/settings` - Cài đặt tài khoản

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Frontend Stack

- ⚛️ **React 18**: Latest React version
- ⚡ **Vite**: Fast build tool
- 🎨 **Tailwind CSS**: Utility-first CSS
- 📡 **Axios**: HTTP client
- 🔄 **React Router**: Client-side routing
- 🏪 **Redux**: State management
- 🎭 **React Hooks**: Custom hooks

### Backend Stack

- 🟢 **Node.js**: JavaScript runtime
- 🚂 **Express.js**: Web framework
- 🔌 **Socket.IO**: Real-time WebSocket
- 📧 **Nodemailer**: Email sending
- 🔐 **JWT**: JSON Web Tokens
- 🔑 **OAuth2**: Google authentication
- 📝 **Winston**: Logging (optional)

### Development Tools

- 📝 **ESLint**: Code linting
- 🎨 **Prettier**: Code formatting
- 🔧 **VS Code**: IDE
- 🐙 **Git**: Version control
- 📦 **npm/yarn**: Package manager

### Database

- 📄 **JSON Files**: File-based storage
    - `users.json`
    - `cars.json`
    - `brands.json`
    - `categories.json`
    - `blogs.json`
    - `deposits.json`
    - `testdrives.json`
    - `contacts.json`
    - `chatsessions.json`
    - `conversations.json`

---

## ⚙️ CẤU HÌNH MÔI TRƯỜNG

### Client Environment (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### Server Environment (.env)

```env
# Server
PORT=3000
URL_CLIENT=http://localhost:5173

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth2
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=your_redirect_uri
REFRESH_TOKEN=your_oauth_refresh_token

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Environment
NODE_ENV=development
```

---

## 📈 ĐIỂM MẠNH CỦA DỰ ÁN

✅ **Kiến trúc rõ ràng** - Tách biệt client/server, cấu trúc folder logic và dễ maintain

✅ **API RESTful** - Endpoints được thiết kế chuẩn RESTful, dễ sử dụng

✅ **Real-time Communication** - Socket.IO cho chat và notifications real-time

✅ **Authentication hoàn chỉnh** - JWT + OAuth2 + Refresh token + Cookie-based

✅ **Admin Dashboard đầy đủ** - Quản trị toàn diện từ users, cars, deposits đến blog

✅ **Email Service tự động** - Gửi email xác nhận, thông báo, OTP tự động

✅ **Chatbot AI** - Hỗ trợ khách hàng 24/7 với AI chatbot

✅ **Responsive Design** - Giao diện tương thích mọi thiết bị

✅ **SEO Friendly** - Slug URLs, meta tags, sitemap, structured data

✅ **Payment Integration** - Tích hợp thanh toán online

✅ **Multi-role Support** - User, Admin roles với permissions khác nhau

✅ **Rich Features** - Blog, chat, chatbot, deposit, test drive, comparison

✅ **Security First** - Input validation, XSS protection, rate limiting

✅ **Developer Friendly** - Clean code, modular, well-documented

✅ **Performance Optimized** - Lazy loading, caching, compression

---

## 🚀 HƯỚNG PHÁT TRIỂN TƯƠNG LAI

### Tính năng mới

- 📱 **Mobile App**: React Native app cho iOS và Android
- 🔔 **Push Notifications**: Web push notifications
- 🌍 **Multi-language**: Hỗ trợ đa ngôn ngữ (i18n)
- 🎥 **Video Reviews**: Video review xe
- 🚗 **3D Car View**: Xem xe 360 độ
- 💬 **Social Features**: Comment, like, share
- 📍 **Store Locator**: Tìm showroom gần nhất
- 🔍 **Advanced Filters**: Nhiều filter hơn
- 📊 **AI Recommendations**: Gợi ý xe thông minh
- 🎁 **Loyalty Program**: Chương trình khách hàng thân thiết

### Cải tiến kỹ thuật

- 🗄️ **Database Migration**: Chuyển sang MongoDB/PostgreSQL
- 🔧 **GraphQL API**: Alternative to REST
- 📦 **Microservices**: Chia thành microservices
- 🐳 **Docker**: Containerization
- ☸️ **Kubernetes**: Orchestration
- 🧪 **Testing**: Unit tests, integration tests, E2E tests
- 📚 **API Documentation**: Swagger/OpenAPI docs
- 🔍 **Search Engine**: ElasticSearch cho tìm kiếm nâng cao
- 📈 **Monitoring**: Application monitoring với Prometheus
- 🚨 **Error Tracking**: Sentry integration

---

## 📞 SUPPORT & DOCUMENTATION

### Developer Resources

- **GitHub Repository**: [Link to repo]
- **API Documentation**: [Link to docs]
- **Figma Design**: [Link to design]
- **Postman Collection**: [Link to collection]

### Contact

- **Email**: support@carsell.com
- **Phone**: +84 xxx xxx xxx
- **Website**: https://carsell.com

---

**© 2026 CarSell Website - Dự án website bán xe ô tô toàn diện**
