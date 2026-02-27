import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { batchReminderSchema } from "@/lib/validations";
import { getPlanLimits, type PlanType } from "@/lib/plans";
import { sendTestimonialRequestEmail } from "@/lib/resend";

const BATCH_SIZE = 5;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = batchReminderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId, recipients } = validation.data;

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

      const remainingQuota = limits.maxRemindersPerMonth - remindersThisMonth;

      if (remainingQuota <= 0) {
        return NextResponse.json(
          {
            error: `You have reached the maximum number of reminders (${limits.maxRemindersPerMonth}) for your ${project.user.plan} plan this month. Please upgrade to send more reminders.`,
          },
          { status: 403 }
        );
      }

      if (recipients.length > remainingQuota) {
        return NextResponse.json(
          {
            error: `You can only send ${remainingQuota} more reminders this month (limit: ${limits.maxRemindersPerMonth}). You are trying to send ${recipients.length}.`,
          },
          { status: 403 }
        );
      }
    }

    const collectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/collect/${project.slug}`;
    const companyName = project.user.companyName || project.name;

    let sent = 0;
    let failed = 0;
    const results: { email: string; status: "sent" | "failed"; error?: string }[] = [];

    // Process recipients in batches
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (recipient) => {
          try {
            await sendTestimonialRequestEmail({
              to: recipient.email,
              recipientName: recipient.name,
              companyName,
              collectUrl,
            });

            // Create reminder record with SENT status
            await prisma.emailReminder.create({
              data: {
                projectId,
                recipientEmail: recipient.email,
                recipientName: recipient.name,
                status: "SENT",
                sentAt: new Date(),
              },
            });

            sent++;
            return { email: recipient.email, status: "sent" as const };
          } catch (err) {
            // Create reminder record with FAILED status
            await prisma.emailReminder.create({
              data: {
                projectId,
                recipientEmail: recipient.email,
                recipientName: recipient.name,
                status: "FAILED",
              },
            });

            failed++;
            const errorMessage =
              err instanceof Error ? err.message : "Unknown error";
            return {
              email: recipient.email,
              status: "failed" as const,
              error: errorMessage,
            };
          }
        })
      );

      results.push(...batchResults);
    }

    return NextResponse.json({
      sent,
      failed,
      total: recipients.length,
      results,
    });
  } catch (error) {
    console.error("Error sending batch reminders:", error);
    return NextResponse.json(
      { error: "Failed to send batch reminders" },
      { status: 500 }
    );
  }
}
