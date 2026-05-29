# Deploy CoreGate Cloud lên Render

Hướng dẫn triển khai full stack: **PostgreSQL** + **Spring Boot API** + **Next.js UI**, dùng file [`render.yaml`](../render.yaml) (Blueprint).

## Kiến trúc trên Render

| Dịch vụ | Tên Blueprint | Ghi chú |
|---------|---------------|---------|
| PostgreSQL | `coregate-db` | Flyway chạy khi backend khởi động |
| Web (Docker) | `coregate-backend` | Port 8080, disk 5GB tại `/app/products` |
| Web (Docker) | `coregate-ui` | Port 3000, proxy `/api/*` → backend |

Luồng API từ trình duyệt: `https://<ui>.onrender.com/api/...` → Next.js server → `API_BASE_URL` (URL public của backend).

## Yêu cầu

- Tài khoản [Render](https://render.com)
- Repo trên **GitHub** / GitLab / Bitbucket (Render kết nối Git)
- Tài khoản **VNPAY Sandbox** (hoặc production) nếu bật thanh toán
- Chi phí ước tính: Postgres **Basic** + 2 Web **Starter** (xem [bảng giá Render](https://render.com/pricing)); có thể hạ plan trong `render.yaml` nếu chỉ demo

## Bước 1 — Đẩy code lên Git

```bash
git add render.yaml docs/DEPLOY-RENDER.md
git commit -m "Add Render Blueprint for production deploy"
git push origin main
```

## Bước 2 — Tạo Blueprint trên Render

1. Vào [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Chọn repository `coregate-cloud` và branch `main`.
3. Render đọc `render.yaml` và hiển thị 3 resource: DB + 2 web services.
4. Khi được hỏi, nhập các biến **sync: false**:

| Biến | Ví dụ / gợi ý |
|------|----------------|
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | Mật khẩu mạnh (dùng đăng nhập dashboard + upload ZIP) |
| `VNPAY_TMN_CODE` | Mã TMN sandbox |
| `VNPAY_HASH_SECRET` | Secret sandbox |
| `VNPAY_RETURN_URL` | `https://<tên-ui>.onrender.com/payment-callback` |
| `VNPAY_IPN_URL` | `https://<tên-backend>.onrender.com/api/webhooks/vnpay` |

> **Lưu ý:** Lần deploy đầu URL `*.onrender.com` có thể chưa có — deploy xong một lượt, copy URL thật từ Dashboard rồi **sửa env** `VNPAY_RETURN_URL` / `VNPAY_IPN_URL` và redeploy backend.

5. Bấm **Apply** và chờ build (backend Docker ~5–10 phút, UI ~3–8 phút).

## Bước 3 — Kiểm tra sau deploy

1. **Backend health:** `https://<coregate-backend>.onrender.com/actuator/health` → `"status":"UP"`.
2. **UI:** mở `https://<coregate-ui>.onrender.com`.
3. **Đăng nhập:** `/login` với `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
4. **Upload sản phẩm:** Dashboard → Catalog → upload ZIP (lưu trên disk Render).
5. **CORS:** `ALLOWED_ORIGINS` đã trỏ tới URL UI qua Blueprint; nếu đổi custom domain, cập nhật thêm origin (phân tách bằng dấu phẩy).

## Bước 4 — Cấu hình VNPAY

Trong [VNPAY Sandbox](https://sandbox.vnpayment.vn/):

- **Return URL:** trùng `VNPAY_RETURN_URL`
- **IPN URL:** trùng `VNPAY_IPN_URL` (backend phải public HTTPS)

`VNPAY_IP_ADDRESS` trên Render: để mặc định hoặc IP egress của Render (VNPAY sandbox thường chấp nhận).

## Biến môi trường quan trọng

### Backend (`coregate-backend`)

| Biến | Nguồn |
|------|--------|
| `DB_*` | Tự gắn từ Postgres `coregate-db` |
| `ALLOWED_ORIGINS` | URL UI (`RENDER_EXTERNAL_URL`) |
| `DOWNLOAD_PUBLIC_BASE_URL` | URL backend |
| `DOWNLOAD_STORAGE_DIR` | `/app/products` (disk gắn kèm) |
| `MAIL_ENABLED` | `false` (bật SMTP sau nếu cần) |

### Frontend (`coregate-ui`)

| Biến | Nguồn |
|------|--------|
| `API_BASE_URL` | URL backend (`RENDER_EXTERNAL_URL`) |

Không cần `NEXT_PUBLIC_API_BASE_URL` — trình duyệt gọi same-origin `/api/*`.

## File ZIP sản phẩm

- Disk **5GB** gắn tại `/app/products` (chỉ backend).
- Upload qua **Dashboard → Catalog** sau khi đăng nhập admin.
- File **không** nằm trong Git; backup disk hoặc giữ bản ZIP ngoài Render.

## Custom domain (tuỳ chọn)

1. Render → service `coregate-ui` → **Settings** → **Custom Domains**.
2. Thêm domain UI, cập nhật `ALLOWED_ORIGINS` trên backend: `https://ui.cua-ban.com`.
3. Cập nhật `VNPAY_RETURN_URL` tương ứng.

## Deploy lại sau khi sửa code

Push lên branch đã gắn Blueprint → Render build lại tự động.

Chỉ rebuild backend:

```bash
# Trên Dashboard: coregate-backend → Manual Deploy → Clear build cache (nếu cần)
```

## Xử lý sự cố

| Triệu chứng | Cách xử lý |
|-------------|------------|
| UI 502 / API lỗi | Backend đang cold start (plan Free/Starter); đợi ~30s thử lại |
| Health 503 | Kiểm tra Postgres đã `Available`; xem log backend (Flyway, DB) |
| CORS lỗi | `ALLOWED_ORIGINS` thiếu URL UI (kể cả `https://`, không slash cuối) |
| VNPAY không callback | Sai `VNPAY_IPN_URL` / Return URL; backend phải HTTPS public |
| Download 404 | Chưa upload ZIP hoặc `productId` chưa map trong DB |
| Build UI fail | Kiểm tra `pnpm-lock.yaml`; build local `cd coregate-ui && pnpm build` |

## Triển khai thủ công (không Blueprint)

1. **New → PostgreSQL** → tạo DB, copy Internal URL / host, port, user, password, database.
2. **New → Web Service → Docker** → root `backend`, Dockerfile `backend/Dockerfile`, thêm env như `backend/.env.example`, gắn disk `/app/products`.
3. **New → Web Service → Docker** → root `coregate-ui`, set `API_BASE_URL=https://<backend>.onrender.com`.

## Hạn chế trên Render

- **Catalog UI** vẫn lưu `localStorage` — mỗi trình duyệt/máy khác nhau; production dài hạn nên đồng bộ catalog qua API/DB.
- **Redis** trong `docker-compose` không dùng trên Render (backend không phụ thuộc Redis).
- Plan **Free** web: sleep sau idle; không khuyến nghị production thật.

## Tài liệu liên quan

- [Render Blueprint spec](https://render.com/docs/blueprint-spec)
- [README](../README.md) — biến môi trường đầy đủ
- [`.env.example`](../.env.example) — tham chiếu local
