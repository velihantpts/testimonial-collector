import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCollectPageSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let collectPage = await prisma.collectPage.findUnique({
      where: { projectId },
    });

    // Auto-create if not exists
    if (!collectPage) {
      collectPage = await prisma.collectPage.create({
        data: {
          projectId,
        },
      });
    }

    return NextResponse.json({ ...collectPage, project });
  } catch (error) {
    console.error("Error fetching collect page:", error);
    return NextResponse.json(
      { error: "Failed to fetch collect page config" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateCollectPageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const collectPage = await prisma.collectPage.upsert({
      where: { projectId },
      update: validation.data,
      create: {
        projectId,
        ...validation.data,
      },
    });

    return NextResponse.json(collectPage);
  } catch (error) {
    console.error("Error updating collect page:", error);
    return NextResponse.json(
      { error: "Failed to update collect page" },
      { status: 500 }
    );
  }
}
