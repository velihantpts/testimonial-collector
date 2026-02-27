import * as dotenv from "dotenv";
dotenv.config();

import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  // Clean up existing demo data
  const existingUser = await prisma.user.findUnique({
    where: { email: "demo@testimonialbox.com" },
  });

  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } });
    console.log("Cleaned up existing demo data.");
  }

  // Create demo user
  const hashedPassword = await bcrypt.hash("Demo123!", 12);

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@testimonialbox.com",
      password: hashedPassword,
      plan: "PRO",
      companyName: "Acme Design Studio",
      slug: "acme-design",
    },
  });

  console.log(`Created demo user: ${user.email}`);

  // Create demo project
  const project = await prisma.project.create({
    data: {
      name: "Acme Design Studio",
      slug: "acme-design",
      userId: user.id,
    },
  });

  console.log(`Created demo project: ${project.name}`);

  // Create 8 demo testimonials
  const testimonials = await Promise.all([
    prisma.testimonial.create({
      data: {
        projectId: project.id,
        name: "Sarah Johnson",
        email: "sarah@techflow.io",
        company: "TechFlow",
        jobTitle: "CEO",
        text: "Acme Design Studio completely transformed our brand identity. Their attention to detail and creative vision exceeded all our expectations. The team was responsive, professional, and delivered ahead of schedule. I could not recommend them more highly to anyone looking for top-tier design work.",
        rating: 5,
        status: "APPROVED",
        isFavorite: true,
        tags: ["design", "product"],
      },
    }),
    prisma.testimonial.create({
      data: {
        projectId: project.id,
        name: "Michael Chen",
        email: "mchen@startupgrind.co",
        company: "StartupGrind",
        jobTitle: "Head of Marketing",
        text: "Working with Acme was a fantastic experience. They took the time to understand our target audience and crafted a visual language that really resonates with our users. The results speak for themselves - our conversion rate increased by 34% after the redesign.",
        rating: 5,
        status: "APPROVED",
        tags: ["design", "support"],
      },
    }),
    prisma.testimonial.create({
      data: {
        projectId: project.id,
        name: "Emily Rodriguez",
        email: "emily@greenleaf.com",
        company: "GreenLeaf Solutions",
        jobTitle: "Product Manager",
        text: "The team at Acme Design Studio delivered a beautiful, intuitive dashboard for our SaaS product. Their UX expertise was evident in every decision. Highly recommended!",
        rating: 5,
        status: "APPROVED",
        isFavorite: true,
        tags: ["product"],
      },
    }),
    prisma.testimonial.create({
      data: {
        projectId: project.id,
        name: "David Park",
        email: "david@novatech.com",
        company: "NovaTech",
        jobTitle: "CTO",
        text: "Great design work overall. The team is skilled and communicative. The only reason I am not giving 5 stars is that the initial timeline slipped by a week, but the final product was worth the wait. Their technical understanding of front-end constraints was impressive.",
        rating: 4,
        status: "APPROVED",
        tags: ["design", "support"],
      },
    }),
    prisma.testimonial.create({
      data: {
        projectId: project.id,
        name: "Lisa Thompson",
        email: "lisa@brightedu.org",
        company: "BrightEdu",
        jobTitle: "Director of Operations",
        text: "Acme redesigned our entire e-learning platform. The new design is modern, accessible, and our students love it. Support was excellent throughout the process.",
        rating: 5,
        status: "APPROVED",
        tags: ["design", "support"],
      },
    }),
    prisma.testimonial.create({
      data: {
        projectId: project.id,
        name: "James Wilson",
        email: "jwilson@cloudbase.dev",
        company: "CloudBase",
        jobTitle: "Founder",
        text: "Solid design agency. They delivered a clean landing page for our developer tool. Good communication and fair pricing. Would consider working with them again for future projects.",
        rating: 4,
        status: "PENDING",
        tags: ["product"],
      },
    }),
    prisma.testimonial.create({
      data: {
        projectId: project.id,
        name: "Anna Kowalski",
        email: "anna@pixelcraft.co",
        company: "PixelCraft",
        jobTitle: "Creative Director",
        text: "I recently hired Acme Design Studio for a branding project. The mood boards and concepts were creative, and the final deliverables looked great. Looking forward to seeing how the brand performs in market.",
        rating: 4,
        status: "PENDING",
      },
    }),
    prisma.testimonial.create({
      data: {
        projectId: project.id,
        name: "Robert Kim",
        email: "rkim@fastship.io",
        company: "FastShip",
        jobTitle: "VP of Engineering",
        text: "We had some miscommunication on the initial project scope which led to delays. While the design quality was acceptable, the process could have been smoother. They did offer revisions to make it right.",
        rating: 4,
        status: "REJECTED",
        tags: ["support"],
      },
    }),
  ]);

  console.log(`Created ${testimonials.length} demo testimonials`);

  // Create demo widget (carousel, light theme)
  const widget = await prisma.widget.create({
    data: {
      projectId: project.id,
      name: "Homepage Carousel",
      theme: "LIGHT",
      layout: "CAROUSEL",
      maxDisplay: 5,
      bgColor: "#ffffff",
      textColor: "#111827",
      starColor: "#f59e0b",
      borderRadius: 12,
      showRating: true,
      showAvatar: true,
      showCompany: true,
      showDate: false,
      autoplay: true,
      autoplaySpeed: 5,
    },
  });

  console.log(`Created demo widget: ${widget.name}`);

  // Create collect page config (default settings)
  const collectPage = await prisma.collectPage.create({
    data: {
      projectId: project.id,
      title: "Share Your Experience with Acme Design Studio",
      description:
        "We'd love to hear about your experience working with us. Your feedback helps us improve and helps others make informed decisions.",
      thankYouMessage:
        "Thank you for your testimonial! We truly appreciate your feedback and will review it shortly.",
      brandColor: "#6366f1",
      collectVideo: false,
      collectAvatar: true,
      collectCompany: true,
      collectWebsite: false,
      promptQuestions: [
        "What was the problem you were facing before working with us?",
        "How did our design services help solve your problem?",
        "What results or improvements have you seen?",
      ],
    },
  });

  console.log(`Created collect page: ${collectPage.title}`);

  console.log("\nSeed completed successfully!");
  console.log("---");
  console.log("Demo login credentials:");
  console.log("  Email:    demo@testimonialbox.com");
  console.log("  Password: Demo123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
