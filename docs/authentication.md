# EventFlow — Authentication & Authorization Specification

## 1. Overview
EventFlow employs a robust state-of-the-art authentication mechanism based on **JWT (JSON Web Tokens)**, salted password hashing using **bcrypt**, refresh token rotation, and strict **Role-Based Access Control (RBAC)**.

---

## 2. Roles & Permission Matrix

| Role | Access Level | Key Capabilities |
|---|---|---|
| **ATTENDEE** | Standard User | Discover events, bookmark/favorite events, purchase tickets, view digital tickets & QR codes, request refunds according to policy, download participation certificates, participate in event chat and live polls, submit reviews for attended events. |
| **ORGANIZER** | Event Creator | Create and manage own events, set up ticket tiers and pricing, configure coupons, view event sales & attendance analytics, scan QR tickets at venue entry using built-in camera scanner, post live announcements. |
| **ADMIN** | Platform Manager | Moderate platform content, approve/reject/suspend events, manage system categories, view system-wide analytics, manage user accounts (block/unblock), inspect audit logs, oversee refunds. |

---

## 3. JWT Strategy & Token Rotation
- **Access Token**: Short-lived (15 minutes). Transmitted via `Authorization: Bearer <token>` header. Contains payload: `{ id, email, role }`.
- **Refresh Token**: Long-lived (7 days). Stored in HTTP-only, secure, `SameSite=Lax` cookies (or securely in response for cross-origin local testing). Verified against hashed refresh token stored in PostgreSQL database (`User.refreshToken`).
- **Token Rotation**: On refresh endpoint hit (`/api/v1/auth/refresh`), a new access token and a newly rotated refresh token are issued, invalidating the old refresh token.

---

## 4. Password Policy & Hashing
- Minimum 8 characters.
- Salted hashing using `bcryptjs` with 12 salt rounds.
- Never store or log plaintext passwords.

---

## 5. Middleware Authorization Enforcers
- `authenticate`: Validates Bearer JWT token, attaches user payload to `req.user`.
- `authorize(...roles)`: Verifies if `req.user.role` matches allowed roles (e.g. `authorize('ORGANIZER', 'ADMIN')`).
- `verifyEventOwnership`: Ensures an organizer can only edit, view check-ins, or manage tickets for events they created.
