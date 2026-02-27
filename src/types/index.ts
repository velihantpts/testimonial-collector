import type {
  User,
  Project,
  Testimonial,
  Widget,
  CollectPage,
  EmailReminder,
  Plan,
  TestimonialStatus,
  WidgetTheme,
  WidgetLayout,
  ReminderStatus,
} from "@/generated/prisma";

export type {
  User,
  Project,
  Testimonial,
  Widget,
  CollectPage,
  EmailReminder,
  Plan,
  TestimonialStatus,
  WidgetTheme,
  WidgetLayout,
  ReminderStatus,
};

export interface DashboardStats {
  totalTestimonials: number;
  pendingReview: number;
  averageRating: number;
  widgetImpressions: number;
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
  monthlyTrend: {
    month: string;
    count: number;
  }[];
}

export interface ProjectWithCounts extends Project {
  _count: {
    testimonials: number;
    widgets: number;
  };
}

export interface TestimonialWithProject extends Testimonial {
  project: Pick<Project, "id" | "name" | "slug">;
}

export interface WidgetWithTestimonials extends Widget {
  project: {
    testimonials: Testimonial[];
    user: Pick<User, "plan" | "companyName" | "companyLogo">;
  };
}

export interface CollectPageConfig extends CollectPage {
  project: {
    name: string;
    user: {
      companyName: string | null;
      companyLogo: string | null;
      plan: Plan;
    };
  };
}
