import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const { widgetId } = await params;

    const widget = await prisma.widget.findUnique({
      where: { id: widgetId },
      include: {
        project: {
          include: {
            testimonials: {
              where: { status: "APPROVED" },
              orderBy: { createdAt: "desc" },
              select: {
                name: true,
                avatar: true,
                company: true,
                rating: true,
                text: true,
                createdAt: true,
              },
            },
            user: {
              select: {
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!widget) {
      return NextResponse.json(
        { error: "Widget not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const testimonials = widget.project.testimonials.slice(
      0,
      widget.maxDisplay
    );

    const userPlan = widget.project.user.plan;
    const showWatermark = userPlan === "FREE";

    const response = {
      widget: {
        theme: widget.theme,
        layout: widget.layout,
        bgColor: widget.bgColor,
        textColor: widget.textColor,
        starColor: widget.starColor,
        borderRadius: widget.borderRadius,
        showRating: widget.showRating,
        showAvatar: widget.showAvatar,
        showCompany: widget.showCompany,
        showDate: widget.showDate,
        autoplay: widget.autoplay,
        autoplaySpeed: widget.autoplaySpeed,
      },
      testimonials: testimonials.map((t) => ({
        name: t.name,
        avatar: t.avatar,
        company: t.company,
        rating: t.rating,
        text: t.text,
        createdAt: t.createdAt,
      })),
      branding: {
        showWatermark,
        url: "https://testimonialbox.com",
      },
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching widget embed data:", error);
    return NextResponse.json(
      { error: "Failed to fetch widget data" },
      { status: 500, headers: corsHeaders }
    );
  }
}
