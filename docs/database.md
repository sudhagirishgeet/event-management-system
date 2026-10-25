# EventFlow — Database Schema & Data Modeling Specification

## 1. Overview
The database layer uses **PostgreSQL** managed by **Prisma ORM**. The schema is normalized, type-safe, indexed for performance, and supports strict integrity constraints, UUIDs, soft deletion flags, and concurrency locks.

---

## 2. Entities & Schema Specification

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ATTENDEE
  ORGANIZER
  ADMIN
}

enum EventStatus {
  DRAFT
  PENDING_APPROVAL
  PUBLISHED
  REJECTED
  CANCELLED
  COMPLETED
}

enum EventType {
  ONLINE
  OFFLINE
  HYBRID
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  REFUNDED
  FAILED
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}

enum NotificationType {
  BOOKING_CONFIRMED
  PAYMENT_SUCCESS
  EVENT_REMINDER
  EVENT_UPDATED
  EVENT_CANCELLED
  REFUND_PROCESSED
  TICKET_AVAILABLE
  ANNOUNCEMENT
}

model User {
  id              String           @id @default(uuid())
  name            String
  email           String           @unique
  phone           String?
  passwordHash    String
  role            Role             @default(ATTENDEE)
  isVerified      Boolean          @default(false)
  profileImage    String?
  bio             String?
  refreshToken    String?
  resetToken      String?
  resetTokenExpiry DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  organizerProfile OrganizerProfile?
  events           Event[]         @relation("OrganizerEvents")
  bookings         Booking[]
  favorites        Favorite[]
  reviews          Review[]
  notifications    Notification[]
  checkIns         CheckIn[]
  certificates     Certificate[]
  pollVotes        PollVote[]
  messages         Message[]
  auditLogs        AuditLog[]

  @@index([email])
}

