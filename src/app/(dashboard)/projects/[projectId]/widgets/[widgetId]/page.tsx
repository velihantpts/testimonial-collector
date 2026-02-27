"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  WidgetCustomizer,
  type WidgetFormValues,
} from "@/components/widgets/WidgetCustomizer";
import { WidgetPreview } from "@/components/widgets/WidgetPreview";
import { EmbedCodeBlock } from "@/components/widgets/EmbedCodeBlock";
import type { Widget } from "@/types";
import type { WidgetConfig } from "@/components/widgets/CarouselWidget";

export default function WidgetEditorPage({
  params,
}: {
  params: Promise<{ projectId: string; widgetId: string }>;
}) {
  const { projectId, widgetId } = use(params);
  const router = useRouter();
  const [widget, setWidget] = useState<Widget | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewConfig, setPreviewConfig] = useState<WidgetConfig | null>(null);
  const [formValues, setFormValues] = useState<WidgetFormValues | null>(null);

  useEffect(() => {
    async function fetchWidget() {
      try {
        setLoading(true);
        const response = await fetch(`/api/widgets/${widgetId}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch widget");
        }

        const data = await response.json();
        setWidget(data);
        setPreviewConfig({
          theme: data.theme,
          layout: data.layout,
          bgColor: data.bgColor,
          textColor: data.textColor,
          starColor: data.starColor,
          borderRadius: data.borderRadius,
          showRating: data.showRating,
          showAvatar: data.showAvatar,
          showCompany: data.showCompany,
          showDate: data.showDate,
          autoplay: data.autoplay,
          autoplaySpeed: data.autoplaySpeed,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch widget";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchWidget();
  }, [widgetId]);

  const handleChange = (values: WidgetFormValues) => {
    setFormValues(values);
    setPreviewConfig(values);
  };

  const handleSave = async () => {
    if (!formValues) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update widget");
      }

      const updatedWidget = await response.json();
      setWidget(updatedWidget);
      toast.success("Widget saved successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save widget";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <Skeleton className="h-[600px] rounded-xl" />
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !widget) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive text-lg">
          {error || "Widget not found"}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() =>
            router.push(`/projects/${projectId}/widgets`)
          }
        >
          <ArrowLeft className="size-4" />
          Back to Widgets
        </Button>
      </div>
    );
  }

  const defaultValues: WidgetFormValues = {
    name: widget.name,
    layout: widget.layout,
    theme: widget.theme,
    bgColor: widget.bgColor,
    textColor: widget.textColor,
    starColor: widget.starColor,
    borderRadius: widget.borderRadius,
    showRating: widget.showRating,
    showAvatar: widget.showAvatar,
    showCompany: widget.showCompany,
    showDate: widget.showDate,
    autoplay: widget.autoplay,
    autoplaySpeed: widget.autoplaySpeed,
    maxDisplay: widget.maxDisplay,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              router.push(`/projects/${projectId}/widgets`)
            }
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Widget
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {widget.name}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Split View */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left: Customizer */}
        <div className="rounded-lg border p-6">
          <WidgetCustomizer
            defaultValues={defaultValues}
            onChange={handleChange}
          />
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            {previewConfig && <WidgetPreview config={previewConfig} />}
          </div>
        </div>
      </div>

      <Separator />

      {/* Embed Code */}
      <EmbedCodeBlock widgetId={widgetId} />
    </div>
  );
}
