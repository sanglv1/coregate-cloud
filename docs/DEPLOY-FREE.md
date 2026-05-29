# Deploy FREE — Vercel (UI) + Render (API) + Neon (Database)

Gói **$0** (theo quota từng nhà cung cấp). UI không sleep nhiều; API có thể sleep khi idle; DB Neon free **lâu dài** (không như Render Postgres 30 ngày).

## Hạn chế cần biết trước

| Hạng mục | Free |
|----------|------|
| UI (Vercel) | Ổn, build tự động |
| API (Render free) | **Sleep** ~15 phút không dùng → lần đầu vào chờ 30–60s |
| Database (Neon) | Free có quota, **không** hết 30 ngày |
| File ZIP upload | Lưu `/tmp` → **mất khi redeploy**; file nhỏ &lt; ~4.5MB qua Vercel |
| VNPAY | Vẫn cấu hình được (Return → Vercel, IPN → Render) |
| Render thẻ tín dụng | Một số tài khoản vẫn bị hỏi xác minh dù plan `free` |

---

## Tổng quan bước

```
1. Neon     → tạo Postgres, lấy chuỗi kết nối
2. GitHub   → push render.yaml (đã cấu hình free + Neon)
3. Render   → Blueprint → chỉ 1 service coregate-backend
4. Vercel   → deploy coregate-ui
5. Nối env  → API_BASE_URL, ALLOWED_ORIGINS, VNPAY
6. Kiểm tra → health, login, upload ZIP nhỏ
```

---

## BƯỚC 1 — Neon (database free)

1. Mở https://neon.tech → **Sign up** (GitHub được).
2. **New Project** → tên `coregate` → region gần VN (Singapore / AWS ap-southeast).
3. Sau khi tạo, tab **Connection details**:
   - Chọn **JDBC** hoặc **Connection string**
   - Copy các giá trị (ví dụ):

```
Host:     ep-xxxx.ap-southeast-1.aws.neon.tech
Database: neondb
User:     neondb_owner
Password: ********
```

4. Ghép **DB_URL** cho Spring Boot (dán vào Notepad):

```
jdbc:postgresql://ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Thay `ep-xxxx...` và `neondb` bằng giá trị thật của bạn.

Ghi lại:

- `DB_URL` = chuỗi jdbc ở trên  
- `DB_USERNAME` = user Neon  
- `DB_PASSWORD` = password Neon  

---

## BƯỚC 2 — Push code lên GitHub

Trên máy:

```powershell
cd d:\dev\coregate-cloud
git add render.yaml render.backend.neon.yaml render.backend.free.yaml docs/DEPLOY-FREE.md
git commit -m "Deploy free: Vercel + Render + Neon"
git push origin main
```

File `render.yaml` trong repo chỉ tạo **1** service backend (không tạo Postgres trên Render).

---

## BƯỚC 3 — Render (backend free)

### 3.1 Tạo Blueprint

1. https://dashboard.render.com → **New +** → **Blueprint**
2. Repo **coregate-cloud**, branch **main**
3. Chỉ thấy **1 resource**: `coregate-backend` (plan **free**)
4. Nếu vẫn bắt thẻ: thử **Cancel** → tạo **Web Service** thủ công (mục 3.3) hoặc dùng tài khoản Render khác

### 3.2 Nhập biến khi Blueprint hỏi

| Biến | Giá trị |
|------|---------|
| `DB_URL` | jdbc từ Bước 1 |
| `DB_USERNAME` | user Neon |
| `DB_PASSWORD` | password Neon |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | mật khẩu mạnh |
| `ALLOWED_ORIGINS` | `https://temp.vercel.app` (sửa sau) |
| `VNPAY_TMN_CODE` | sandbox hoặc `test` |
| `VNPAY_HASH_SECRET` | sandbox hoặc `test` |
| `VNPAY_RETURN_URL` | `https://temp.vercel.app/payment-callback` |
| `VNPAY_IPN_URL` | `https://temp.onrender.com/api/webhooks/vnpay` |

**Apply** → chờ **Live** (10–15 phút).

### 3.3 (Thay thế) Tạo Web Service thủ công

Nếu Blueprint lỗi:

1. **New +** → **Web Service** → repo `coregate-cloud`
2. **Root Directory**: `backend`  
   **Hoặc** Docker: Dockerfile `backend/Dockerfile`, context `backend`
3. **Instance Type**: **Free**
4. **Environment** → thêm tất cả biến như bảng 3.2
5. **Create Web Service**

### 3.4 Lấy URL backend

Copy URL, ví dụ: `https://coregate-backend-xxxx.onrender.com`

Kiểm tra: `https://<url>/actuator/health` → `"status":"UP"`

Sửa trên Environment:

```
VNPAY_IPN_URL = https://<BACKEND_URL>/api/webhooks/vnpay
```

→ **Save** → **Manual Deploy**

---

## BƯỚC 4 — Vercel (UI free)

1. https://vercel.com → **Add New → Project** → repo **coregate-cloud**
2. **Root Directory**: `coregate-ui`
3. **Environment Variables**:

| Name | Value |
|------|--------|
| `API_BASE_URL` | `https://coregate-backend-xxxx.onrender.com` |

4. **Deploy** → copy URL Vercel, ví dụ `https://coregate-cloud.vercel.app`

---

## BƯỚC 5 — Nối Vercel ↔ Render

**coregate-backend** → **Environment**:

```
ALLOWED_ORIGINS  = https://coregate-cloud.vercel.app
VNPAY_RETURN_URL = https://coregate-cloud.vercel.app/payment-callback
```

(Thay bằng URL Vercel thật, không slash cuối.)

**Save** → **Manual Deploy** backend.

VNPAY Sandbox: Return → Vercel, IPN → Render backend.

---

## BƯỚC 6 — Kiểm tra

1. `https://<backend>/actuator/health` → UP  
2. `https://<vercel>/` → trang chủ  
3. `/login` → admin  
4. Dashboard → Catalog → upload ZIP **&lt; 4 MB** thử  
5. Browse → thấy sản phẩm  

Lần đầu sau khi API sleep: chờ ~30–60s rồi F5.

---

## Bản FREE đơn giản hơn (DB trên Render, 30 ngày)

Nếu không muốn tạo Neon:

```powershell
copy render.backend.free.yaml render.yaml
git add render.yaml && git commit -m "Use Render free postgres" && git push
```

Blueprint sẽ có **2** resource: `coregate-db` (free, **hết hạn ~30 ngày**) + backend.

---

## Xử lý lỗi

| Lỗi | Cách sửa |
|-----|----------|
| Render bắt thẻ | Dùng plan `free` trong yaml; hoặc Web Service thủ công Free; hoặc chỉ Vercel + chạy API local |
| Health DOWN / Flyway | Sai `DB_URL`; Neon bật SSL → thêm `?sslmode=require` |
| UI không gọi API | Kiểm tra `API_BASE_URL` trên Vercel, redeploy |
| Upload fail | File quá lớn cho Vercel; thử ZIP &lt; 4MB |
| API chậm | Render free đang wake — đợi thêm |

---

## Tóm tắt biến

**Vercel:** `API_BASE_URL=https://<backend>.onrender.com`

**Render:** `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (Neon) + `ADMIN_*` + `ALLOWED_ORIGINS` + `VNPAY_*`
