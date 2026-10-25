# EventFlow — Quality Assurance & Testing Plan

## 1. Overview
The testing strategy covers backend API unit and integration tests (Jest / Supertest), validation of critical business workflows (Authentication, Concurrent Inventory Booking, Payment verification, QR check-in), security tests, and frontend UI tests.

---

## 2. Test Suite Breakdown

### 2.1 Backend Tests (`/server/tests`)
- **Authentication Suite**: User registration, login token payload verification, invalid password rejection, refresh token rotation.
- **Authorization & RBAC**: Attendee access restrictions on organizer endpoints, organizer restriction on other organizers' events, admin overrides.
- **Event Lifecycle**: Event creation, status changes (DRAFT -> PENDING_APPROVAL -> PUBLISHED), updating details.
- **Booking & Concurrency**: Purchasing tickets under high concurrency, prevention of over-selling beyond capacity, double booking checks.
- **Payment Verification**: Verification of HMAC-SHA256 signature algorithm against tampered Razorpay payloads.
- **QR Check-in**: Validating unused QR codes vs rejecting already-checked-in QR codes.
- **Coupon Validation**: Expiry dates, usage limits, duplicate usage per user.

### 2.2 Security Tests
- SQL injection attempts on API filters.
- Rate limiting enforcement test.
- Password hashing verification.

---

## 3. Test Execution Command
```bash
npm run test
```
