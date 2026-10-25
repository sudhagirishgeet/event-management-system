# EventFlow — Security Architecture & Compliance Guidelines

## 1. Threat Mitigation Strategies

### 1.1 SQL Injection & ORM Safety
- All database queries are executed strictly through **Prisma ORM**, which utilizes parameterized queries by default, completely neutralizing SQL Injection vulnerabilities.

### 1.2 Cross-Site Scripting (XSS) & Header Security
- Frontend utilizes React's auto-escaping JSX rendering to prevent script injection.
- Backend implements `helmet` to set HTTP security headers (`Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).

### 1.3 Rate Limiting & Denial of Service Protection
- Implemented `express-rate-limit`:
  - Auth endpoints (`/api/v1/auth/login`, `/register`): Max 10 requests per 15 minutes per IP.
  - General API endpoints: Max 100 requests per 15 minutes per IP.
  - Payment & Booking endpoints: Max 20 requests per 15 minutes.

### 1.4 Payment Security (Razorpay)
- Frontend client sends payment credentials to Razorpay directly via SDK.
- Final booking state is updated **ONLY** after backend receives the Razorpay payload and validates the `razorpay_signature` using HMAC-SHA256 with the secret key (`RAZORPAY_KEY_SECRET`).
- Webhook signature verification guarantees async payment state reconciliation.

### 1.5 Double-Booking & Race Condition Prevention
- Concurrent ticket checkout is protected using PostgreSQL explicit table locking / atomic Prisma transaction updates (`prisma.$transaction` with decrements and checks on `availableQty` and `remainingCapacity`).

### 1.6 File Upload Security
- File uploads (banners, avatars) enforce MIME-type filtering (`image/jpeg`, `image/png`, `image/webp`) and maximum file size limits (5MB). Uploads bypass direct server disk storage by streaming directly to Cloudinary/S3.

### 1.7 Audit Trail & Data Privacy
- Critical administrative and user actions (e.g. event approval, user block, refund issuance) write immutable records to the `AuditLog` table.
- Passwords, JWT secrets, and API secret keys are strictly stripped from responses and logging contexts.
