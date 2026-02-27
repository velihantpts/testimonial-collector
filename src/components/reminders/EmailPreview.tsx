import { Eye } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EmailPreviewProps {
  companyName: string;
  recipientName?: string;
  collectUrl: string;
}

export function EmailPreview({
  companyName,
  recipientName,
  collectUrl,
}: EmailPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="text-muted-foreground size-4" />
          <CardTitle className="text-sm font-medium">Email Preview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-white p-6 dark:bg-gray-950">
          {/* Email Subject */}
          <div className="mb-4 border-b pb-3">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Subject
            </p>
            <p className="mt-1 text-sm font-medium">
              {companyName} would love your feedback
            </p>
          </div>

          {/* Email Body */}
          <div
            style={{ fontFamily: "'Inter', sans-serif", maxWidth: 600 }}
          >
            <h2
              style={{
                color: "#111827",
                marginBottom: 16,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Hi {recipientName || "there"},
            </h2>
            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.6,
                marginBottom: 24,
                fontSize: 14,
              }}
            >
              {companyName} values your opinion and would love to hear about
              your experience.
            </p>
            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.6,
                marginBottom: 32,
                fontSize: 14,
              }}
            >
              It only takes 2 minutes:
            </p>
            <a
              href={collectUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#6366f1",
                color: "white",
                padding: "12px 32px",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              Leave a Testimonial
            </a>
            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.6,
                marginTop: 32,
                fontSize: 14,
              }}
            >
              Your feedback helps us improve and helps others make informed
              decisions.
            </p>
            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.6,
                marginTop: 24,
                fontSize: 14,
              }}
            >
              Thank you!
              <br />
              {companyName}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
