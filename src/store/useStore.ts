import { create } from "zustand";
import type { Project, Testimonial } from "@/types";

interface AppState {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;

  testimonials: Testimonial[];
  setTestimonials: (testimonials: Testimonial[]) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),

  testimonials: [],
  setTestimonials: (testimonials) => set({ testimonials }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
