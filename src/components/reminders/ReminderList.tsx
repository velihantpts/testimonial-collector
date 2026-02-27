"use client";

import { Mail, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EmailReminder, ReminderStatus } from "@/types";

const STATUS_CONFIG: Record<
  ReminderStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  SENT: {
    label: "Sent",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  OPENED: {
    label: "Opened",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  SUBMITTED: {
    label: "Submitted",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ReminderListProps {
  reminders: EmailReminder[];
}

export function ReminderList({ reminders }: ReminderListProps) {
  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <Inbox className="text-muted-foreground mb-3 size-10" />
        <h3 className="mb-1 text-lg font-semibold">No reminders sent yet</h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          Send your first reminder using the form above to start collecting
          testimonials via email.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Recipient</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead>Opened</TableHead>
          <TableHead>Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reminders.map((reminder) => {
          const statusConfig = STATUS_CONFIG[reminder.status];

          return (
            <TableRow key={reminder.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground size-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {reminder.recipientEmail}
                    </p>
                    {reminder.recipientName && (
                      <p className="text-muted-foreground truncate text-xs">
                        {reminder.recipientName}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(reminder.sentAt)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(reminder.openedAt)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(reminder.submittedAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
