import { CreateProjectForm } from "@/components/projects/CreateProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Project
        </h1>
        <p className="text-muted-foreground mt-1">
          Set up a new project to start collecting testimonials.
        </p>
      </div>

      <CreateProjectForm />
    </div>
  );
}
