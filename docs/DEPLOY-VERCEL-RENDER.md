# Deploy CoreGate: Vercel (UI) + Render (Backend + Postgres)

Kiến trúc:

```
Người dùng → https://your-app.vercel.app (Next.js)
                    │
                    │  /api/* (proxy server-side)
                    ▼
            https://coregate-backend.onrender.com (Spring Boot)
                    │
                    ├── PostgreSQL (Render)
                    └── Disk ZIP /app/products
VNPAY IPN ──────────────► backend (trực tiếp, không qua Vercel)
VNPAY Return ───────────► Vercel /payment-callback
```

---

## Tổng quan các bước

| # | Việc cần làm | Nền tảng |
|---|----------------|----------|
| 1 | Chuẩn bị `render.yaml` backend-only | GitHub |
| 2 | Deploy Postgres + API | Render |
| 3 | Deploy Next.js | Vercel |
| 4 | Nối env hai bên + VNPAY | Render + Vercel |
| 5 | Kiểm tra | Trình duyệt |

**Thứ tự quan trọng:** Render backend **trước**, Vercel **sau** (cần URL backend cho `API_BASE_URL`).

---

## PHẦN 1 — Chuẩn bị GitHub

### Bước 1.1 — Dùng Blueprint backend-only trên Render

Trên máy, trong thư mục repo:

**Cách A (khuyến nghị):** thay `render.yaml` bằng bản chỉ backend:

```bash
cd d:\dev\coregate-cloud
copy render.yaml render.full.yaml
copy render.backend.yaml render.yaml
git add render.yaml render.backend.yaml render.full.yaml docs coregate-ui/vercel.json
git commit -m "Add Vercel + Render split deploy config"
git push origin main
```

**Cách B:** giữ `render.full.yaml` backup, chỉ commit `render.backend.yaml` và tạo service Render **thủ công** (Phần 1 thay thế ở cuối tài liệu).

### Bước 1.2 — Xóa service Render sai (nếu có)

Nếu trước đó tạo **một** Web Service `coregate-cloud` ở root repo (build fail):

1. Render Dashboard → service đó → **Settings** → **Delete Web Service**.

---

## PHẦN 2 — Deploy Backend trên Render

### Bước 2.1 — Tạo Blueprint

1. https://dashboard.render.com → **New +** → **Blueprint**
2. Chọn repo `sanglv1/coregate-cloud`, branch `main`
3. Phải thấy **2 resource** (không phải 3):
   - `coregate-db`
   - `coregate-backend`
4. **Apply**

### Bước 2.2 — Nhập biến môi trường

| Biến | Giá trị tạm |
|------|-------------|
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | mật khẩu mạnh |
| `ALLOWED_ORIGINS` | `https://placeholder.vercel.app` (sửa sau) |
| `VNPAY_TMN_CODE` | mã sandbox |
| `VNPAY_HASH_SECRET` | secret sandbox |
| `VNPAY_RETURN_URL` | `https://placeholder.vercel.app/payment-callback` |
| `VNPAY_IPN_URL` | `https://placeholder.onrender.com/api/webhooks/vnpay` |

### Bước 2.3 — Chờ Live

- `coregate-db` → **Available**
- `coregate-backend` → **Live** (8–15 phút)

### Bước 2.4 — Lấy URL backend

1. Mở service **coregate-backend**
2. Copy URL, ví dụ: `https://coregate-backend-xxxx.onrender.com`
3. Kiểm tra: mở `https://<backend-url>/actuator/health` → `"status":"UP"`

Ghi lại: **BACKEND_URL** = URL trên (không có slash cuối).

### Bước 2.5 — Sửa VNPAY_IPN_URL (backend)

1. **coregate-backend** → **Environment**
2. `VNPAY_IPN_URL` = `https://<BACKEND_URL>/api/webhooks/vnpay`  
   (bỏ phần host cũ, chỉ path `/api/webhooks/vnpay`)
3. **Save** → **Manual Deploy**

---

## PHẦN 3 — Deploy UI trên Vercel

### Bước 3.1 — Tạo project

1. https://vercel.com → đăng nhập **GitHub**
2. **Add New…** → **Project**
3. Import repo **coregate-cloud**

### Bước 3.2 — Cấu hình build (quan trọng)

Trên màn **Configure Project**:

| Mục | Giá trị |
|-----|---------|
| **Root Directory** | `coregate-ui` → **Edit** → chọn `coregate-ui` |
| **Framework Preset** | Next.js |
| **Build Command** | `pnpm build` (hoặc để Vercel đọc `vercel.json`) |
| **Install Command** | `corepack enable && corepack prepare pnpm@10.32.1 --activate && pnpm install --frozen-lockfile` |

### Bước 3.3 — Biến môi trường Vercel

**Environment Variables** → thêm:

| Name | Value | Environment |
|------|--------|-------------|
| `API_BASE_URL` | `https://coregate-backend-xxxx.onrender.com` | Production, Preview, Development |

Thay bằng **BACKEND_URL** thật (Bước 2.4). **Không** thêm slash `/` ở cuối.

