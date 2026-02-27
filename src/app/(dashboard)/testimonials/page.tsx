"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  LayoutGrid,
  List,
  MessageSquareQuote,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { FilterBar } from "@/components/testimonials/FilterBar";
import { BulkActions } from "@/components/testimonials/BulkActions";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useProjects } from "@/hooks/useProjects";

export default function TestimonialsPage() {
  // Filter state
  const [status, setStatus] = useState("ALL");
  const [rating, setRating] = useState("any");
  const [projectId, setProjectId] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }

  // Fetch data
  const { projects } = useProjects();
  const {
    testimonials,
    total,
    totalPages,
    loading,
    error,
    approveTestimonial,
    rejectTestimonial,
    deleteTestimonial,
    updateTestimonial,
    bulkApprove,
    bulkReject,
    bulkDelete,
    refetch,
  } = useTestimonials({
    projectId: projectId !== "all" ? projectId : undefined,
    status: status !== "ALL" ? status : undefined,
    rating: rating !== "any" ? rating : undefined,
    search: debouncedSearch || undefined,
    sort,
    page,
  });

  // Selection handlers
  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(testimonials.map((t) => t.id)));
  }, [testimonials]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const allSelected = useMemo(
    () =>
      testimonials.length > 0 &&
      testimonials.every((t) => selectedIds.has(t.id)),
    [testimonials, selectedIds]
  );

  // Action handlers
  async function handleApprove(id: string) {
    try {
      await approveTestimonial(id);
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectTestimonial(id);
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTestimonial(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  async function handleToggleFavorite(id: string, isFavorite: boolean) {
    try {
      await updateTestimonial(id, { isFavorite });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  }

  // Bulk action handlers
  async function handleBulkApprove() {
    try {
      await bulkApprove(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Failed to bulk approve:", err);
    }
  }

  async function handleBulkReject() {
    try {
      await bulkReject(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Failed to bulk reject:", err);
    }
  }

  async function handleBulkDelete() {
    try {
      await bulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Failed to bulk delete:", err);
    }
  }

  // Filter change handlers that reset page
  function handleStatusChange(value: string) {
    setStatus(value);
    setPage(1);
  }

  function handleRatingChange(value: string) {
    setRating(value);
    setPage(1);
  }

  function handleProjectChange(value: string) {
    setProjectId(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage and review all your testimonials
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{total} total</span>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        status={status}
        onStatusChange={handleStatusChange}
        rating={rating}
        onRatingChange={handleRatingChange}
        projectId={projectId}
        onProjectChange={handleProjectChange}
        search={search}
        onSearchChange={handleSearchChange}
        projects={projects}
      />

      {/* Toolbar: sort + view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px]" size="sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          <Button
            variant={layout === "grid" ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={() => setLayout("grid")}
            title="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={layout === "list" ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={() => setLayout("list")}
            title="List view"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Bulk actions */}
      <BulkActions
        selectedCount={selectedIds.size}
        totalCount={testimonials.length}
        onApproveAll={handleBulkApprove}
        onRejectAll={handleBulkReject}
        onDeleteAll={handleBulkDelete}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        allSelected={allSelected}
      />

      {/* Loading state */}
      {loading && (
        <div
          className={
            layout === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          }
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-0">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-12 w-full" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && testimonials.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MessageSquareQuote className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No testimonials yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || status !== "ALL" || rating !== "any"
                ? "No testimonials match your filters. Try adjusting your search criteria."
                : "Start collecting testimonials by sharing your collect page link with customers."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Testimonials grid/list */}
      {!loading && !error && testimonials.length > 0 && (
        <div
          className={
            layout === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          }
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              selected={selectedIds.has(testimonial.id)}
              onSelect={handleSelect}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              layout={layout}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of{" "}
            {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="icon-xs"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
