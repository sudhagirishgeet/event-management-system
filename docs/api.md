# EventFlow — REST & WebSocket API Specification

## 1. REST API Standards
- Base URL: `/api/v1`
- Format: JSON request and response body
- Response Payload Envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 2. Authentication & User Routes (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user (ATTENDEE / ORGANIZER) |
| POST | `/auth/login` | Public | Login with email/password, returns access & refresh tokens |
| POST | `/auth/refresh` | Public | Refresh JWT access token using refresh token cookie/body |
| POST | `/auth/logout` | Authenticated | Revoke refresh token and clear auth state |
| GET | `/auth/me` | Authenticated | Fetch current authenticated profile |
| POST | `/auth/forgot-password` | Public | Send password reset link/OTP email |
| POST | `/auth/reset-password` | Public | Reset password using token |

---

## 3. Event Management Routes (`/api/v1/events`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/events` | Public | List & filter events (category, location, date, price, type, search) |
| GET | `/events/featured` | Public | List featured homepage events |
| GET | `/events/:id` | Public | Detailed event page data (speakers, schedule, tickets, venue, reviews) |
| POST | `/events` | Organizer / Admin | Create draft event |
| PUT | `/events/:id` | Organizer / Admin | Update event details (organizer can only edit own event) |
| DELETE | `/events/:id` | Organizer / Admin | Cancel or delete event |
| PUT | `/events/:id/status` | Admin | Change status (APPROVED, REJECTED, PUBLISHED, SUSPENDED) |

---

## 4. Ticket Management Routes (`/api/v1/tickets`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/tickets` | Organizer / Admin | Add ticket tier to event (Early bird, Regular, VIP) |
| PUT | `/tickets/:id` | Organizer / Admin | Update ticket tier details & quantities |
| DELETE | `/tickets/:id` | Organizer / Admin | Remove ticket tier if no bookings exist |

---

## 5. Booking & Payment Routes (`/api/v1/bookings`, `/api/v1/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/bookings` | Attendee | Initiate booking & reserve ticket inventory |
| GET | `/bookings/my` | Attendee | List user's active & past bookings |
| GET | `/bookings/:id` | Attendee / Admin | Fetch booking details & QR code |
| POST | `/bookings/:id/cancel` | Attendee | Cancel booking & calculate refund based on policy |
| POST | `/payments/create-order` | Attendee | Initialize Razorpay Order ID for a pending booking |
| POST | `/payments/verify` | Attendee | Verify Razorpay payment signature & confirm booking |

---

## 6. QR Check-In & Attendee Validation (`/api/v1/checkins`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/checkins/scan` | Organizer / Admin | Scan QR secret to validate & mark attendee checked-in |
| GET | `/events/:id/checkins` | Organizer / Admin | Live attendee check-in stats & attendee roster |

---

## 7. Reviews, Favorites & Certificates
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/favorites/:eventId` | Attendee | Add event to favorites |
| DELETE | `/favorites/:eventId` | Attendee | Remove event from favorites |
| GET | `/favorites/my` | Attendee | Get user's saved events |
| POST | `/reviews` | Verified Attendee | Submit review & rating for attended event |
| GET | `/certificates/:bookingId` | Attendee | Get certificate metadata & download PDF |

---

## 8. Analytics & Admin Control (`/api/v1/organizer`, `/api/v1/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/organizer/analytics` | Organizer | Sales, revenue, ticket breakdown charts data |
| GET | `/admin/analytics` | Admin | Platform-wide revenue, user growth, top events |
| GET | `/admin/users` | Admin | Paginated list of platform users & status toggles |
| GET | `/admin/audit-logs` | Admin | Platform security audit logs |

---

## 9. AI Integration Service (`/api/v1/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/ai/generate-event-info` | Organizer | Generate event title, description, FAQs using AI |
| POST | `/ai/recommendations` | Attendee / Public | AI-personalized event recommendations |
| POST | `/ai/chatbot` | Public | Real-time database-driven event discovery chatbot |

---

## 10. Real-Time WebSockets (Socket.IO)
- **Namespace**: `/`
- **Events**:
  - `join_event_room`: Join event community chat and poll channel.
  - `send_message` / `new_message`: Real-time chat messages.
  - `submit_vote` / `poll_update`: Real-time poll vote updates.
  - `live_checkin_update`: Real-time organizer check-in counter updates.
