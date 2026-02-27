"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  LayoutGrid,
  Copy,
  Pencil,
  Trash2,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgets } from "@/hooks/useWidgets";

const LAYOUT_LABELS: Record<string, string> = {
  CAROUSEL: "Carousel",
  GRID: "Grid",
  LIST: "List",
  MASONRY: "Masonry",
  WALL_OF_LOVE: "Wall of Love",
  MINIMAL: "Minimal",
};

const THEME_LABELS: Record<string, string> = {
  LIGHT: "Light",
  DARK: "Dark",
  CUSTOM: "Custom",
};

export default function WidgetsListPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const { widgets, loading, error, deleteWidget } = useWidgets(projectId);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCopyEmbed = async (widgetId: string) => {
    const appUrl = window.location.origin;
    const embedCode = `<!-- TestimonialBox Widget -->
<div id="testimonialbox-widget" data-widget-id="${widgetId}"></div>
<script src="${appUrl}/widget.js" async></script>`;

    try {
      await navigator.clipboard.writeText(embedCode);
      toast.success("Embed code copied to clipboard!");
    } catch {
      toast.error("Failed to copy embed code");
    }
  };

  const handleDelete = async (widgetId: string) => {
    try {
      setDeletingId(widgetId);
      await deleteWidget(widgetId);
      toast.success("Widget deleted successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete widget";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive text-lg">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`/projects/${projectId}`)}
        >
          <ArrowLeft className="size-4" />
          Back to Project
        </Button>
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
            size="icon-sm"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Widgets</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Create and manage embed widgets for your website
            </p>
          </div>
        </div>
        <Button
          onClick={() =>
            router.push(`/projects/${projectId}/widgets/new`)
          }
        >
          <Plus className="size-4" />
          Create Widget
        </Button>
      </div>

      {/* Widget Grid */}
      {widgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <LayoutGrid className="text-muted-foreground mb-4 size-12" />
            <h3 className="mb-2 text-lg font-semibold">No widgets yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm text-sm">
              Create a widget to embed testimonials on your website. Customize
              the layout, theme, and display options.
            </p>
            <Button
              onClick={() =>
                router.push(`/projects/${projectId}/widgets/new`)
              }
            >
              <Plus className="size-4" />
              Create Your First Widget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <Card
              key={widget.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() =>
                router.push(
                  `/projects/${projectId}/widgets/${widget.id}`
                )
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-lg">
                      {widget.name}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/projects/${projectId}/widgets/${widget.id}`
                          );
                        }}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyEmbed(widget.id);
                        }}
                      >
                        <Copy className="size-4" />
                        Copy Embed Code
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(widget.id);
                        }}
                        disabled={deletingId === widget.id}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {LAYOUT_LABELS[widget.layout] || widget.layout}
                  </Badge>
                  <Badge variant="outline">
                    {THEME_LABELS[widget.theme] || widget.theme}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Calendar className="size-3" />
                  Created{" "}
                  {new Date(widget.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
