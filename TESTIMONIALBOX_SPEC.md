# TestimonialBox — SaaS Testimonial Collector Platform

## Complete Development Specification

---

## 1. PROJECT OVERVIEW

**Product Name:** TestimonialBox
**Tagline:** "Collect, manage, and showcase customer testimonials — in minutes."
**Type:** Full-stack SaaS web application
**Target Users:** Freelancers, agencies, SaaS companies, local businesses, e-commerce stores

**Core Value Proposition:**
Businesses need social proof to increase conversions. TestimonialBox lets them collect text & video testimonials via a simple link, manage them in a dashboard, and embed beautiful widgets on their website with one line of code.

---

## 2. TECH STACK

```
Framework:       Next.js 15 (App Router, TypeScript, Turbopack)
UI:              Tailwind CSS 4 + shadcn/ui
Database:        PostgreSQL via Supabase
ORM:             Prisma
Authentication:  NextAuth.js (Credentials + Google OAuth)
File Storage:    Supabase Storage (avatars, video testimonials)
Payments:        Stripe (Checkout + Webhooks + Customer Portal)
Email:           Resend (transactional + reminder emails)
Hosting:         Vercel
State:           Zustand (client state)
Forms:           React Hook Form + Zod validation
```

---

## 3. DATABASE SCHEMA (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== AUTH ====================

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?   // null if Google OAuth
  image         String?
  plan          Plan      @default(FREE)
  stripeCustomerId    String?   @unique
  stripeSubscriptionId String?
  companyName   String?
  companyLogo   String?
  slug          String    @unique // unique URL slug for collect page
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  projects      Project[]
  sessions      Session[]
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Plan {
  FREE
  STARTER
  PRO
}

// ==================== PROJECTS ====================

model Project {
  id          String   @id @default(cuid())
  name        String   // e.g. "My SaaS App", "Photography Business"
  slug        String   // unique per user, used in collect URL
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  testimonials  Testimonial[]
  widgets       Widget[]
  collectPage   CollectPage?
  emailReminders EmailReminder[]

  @@unique([userId, slug])
}

// ==================== TESTIMONIALS ====================

