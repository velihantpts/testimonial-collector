import { z } from "zod";

// Auth
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().optional(),
});

// Projects
export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
});

export const updateProjectSchema = createProjectSchema.partial();

// Testimonials
export const submitTestimonialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  text: z
    .string()
    .min(20, "Testimonial must be at least 20 characters")
    .max(1000, "Testimonial must be at most 1000 characters"),
  rating: z.number().min(1).max(5),
  avatar: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

export const updateTestimonialSchema = z.object({
  text: z.string().min(20).max(1000).optional(),
  rating: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
});

// Widgets
export const createWidgetSchema = z.object({
  name: z.string().min(1, "Widget name is required"),
  projectId: z.string(),
  theme: z.enum(["LIGHT", "DARK", "CUSTOM"]).optional(),
  layout: z
    .enum(["CAROUSEL", "GRID", "LIST", "MASONRY", "WALL_OF_LOVE", "MINIMAL"])
    .optional(),
  maxDisplay: z.number().min(1).max(50).optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  starColor: z.string().optional(),
  borderRadius: z.number().min(0).max(50).optional(),
  showRating: z.boolean().optional(),
  showAvatar: z.boolean().optional(),
  showCompany: z.boolean().optional(),
  showDate: z.boolean().optional(),
  autoplay: z.boolean().optional(),
  autoplaySpeed: z.number().min(1).max(30).optional(),
});

export const updateWidgetSchema = createWidgetSchema.partial();

// Collect Page
export const updateCollectPageSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  thankYouMessage: z.string().optional(),
  brandColor: z.string().optional(),
  collectVideo: z.boolean().optional(),
  collectAvatar: z.boolean().optional(),
  collectCompany: z.boolean().optional(),
  collectWebsite: z.boolean().optional(),
  promptQuestions: z.array(z.string()).optional(),
});

// Reminders
export const sendReminderSchema = z.object({
  projectId: z.string(),
  recipientEmail: z.string().email("Invalid email address"),
  recipientName: z.string().optional(),
});

export const batchReminderSchema = z.object({
  projectId: z.string(),
  recipients: z.array(
    z.object({
      email: z.string().email(),
      name: z.string().optional(),
    })
  ),
});

// Settings
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  companyName: z.string().optional(),
  companyLogo: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type SubmitTestimonialInput = z.infer<typeof submitTestimonialSchema>;
export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;
export type UpdateCollectPageInput = z.infer<typeof updateCollectPageSchema>;
export type SendReminderInput = z.infer<typeof sendReminderSchema>;
