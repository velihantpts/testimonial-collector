import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submitTestimonialSchema } from "@/lib/validations";
import { getPlanLimits, type PlanType } from "@/lib/plans";

// GET: Fetch collect page config by project slug (public, no auth)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const project = await prisma.project.findFirst({
      where: { slug },
      include: {
        collectPage: true,
        user: {
          select: {
            companyName: true,
            companyLogo: true,
            plan: true,
          },
        },
        _count: {
          select: {
            testimonials: true,
          },
        },
      },
    });

    if (!project || !project.collectPage) {
      return NextResponse.json(
        { error: "Collect page not found" },
        { status: 404 }
      );
    }

    const planLimits = getPlanLimits(project.user.plan as PlanType);

    return NextResponse.json({
      collectPage: project.collectPage,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
      },
      company: {
        name: project.user.companyName,
        logo: project.user.companyLogo,
      },
      plan: {
        type: project.user.plan,
        videoTestimonials: planLimits.videoTestimonials,
        customBranding: planLimits.customBranding,
        removeBranding: planLimits.removeBranding,
      },
    });
  } catch (error) {
    console.error("Error fetching collect page:", error);
    return NextResponse.json(
      { error: "Failed to fetch collect page" },
      { status: 500 }
    );
  }
}

// POST: Submit a testimonial (public, no auth required)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find the project by slug
    const project = await prisma.project.findFirst({
      where: { slug },
      include: {
        user: {
          select: { plan: true },
        },
        _count: {
          select: { testimonials: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validation = submitTestimonialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Check plan limits for max testimonials
    const planLimits = getPlanLimits(project.user.plan as PlanType);
    if (
      planLimits.maxTestimonials !== -1 &&
      project._count.testimonials >= planLimits.maxTestimonials
    ) {
      return NextResponse.json(
        {
          error:
            "This project has reached its testimonial limit. Please contact the project owner.",
        },
        { status: 403 }
      );
    }

    // Check if video is allowed on the plan
    if (validation.data.videoUrl && !planLimits.videoTestimonials) {
      return NextResponse.json(
        {
          error: "Video testimonials are not available on the current plan.",
        },
        { status: 403 }
      );
    }

    // Create testimonial with PENDING status
    const testimonial = await prisma.testimonial.create({
      data: {
        projectId: project.id,
        name: validation.data.name,
        email: validation.data.email || null,
        avatar: validation.data.avatar || null,
        company: validation.data.company || null,
        jobTitle: validation.data.jobTitle || null,
        website: validation.data.website || null,
        text: validation.data.text,
        rating: validation.data.rating,
        videoUrl: validation.data.videoUrl || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Testimonial submitted successfully!",
        id: testimonial.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}
