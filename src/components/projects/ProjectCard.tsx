"use client";

import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  MessageSquare,
  LayoutGrid,
  Pencil,
  Link2,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectWithCounts } from "@/types";
import { toast } from "sonner";

interface ProjectCardProps {
  project: ProjectWithCounts;
  onDelete: (projectId: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();

  const collectLink = `${typeof window !== "undefined" ? window.location.origin : ""}/collect/${project.slug}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(collectLink);
      toast.success("Collect link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/projects/${project.id}`);
  };

  const formattedDate = new Date(project.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-lg">{project.name}</CardTitle>
            <p className="text-muted-foreground mt-1 truncate text-sm">
              /{project.slug}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                <Link2 className="size-4" />
                Copy Collect Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <MessageSquare className="size-3" />
            {project._count.testimonials}{" "}
            {project._count.testimonials === 1
              ? "testimonial"
              : "testimonials"}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <LayoutGrid className="size-3" />
            {project._count.widgets}{" "}
            {project._count.widgets === 1 ? "widget" : "widgets"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Calendar className="size-3" />
          Created {formattedDate}
        </div>
      </CardFooter>
    </Card>
  );
}