model OrganizerProfile {
  id             String   @id @default(uuid())
  userId         String   @unique
  organization   String
  logo           String?
  website        String?
  bio            String?
  payoutDetails  Json?
  isVerified     Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model EventCategory {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  icon        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  events      Event[]
}

model Venue {
  id          String   @id @default(uuid())
  name        String
  address     String
  city        String
  state       String
  country     String
  zipCode     String?
  latitude    Float?
  longitude   Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  events      Event[]
}

model Event {
  id                 String         @id @default(uuid())
  title              String
  slug               String         @unique
  description        String
  shortDescription   String?
  bannerImage        String
  images             String[]
  status             EventStatus    @default(DRAFT)
  eventType          EventType      @default(OFFLINE)
  startDate          DateTime
  endDate            DateTime
  startTime          String
  endTime            String
  capacity           Int
  remainingCapacity  Int
  refundPolicyDays   Int            @default(7)
  refundPolicyPercent Int           @default(100)
  contactEmail       String
  contactPhone       String?
  isFeatured         Boolean        @default(false)
  rejectionReason    String?
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  organizerId        String
  categoryId         String
  venueId            String?

  organizer          User           @relation("OrganizerEvents", fields: [organizerId], references: [id], onDelete: Cascade)
  category           EventCategory  @relation(fields: [categoryId], references: [id])
  venue              Venue?         @relation(fields: [venueId], references: [id])

  ticketTypes        TicketType[]
  speakers           EventSpeaker[]
  schedule           EventSchedule[]
  faqs               EventFAQ[]
  bookings           Booking[]
  reviews            Review[]
  favorites          Favorite[]
  polls              EventPoll[]
  reports            EventReport[]
  certificates       Certificate[]
  messages           Message[]
  checkIns           CheckIn[]

  @@index([status, startDate])
  @@index([categoryId])
  @@index([organizerId])
}

model TicketType {
  id           String        @id @default(uuid())
  eventId      String
  name         String        // Early Bird, Regular, VIP, etc.
  description  String?
  price        Float
  quantity     Int
  availableQty Int
  saleStart    DateTime
  saleEnd      DateTime
  maxPerUser   Int           @default(5)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  event        Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  bookingItems BookingItem[]

  @@index([eventId])
}

model Booking {
  id              String        @id @default(uuid())
  bookingNumber   String        @unique // EVT-2026-XXXXXX
  userId          String
  eventId         String
  totalAmount     Float
  discountAmount  Float         @default(0)
  finalAmount     Float
  status          BookingStatus @default(PENDING)
  qrCodeUrl       String?
  qrSecret        String        @unique @default(uuid())
  couponId        String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user            User          @relation(fields: [userId], references: [id])
  event           Event         @relation(fields: [eventId], references: [id])
  coupon          Coupon?       @relation(fields: [couponId], references: [id])

  bookingItems    BookingItem[]
  payment         Payment?
  refund          Refund?
  checkIn         CheckIn?
  certificate     Certificate?

  @@index([userId])
  @@index([eventId])
  @@index([bookingNumber])
}

model BookingItem {
  id           String     @id @default(uuid())
  bookingId    String
  ticketTypeId String
  quantity     Int
  unitPrice    Float
  totalPrice   Float

  booking      Booking    @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  ticketType   TicketType @relation(fields: [ticketTypeId], references: [id])
}

model Payment {
  id               String        @id @default(uuid())
  bookingId        String        @unique
  gateway          String        @default("RAZORPAY")
  gatewayOrderId   String        @unique
  gatewayPaymentId String?       @unique
  gatewaySignature String?
  amount           Float
  currency         String        @default("INR")
  status           PaymentStatus @default(PENDING)
  metadata         Json?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  booking          Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model Refund {
  id           String   @id @default(uuid())
  bookingId    String   @unique
  amount       Float
  reason       String?
  status       String   @default("PROCESSED")
  processedAt  DateTime @default(now())

  booking      Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model Coupon {
  id              String       @id @default(uuid())
  code            String       @unique
  discountType    DiscountType
  discountValue   Float
  minimumAmount   Float        @default(0)
  maximumDiscount Float?
  usageLimit      Int
  usedCount       Int          @default(0)
  perUserLimit    Int          @default(1)
  validFrom       DateTime
  validUntil      DateTime
  isActive        Boolean      @default(true)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  bookings        Booking[]
}

model CheckIn {
  id          String   @id @default(uuid())
  eventId     String
  bookingId   String   @unique
  userId      String
  checkedInAt DateTime @default(now())
  checkedInBy String   // Staff or organizer user ID

  event       Event    @relation(fields: [eventId], references: [id])
  booking     Booking  @relation(fields: [bookingId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
}

model Speaker {
  id          String         @id @default(uuid())
  name        String
  designation String
  bio         String
  photo       String?
  socialLinks Json?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  events      EventSpeaker[]
}

model EventSpeaker {
  eventId   String
  speakerId String
  topic     String?

  event     Event   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  speaker   Speaker @relation(fields: [speakerId], references: [id], onDelete: Cascade)

  @@id([eventId, speakerId])
}

model EventSchedule {
  id          String   @id @default(uuid())
  eventId     String
  startTime   String
  endTime     String
  title       String
  description String?
  speakerName String?

  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model EventFAQ {
  id        String   @id @default(uuid())
  eventId   String
  question  String
  answer    String

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model Favorite {
  userId    String
  eventId   String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@id([userId, eventId])
}

model Review {
  id        String   @id @default(uuid())
  userId    String
  eventId   String
  rating    Int
  comment   String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])
}

model Certificate {
  id            String   @id @default(uuid())
  certificateId String   @unique // CERT-2026-XXXXXX
  userId        String
  eventId       String
  bookingId     String   @unique
  pdfUrl        String?
  issuedAt      DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id])
  event         Event    @relation(fields: [eventId], references: [id])
  booking       Booking  @relation(fields: [bookingId], references: [id])
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false)
  link      String?
  createdAt DateTime         @default(now())

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Message {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  content   String
  createdAt DateTime @default(now())

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
}

model EventPoll {
  id          String       @id @default(uuid())
  eventId     String
  question    String
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())

  event       Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  options     PollOption[]
  votes       PollVote[]
}

model PollOption {
  id        String     @id @default(uuid())
  pollId    String
  text      String
  voteCount Int        @default(0)

  poll      EventPoll  @relation(fields: [pollId], references: [id], onDelete: Cascade)
  votes     PollVote[]
}

model PollVote {
  id        String     @id @default(uuid())
  pollId    String
  optionId  String
  userId    String
  createdAt DateTime   @default(now())

  poll      EventPoll  @relation(fields: [pollId], references: [id], onDelete: Cascade)
  option    PollOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id])

  @@unique([pollId, userId])
}

model EventReport {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  reason    String
  details   String?
  status    String   @default("PENDING") // PENDING, RESOLVED, DISMISSED
  createdAt DateTime @default(now())

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String   // ADMIN_APPROVED_EVENT, USER_CANCELLED_BOOKING, etc.
  entity    String   // Event, Booking, User
  entityId  String?
  ipAddress String?
  metadata  Json?
  createdAt DateTime @default(now())

  user      User?    @relation(fields: [userId], references: [id])
}
```
