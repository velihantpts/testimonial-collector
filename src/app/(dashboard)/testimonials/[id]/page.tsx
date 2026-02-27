"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Trash2,
  Heart,
  Pencil,
  Save,
  Plus,
  Copy,
  Sparkles,
  ExternalLink,
  Mail,
  Building2,
  Briefcase,
  Globe,
  Calendar,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RatingStars } from "@/components/testimonials/RatingStars";
import { StatusBadge } from "@/components/testimonials/StatusBadge";
import type { TestimonialWithProject } from "@/types";

export default function TestimonialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [testimonial, setTestimonial] =
    useState<TestimonialWithProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [saving, setSaving] = useState(false);

  // Tags state
  const [tagInput, setTagInput] = useState("");

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // AI Variants
  const [generatingAI, setGeneratingAI] = useState(false);

  // User plan (fetched from session)
  const [userPlan, setUserPlan] = useState<string>("FREE");

  const fetchTestimonial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/testimonials/${id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch testimonial");
      }

      const data = await response.json();
      setTestimonial(data);
      setEditText(data.text);
      setEditRating(data.rating);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch testimonial";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTestimonial();
  }, [fetchTestimonial]);

  // Fetch user plan
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.plan) {
          setUserPlan(data.user.plan);
        }
      })
      .catch(() => {
        // Ignore session fetch errors
      });
  }, []);

  async function handleApprove() {
    if (!testimonial) return;
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}/approve`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updated = await res.json();
        setTestimonial(updated);
      }
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  }

  async function handleReject() {
    if (!testimonial) return;
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}/reject`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updated = await res.json();
        setTestimonial(updated);
      }
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  }

  async function handleDelete() {
    if (!testimonial) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/testimonials");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleFavorite() {
    if (!testimonial) return;
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !testimonial.isFavorite }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTestimonial(updated);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  }

  async function handleSaveEdit() {
    if (!testimonial) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText, rating: editRating }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTestimonial(updated);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to save edit:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTag() {
    if (!testimonial || !tagInput.trim()) return;
    const newTags = [...(testimonial.tags || []), tagInput.trim()];
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTestimonial(updated);
        setTagInput("");
      }
    } catch (err) {
      console.error("Failed to add tag:", err);
    }
  }

  async function handleRemoveTag(tagToRemove: string) {
    if (!testimonial) return;
    const newTags = (testimonial.tags || []).filter((t) => t !== tagToRemove);
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTestimonial(updated);
      }
    } catch (err) {
      console.error("Failed to remove tag:", err);
    }
  }

  async function handleGenerateAIVariants() {
    if (!testimonial) return;
    setGeneratingAI(true);
    try {
      const res = await fetch(
        `/api/testimonials/${testimonial.id}/ai-variants`,
        { method: "POST" }
      );
      if (res.ok) {
        const updated = await res.json();
        setTestimonial(updated);
      }
    } catch (err) {
      console.error("Failed to generate AI variants:", err);
    } finally {
      setGeneratingAI(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-0">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-0 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !testimonial) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/testimonials" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Testimonials
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">
              {error || "Testimonial not found"}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={fetchTestimonial}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = testimonial.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = new Date(testimonial.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );

  const isPro = userPlan === "PRO";

  return (
    <div className="space-y-6">
      {/* Back button + heading */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/testimonials" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Testimonials
          </Link>
        </Button>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {testimonial.status === "PENDING" && (
            <>
              <Button
                size="sm"
                className="bg-[#22c55e] text-white hover:bg-[#22c55e]/90"
                onClick={handleApprove}
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[#ef4444] hover:bg-[#ef4444]/10"
                onClick={handleReject}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          {testimonial.status === "REJECTED" && (
            <Button
              size="sm"
              className="bg-[#22c55e] text-white hover:bg-[#22c55e]/90"
              onClick={handleApprove}
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
          )}
          {testimonial.status === "APPROVED" && (
            <Button
              variant="outline"
              size="sm"
              className="text-[#ef4444] hover:bg-[#ef4444]/10"
              onClick={handleReject}
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
            className={
              testimonial.isFavorite ? "text-[#f59e0b]" : "text-muted-foreground"
            }
          >
            <Heart
              className={`h-4 w-4 ${testimonial.isFavorite ? "fill-current" : ""}`}
            />
            {testimonial.isFavorite ? "Favorited" : "Favorite"}
          </Button>

          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="text-[#ef4444] hover:bg-[#ef4444]/10"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Testimonial content */}
          <Card>
            <CardContent className="pt-0">
              <div className="flex items-start gap-4">
                {/* Large avatar */}
                <Avatar className="h-16 w-16 text-lg">
                  <AvatarImage src={testimonial.avatar ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">
                      {testimonial.name}
                    </h2>
                    <StatusBadge status={testimonial.status} />
                  </div>

                  {(testimonial.jobTitle || testimonial.company) && (
                    <p className="mt-0.5 text-muted-foreground">
                      {[testimonial.jobTitle, testimonial.company]
                        .filter(Boolean)
                        .join(" at ")}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="mt-2">
                    {isEditing ? (
                      <RatingStars
                        rating={editRating}
                        size="lg"
                        interactive
                        onChange={setEditRating}
                      />
                    ) : (
                      <RatingStars rating={testimonial.rating} size="lg" />
                    )}
                  </div>

                  {/* Text */}
                  <Separator className="my-4" />

                  {isEditing ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={6}
                      className="w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  ) : (
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {testimonial.text}
                    </p>
                  )}

                  {/* Video */}
                  {testimonial.videoUrl && (
                    <div className="mt-4">
                      <video
                        src={testimonial.videoUrl}
                        controls
                        className="w-full max-w-lg rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
              <CardDescription>Organize testimonials with tags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(testimonial.tags || []).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="max-w-[200px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Variants panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
                    AI Variants
                  </CardTitle>
                  <CardDescription>
                    Generate optimized versions for different platforms
                  </CardDescription>
                </div>
                {isPro && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateAIVariants}
                    disabled={generatingAI}
                  >
                    <Sparkles className="h-4 w-4" />
                    {generatingAI ? "Generating..." : "Generate Variants"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isPro ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-3 font-semibold">Pro Plan Feature</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    AI-generated variants are available on the Pro plan.
                    Automatically create tweet-sized, LinkedIn, and email quote
                    versions of your testimonials.
                  </p>
                  <Button size="sm" className="mt-4" asChild>
                    <Link href="/settings/billing">Upgrade to Pro</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tweet version */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Tweet Version</h4>
                      {testimonial.tweetVersion && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            copyToClipboard(testimonial.tweetVersion!)
                          }
                          title="Copy"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.tweetVersion ||
                        "Click 'Generate Variants' to create a tweet-sized version."}
                    </p>
                  </div>

                  {/* LinkedIn version */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">LinkedIn Version</h4>
                      {testimonial.linkedInVersion && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            copyToClipboard(testimonial.linkedInVersion!)
                          }
                          title="Copy"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.linkedInVersion ||
                        "Click 'Generate Variants' to create a LinkedIn version."}
                    </p>
                  </div>

                  {/* Email quote */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Email Quote</h4>
                      {testimonial.emailQuote && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            copyToClipboard(testimonial.emailQuote!)
                          }
                          title="Copy"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.emailQuote ||
                        "Click 'Generate Variants' to create an email quote version."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - metadata */}
        <div className="space-y-6">
          {/* Metadata card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Submitted date */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="text-sm">{formattedDate}</p>
                  </div>
                </div>

                {/* Email */}
                {testimonial.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${testimonial.email}`}
                        className="text-sm text-primary hover:underline truncate block"
                      >
                        {testimonial.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Company */}
                {testimonial.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-sm">{testimonial.company}</p>
                    </div>
                  </div>
                )}

                {/* Job title */}
                {testimonial.jobTitle && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Job Title</p>
                      <p className="text-sm">{testimonial.jobTitle}</p>
                    </div>
                  </div>
                )}

                {/* Website */}
                {testimonial.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a
                        href={testimonial.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate block inline-flex items-center gap-1"
                      >
                        {testimonial.website.replace(/^https?:\/\//, "")}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Project info */}
                {testimonial.project && (
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Project</p>
                      <Link
                        href={`/projects/${testimonial.project.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {testimonial.project.name}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Favorite status */}
                <div className="flex items-center gap-3">
                  <Heart
                    className={`h-4 w-4 shrink-0 ${
                      testimonial.isFavorite
                        ? "text-[#f59e0b] fill-[#f59e0b]"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Favorite</p>
                    <p className="text-sm">
                      {testimonial.isFavorite ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this testimonial?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this
              testimonial from &ldquo;{testimonial.name}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
