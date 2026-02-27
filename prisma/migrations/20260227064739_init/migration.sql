-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'STARTER', 'PRO');

-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WidgetTheme" AS ENUM ('LIGHT', 'DARK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "WidgetLayout" AS ENUM ('CAROUSEL', 'GRID', 'LIST', 'MASONRY', 'WALL_OF_LOVE', 'MINIMAL');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'OPENED', 'SUBMITTED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "companyName" TEXT,
    "companyLogo" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "avatar" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "website" TEXT,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "status" "TestimonialStatus" NOT NULL DEFAULT 'PENDING',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "tweetVersion" TEXT,
    "linkedInVersion" TEXT,
    "emailQuote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Widget" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Widget',
    "theme" "WidgetTheme" NOT NULL DEFAULT 'LIGHT',
    "layout" "WidgetLayout" NOT NULL DEFAULT 'CAROUSEL',
    "maxDisplay" INTEGER NOT NULL DEFAULT 5,
    "bgColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#111827',
    "starColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "borderRadius" INTEGER NOT NULL DEFAULT 12,
    "showRating" BOOLEAN NOT NULL DEFAULT true,
    "showAvatar" BOOLEAN NOT NULL DEFAULT true,
    "showCompany" BOOLEAN NOT NULL DEFAULT true,
    "showDate" BOOLEAN NOT NULL DEFAULT false,
    "autoplay" BOOLEAN NOT NULL DEFAULT true,
    "autoplaySpeed" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectPage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Share Your Experience',
    "description" TEXT NOT NULL DEFAULT 'We''d love to hear about your experience. Your feedback helps us improve and helps others make informed decisions.',
    "thankYouMessage" TEXT NOT NULL DEFAULT 'Thank you for your testimonial! We truly appreciate your feedback.',
    "brandColor" TEXT NOT NULL DEFAULT '#6366f1',
    "collectVideo" BOOLEAN NOT NULL DEFAULT false,
    "collectAvatar" BOOLEAN NOT NULL DEFAULT true,
    "collectCompany" BOOLEAN NOT NULL DEFAULT true,
    "collectWebsite" BOOLEAN NOT NULL DEFAULT false,
    "promptQuestions" TEXT[] DEFAULT ARRAY['What was the problem you were facing?', 'How did our product/service help?', 'What results did you achieve?']::TEXT[],

    CONSTRAINT "CollectPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailReminder" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Project_userId_slug_key" ON "Project"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CollectPage_projectId_key" ON "CollectPage"("projectId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Widget" ADD CONSTRAINT "Widget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectPage" ADD CONSTRAINT "CollectPage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailReminder" ADD CONSTRAINT "EmailReminder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
