"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProjectWithCounts } from "@/types";
import type { CreateProjectInput } from "@/lib/validations";

interface UseProjectsReturn {
  projects: ProjectWithCounts[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProject: (data: CreateProjectInput) => Promise<ProjectWithCounts>;
  deleteProject: (projectId: string) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/projects");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch projects";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(
    async (data: CreateProjectInput): Promise<ProjectWithCounts> => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const project = await response.json();
      setProjects((prev) => [project, ...prev]);
      return project;
    },
    []
  );

  const deleteProject = useCallback(async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete project");
    }

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    deleteProject,
  };
}