model Testimonial {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // Submitter info
  name        String
  email       String?
  avatar      String?  // uploaded photo URL
  company     String?
  jobTitle    String?
  website     String?

  // Content
  text        String   // testimonial text
  rating      Int      // 1-5 stars
  videoUrl    String?  // optional video testimonial URL

  // Management
  status      TestimonialStatus @default(PENDING)
  isFavorite  Boolean  @default(false)
  tags        String[] // tags for filtering

  // AI Generated variants (optional, Pro plan)
  tweetVersion    String?
  linkedInVersion String?
  emailQuote      String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum TestimonialStatus {
  PENDING
  APPROVED
  REJECTED
}

// ==================== WIDGETS ====================

model Widget {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  name        String   @default("Default Widget")
  theme       WidgetTheme @default(LIGHT)
  layout      WidgetLayout @default(CAROUSEL)
  maxDisplay  Int      @default(5)

  // Customization
  bgColor        String  @default("#ffffff")
  textColor      String  @default("#111827")
  starColor      String  @default("#f59e0b")
  borderRadius   Int     @default(12)
  showRating     Boolean @default(true)
  showAvatar     Boolean @default(true)
  showCompany    Boolean @default(true)
  showDate       Boolean @default(false)
  autoplay       Boolean @default(true)
  autoplaySpeed  Int     @default(5) // seconds

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum WidgetTheme {
  LIGHT
  DARK
  CUSTOM
}

enum WidgetLayout {
  CAROUSEL
  GRID
  LIST
  MASONRY
  WALL_OF_LOVE
  MINIMAL
}

// ==================== COLLECT PAGE ====================

model CollectPage {
  id          String  @id @default(cuid())
  projectId   String  @unique
  project     Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // Customization
  title           String  @default("Share Your Experience")
  description     String  @default("We'd love to hear about your experience. Your feedback helps us improve and helps others make informed decisions.")
  thankYouMessage String  @default("Thank you for your testimonial! We truly appreciate your feedback.")
  brandColor      String  @default("#6366f1")
  collectVideo    Boolean @default(false)
  collectAvatar   Boolean @default(true)
  collectCompany  Boolean @default(true)
  collectWebsite  Boolean @default(false)

  // Prompt questions (helps customers write better testimonials)
  promptQuestions  String[] @default(["What was the problem you were facing?", "How did our product/service help?", "What results did you achieve?"])
}

// ==================== EMAIL REMINDERS ====================

model EmailReminder {
  id          String  @id @default(cuid())
  projectId   String
  project     Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  recipientEmail  String
  recipientName   String?
  status          ReminderStatus @default(PENDING)
  sentAt          DateTime?
  openedAt        DateTime?
  submittedAt     DateTime?  // when testimonial was actually submitted

  createdAt   DateTime @default(now())
}

enum ReminderStatus {
  PENDING
  SENT
  OPENED
  SUBMITTED
  FAILED
}
```

---

## 4. ENVIRONMENT VARIABLES (.env)

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_STARTER_PRICE_ID=""
STRIPE_PRO_PRICE_ID=""

# Resend (Email)
RESEND_API_KEY=""

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# OpenAI (optional, for AI features)
OPENAI_API_KEY=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 5. PROJECT STRUCTURE

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   ├── register/
│   │   │   └── page.tsx            # Register page
│   │   └── layout.tsx              # Auth layout (centered, no sidebar)
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Overview: stats, recent testimonials, quick actions
│   │   ├── testimonials/
│   │   │   ├── page.tsx            # All testimonials list with filters
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Single testimonial detail + AI variants
│   │   ├── projects/
│   │   │   ├── page.tsx            # Projects list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create new project
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx        # Project detail + testimonials
│   │   │       ├── collect/
│   │   │       │   └── page.tsx    # Customize collect page
│   │   │       ├── widgets/
│   │   │       │   ├── page.tsx    # Widget list
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx # Create widget + live preview
│   │   │       │   └── [widgetId]/
│   │   │       │       └── page.tsx # Edit widget + embed code
│   │   │       └── reminders/
│   │   │           └── page.tsx    # Email reminder management
│   │   ├── settings/
│   │   │   ├── page.tsx            # Account settings
│   │   │   ├── billing/
│   │   │   │   └── page.tsx        # Stripe billing portal
│   │   │   └── branding/
│   │   │       └── page.tsx        # Company logo, name, custom domain
│   │   └── layout.tsx              # Dashboard layout (sidebar + topbar)
│   │
│   ├── (marketing)/
│   │   ├── page.tsx                # Landing page (public)
│   │   ├── pricing/
│   │   │   └── page.tsx            # Pricing page
│   │   ├── features/
│   │   │   └── page.tsx            # Features page
│   │   └── layout.tsx              # Marketing layout (navbar + footer)
│   │
│   ├── collect/
│   │   └── [slug]/
│   │       └── page.tsx            # PUBLIC: Testimonial submission form
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts        # NextAuth handler
│   │   ├── testimonials/
│   │   │   ├── route.ts            # GET (list), POST (submit from collect page)
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET, PUT, DELETE
│   │   │       ├── approve/
│   │   │       │   └── route.ts    # PATCH - approve testimonial
│   │   │       ├── reject/
│   │   │       │   └── route.ts    # PATCH - reject testimonial
│   │   │       └── ai-variants/
│   │   │           └── route.ts    # POST - generate AI text variants
│   │   ├── projects/
│   │   │   ├── route.ts            # GET, POST
│   │   │   └── [projectId]/
│   │   │       └── route.ts        # GET, PUT, DELETE
│   │   ├── widgets/
│   │   │   ├── route.ts            # GET, POST
│   │   │   ├── [widgetId]/
│   │   │   │   └── route.ts        # GET, PUT, DELETE
│   │   │   └── embed/
│   │   │       └── [widgetId]/
│   │   │           └── route.ts    # GET - returns widget JS/JSON for embed
│   │   ├── collect/
│   │   │   └── [slug]/
│   │   │       └── route.ts        # GET collect page config, POST submit testimonial
│   │   ├── reminders/
│   │   │   ├── route.ts            # GET, POST (send reminder emails)
│   │   │   └── batch/
│   │   │       └── route.ts        # POST (send bulk reminders)
│   │   ├── stripe/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts        # POST - create checkout session
│   │   │   ├── portal/
│   │   │   │   └── route.ts        # POST - create customer portal session
│   │   │   └── webhook/
│   │   │       └── route.ts        # POST - Stripe webhook handler
│   │   ├── upload/
│   │   │   └── route.ts            # POST - upload avatar/video to Supabase Storage
│   │   └── stats/
│   │       └── route.ts            # GET - dashboard statistics
│   │
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles + Tailwind
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # Dashboard sidebar navigation
│   │   ├── TopBar.tsx              # Dashboard top bar (search, user menu)
│   │   ├── DashboardLayout.tsx     # Sidebar + TopBar wrapper
│   │   ├── Navbar.tsx              # Marketing navbar
│   │   └── Footer.tsx              # Marketing footer
│   │
│   ├── dashboard/
│   │   ├── StatsCards.tsx          # KPI cards (total, pending, avg rating, views)
│   │   ├── RecentTestimonials.tsx  # Recent testimonials list
│   │   ├── QuickActions.tsx        # Quick action buttons
│   │   └── RatingChart.tsx         # Rating distribution chart
│   │
│   ├── testimonials/
│   │   ├── TestimonialCard.tsx     # Single testimonial card
│   │   ├── TestimonialList.tsx     # Testimonials grid/list with filters
│   │   ├── TestimonialDetail.tsx   # Full testimonial detail view
│   │   ├── StatusBadge.tsx         # Approved/Pending/Rejected badge
│   │   ├── RatingStars.tsx         # Star rating display
│   │   ├── FilterBar.tsx           # Status, rating, date, tag filters
│   │   ├── BulkActions.tsx         # Bulk approve/reject/delete
│   │   └── AiVariants.tsx          # AI generated text variants display
│   │
│   ├── collect/
│   │   ├── CollectForm.tsx         # Public testimonial submission form
│   │   ├── StarRatingInput.tsx     # Interactive star rating input
│   │   ├── AvatarUpload.tsx        # Avatar photo upload
│   │   ├── VideoRecorder.tsx       # Video recording/upload component
│   │   ├── PromptQuestions.tsx     # Guided questions to help write
│   │   └── ThankYouScreen.tsx      # Post-submission thank you
│   │
│   ├── widgets/
│   │   ├── WidgetPreview.tsx       # Live preview of widget
│   │   ├── WidgetCustomizer.tsx    # Widget customization controls
│   │   ├── EmbedCodeBlock.tsx      # Copy-paste embed code display
│   │   ├── CarouselWidget.tsx      # Carousel layout widget
│   │   ├── GridWidget.tsx          # Grid layout widget
│   │   ├── WallOfLoveWidget.tsx    # Wall of love layout
│   │   └── MinimalWidget.tsx       # Minimal single testimonial
│   │
│   ├── projects/
│   │   ├── ProjectCard.tsx         # Project card in projects list
│   │   ├── CreateProjectForm.tsx   # New project form
│   │   └── ProjectSettings.tsx     # Project settings form
│   │
│   ├── reminders/
│   │   ├── ReminderForm.tsx        # Send reminder form (single/bulk)
│   │   ├── ReminderList.tsx        # Reminder history + status
│   │   └── EmailPreview.tsx        # Preview of reminder email
│   │
│   ├── billing/
│   │   ├── PricingCards.tsx        # Pricing plan cards (Free/Starter/Pro)
│   │   ├── PlanBadge.tsx           # Current plan badge
│   │   └── UpgradePrompt.tsx       # "Upgrade to unlock" prompt
│   │
│   ├── marketing/
│   │   ├── Hero.tsx                # Landing page hero section
│   │   ├── Features.tsx            # Features grid
│   │   ├── HowItWorks.tsx          # 3-step how it works
│   │   ├── Testimonials.tsx        # Social proof (meta: testimonials about testimonial tool)
│   │   ├── PricingSection.tsx      # Pricing on landing page
│   │   ├── FAQ.tsx                 # Frequently asked questions
│   │   └── CTA.tsx                 # Call to action section
│   │
│   └── ui/                         # shadcn/ui components (auto-generated)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── badge.tsx
│       ├── avatar.tsx
│       ├── switch.tsx
│       ├── slider.tsx
│       ├── skeleton.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       └── tooltip.tsx
│
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # NextAuth configuration
│   ├── stripe.ts                   # Stripe client + helper functions
│   ├── resend.ts                   # Resend email client
│   ├── supabase.ts                 # Supabase client (storage)
│   ├── openai.ts                   # OpenAI client (AI variants)
│   ├── utils.ts                    # Utility functions (cn, formatDate, etc.)
│   ├── validations.ts              # Zod schemas for all forms
│   └── plans.ts                    # Plan limits and feature flags
│
├── hooks/
│   ├── useTestimonials.ts          # Fetch + manage testimonials
│   ├── useProjects.ts              # Fetch + manage projects
│   ├── useWidgets.ts               # Fetch + manage widgets
│   ├── useStats.ts                 # Fetch dashboard stats
│   ├── useUpload.ts                # File upload hook
│   └── usePlan.ts                  # Current plan + feature checks
│
├── store/
│   └── useStore.ts                 # Zustand global store
│
├── types/
│   └── index.ts                    # TypeScript type definitions
│
├── emails/
│   ├── TestimonialRequest.tsx      # Email template: request testimonial
│   ├── ReminderEmail.tsx           # Email template: reminder
│   ├── ThankYouEmail.tsx           # Email template: thank you after submission
│   └── WelcomeEmail.tsx            # Email template: welcome new user
│
└── prisma/
    ├── schema.prisma               # Database schema (above)
    ├── seed.ts                     # Seed script with demo data
    └── migrations/                 # Auto-generated migrations
```

---

## 6. PLAN LIMITS

```typescript
// lib/plans.ts

export const PLAN_LIMITS = {
  FREE: {
    maxTestimonials: 10,
    maxProjects: 1,
    maxWidgets: 1,
    maxRemindersPerMonth: 10,
    videoTestimonials: false,
    aiVariants: false,
    customBranding: false,
    removeBranding: false, // "Powered by TestimonialBox" watermark
    googleReviewImport: false,
    prioritySupport: false,
  },
  STARTER: {
    maxTestimonials: 100,
    maxProjects: 3,
    maxWidgets: 5,
    maxRemindersPerMonth: 100,
    videoTestimonials: false,
    aiVariants: false,
    customBranding: true,
    removeBranding: true,
    googleReviewImport: false,
    prioritySupport: false,
  },
  PRO: {
    maxTestimonials: -1, // unlimited
    maxProjects: -1,
    maxWidgets: -1,
    maxRemindersPerMonth: -1,
    videoTestimonials: true,
    aiVariants: true,
    customBranding: true,
    removeBranding: true,
    googleReviewImport: true,
    prioritySupport: true,
  },
} as const;

export const PLAN_PRICES = {
  STARTER: {
    monthly: 19,
    yearly: 190, // ~$15.83/mo
  },
  PRO: {
    monthly: 39,
    yearly: 390, // ~$32.50/mo
  },
} as const;
```

---

## 7. API ROUTES SPECIFICATION

### Authentication
```
POST /api/auth/[...nextauth]     → NextAuth handler (login, register, OAuth)
```

### Testimonials
```
GET    /api/testimonials           → List all testimonials (filter: projectId, status, rating)
POST   /api/testimonials           → Submit new testimonial (from collect page, NO auth required)
GET    /api/testimonials/[id]      → Get single testimonial
PUT    /api/testimonials/[id]      → Update testimonial (edit, tag)
DELETE /api/testimonials/[id]      → Delete testimonial
PATCH  /api/testimonials/[id]/approve → Approve testimonial
PATCH  /api/testimonials/[id]/reject  → Reject testimonial
POST   /api/testimonials/[id]/ai-variants → Generate AI text variants (Pro plan)
```

### Projects
```
GET    /api/projects               → List user's projects
POST   /api/projects               → Create new project
GET    /api/projects/[projectId]   → Get project details
PUT    /api/projects/[projectId]   → Update project
DELETE /api/projects/[projectId]   → Delete project + all testimonials
```

### Widgets
```
GET    /api/widgets                → List widgets for a project
POST   /api/widgets                → Create new widget
GET    /api/widgets/[widgetId]     → Get widget config
PUT    /api/widgets/[widgetId]     → Update widget settings
DELETE /api/widgets/[widgetId]     → Delete widget
GET    /api/widgets/embed/[widgetId] → PUBLIC: Return widget data (JSON) for embed script
```

### Collect Page
```
GET    /api/collect/[slug]         → PUBLIC: Get collect page config + prompt questions
POST   /api/collect/[slug]         → PUBLIC: Submit testimonial (no auth)
```

### Reminders
```
GET    /api/reminders              → List reminders for a project
POST   /api/reminders              → Send single reminder email
POST   /api/reminders/batch        → Send bulk reminder emails (CSV upload)
```

### Stripe
```
POST   /api/stripe/checkout        → Create Stripe checkout session
POST   /api/stripe/portal          → Create Stripe customer portal session
POST   /api/stripe/webhook         → Handle Stripe webhooks (subscription events)
```

### Upload
```
POST   /api/upload                 → Upload file to Supabase Storage (avatar/video)
```

### Stats
```
GET    /api/stats                  → Dashboard statistics (total, pending, avg rating, monthly trend)
```

---

## 8. PAGE-BY-PAGE DETAILED SPECS

### 8.1 Landing Page (/)

**Design:** Modern, clean, high-converting SaaS landing page.
**Theme:** Light mode default with indigo/violet accent (#6366f1).

**Sections:**
1. **Hero** — Headline: "Turn Happy Customers Into Your Best Marketing" / Subheadline: "Collect, manage, and showcase testimonials with a single link. No coding required." / CTA: "Start Free — No Credit Card" / Hero image: dashboard mockup screenshot
2. **Social Proof Bar** — "Trusted by 500+ businesses" + company logos (use placeholder logos initially)
3. **How It Works** — 3 steps with icons: (1) Create a collection link (2) Share with customers (3) Embed widget on your site
4. **Features Grid** — 6 cards: One-click collect, Beautiful widgets, Video testimonials, AI-powered variants, Email reminders, Analytics dashboard
5. **Widget Showcase** — Interactive demo showing different widget layouts (carousel, grid, wall of love)
6. **Pricing** — 3 plan cards (Free/Starter/Pro) with feature comparison
7. **FAQ** — 6-8 common questions in accordion
8. **Final CTA** — "Ready to collect your first testimonial?" + signup button

### 8.2 Collect Page (/collect/[slug])

**This is the PUBLIC page customers visit to leave a testimonial.**

**Design:** Clean, branded, mobile-first. Shows company logo + brand color.

**Fields:**
- Name (required)
- Email (optional)
- Avatar photo upload (optional, drag & drop or click)
- Company name (optional)
- Job title (optional)
- Star rating (required, 1-5, interactive stars)
- Testimonial text (required, min 20 chars, max 1000 chars)
- Video upload/record (Pro plan only)

**Guided prompts:** Show 3 questions above the textarea to help customer write:
- "What problem were you facing?"
- "How did our product/service help?"
- "What results did you achieve?"

**After submission:** Show animated thank you screen with confetti effect.

### 8.3 Dashboard (/dashboard)

**Layout:** Sidebar left + content right.

**Stats Cards (top):**
- Total Testimonials (all time)
- Pending Review (awaiting approval)
- Average Rating (stars)
- Widget Impressions (this month)

**Recent Testimonials:** Last 5 testimonials with status badge, quick approve/reject buttons.

**Quick Actions:** "Create Project", "Share Collect Link", "Create Widget"

**Rating Distribution:** Simple bar chart showing 1-5 star distribution.

### 8.4 Testimonials List (/testimonials)

**Features:**
- Grid or List view toggle
- Filter by: status (all/pending/approved/rejected), rating (1-5), project, date range, tags
- Search by name or text content
- Sort by: newest, oldest, highest rating, lowest rating
- Bulk actions: select multiple → approve all / reject all / delete all
- Each card shows: avatar, name, company, rating, text preview, status badge, date
- Click card → detail view

### 8.5 Testimonial Detail (/testimonials/[id])

**Sections:**
- Full testimonial with avatar, name, company, rating, text, video (if any)
- Action buttons: Approve, Reject, Delete, Edit, Favorite
- Tags: add/remove tags
- AI Variants panel (Pro plan): Generate tweet, LinkedIn post, email quote versions
- Copy buttons for each variant
- Metadata: submitted date, email, website

### 8.6 Widget Editor (/projects/[projectId]/widgets/[widgetId])

**Split view:** Left = customization controls, Right = live preview

**Customization options:**
- Layout: Carousel / Grid / List / Masonry / Wall of Love / Minimal
- Theme: Light / Dark / Custom
- Colors: Background, text, star color, border radius
- Content: Show/hide rating, avatar, company, date
- Behavior: Autoplay on/off, autoplay speed
- Max testimonials to display
- Filter: only show approved, minimum rating

**Embed code section:**
```html
<!-- TestimonialBox Widget -->
<div id="testimonialbox-widget" data-widget-id="WIDGET_ID"></div>
<script src="https://testimonialbox.com/widget.js" async></script>
```

### 8.7 Email Reminders (/projects/[projectId]/reminders)

**Features:**
- Send single reminder: enter email + name → sends personalized email with collect link
- Send bulk: upload CSV (email, name columns) → sends to all
- Reminder history: list showing email, name, status (sent/opened/submitted), date
- Auto-reminder: toggle to automatically re-send after 3 days if not submitted
- Email preview: see exactly what the recipient will receive

### 8.8 Settings (/settings)

**Tabs:**
- **Account:** Name, email, password change
- **Branding:** Company name, logo upload, default brand color
- **Billing:** Current plan, upgrade/downgrade, Stripe customer portal link
- **API Keys:** (Pro plan) Generate API key for programmatic access

---

## 9. WIDGET EMBED SYSTEM

The widget embed system is a key feature. Here's how it works:

### Widget Script (public/widget.js)
```javascript
// This script is loaded on the customer's website
(function() {
  const container = document.getElementById('testimonialbox-widget');
  if (!container) return;

  const widgetId = container.getAttribute('data-widget-id');
  const API_URL = 'https://testimonialbox.com/api/widgets/embed/' + widgetId;

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      // data contains: testimonials[], widget config (theme, layout, colors)
      // Render widget inside container using shadow DOM for style isolation
      const shadow = container.attachShadow({ mode: 'open' });
      shadow.innerHTML = buildWidgetHTML(data);
    });

  function buildWidgetHTML(data) {
    // Returns complete HTML + CSS for the widget
    // Includes: testimonial cards, carousel logic, styles
    // Uses widget config for theming
    // Adds "Powered by TestimonialBox" for free plan users
  }
})();
```

### Embed API Response (GET /api/widgets/embed/[widgetId])
```json
{
  "widget": {
    "theme": "light",
    "layout": "carousel",
    "bgColor": "#ffffff",
    "textColor": "#111827",
    "starColor": "#f59e0b",
    "borderRadius": 12,
    "showRating": true,
    "showAvatar": true,
    "autoplay": true,
    "autoplaySpeed": 5
  },
  "testimonials": [
    {
      "name": "John Doe",
      "avatar": "https://...",
      "company": "Acme Inc",
      "rating": 5,
      "text": "Amazing product!",
      "createdAt": "2025-01-15"
    }
  ],
  "branding": {
    "showWatermark": true, // false for paid plans
    "url": "https://testimonialbox.com"
  }
}
```

---

## 10. STRIPE INTEGRATION

### Products & Prices
```
Product: TestimonialBox Starter
  - Price: $19/month (price_starter_monthly)
  - Price: $190/year (price_starter_yearly)

Product: TestimonialBox Pro
  - Price: $39/month (price_pro_monthly)
  - Price: $390/year (price_pro_yearly)
```

### Webhook Events to Handle
```
checkout.session.completed    → Create/update user subscription
customer.subscription.updated → Plan change (upgrade/downgrade)
customer.subscription.deleted → Cancellation → revert to FREE plan
invoice.payment_succeeded     → Log successful payment
invoice.payment_failed        → Send failed payment notification
```

---

## 11. EMAIL TEMPLATES (Resend)

### Testimonial Request Email
```
Subject: "{companyName} would love your feedback"
Body:
  Hi {recipientName},

  {companyName} values your opinion and would love to hear about your experience.

  It only takes 2 minutes:
  [Leave a Testimonial] → button linking to collect page

  Your feedback helps us improve and helps others make informed decisions.

  Thank you!
  {companyName}
```

### Reminder Email (sent 3 days after request if not submitted)
```
Subject: "Quick reminder: Share your experience with {companyName}"
Body:
  Hi {recipientName},

  Just a friendly reminder — we'd still love to hear your feedback.

  [Share Your Experience] → button

  Thank you!
```

---

## 12. SEED DATA

```typescript
// prisma/seed.ts

// Demo user
const demoUser = {
  name: "Demo User",
  email: "demo@testimonialbox.com",
  password: bcrypt.hash("Demo123!"),
  plan: "PRO",
  companyName: "Acme Design Studio",
  slug: "acme-design",
};

// Demo project
const demoProject = {
  name: "Acme Design Studio",
  slug: "acme-design",
};

// 8 demo testimonials with variety:
// - Mix of 4-5 star ratings
// - Different names, companies, job titles
// - 2 pending, 5 approved, 1 rejected
// - 1 with video URL
// - Various lengths of text
// - Some with tags: ["product", "support", "design"]

// 1 demo widget (carousel, light theme)

// 1 collect page config (default settings)
```

---

## 13. DESIGN SYSTEM

### Colors
```css
--primary: #6366f1      /* Indigo - main brand color */
--primary-hover: #4f46e5
--secondary: #8b5cf6    /* Violet - accent */
--success: #22c55e      /* Green - approved */
--warning: #f59e0b      /* Amber - pending, stars */
--danger: #ef4444       /* Red - rejected */
--bg-primary: #ffffff   /* White background */
--bg-secondary: #f9fafb /* Gray-50 - secondary bg */
--bg-sidebar: #111827   /* Gray-900 - dark sidebar */
--text-primary: #111827 /* Gray-900 */
--text-secondary: #6b7280 /* Gray-500 */
--border: #e5e7eb       /* Gray-200 */
```

### Typography
```
Font: Inter (Google Fonts)
Headings: font-bold
Body: font-normal
Small: text-sm text-gray-500
```

### Component Style
```
Cards: bg-white rounded-xl border shadow-sm p-6
Buttons: rounded-lg font-medium px-4 py-2
Inputs: rounded-lg border border-gray-200 px-3 py-2
Sidebar: bg-gray-900 text-white w-64
```

---

## 14. DEVELOPMENT PHASES

### Phase 1: Foundation (Day 1-2)
- [x] Initialize Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [x] Setup Prisma + PostgreSQL (Supabase)
- [x] Database schema + migration + seed
- [x] NextAuth.js (credentials + Google OAuth)
- [x] Dashboard layout (sidebar, topbar)
- [x] Protected routes middleware

### Phase 2: Core Features (Day 3-5)
- [x] Project CRUD
- [x] Collect page (public form)
- [x] Testimonial submission + storage
- [x] Dashboard with stats
- [x] Testimonials list with filters
- [x] Approve/Reject/Delete actions
- [x] Star rating component
- [x] Avatar upload

### Phase 3: Widgets (Day 6-7)
- [x] Widget CRUD
- [x] Widget customizer with live preview
- [x] Carousel widget layout
- [x] Grid widget layout
- [x] Wall of Love layout
- [x] Embed code generation
- [x] Public widget.js script
- [x] Shadow DOM style isolation

### Phase 4: Monetization (Day 8-9)
- [x] Stripe integration (checkout, webhooks, portal)
- [x] Plan limits enforcement
- [x] Pricing page
- [x] Upgrade/downgrade flow
- [x] "Powered by TestimonialBox" watermark (free plan)
- [x] Feature gating (video, AI, branding)

### Phase 5: Growth Features (Day 10-12)
- [x] Email reminders (Resend)
- [x] Bulk CSV reminder upload
- [x] Auto-reminder (3 day follow-up)
- [x] Landing page (marketing)
- [x] SEO meta tags
- [x] Open Graph images

### Phase 6: Polish & Deploy (Day 13-14)
- [x] Loading skeletons
- [x] Toast notifications
- [x] Error handling
- [x] Mobile responsive
- [x] Vercel deployment
- [x] Environment variables
- [x] Custom domain setup

### Phase 7: Optional AI Features (Post-launch)
- [ ] AI variant generation (tweet, LinkedIn, email quote)
- [ ] AI testimonial summarizer
- [ ] Google Reviews import
- [ ] Trustpilot import

---

## 15. DEPENDENCIES

```bash
# Core
npm install next@latest react react-dom typescript @types/react @types/node

# UI
npm install tailwindcss @tailwindcss/postcss postcss
npx shadcn@latest init

# Database
npm install @prisma/client
npm install -D prisma

# Auth
npm install next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs

# Payments
npm install stripe

# Email
npm install resend

# Storage
npm install @supabase/supabase-js

# AI (optional)
npm install openai

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# State Management
npm install zustand

# Utilities
npm install date-fns clsx tailwind-merge lucide-react

# Charts (dashboard)
npm install recharts

# File Upload
npm install react-dropzone

# DnD (widget reordering)
npm install @dnd-kit/core @dnd-kit/sortable

# CSV parsing (bulk reminders)
npm install papaparse
npm install -D @types/papaparse
```

---

## 16. DEPLOYMENT CHECKLIST

### Vercel Environment Variables
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://testimonialbox.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=
RESEND_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=https://testimonialbox.com
```

### package.json build script
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## 17. MVP PRIORITIES

If building in phases, prioritize in this exact order:

1. **Auth + Dashboard layout** (must have)
2. **Project creation** (must have)
3. **Collect page + form submission** (must have — this IS the product)
4. **Testimonials list + approve/reject** (must have)
5. **Widget embed system** (must have — this creates retention)
6. **Landing page** (must have — this gets users)
7. **Stripe billing** (must have — this makes money)
8. **Email reminders** (nice to have — increases testimonial collection)
9. **Widget customization** (nice to have — adds value)
10. **AI variants** (nice to have — Pro plan differentiator)
11. **Video testimonials** (nice to have — Pro plan differentiator)

Items 1-7 = launch-ready MVP. Items 8-11 = post-launch iteration.
