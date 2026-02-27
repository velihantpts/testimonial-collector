import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReminderSchema } from "@/lib/validations";
import { getPlanLimits, type PlanType } from "@/lib/plans";
import { sendTestimonialRequestEmail } from "@/lib/resend";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const reminders = await prisma.emailReminder.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
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
    const validation = sendReminderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId, recipientEmail, recipientName } = validation.data;

    // Verify project ownership and get project details
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        collectPage: true,
        user: {
          select: { plan: true, companyName: true, name: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check plan limits for reminders this month
    const limits = getPlanLimits(project.user.plan as PlanType);

    if (limits.maxRemindersPerMonth !== -1) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const remindersThisMonth = await prisma.emailReminder.count({
        where: {
          project: { userId: session.user.id },
          createdAt: { gte: startOfMonth },
        },
      });

      if (remindersThisMonth >= limits.maxRemindersPerMonth) {
        return NextResponse.json(
          {
            error: `You have reached the maximum number of reminders (${limits.maxRemindersPerMonth}) for your ${project.user.plan} plan this month. Please upgrade to send more reminders.`,
          },
          { status: 403 }
        );
      }
    }

    // Build the collect URL
    const collectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/collect/${project.slug}`;
    const companyName = project.user.companyName || project.name;

    // Send the email
    await sendTestimonialRequestEmail({
      to: recipientEmail,
      recipientName,
      companyName,
      collectUrl,
    });

    // Create the reminder record
    const reminder = await prisma.emailReminder.create({
      data: {
        projectId,
        recipientEmail,
        recipientName,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Error sending reminder:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}
