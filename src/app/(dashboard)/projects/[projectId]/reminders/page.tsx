"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { ReminderForm } from "@/components/reminders/ReminderForm";
import { ReminderList } from "@/components/reminders/ReminderList";
import { EmailPreview } from "@/components/reminders/EmailPreview";
import { BulkUpload } from "@/components/reminders/BulkUpload";

import type { EmailReminder } from "@/types";

interface ProjectInfo {
  id: string;
  name: string;
  slug: string;
  user: {
    plan: string;
    companyName: string | null;
    name: string;
  };
}

interface PlanLimits {
  maxRemindersPerMonth: number;
}

const PLAN_LIMITS_MAP: Record<string, PlanLimits> = {
  FREE: { maxRemindersPerMonth: 10 },
  STARTER: { maxRemindersPerMonth: 100 },
  PRO: { maxRemindersPerMonth: -1 },
};

export default function RemindersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();

  const [reminders, setReminders] = useState<EmailReminder[]>([]);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remindersThisMonth, setRemindersThisMonth] = useState(0);

  const fetchReminders = useCallback(async () => {
    try {
      const response = await fetch(`/api/reminders?projectId=${projectId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch reminders");
      }

      const data: EmailReminder[] = await response.json();
      setReminders(data);

      // Count reminders sent this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const thisMonthCount = data.filter(
        (r) => new Date(r.createdAt) >= startOfMonth
      ).length;
      setRemindersThisMonth(thisMonthCount);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch reminders";
      toast.error(message);
    }
  }, [projectId]);

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch project");
      }

      const data = await response.json();
      setProject({
        id: data.id,
        name: data.name,
        slug: data.slug,
        user: data.user || {
          plan: "FREE",
          companyName: null,
          name: "",
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch project";
      setError(message);
    }
  }, [projectId]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchProject(), fetchReminders()]);
      setLoading(false);
    }
    init();
  }, [fetchProject, fetchReminders]);

  const handleReminderSent = () => {
    fetchReminders();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive text-lg">
          {error || "Project not found"}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="size-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const planLimits = PLAN_LIMITS_MAP[project.user.plan] || PLAN_LIMITS_MAP.FREE;
  const isUnlimited = planLimits.maxRemindersPerMonth === -1;
  const companyName = project.user.companyName || project.name;
  const collectUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/collect/${project.slug}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Email Reminders
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Send testimonial request emails for {project.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Plan limit indicator */}
          <div className="flex items-center gap-2">
            <Mail className="text-muted-foreground size-4" />
            <span className="text-sm">
              {isUnlimited ? (
                <span className="text-muted-foreground">
                  Unlimited reminders
                </span>
              ) : (
                <>
                  <span className="font-medium">{remindersThisMonth}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    of {planLimits.maxRemindersPerMonth} used this month
                  </span>
                </>
              )}
            </span>
            {!isUnlimited && (
              <Badge
                variant="outline"
                className={
                  remindersThisMonth >= planLimits.maxRemindersPerMonth
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                }
              >
                {remindersThisMonth >= planLimits.maxRemindersPerMonth
                  ? "Limit reached"
                  : `${planLimits.maxRemindersPerMonth - remindersThisMonth} remaining`}
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleReminderSent}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Send Single Reminder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Single Reminder</CardTitle>
              <CardDescription>
                Send a testimonial request email to a specific person.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReminderForm
                projectId={projectId}
                onSuccess={handleReminderSent}
              />
            </CardContent>
          </Card>

          {/* Bulk Send */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bulk Send</CardTitle>
              <CardDescription>
                Upload a CSV file with recipient emails to send reminders in
                bulk. The CSV should have an &quot;email&quot; column and
                optionally a &quot;name&quot; column.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkUpload
                projectId={projectId}
                onSuccess={handleReminderSent}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Reminder History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reminder History</CardTitle>
              <CardDescription>
                Track the status of all sent reminders for this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReminderList reminders={reminders} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Email Preview */}
        <div>
          <EmailPreview
            companyName={companyName}
            collectUrl={collectUrl}
          />
        </div>
      </div>
    </div>
  );
}
