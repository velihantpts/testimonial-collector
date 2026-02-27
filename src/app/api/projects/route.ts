import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations";
import { getPlanLimits, type PlanType } from "@/lib/plans";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            testimonials: true,
            widgets: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, slug } = validation.data;

    // Check plan limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, _count: { select: { projects: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const limits = getPlanLimits(user.plan as PlanType);
    if (
      limits.maxProjects !== -1 &&
      user._count.projects >= limits.maxProjects
    ) {
      return NextResponse.json(
        {
          error: `You have reached the maximum number of projects (${limits.maxProjects}) for your ${user.plan} plan. Please upgrade to create more projects.`,
        },
        { status: 403 }
      );
    }

    // Check slug uniqueness for this user
    const existingProject = await prisma.project.findUnique({
      where: {
        userId_slug: {
          userId: session.user.id,
          slug,
        },
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 }
      );
    }

    // Create project with default CollectPage
    const project = await prisma.project.create({
      data: {
        name,
        slug,
        userId: session.user.id,
        collectPage: {
          create: {
            title: "Share Your Experience",
            description:
              "We'd love to hear about your experience. Your feedback helps us improve and helps others make informed decisions.",
            thankYouMessage:
              "Thank you for your testimonial! We truly appreciate your feedback.",
            brandColor: "#6366f1",
          },
        },
      },
      include: {
        _count: {
          select: {
            testimonials: true,
            widgets: true,
          },
        },
        collectPage: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
