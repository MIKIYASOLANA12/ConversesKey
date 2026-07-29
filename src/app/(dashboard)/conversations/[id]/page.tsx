import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash } from 'lucide-react';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { conversationService } from '@/server/services/conversation.service';
import { messageService } from '@/server/services/message.service';
import { ChatWindow } from '@/components/conversations/ChatWindow';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Conversation - ConverseKey',
};

export default async function ConversationPage(props: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = await props.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.login);
  }

  let conversation;
  try {
    conversation = await conversationService.getConversation(conversationId, user.id);
  } catch {
    notFound();
  }

  // Fetch initial messages for server-side rendering
  const dbMessages = await messageService.getMessages(conversation.id);
  
  // Format for useChat
  const initialMessages = dbMessages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant' | 'system' | 'data',
    content: msg.content,
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4 border-b pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.project(conversation.projectId)}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {conversation.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Model: {conversation.model}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatWindow 
          conversationId={conversation.id} 
          initialMessages={initialMessages} 
        />
      </div>
    </div>
  );
}
