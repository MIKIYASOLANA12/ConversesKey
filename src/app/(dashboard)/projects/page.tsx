import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { projectService } from '@/server/services/project.service';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export const metadata: Metadata = {
  title: 'Projects - ConverseKey',
  description: 'Manage your AI workspaces',
};

export default async function ProjectsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Handled by layout redirect
  }

  const projects = await projectService.getProjects(user.id);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Organize your conversations into dedicated workspaces.
          </p>
        </div>
        <CreateProjectModal />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h2 className="mt-6 text-xl font-semibold">No projects yet</h2>
            <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground">
              You don't have any projects yet. Create a project to start organizing your AI conversations.
            </p>
            <CreateProjectModal />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
