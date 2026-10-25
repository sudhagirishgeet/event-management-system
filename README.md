# EventFlow — Smart Event Management & Ticketing Platform

[![Node.js](https://img.shields.io/badge/Backend-Node.js%20v18+-6366f1)](https://nodejs.org)
[![Express](https://img.shields.io/badge/API-Express.js-black)](https://expressjs.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-336791)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8)](https://tailwindcss.com)

**EventFlow** is a complete, production-grade SaaS Event Management and Ticketing Platform designed for Attendees, Organizers, and System Administrators.

---

## 📋 Table of Contents
- [1. Core Capabilities](#1-core-capabilities)
- [2. System Requirements & External Services](#2-system-requirements--external-services)
- [3. Technology Stack](#3-technology-stack)
- [4. Environment Variables Specification](#4-environment-variables-specification)
- [5. Database Architecture & Setup](#5-database-architecture--setup)
- [6. Step-by-Step Installation & Setup](#6-step-by-step-installation--setup)
- [7. Default Demo Accounts](#7-default-demo-accounts)
- [8. API Endpoints Overview](#8-api-endpoints-overview)
- [9. Testing & Quality Assurance](#9-testing--quality-assurance)
- [10. Docker & Production Deployment](#10-docker--production-deployment)

---

## 1. Core Capabilities

### 🎟️ Attendees
- **Event Discovery**: Search and filter events by category, location, date, price, and format (Offline/Online/Hybrid).
- **Checkout & Razorpay Payments**: Secure ticket purchasing with coupon redemption (`WELCOME20`, `FLAT200`) and HMAC-SHA256 signature verification.
- **Digital QR Tickets**: Instant unique QR code pass generation for gate entry.
- **Downloadable Passes**: Automatic PDF ticket pass generation using PDFKit.
- **Certificates**: Automatically issued participation certificates for completed events.
- **Real-Time Community**: Socket.IO powered attendee event chat room and live polls.
- **AI Event Search**: AI discovery assistant querying the real database without hallucinating.

### 🏢 Organizers
- **AI-Assisted Event Creation**: Autofill event titles, descriptions, and FAQs via AI service abstraction.
- **Ticket Tiering**: Configure Early Bird, VIP, and Regular passes with custom pricing, sale periods, and capacities.
- **Camera-Based Gate Scanner**: Scan attendee QR codes via device camera with double check-in prevention.
- **Organizer Studio**: Visual Recharts analytics for revenue trends and ticket volume.

### 🛡️ System Administrators
- **Moderation Queue**: Approve, reject, or suspend event listings.
- **User Management**: Monitor Attendees, Organizers, and Admins.
- **Audit Trails**: Security logs tracking administrative actions and system events.

---

## 2. System Requirements & External Services

To run EventFlow, the following runtime environments and optional external API keys are required:

### Required Runtime
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher

### Required Database (Pick One)
1. **SQLite (Default for Local Development)**: Zero configuration required out-of-the-box. Uses `./server/prisma/dev.db`.
2. **PostgreSQL (Production Standard)**: v15.0 or higher (Neon, Supabase, AWS RDS, or local PostgreSQL daemon).

### Optional External Services
- **Razorpay**: API Key & Secret for live payment gateway processing. (Mock fallback is included for local testing without credentials).
- **Cloudinary / AWS S3**: For storing image uploads (banners, logos, avatars).
- **Nodemailer / SMTP (Mailtrap, Resend, SendGrid)**: For sending transactional emails and PDF tickets.
- **OpenAI API Key**: For AI description generation and chatbot features. (Structured local mock generator is included).

---

## 3. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, TanStack Query, HTML5-QRCode, QRCode.react, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, JWT, bcryptjs, Helmet, CORS, Rate Limiting, Zod Validation, PDFKit, Nodemailer |
| **Database & ORM** | PostgreSQL / SQLite, Prisma ORM |
| **Payments** | Razorpay SDK with HMAC-SHA256 signature verification |
| **Orchestration** | Docker, Docker Compose |

---

## 4. Environment Variables Specification

Create `.env` inside the `/server` folder based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"  # For PostgreSQL: "postgresql://postgres:postgres@localhost:5432/eventflow_db?schema=public"

# Auth Secrets
JWT_SECRET="super-secret-jwt-key-eventflow-2026"
JWT_REFRESH_SECRET="super-secret-jwt-refresh-key-eventflow-2026"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Razorpay Credentials (Optional for local test mode)
RAZORPAY_KEY_ID="rzp_test_placeholder_key"
RAZORPAY_KEY_SECRET="rzp_test_placeholder_secret"

# Cloudinary / S3 Credentials (Optional)
CLOUDINARY_CLOUD_NAME="demo_cloud"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="cloudinary_secret_key"

# Email SMTP Credentials (Optional)
EMAIL_HOST="smtp.mailtrap.io"
EMAIL_PORT=2525
EMAIL_USER="mailtrap_user"
EMAIL_PASS="mailtrap_pass"
EMAIL_FROM="EventFlow <noreply@eventflow.com>"

# AI Provider Credentials (Optional)
AI_PROVIDER="mock"
AI_API_KEY="sk-placeholder-ai-key"
```

---

## 5. Database Architecture & Setup

### Schema Models
EventFlow includes 20+ Prisma database entities:
- `User`, `OrganizerProfile`
- `EventCategory`, `Venue`, `Event`
- `TicketType`, `Booking`, `BookingItem`, `Payment`, `Refund`, `Coupon`
- `CheckIn`, `Speaker`, `EventSpeaker`, `EventSchedule`, `EventFAQ`
- `Favorite`, `Review`, `Certificate`, `Notification`, `Message`, `EventPoll`, `PollOption`, `PollVote`, `AuditLog`

### Database Commands

#### A. Out-of-the-Box SQLite Mode (Default)
```bash
cd server
npx prisma db push
npx prisma generate
node prisma/seed.js
```

#### B. PostgreSQL Production Mode
To switch to PostgreSQL, update `datasource db` in `server/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Then run:
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js
```

---

## 6. Step-by-Step Installation & Setup

### Step 1: Install Dependencies
From the project root directory, run:
```bash
npm run install:all
```

### Step 2: Initialize Database & Seed Sample Data
```bash
cd server
npx prisma db push
node prisma/seed.js
cd ..
```

### Step 3: Run Development Servers
Open two terminal windows:

**Terminal 1 (Backend API & WebSockets - Port 5000):**
```bash
npm run server
```

**Terminal 2 (React + Vite Client - Port 5173):**
```bash
npm run client
```

Navigate to **`http://localhost:5173`** in your browser.

---

## 7. Default Demo Accounts

The seed script creates pre-configured accounts (Password for all: `Password123!`):

| Role | Email | Capabilities |
|---|---|---|
| **System Admin** | `admin@eventflow.com` | Full administrative control, event approvals, user management, audit logs |
| **Organizer** | `organizer@eventflow.com` | Create events, setup tickets, view sales analytics, scan QR tickets |
| **Attendee** | `rahul@gmail.com` | Browse events, purchase tickets, view QR passes, download PDF passes |

---

## 8. API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Register new Attendee or Organizer |
| POST | `/api/v1/auth/login` | Public | Authenticate user & return JWT tokens |
| GET | `/api/v1/events` | Public | Search & filter events |
| GET | `/api/v1/events/:id` | Public | Fetch event details, keynotes, FAQs & reviews |
| POST | `/api/v1/events` | Organizer/Admin | Create new event listing |
| POST | `/api/v1/bookings` | Attendee | Reserve tickets & apply coupon |
| POST | `/api/v1/payments/create-order` | Attendee | Initialize Razorpay order |
| POST | `/api/v1/payments/verify` | Attendee | Verify Razorpay payment signature |
| POST | `/api/v1/checkins/scan` | Organizer/Admin | Scan attendee ticket QR code |
| GET | `/api/v1/organizer/analytics` | Organizer/Admin | Recharts sales & revenue data |
| POST | `/api/v1/ai/chatbot` | Public | Database-backed AI event chatbot |

---

## 9. Testing & Quality Assurance

Run the automated backend test suite (Jest + Supertest):
```bash
cd server
npm test
```

---

## 10. Docker & Production Deployment

Run the multi-container Docker setup locally:
```bash
docker-compose up --build
```
This spins up:
- **Frontend**: Port 5173
- **Backend**: Port 5000
- **PostgreSQL**: Port 5432

---

## Screenshots

### Homepage
![EventFlow homepage](docs/screenshots/homepage.png)

### Trending Experiences
![Trending experiences and event cards](docs/screenshots/trending-experiences.png)

### Organizer Section and Footer
![Organizer section and footer](docs/screenshots/organizer-footer.png)

