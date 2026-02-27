"use client";

import { useState, useEffect, useCallback } from "react";
import type { Widget } from "@/types";
import type { CreateWidgetInput } from "@/lib/validations";

interface UseWidgetsReturn {
  widgets: Widget[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createWidget: (data: CreateWidgetInput) => Promise<Widget>;
  updateWidget: (
    widgetId: string,
    data: Partial<CreateWidgetInput>
  ) => Promise<Widget>;
  deleteWidget: (widgetId: string) => Promise<void>;
}

export function useWidgets(projectId: string): UseWidgetsReturn {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/widgets?projectId=${encodeURIComponent(projectId)}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch widgets");
      }

      const data = await response.json();
      setWidgets(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch widgets";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createWidget = useCallback(
    async (data: CreateWidgetInput): Promise<Widget> => {
      const response = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create widget");
      }

      const widget = await response.json();
      setWidgets((prev) => [widget, ...prev]);
      return widget;
    },
    []
  );

  const updateWidget = useCallback(
    async (
      widgetId: string,
      data: Partial<CreateWidgetInput>
    ): Promise<Widget> => {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update widget");
      }

      const widget = await response.json();
      setWidgets((prev) =>
        prev.map((w) => (w.id === widgetId ? widget : w))
      );
      return widget;
    },
    []
  );

  const deleteWidget = useCallback(async (widgetId: string) => {
    const response = await fetch(`/api/widgets/${widgetId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete widget");
    }

    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  }, []);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  return {
    widgets,
    loading,
    error,
    refetch: fetchWidgets,
    createWidget,
    updateWidget,
    deleteWidget,
  };
}
