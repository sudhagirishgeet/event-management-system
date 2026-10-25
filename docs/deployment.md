# EventFlow — Deployment & Infrastructure Guide

## 1. Overview
EventFlow is containerized for seamless local execution and production deployment across Vercel (Frontend), Render/Railway/AWS (Backend API & Socket.IO), and Managed PostgreSQL (Neon, Supabase, or AWS RDS).

---

## 2. Docker Setup
Multi-container orchestration via `docker-compose.yml`:
- `frontend`: Vite React App containerized with NGINX server.
- `backend`: Express Node.js application container.
- `postgres`: PostgreSQL 15 container with persistent volume storage.

---

## 3. Environment Variables Specification
Create `.env` files based on `.env.example`:

### Server Environment Variables (`/server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eventflow_db?schema=public

JWT_SECRET=super-secret-jwt-key-eventflow-2026
JWT_REFRESH_SECRET=super-secret-jwt-refresh-key-eventflow-2026
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

RAZORPAY_KEY_ID=rzp_test_placeholder_key
RAZORPAY_KEY_SECRET=rzp_test_placeholder_secret

CLOUDINARY_CLOUD_NAME=demo_cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=cloudinary_secret_key

EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=mailtrap_user
EMAIL_PASS=mailtrap_pass
EMAIL_FROM="EventFlow <noreply@eventflow.com>"

AI_PROVIDER=openai
AI_API_KEY=sk-placeholder-ai-key
```

### Client Environment Variables (`/client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder_key
```

---

## 4. Production Build & Deployment Pipeline
1. Run Prisma database migrations:
   `npx prisma migrate deploy`
2. Run database seed:
   `node prisma/seed.js`
3. Build client bundle:
   `cd client && npm run build`
4. Build server:
   `cd server && npm run build` (or start via `node src/app.js`)
