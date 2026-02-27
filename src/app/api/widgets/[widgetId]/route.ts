import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateWidgetSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { widgetId } = await params;

    const widget = await prisma.widget.findFirst({
      where: {
        id: widgetId,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!widget) {
      return NextResponse.json(
        { error: "Widget not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(widget);
  } catch (error) {
    console.error("Error fetching widget:", error);
    return NextResponse.json(
      { error: "Failed to fetch widget" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { widgetId } = await params;

    // Verify ownership through project
    const existingWidget = await prisma.widget.findFirst({
      where: {
        id: widgetId,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!existingWidget) {
      return NextResponse.json(
        { error: "Widget not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateWidgetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const widget = await prisma.widget.update({
      where: { id: widgetId },
      data: validation.data,
    });

    return NextResponse.json(widget);
  } catch (error) {
    console.error("Error updating widget:", error);
    return NextResponse.json(
      { error: "Failed to update widget" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { widgetId } = await params;

    // Verify ownership through project
    const existingWidget = await prisma.widget.findFirst({
      where: {
        id: widgetId,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!existingWidget) {
      return NextResponse.json(
        { error: "Widget not found" },
        { status: 404 }
      );
    }

    await prisma.widget.delete({
      where: { id: widgetId },
    });

    return NextResponse.json({ message: "Widget deleted successfully" });
  } catch (error) {
    console.error("Error deleting widget:", error);
    return NextResponse.json(
      { error: "Failed to delete widget" },
      { status: 500 }
    );
  }
}
