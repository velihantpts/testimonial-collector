"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardStats } from "@/types";

interface UseStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/stats");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch stats";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
