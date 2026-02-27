"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  Trash2,
  Palette,
  Star,
  Eye,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const collectPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  thankYouMessage: z.string(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
  collectVideo: z.boolean(),
  collectAvatar: z.boolean(),
  collectCompany: z.boolean(),
  collectWebsite: z.boolean(),
  promptQuestions: z.array(
    z.object({
      value: z.string().min(1, "Question cannot be empty"),
    })
  ),
});

type CollectPageFormValues = z.infer<typeof collectPageSchema>;

interface CollectPageData {
  id: string;
  projectId: string;
  title: string;
  description: string;
  thankYouMessage: string;
  brandColor: string;
  collectVideo: boolean;
  collectAvatar: boolean;
  collectCompany: boolean;
  collectWebsite: boolean;
  promptQuestions: string[];
  project: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function CollectPageSettings({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectSlug, setProjectSlug] = useState("");

  const form = useForm<CollectPageFormValues>({
    resolver: zodResolver(collectPageSchema),
    defaultValues: {
      title: "Share Your Experience",
      description:
        "We'd love to hear about your experience. Your feedback helps us improve and helps others make informed decisions.",
      thankYouMessage:
        "Thank you for your testimonial! We truly appreciate your feedback.",
      brandColor: "#6366f1",
      collectVideo: false,
      collectAvatar: true,
      collectCompany: true,
      collectWebsite: false,
      promptQuestions: [
        { value: "What was the problem you were facing?" },
        { value: "How did our product/service help?" },
        { value: "What results did you achieve?" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "promptQuestions",
  });

  const watchedValues = form.watch();

  useEffect(() => {
    async function fetchCollectPage() {
      try {
        const response = await fetch(`/api/projects/${projectId}/collect`);
        if (!response.ok) {
          throw new Error("Failed to fetch collect page settings");
        }
        const data: CollectPageData = await response.json();
        setProjectName(data.project.name);
        setProjectSlug(data.project.slug);
        form.reset({
          title: data.title,
          description: data.description,
          thankYouMessage: data.thankYouMessage,
          brandColor: data.brandColor,
          collectVideo: data.collectVideo,
          collectAvatar: data.collectAvatar,
          collectCompany: data.collectCompany,
          collectWebsite: data.collectWebsite,
          promptQuestions: data.promptQuestions.map((q) => ({ value: q })),
        });
      } catch {
        toast.error("Failed to load collect page settings");
      } finally {
        setLoading(false);
      }
    }

    fetchCollectPage();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: CollectPageFormValues) {
    try {
      setSaving(true);
      const response = await fetch(`/api/projects/${projectId}/collect`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          thankYouMessage: values.thankYouMessage,
          brandColor: values.brandColor,
          collectVideo: values.collectVideo,
          collectAvatar: values.collectAvatar,
          collectCompany: values.collectCompany,
          collectWebsite: values.collectWebsite,
          promptQuestions: values.promptQuestions.map((q) => q.value),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      toast.success("Collect page settings saved successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save settings";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-1 h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[600px] rounded-xl" />
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Collect Page Settings
            </h1>
            <p className="text-muted-foreground text-sm">
              {projectName} &middot; /{projectSlug}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`/collect/${projectSlug}`, "_blank")}
        >
          <Eye className="size-4" />
          View Live Page
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings" className="gap-2">
            <Settings2 className="size-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2 lg:hidden">
            <Eye className="size-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Settings Form */}
            <div className="space-y-6">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Content Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content</CardTitle>
                    <CardDescription>
                      Customize the text shown on your collect page.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Page Title</Label>
                      <Input
                        id="title"
                        placeholder="Share Your Experience"
                        {...form.register("title")}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell visitors what you're looking for..."
                        rows={3}
                        {...form.register("description")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="thankYouMessage">
                        Thank You Message
                      </Label>
                      <Textarea
                        id="thankYouMessage"
                        placeholder="Message shown after submission..."
                        rows={2}
                        {...form.register("thankYouMessage")}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Appearance Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="size-5" />
                      Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="brandColor">Brand Color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          id="brandColor"
                          value={watchedValues.brandColor}
                          onChange={(e) =>
                            form.setValue("brandColor", e.target.value)
                          }
                          className="h-10 w-14 cursor-pointer rounded-md border"
                        />
                        <Input
                          value={watchedValues.brandColor}
                          onChange={(e) =>
                            form.setValue("brandColor", e.target.value)
                          }
                          className="w-32 font-mono"
                        />
                      </div>
                      {form.formState.errors.brandColor && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.brandColor.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Fields Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Fields & Collection
                    </CardTitle>
                    <CardDescription>
                      Choose what information to collect from respondents.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Collect Video Testimonials</Label>
                        <p className="text-xs text-muted-foreground">
                          Allow visitors to record video
                        </p>
                      </div>
                      <Switch
                        checked={watchedValues.collectVideo}
                        onCheckedChange={(checked) =>
                          form.setValue("collectVideo", checked)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Collect Avatar</Label>
                        <p className="text-xs text-muted-foreground">
                          Ask for a profile photo
                        </p>
                      </div>
                      <Switch
                        checked={watchedValues.collectAvatar}
                        onCheckedChange={(checked) =>
                          form.setValue("collectAvatar", checked)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Collect Company</Label>
                        <p className="text-xs text-muted-foreground">
                          Ask for company name and job title
                        </p>
                      </div>
                      <Switch
                        checked={watchedValues.collectCompany}
                        onCheckedChange={(checked) =>
                          form.setValue("collectCompany", checked)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Collect Website</Label>
                        <p className="text-xs text-muted-foreground">
                          Ask for their website URL
                        </p>
                      </div>
                      <Switch
                        checked={watchedValues.collectWebsite}
                        onCheckedChange={(checked) =>
                          form.setValue("collectWebsite", checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Prompt Questions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prompt Questions</CardTitle>
                    <CardDescription>
                      Suggested questions to help respondents write better
                      testimonials.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Input
                          {...form.register(
                            `promptQuestions.${index}.value` as const
                          )}
                          placeholder="Enter a prompt question..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {form.formState.errors.promptQuestions && (
                      <p className="text-sm text-destructive">
                        Please fill in all questions
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ value: "" })}
                    >
                      <Plus className="size-4" />
                      Add Question
                    </Button>
                  </CardContent>
                </Card>

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
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Live Preview (desktop only) */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="size-5" />
                      Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CollectPagePreview values={watchedValues} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Mobile Preview Tab */}
        <TabsContent value="preview" className="lg:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="size-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CollectPagePreview values={watchedValues} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CollectPagePreview({
  values,
}: {
  values: CollectPageFormValues;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      {/* Header */}
      <div
        className="px-6 py-8 text-center text-white"
        style={{ backgroundColor: values.brandColor || "#6366f1" }}
      >
        <h3 className="text-lg font-semibold">{values.title || "Share Your Experience"}</h3>
        <p className="mt-2 text-sm opacity-90">
          {values.description ||
            "We'd love to hear about your experience."}
        </p>
      </div>

      {/* Body */}
      <div className="space-y-4 p-6">
        {/* Prompt Questions */}
        {values.promptQuestions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">
              Consider these questions:
            </p>
            <ul className="space-y-1">
              {values.promptQuestions
                .filter((q) => q.value)
                .map((q, i) => (
                  <li key={i} className="text-xs text-gray-500">
                    &bull; {q.value}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Star Rating */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-5 ${
                i < 4
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Mock Fields */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500">Your Name *</div>
            <div className="h-9 rounded-md border bg-gray-50" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500">
              Your Testimonial *
            </div>
            <div className="h-20 rounded-md border bg-gray-50" />
          </div>

          {values.collectCompany && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500">Company</div>
              <div className="h-9 rounded-md border bg-gray-50" />
            </div>
          )}

          {values.collectWebsite && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500">Website</div>
              <div className="h-9 rounded-md border bg-gray-50" />
            </div>
          )}

          {values.collectAvatar && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500">
                Profile Photo
              </div>
              <div className="flex h-16 items-center justify-center rounded-md border border-dashed bg-gray-50 text-xs text-gray-400">
                Upload photo
              </div>
            </div>
          )}

          {values.collectVideo && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500">
                Video Testimonial
              </div>
              <div className="flex h-16 items-center justify-center rounded-md border border-dashed bg-gray-50 text-xs text-gray-400">
                Record or upload video
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div
          className="h-10 rounded-md text-center text-sm font-medium leading-10 text-white"
          style={{ backgroundColor: values.brandColor || "#6366f1" }}
        >
          Submit Testimonial
        </div>
      </div>
    </div>
  );
}
