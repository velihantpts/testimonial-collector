"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Upload, Loader2, X, AlertCircle, Users, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Recipient {
  email: string;
  name?: string;
  valid: boolean;
}

interface BulkUploadProps {
  projectId: string;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BulkUpload({ projectId, onSuccess }: BulkUploadProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [sending, setSending] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setParseError(null);

    const file = acceptedFiles[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.errors.length > 0) {
          setParseError(
            `CSV parsing error: ${results.errors[0].message}`
          );
          return;
        }

        const data = results.data as Record<string, string>[];

        if (data.length === 0) {
          setParseError("CSV file is empty. Please include at least one row.");
          return;
        }

        // Try to detect email and name columns
        const headers = Object.keys(data[0] || {}).map((h) =>
          h.toLowerCase().trim()
        );
        const originalHeaders = Object.keys(data[0] || {});

        let emailKey: string | null = null;
        let nameKey: string | null = null;

        for (let i = 0; i < headers.length; i++) {
          const h = headers[i];
          if (
            !emailKey &&
            (h === "email" ||
              h === "e-mail" ||
              h === "email address" ||
              h === "emailaddress")
          ) {
            emailKey = originalHeaders[i];
          }
          if (
            !nameKey &&
            (h === "name" ||
              h === "full name" ||
              h === "fullname" ||
              h === "recipient" ||
              h === "recipient name")
          ) {
            nameKey = originalHeaders[i];
          }
        }

        // Fallback: if no email column found, try the first column
        if (!emailKey) {
          const firstValue = data[0]?.[originalHeaders[0]] || "";
          if (EMAIL_REGEX.test(firstValue.trim())) {
            emailKey = originalHeaders[0];
          }
        }

        if (!emailKey) {
          setParseError(
            'Could not find an email column. Please include a column named "email" in your CSV.'
          );
          return;
        }

        const parsed: Recipient[] = data.map((row) => {
          const email = (row[emailKey!] || "").trim();
          const name = nameKey ? (row[nameKey] || "").trim() : undefined;
          return {
            email,
            name: name || undefined,
            valid: EMAIL_REGEX.test(email),
          };
        });

        setRecipients(parsed);
      },
      error(error) {
        setParseError(`Failed to parse CSV: ${error.message}`);
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
  });

  const removeRecipient = (index: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const validRecipients = recipients.filter((r) => r.valid);
  const invalidCount = recipients.filter((r) => !r.valid).length;

  const handleSendAll = async () => {
    if (validRecipients.length === 0) {
      toast.error("No valid recipients to send to");
      return;
    }

    try {
      setSending(true);

      const response = await fetch("/api/reminders/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          recipients: validRecipients.map((r) => ({
            email: r.email,
            name: r.name,
          })),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to send batch reminders");
      }

      const result = await response.json();

      if (result.failed > 0) {
        toast.warning(
          `Sent ${result.sent} of ${result.total} reminders. ${result.failed} failed.`
        );
      } else {
        toast.success(
          `Successfully sent ${result.sent} reminder${result.sent !== 1 ? "s" : ""}!`
        );
      }

      setRecipients([]);
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send reminders";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleClearAll = () => {
    setRecipients([]);
    setParseError(null);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {recipients.length === 0 && (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="text-muted-foreground mx-auto mb-3 size-8" />
          {isDragActive ? (
            <p className="text-sm font-medium">Drop the CSV file here</p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Drag & drop a CSV file here, or click to select
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                CSV should have an &quot;email&quot; column and optionally a
                &quot;name&quot; column
              </p>
            </>
          )}
        </div>
      )}

      {/* Parse Error */}
      {parseError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">{parseError}</p>
        </div>
      )}

      {/* Preview Table */}
      {recipients.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="text-muted-foreground size-4" />
              <span className="text-sm font-medium">
                {validRecipients.length} valid recipient
                {validRecipients.length !== 1 ? "s" : ""}
              </span>
              {invalidCount > 0 && (
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                >
                  {invalidCount} invalid
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((recipient, index) => (
                  <TableRow
                    key={index}
                    className={
                      !recipient.valid ? "bg-red-50 dark:bg-red-950/30" : ""
                    }
                  >
                    <TableCell>
                      <span
                        className={
                          !recipient.valid
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }
                      >
                        {recipient.email || "(empty)"}
                      </span>
                      {!recipient.valid && (
                        <span className="ml-2 text-xs text-red-500">
                          Invalid email
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {recipient.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeRecipient(index)}
                      >
                        <X className="size-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button
            onClick={handleSendAll}
            disabled={sending || validRecipients.length === 0}
            className="w-full sm:w-auto"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {sending
              ? "Sending..."
              : `Send to ${validRecipients.length} recipient${validRecipients.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