### Bước 3.4 — Deploy

1. Bấm **Deploy**
2. Chờ 3–8 phút → **Visit** site
3. URL dạng: `https://coregate-cloud.vercel.app` hoặc `https://coregate-cloud-xxx.vercel.app`

Ghi lại: **VERCEL_URL** = URL production (không slash cuối).

---

## PHẦN 4 — Nối Render ↔ Vercel

### Bước 4.1 — Cập nhật Render (backend)

**coregate-backend** → **Environment**:

```
ALLOWED_ORIGINS = https://<VERCEL_URL>
```

Nhiều domain (preview + production):

```
ALLOWED_ORIGINS = https://coregate-cloud.vercel.app,https://coregate-cloud-git-main-xxx.vercel.app
```

```
VNPAY_RETURN_URL = https://<VERCEL_URL>/payment-callback
```

**Save** → **Manual Deploy** backend.

> Trình duyệt gọi `/api/*` qua Vercel nên CORS ít khi lỗi; vẫn nên set `ALLOWED_ORIGINS` đúng.

### Bước 4.2 — VNPAY Sandbox

Trên https://sandbox.vnpayment.vn/:

- **Return URL** = `VNPAY_RETURN_URL` (trỏ Vercel)
- **IPN URL** = `VNPAY_IPN_URL` (trỏ Render backend)

### Bước 4.3 — Redeploy Vercel (nếu đổi env)

Vercel → Project → **Deployments** → **⋯** → **Redeploy** (khi sửa `API_BASE_URL`).

---

## PHẦN 5 — Kiểm tra

### Checklist

```
[ ] https://<backend>/actuator/health → UP
[ ] https://<vercel>/ → trang chủ hiện
[ ] https://<vercel>/login → đăng nhập admin OK
[ ] Dashboard → Catalog → upload ZIP (xem lưu ý dung lượng bên dưới)
[ ] Browse → thấy sản phẩm
[ ] Checkout → VNPAY (nếu đã cấu hình)
```

### Upload ZIP qua Vercel

Proxy upload đi: Browser → Vercel `/api/...` → Render.

- Gói **Vercel Hobby**: giới hạn body request ~**4.5 MB** — file ZIP lớn có thể **lỗi**.
- File ZIP **> 5 MB**: nên nâng plan Vercel hoặc upload trực tiếp API Render (cần chỉnh client sau).

Backend cho phép tới **200 MB**; giới hạn thường nằm ở Vercel proxy.

---

## PHẦN 6 — Sau này sửa code

| Thay đổi | Hành động |
|----------|-----------|
| Chỉ UI (`coregate-ui/`) | `git push` → Vercel tự build |
| Chỉ backend (`backend/`) | `git push` → Render tự build |
| Đổi `API_BASE_URL` | Vercel → Settings → Environment → Redeploy |
| Đổi domain Vercel | Cập nhật `ALLOWED_ORIGINS` + `VNPAY_RETURN_URL` trên Render |

---

## Custom domain (tuỳ chọn)

**Vercel:** Settings → Domains → `shop.domain.com`  
**Render:** giữ `*.onrender.com` cho API (hoặc thêm subdomain `api.domain.com`)

Cập nhật:

- Vercel: không đổi `API_BASE_URL` nếu API vẫn trên Render
- Render: `ALLOWED_ORIGINS` thêm `https://shop.domain.com`
- VNPAY: `VNPAY_RETURN_URL` = `https://shop.domain.com/payment-callback`

---

## Render thủ công (không Blueprint)

1. **New → PostgreSQL** → `coregate-db`
2. **New → Web Service → Docker**
   - Root: `backend`
   - Dockerfile: `backend/Dockerfile`
   - Env: xem `backend/.env.example`
   - Disk: `/app/products`, 5 GB
3. Gắn `DB_*` từ Postgres Internal URL

---

## Xử lý lỗi

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Vercel build fail | Sai root directory | Root = `coregate-ui` |
| UI không gọi được API | Thiếu `API_BASE_URL` | Thêm env, redeploy Vercel |
| 502 sau vài phút idle | Render cold start | Đợi 30–60s, F5 |
| VNPAY không callback | Sai Return/IPN URL | Return → Vercel, IPN → Render |
| Upload fail | File quá lớn cho Vercel | ZIP nhỏ hơn 4MB hoặc nâng plan |
| Health 503 | DB chưa sẵn | Xem Logs backend |

---

## Tóm tắt biến môi trường

### Vercel (`coregate-ui`)

```
API_BASE_URL=https://coregate-backend-xxxx.onrender.com
```

### Render (`coregate-backend`)

```
ALLOWED_ORIGINS=https://your-app.vercel.app
VNPAY_RETURN_URL=https://your-app.vercel.app/payment-callback
VNPAY_IPN_URL=https://coregate-backend-xxxx.onrender.com/api/webhooks/vnpay
DOWNLOAD_PUBLIC_BASE_URL=https://coregate-backend-xxxx.onrender.com
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=...
```
