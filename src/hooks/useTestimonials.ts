"use client";

import { useState, useEffect, useCallback } from "react";
import type { TestimonialWithProject } from "@/types";

interface UseTestimonialsFilters {
  projectId?: string;
  status?: string;
  rating?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

interface UseTestimonialsReturn {
  testimonials: TestimonialWithProject[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  approveTestimonial: (id: string) => Promise<void>;
  rejectTestimonial: (id: string) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  updateTestimonial: (
    id: string,
    data: Record<string, unknown>
  ) => Promise<TestimonialWithProject>;
  bulkApprove: (ids: string[]) => Promise<void>;
  bulkReject: (ids: string[]) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
}

export function useTestimonials(
  filters: UseTestimonialsFilters = {}
): UseTestimonialsReturn {
  const [testimonials, setTestimonials] = useState<TestimonialWithProject[]>(
    []
  );
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.projectId) params.set("projectId", filters.projectId);
      if (filters.status && filters.status !== "ALL")
        params.set("status", filters.status);
      if (filters.rating) params.set("rating", filters.rating);
      if (filters.search) params.set("search", filters.search);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.page) params.set("page", filters.page.toString());
      if (filters.limit) params.set("limit", filters.limit.toString());

      const response = await fetch(`/api/testimonials?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch testimonials");
      }

      const data = await response.json();
      setTestimonials(data.testimonials);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch testimonials";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [
    filters.projectId,
    filters.status,
    filters.rating,
    filters.search,
    filters.sort,
    filters.page,
    filters.limit,
  ]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const approveTestimonial = useCallback(async (id: string) => {
    const response = await fetch(`/api/testimonials/${id}/approve`, {
      method: "PATCH",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to approve testimonial");
    }

    const updated = await response.json();
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? updated : t))
    );
  }, []);

  const rejectTestimonial = useCallback(async (id: string) => {
    const response = await fetch(`/api/testimonials/${id}/reject`, {
      method: "PATCH",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to reject testimonial");
    }

    const updated = await response.json();
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? updated : t))
    );
  }, []);

  const deleteTestimonial = useCallback(async (id: string) => {
    const response = await fetch(`/api/testimonials/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete testimonial");
    }

    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    setTotal((prev) => prev - 1);
  }, []);

  const updateTestimonial = useCallback(
    async (
      id: string,
      data: Record<string, unknown>
    ): Promise<TestimonialWithProject> => {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update testimonial");
      }

      const updated = await response.json();
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
      return updated;
    },
    []
  );

  const bulkApprove = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => approveTestimonial(id)));
    },
    [approveTestimonial]
  );

  const bulkReject = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => rejectTestimonial(id)));
    },
    [rejectTestimonial]
  );

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteTestimonial(id)));
    },
    [deleteTestimonial]
  );

  return {
    testimonials,
    total,
    totalPages,
    loading,
    error,
    refetch: fetchTestimonials,
    approveTestimonial,
    rejectTestimonial,
    deleteTestimonial,
    updateTestimonial,
    bulkApprove,
    bulkReject,
    bulkDelete,
  };
}
