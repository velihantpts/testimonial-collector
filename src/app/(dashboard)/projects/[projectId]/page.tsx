"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Link2,
  LayoutGrid,
  Mail,
  MessageSquare,
  Star,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project, Testimonial, CollectPage } from "@/types";

interface ProjectDetail extends Project {
  _count: {
    testimonials: number;
    widgets: number;
  };
  collectPage: CollectPage | null;
  testimonials: Testimonial[];
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch project");
        }

        const data = await response.json();
        setProject(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch project";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  const handleCopyLink = async () => {
    if (!project) return;
    const collectLink = `${window.location.origin}/collect/${project.slug}`;
    try {
      await navigator.clipboard.writeText(collectLink);
      toast.success("Collect link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive text-lg">
          {error || "Project not found"}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="size-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(project.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/projects")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              /{project.slug} &middot; Created {formattedDate}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <Link2 className="size-4" />
            Share Collect Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projects/${project.id}/widgets`)}
          >
            <LayoutGrid className="size-4" />
            Manage Widgets
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projects/${project.id}/reminders`)}
          >
            <Mail className="size-4" />
            Send Reminders
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/projects/${project.id}/settings`)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Testimonials</CardDescription>
            <CardTitle className="text-3xl">
              {project._count.testimonials}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              Across all statuses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Widgets</CardDescription>
            <CardTitle className="text-3xl">
              {project._count.widgets}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              Embeddable components
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Collect Page</CardDescription>
            <CardTitle className="text-lg">
              {project.collectPage ? "Active" : "Not Set Up"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() =>
                window.open(`/collect/${project.slug}`, "_blank")
              }
            >
              <ExternalLink className="size-3" />
              View collect page
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testimonials">
            Testimonials ({project._count.testimonials})
          </TabsTrigger>
          <TabsTrigger value="widgets">
            Widgets ({project._count.widgets})
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Recent Testimonials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Testimonials</CardTitle>
              <CardDescription>
                The latest testimonials submitted for this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.testimonials.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MessageSquare className="text-muted-foreground mb-3 size-8" />
                  <p className="text-muted-foreground text-sm">
                    No testimonials yet. Share your collect link to get started!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleCopyLink}
                  >
                    <Link2 className="size-4" />
                    Copy Collect Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="flex gap-4 rounded-lg border p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {testimonial.name}
                          </span>
                          <Badge
                            variant={
                              testimonial.status === "APPROVED"
                                ? "default"
                                : testimonial.status === "PENDING"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {testimonial.status.toLowerCase()}
                          </Badge>
                        </div>
                        {testimonial.company && (
                          <p className="text-muted-foreground text-xs">
                            {testimonial.jobTitle
                              ? `${testimonial.jobTitle} at `
                              : ""}
                            {testimonial.company}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${
                                i < testimonial.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                          {testimonial.text}
                        </p>
                        <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                          <Clock className="size-3" />
                          {new Date(
                            testimonial.createdAt
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto justify-start gap-3 p-4"
                  onClick={handleCopyLink}
                >
                  <Link2 className="size-5" />
                  <div className="text-left">
                    <p className="font-medium">Share Collect Link</p>
                    <p className="text-muted-foreground text-xs">
                      Copy your testimonial collection URL
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto justify-start gap-3 p-4"
                  onClick={() =>
                    router.push(`/projects/${project.id}/widgets`)
                  }
                >
                  <LayoutGrid className="size-5" />
                  <div className="text-left">
                    <p className="font-medium">Create Widget</p>
                    <p className="text-muted-foreground text-xs">
                      Embed testimonials on your website
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto justify-start gap-3 p-4"
                  onClick={() =>
                    router.push(`/projects/${project.id}/reminders`)
                  }
                >
                  <Mail className="size-5" />
                  <div className="text-left">
                    <p className="font-medium">Send Reminders</p>
                    <p className="text-muted-foreground text-xs">
                      Email customers to request testimonials
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto justify-start gap-3 p-4"
                  onClick={() =>
                    window.open(`/collect/${project.slug}`, "_blank")
                  }
                >
                  <ExternalLink className="size-5" />
                  <div className="text-left">
                    <p className="font-medium">Preview Collect Page</p>
                    <p className="text-muted-foreground text-xs">
                      See what your customers will see
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Testimonials</CardTitle>
              <CardDescription>
                Manage testimonials for this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project._count.testimonials === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MessageSquare className="text-muted-foreground mb-3 size-8" />
                  <p className="text-muted-foreground text-sm">
                    No testimonials yet. Share your collect link to get started!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleCopyLink}
                  >
                    <Link2 className="size-4" />
                    Copy Collect Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="flex gap-4 rounded-lg border p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {testimonial.name}
                          </span>
                          <Badge
                            variant={
                              testimonial.status === "APPROVED"
                                ? "default"
                                : testimonial.status === "PENDING"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {testimonial.status.toLowerCase()}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${
                                i < testimonial.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground mt-2 text-sm">
                          {testimonial.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {project._count.testimonials > project.testimonials.length && (
                    <p className="text-muted-foreground text-center text-sm">
                      Showing {project.testimonials.length} of{" "}
                      {project._count.testimonials} testimonials.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Widgets</CardTitle>
                  <CardDescription>
                    Embed testimonial widgets on your website.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/projects/${project.id}/widgets`)
                  }
                >
                  Manage Widgets
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project._count.widgets === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <LayoutGrid className="text-muted-foreground mb-3 size-8" />
                  <p className="text-muted-foreground text-sm">
                    No widgets yet. Create a widget to embed testimonials on
                    your website.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  You have {project._count.widgets}{" "}
                  {project._count.widgets === 1 ? "widget" : "widgets"}.
                  Click &quot;Manage Widgets&quot; to view and configure them.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Settings</CardTitle>
              <CardDescription>
                Update your project name, slug, and other settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Project Name</p>
                  <p className="text-muted-foreground text-sm">
                    {project.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Slug</p>
                  <p className="text-muted-foreground text-sm">
                    {project.slug}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Collect Page URL</p>
                  <p className="text-muted-foreground text-sm font-mono">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/collect/${project.slug}`
                      : `/collect/${project.slug}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/projects/${project.id}/settings`)
                  }
                >
                  <Pencil className="size-4" />
                  Edit Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
