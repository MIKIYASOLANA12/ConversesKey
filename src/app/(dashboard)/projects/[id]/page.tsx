import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { projectService } from '@/server/services/project.service';
import { conversationService } from '@/server/services/conversation.service';
import { ConversationCard } from '@/components/conversations/ConversationCard';
import { CreateConversationModal } from '@/components/conversations/CreateConversationModal';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Project - ConverseKey',
};

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await props.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.login);
  }

  let project;
  try {
    project = await projectService.getProject(projectId, user.id);
  } catch {
    notFound();
  }

  const conversations = await conversationService.getConversations(projectId, user.id);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span 
              className="inline-block w-4 h-4 rounded-full" 
              style={{ backgroundColor: project.color || '#3b82f6' }}
            />
            {project.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage conversations for this project.
          </p>
        </div>
        <CreateConversationModal projectId={project.id} />
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h2 className="mt-6 text-xl font-semibold">No conversations yet</h2>
            <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground">
              Start a new chat to begin working on this project with AI.
            </p>
            <CreateConversationModal projectId={project.id} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {conversations.map((conversation) => (
            <ConversationCard key={conversation.id} conversation={conversation} />
          ))}
        </div>
      )}
    </div>
  );
}
