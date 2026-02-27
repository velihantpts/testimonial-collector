"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquareQuote,
  Clock,
  Star,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Share2,
  Code2,
  Check,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/testimonials/RatingStars";
import { StatusBadge } from "@/components/testimonials/StatusBadge";
import type { TestimonialStatus } from "@/types";

// ----------------------------------------------------------------
// Mock data (replace with API calls later)
// ----------------------------------------------------------------

const mockStats = {
  totalTestimonials: 128,
  pendingReview: 12,
  averageRating: 4.7,
  widgetImpressions: 3842,
  totalChange: 14,
  pendingChange: -3,
  ratingChange: 0.2,
  impressionsChange: 22,
};

const mockRecentTestimonials = [
  {
    id: "1",
    name: "Sarah Johnson",
    company: "Acme Corp",
    avatar: null,
    rating: 5,
    text: "This product has completely transformed our workflow. The team loves it and we've seen a 40% increase in productivity since we started using it.",
    status: "APPROVED" as TestimonialStatus,
    createdAt: "2026-02-25",
  },
  {
    id: "2",
    name: "Michael Chen",
    company: "TechStart",
    avatar: null,
    rating: 4,
    text: "Really solid tool for collecting and managing testimonials. The widget integration was seamless and our conversion rate improved.",
    status: "PENDING" as TestimonialStatus,
    createdAt: "2026-02-24",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    company: "GrowthLab",
    avatar: null,
    rating: 5,
    text: "The best testimonial management tool we've used. Simple, effective, and the customer support is outstanding.",
    status: "PENDING" as TestimonialStatus,
    createdAt: "2026-02-23",
  },
  {
    id: "4",
    name: "David Kim",
    company: "Pixel Studio",
    avatar: null,
    rating: 3,
    text: "Good product overall but could use more customization options for the widget embed. Looking forward to future updates.",
    status: "REJECTED" as TestimonialStatus,
    createdAt: "2026-02-22",
  },
  {
    id: "5",
    name: "Lisa Park",
    company: "Flowstate",
    avatar: null,
    rating: 5,
    text: "Incredibly easy to set up and our customers love how simple the feedback form is. Highly recommend for any SaaS business.",
    status: "APPROVED" as TestimonialStatus,
    createdAt: "2026-02-21",
  },
];

const mockRatingDistribution = [
  { rating: "1 star", count: 3, fill: "#6366f1" },
  { rating: "2 stars", count: 7, fill: "#818cf8" },
  { rating: "3 stars", count: 15, fill: "#8b5cf6" },
  { rating: "4 stars", count: 38, fill: "#7c3aed" },
  { rating: "5 stars", count: 65, fill: "#6366f1" },
];

// ----------------------------------------------------------------
// Stats Cards
// ----------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ label, value, change, icon, iconBg }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-[#22c55e]" />
          ) : (
            <TrendingDown className="h-4 w-4 text-[#ef4444]" />
          )}
          <span
            className={isPositive ? "font-medium text-[#22c55e]" : "font-medium text-[#ef4444]"}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Testimonials"
        value={mockStats.totalTestimonials}
        change={mockStats.totalChange}
        icon={<MessageSquareQuote className="h-6 w-6 text-blue-600" />}
        iconBg="rgba(59, 130, 246, 0.1)"
      />
      <StatCard
        label="Pending Review"
        value={mockStats.pendingReview}
        change={mockStats.pendingChange}
        icon={<Clock className="h-6 w-6 text-amber-600" />}
        iconBg="rgba(245, 158, 11, 0.1)"
      />
      <StatCard
        label="Average Rating"
        value={mockStats.averageRating.toFixed(1)}
        change={mockStats.ratingChange}
        icon={<Star className="h-6 w-6 text-yellow-500" />}
        iconBg="rgba(234, 179, 8, 0.1)"
      />
      <StatCard
        label="Widget Impressions"
        value={mockStats.widgetImpressions.toLocaleString()}
        change={mockStats.impressionsChange}
        icon={<Eye className="h-6 w-6 text-green-600" />}
        iconBg="rgba(34, 197, 94, 0.1)"
      />
    </div>
  );
}

// ----------------------------------------------------------------
// Recent Testimonials
// ----------------------------------------------------------------

function RecentTestimonials() {
  const [testimonials, setTestimonials] = useState(mockRecentTestimonials);

  function handleApprove(id: string) {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "APPROVED" as TestimonialStatus } : t))
    );
  }

  function handleReject(id: string) {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "REJECTED" as TestimonialStatus } : t))
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Testimonials</CardTitle>
            <CardDescription className="mt-1">
              Latest feedback from your customers
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/testimonials" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testimonials.map((testimonial) => {
            const initials = testimonial.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={testimonial.id}
                className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <Avatar size="default" className="mt-0.5 shrink-0">
                  <AvatarImage src={testimonial.avatar ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{testimonial.name}</span>
                    {testimonial.company && (
                      <span className="text-sm text-muted-foreground">
                        {testimonial.company}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars rating={testimonial.rating} size="sm" />
                    <StatusBadge status={testimonial.status} />
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {testimonial.text}
                  </p>
                </div>

                {/* Quick actions */}
                {testimonial.status === "PENDING" && (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-[#22c55e] hover:bg-[#22c55e]/10 hover:text-[#22c55e]"
                      onClick={() => handleApprove(testimonial.id)}
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
                      onClick={() => handleReject(testimonial.id)}
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------
// Quick Actions
// ----------------------------------------------------------------

const quickActions = [
  {
    label: "Create Project",
    description: "Set up a new project to collect testimonials",
    icon: Plus,
    href: "/projects/new",
    color: "#6366f1",
  },
  {
    label: "Share Collect Link",
    description: "Send a link for customers to submit feedback",
    icon: Share2,
    href: "/testimonials",
    color: "#22c55e",
  },
  {
    label: "Create Widget",
    description: "Embed testimonials on your website",
    icon: Code2,
    href: "/projects",
    color: "#8b5cf6",
  },
];

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to get you started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col items-center gap-3 rounded-xl border border-dashed p-5 text-center transition-all hover:border-solid hover:border-[#6366f1]/30 hover:bg-[#6366f1]/5"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <action.icon
                  className="h-5 w-5"
                  style={{ color: action.color }}
                />
              </div>
              <div>
                <p className="font-medium">{action.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------
// Rating Distribution Chart
// ----------------------------------------------------------------

function RatingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Distribution</CardTitle>
        <CardDescription>
          Breakdown of testimonial ratings (1-5 stars)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockRatingDistribution}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="rating"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {mockRatingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------
// Dashboard Page
// ----------------------------------------------------------------

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your testimonials.
        </p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent testimonials - takes 2 cols */}
        <div className="lg:col-span-2">
          <RecentTestimonials />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <RatingChart />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
