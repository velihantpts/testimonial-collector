import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership through project
    const existing = await prisma.testimonial.findFirst({
      where: {
        id,
        project: { userId: session.user.id },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { status: "APPROVED" },
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Error approving testimonial:", error);
    return NextResponse.json(
      { error: "Failed to approve testimonial" },
      { status: 500 }
    );
  }
}
