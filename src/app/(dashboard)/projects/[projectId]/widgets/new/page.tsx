"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  WidgetCustomizer,
  type WidgetFormValues,
} from "@/components/widgets/WidgetCustomizer";
import { WidgetPreview } from "@/components/widgets/WidgetPreview";
import { useWidgets } from "@/hooks/useWidgets";
import type { WidgetConfig } from "@/components/widgets/CarouselWidget";

const DEFAULT_VALUES: WidgetFormValues = {
  name: "My Widget",
  layout: "CAROUSEL",
  theme: "LIGHT",
  bgColor: "#ffffff",
  textColor: "#111827",
  starColor: "#f59e0b",
  borderRadius: 12,
  showRating: true,
  showAvatar: true,
  showCompany: true,
  showDate: false,
  autoplay: true,
  autoplaySpeed: 5,
  maxDisplay: 5,
};

export default function NewWidgetPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const { createWidget } = useWidgets(projectId);
  const [saving, setSaving] = useState(false);
  const [previewConfig, setPreviewConfig] =
    useState<WidgetConfig>(DEFAULT_VALUES);

  const handleChange = (values: WidgetFormValues) => {
    setPreviewConfig(values);
  };

  const handleCreate = async (values: WidgetFormValues) => {
    try {
      setSaving(true);
      const { name, theme, layout, ...rest } = values;
      const widget = await createWidget({
        name,
        projectId,
        theme: theme as "LIGHT" | "DARK" | "CUSTOM",
        layout: layout as "CAROUSEL" | "GRID" | "LIST" | "MASONRY" | "WALL_OF_LOVE" | "MINIMAL",
        ...rest,
      });
      toast.success("Widget created successfully!");
      router.push(`/projects/${projectId}/widgets/${widget.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create widget";
      toast.error(message);
    } finally {
      setSaving(false);
    }
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
              Create Widget
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Customize and create a new embed widget
            </p>
          </div>
        </div>
        <Button
          type="submit"
          form="widget-form"
          disabled={saving}
          onClick={() => {
            // Trigger form submit via the form id
          }}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Create Widget
        </Button>
      </div>

      {/* Split View */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left: Customizer */}
        <div className="rounded-lg border p-6">
          <WidgetCustomizer
            defaultValues={DEFAULT_VALUES}
            onChange={handleChange}
            onSubmit={handleCreate}
          />
        </div>

        {/* Right: Preview */}
        <div className="rounded-lg border p-6">
          <WidgetPreview config={previewConfig} />
        </div>
      </div>
    </div>
  );
}
