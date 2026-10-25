# EventFlow — System Architecture & Design Specification

## 1. Overview
**EventFlow** is a modern, high-concurrency SaaS Event Management and Ticketing Platform designed for Attendees, Organizers, and System Administrators. It supports event discovery, ticket purchasing, digital QR check-ins, real-time community chat and live polls, automated PDF certificate generation, AI-powered recommendations/event content generation, and comprehensive analytics.

---

## 2. High-Level Architecture Diagram

```
                 +-------------------------------------------------------+
                 |              React + Vite Web Client                  |
                 |    (Tailwind CSS, Lucide, Recharts, Socket.IO Client) |
                 +-------------------------------------------------------+
                                           |
                                   HTTP / WebSocket
                                           v
                 +-------------------------------------------------------+
                 |              Express.js REST & Real-Time API          |
                 | (Authentication, Security, Controllers, Middleware)   |
                 +-------------------------------------------------------+
                                 /         |         \
                                /          |          \
                               v           v           v
                     +------------+   +----------+   +-------------------+
                     | PostgreSQL |   | Cloud    |   | External APIs     |
                     | (Prisma)   |   | Storage  |   | (Razorpay, Email, |
                     |            |   | (S3/Cloud|   |  OpenAI/AI, Maps) |
                     +------------+   +----------+   +-------------------+
```

---

## 3. Technology Stack & Component Responsibilities

### 3.1 Frontend Layer (`/client`)
- **Framework**: React 18, Vite.
- **Styling**: Tailwind CSS (Dark/Light themes, Responsive design, Glassmorphism, Micro-interactions).
- **Routing**: React Router v6 (Protected routes, Role-based route guards).
- **State & Data Fetching**: TanStack React Query + Axios (Caching, optimistic updates, loading/error states).
- **Forms & Validation**: React Hook Form + Zod.
- **Data Visualization**: Recharts (Revenue, sales, registration trends, category distributions).
- **Real-Time Features**: Socket.IO Client (Live attendee chat, announcements, real-time live polls).
- **QR Code Handling**: `@zxing/library` / `html5-qrcode` for scanning; `qrcode.react` for rendering ticket QR codes.

### 3.2 Backend API Layer (`/server`)
- **Runtime**: Node.js v18+.
- **Framework**: Express.js (Modular controllers, routes, middleware, validators).
- **Real-Time Communication**: Socket.IO Server integrated with Express HTTP server.
- **Security Middleware**:
  - `helmet`: HTTP header security.
  - `cors`: Restricted cross-origin requests.
  - `express-rate-limit`: Brute-force and DDoS mitigation.
  - Custom JWT & Role-Based Authorization Guards (`ATTENDEE`, `ORGANIZER`, `ADMIN`).
- **Validation**: Zod schema validation for all requests.

### 3.3 Persistence Layer (`/server/prisma`)
- **Database**: PostgreSQL 15+.
- **ORM**: Prisma ORM (Type-safe query builder, automated migrations, seed scripts).
- **Concurrency Management**: Database transactions (`prisma.$transaction`) and pessimistic/optimistic concurrency control for ticket inventory lock to prevent double booking.

### 3.4 Auxiliary Services & Integrations
- **Payments**: Razorpay API integration with HMAC-SHA256 signature verification (Extensible Payment Interface for Stripe).
- **File Storage**: Cloudinary / AWS S3 abstraction for event banners, organizer logos, user avatars, certificate templates.
- **Email Service**: Nodemailer SMTP / Resend API abstraction for transactional emails (Registration, Booking Confirmation with PDF, Reminders, Refund Alerts).
- **AI Service Abstraction**: OpenAI / Custom LLM API wrapper for:
  - Event title/description generation & social captions.
  - Contextual vector/query AI event recommendations.
  - AI Event Chatbot (Queries database for actual events without hallucinating).

---

## 4. Frontend Route Structure
- `/` - Public Modern Landing / Discovery Hero
- `/events` - Event Directory with Search, Filters, Sorting & Pagination
- `/events/:id` - Detailed Event Page & Interactive Booking Flow
- `/login`, `/register`, `/forgot-password`, `/reset-password` - Auth Pages
- `/dashboard` - Attendee Dashboard (Upcoming/Past Tickets, Saved Events, Notifications, Certificates)
- `/my-tickets/:id` - Digital Ticket View with QR Code and PDF Download
- `/organizer/dashboard` - Organizer Analytics & Event Management Overview
- `/organizer/events/create` - Multi-step Event & Ticket Creation Wizard
- `/organizer/events/:id/edit` - Edit Event Details, Schedule, Speakers, FAQs
- `/organizer/events/:id/checkin` - Camera-based QR Code Attendee Check-In Interface
- `/organizer/events/:id/analytics` - Event Performance Charts & Revenue Reports
- `/admin/dashboard` - System Administration Overview
- `/admin/users` - User & Organizer Account Management
- `/admin/events` - Event Moderation & Approval Queue
- `/admin/categories` - System Event Categories Management
- `/admin/audit-logs` - Platform Security & Audit Trail

---

## 5. Deployment Architecture
- **Docker Compose**: Containerized multi-service development setup (client, server, postgresql).
- **CI/CD**: GitHub Actions pipeline for linting, testing, and automated build checks.
