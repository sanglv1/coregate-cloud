# Coregate Cloud

Near-production baseline for Coregate with a separated backend and frontend.

## Services

- `coregate-ui`: Next.js 16 frontend.
- `backend`: Spring Boot 3 API for orders, payments (VNPAY), analytics, and webhooks.
- `postgres`: persistent relational storage.
- `redis`: cache/idempotency placeholder.

## Quick start (Docker)

1. Copy env templates:
   - `cp .env.example .env`
   - `cp backend/.env.example backend/.env`
   - `cp coregate-ui/.env.example coregate-ui/.env.local`
2. Fill VNPAY credentials in `.env` and/or `backend/.env`.
3. Start stack:
   - `docker compose up --build`

Frontend: `http://localhost:3000`  
Backend health: `http://localhost:8080/actuator/health`

## Local dev without Docker

### Backend
- `cd backend`
- `./mvnw spring-boot:run` (Linux/macOS)
- `mvnw.cmd spring-boot:run` (Windows)

### Frontend
- `cd coregate-ui`
- `pnpm install`
- `pnpm dev`

## Required environment variables

- `NEXT_PUBLIC_API_BASE_URL` for frontend.
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` for backend database.
- `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_PAY_URL`, `VNPAY_RETURN_URL`, `VNPAY_IPN_URL`.
- `DOWNLOAD_PUBLIC_BASE_URL`, `DOWNLOAD_STORAGE_DIR` for download link generation and file storage.
- `DOWNLOAD_HOST_DIR` for mapping an external host directory into backend container.
- `MAIL_ENABLED`, `MAIL_FROM`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` for email delivery.

## Download delivery

- After payment is confirmed (`IPN` or return verify), backend issues an access code and sends it by email if mail is enabled.
- Place product zip files in your external folder configured via `DOWNLOAD_HOST_DIR` (filename format by product mapping, e.g. `payment-demo.zip`).
- Download endpoints:
  - `GET /api/downloads?orderId={orderId}` to list links
  - `GET /api/downloads/access-code?orderId={orderId}` to get access code
  - `POST /api/downloads/redeem` with `{ "accessCode": "CG-..." }` to redeem download links
  - `GET /api/downloads/file/{token}` to download file

## API surface

- `POST /api/orders`
- `GET /api/orders/{id}`
- `POST /api/payments/vnpay`
- `GET /api/payments/vnpay/return-verify`
- `POST /api/webhooks/vnpay`
- `GET /api/downloads`
- `GET /api/downloads/access-code`
- `POST /api/downloads/redeem`
- `GET /api/downloads/file/{token}`
- `GET /api/analytics`
- `POST /api/auth/sign-out`

## Troubleshooting (Windows)

- If `pnpm`/`npm` fails with `spawn %SystemRoot%\\System32\\cmd.exe ENOENT`, run:
  - PowerShell: `$env:ComSpec='C:\\Windows\\System32\\cmd.exe'`
- If Docker compose fails with `dockerDesktopLinuxEngine` pipe errors, start Docker Desktop first.
