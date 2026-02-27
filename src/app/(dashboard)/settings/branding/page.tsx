"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  Loader2,
  Save,
  Upload,
  X,
  Building2,
  Palette,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const brandingSchema = z.object({
  companyName: z.string().optional(),
  companyLogo: z.string().optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

interface UserSettings {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  companyLogo: string | null;
}

export default function BrandingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      companyName: "",
      companyLogo: "",
      brandColor: "#6366f1",
    },
  });

  const brandColor = form.watch("brandColor");
  const companyName = form.watch("companyName");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data: UserSettings = await response.json();
        form.reset({
          companyName: data.companyName ?? "",
          companyLogo: data.companyLogo ?? "",
          brandColor: "#6366f1",
        });
        if (data.companyLogo) {
          setLogoPreview(data.companyLogo);
        }
      } catch {
        toast.error("Failed to load branding settings");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const { url } = await response.json();
        form.setValue("companyLogo", url);
        setLogoPreview(url);
        toast.success("Logo uploaded successfully");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload logo";
        toast.error(message);
      } finally {
        setUploading(false);
      }
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  function handleRemoveLogo() {
    form.setValue("companyLogo", "");
    setLogoPreview(null);
  }

  async function onSubmit(values: BrandingFormValues) {
    try {
      setSaving(true);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: values.companyName,
          companyLogo: values.companyLogo,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save branding");
      }

      toast.success("Branding settings saved successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save branding";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Branding</h1>
        <p className="text-muted-foreground">
          Customize how your brand appears on collect pages and widgets.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Company Details
              </CardTitle>
              <CardDescription>
                Your company name and logo shown on collect pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g. Acme Design Studio"
                    {...form.register("companyName")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  {logoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Company logo"
                        className="h-20 w-20 rounded-lg border object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow-sm hover:bg-destructive/90"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                        isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50"
                      }`}
                    >
                      <input {...getInputProps()} />
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="size-8 animate-spin text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Uploading...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="size-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {isDragActive
                              ? "Drop your logo here"
                              : "Drag & drop your logo, or click to browse"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, or WebP. Max 5MB.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="brandColor" className="flex items-center gap-2">
                    <Palette className="size-4" />
                    Default Brand Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="brandColor"
                      value={brandColor}
                      onChange={(e) =>
                        form.setValue("brandColor", e.target.value)
                      }
                      className="h-10 w-14 cursor-pointer rounded-md border"
                    />
                    <Input
                      value={brandColor}
                      onChange={(e) =>
                        form.setValue("brandColor", e.target.value)
                      }
                      placeholder="#6366f1"
                      className="w-32 font-mono"
                    />
                  </div>
                  {form.formState.errors.brandColor && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.brandColor.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Used as the default color for new collect pages.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        Save Branding
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How your branding will appear on collect pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border bg-white">
                {/* Preview Header */}
                <div
                  className="px-6 py-8 text-center text-white"
                  style={{ backgroundColor: brandColor || "#6366f1" }}
                >
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="mx-auto mb-4 h-12 w-12 rounded-lg bg-white/20 object-contain p-1"
                    />
                  )}
                  <h3 className="text-lg font-semibold">
                    {companyName || "Your Company"}
                  </h3>
                  <p className="mt-1 text-sm opacity-90">
                    Share Your Experience
                  </p>
                </div>

                {/* Preview Body */}
                <div className="space-y-4 p-6">
                  <p className="text-sm text-gray-600">
                    We&apos;d love to hear about your experience. Your feedback
                    helps us improve.
                  </p>

                  {/* Mock stars */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-6 ${
                          i < 4
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Mock form fields */}
                  <div className="space-y-3">
                    <div className="h-10 rounded-md border bg-gray-50" />
                    <div className="h-24 rounded-md border bg-gray-50" />
                    <div
                      className="h-10 rounded-md text-center text-sm font-medium leading-10 text-white"
                      style={{ backgroundColor: brandColor || "#6366f1" }}
                    >
                      Submit Testimonial
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
