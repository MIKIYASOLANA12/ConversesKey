'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { conversationService } from '@/server/services/conversation.service';
import { createConversationSchema, deleteConversationSchema } from '@/lib/validations/conversation.schema';
import { ROUTES } from '@/config/routes';
import { DEFAULT_MODEL } from '@/config/ai';

async function getUserOrThrow() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function createConversationAction(formData: FormData) {
  try {
    const user = await getUserOrThrow();
    const data = Object.fromEntries(formData.entries());
    
    // Default model if not provided
    if (!data.model) data.model = DEFAULT_MODEL;

    const parsed = createConversationSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const conversation = await conversationService.createConversation(user.id, parsed.data);
    revalidatePath(ROUTES.project(parsed.data.projectId));
    return { success: true, redirect: ROUTES.conversation(conversation.id) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteConversationAction(formData: FormData) {
  try {
    const user = await getUserOrThrow();
    const data = Object.fromEntries(formData.entries());
    const parsed = deleteConversationSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const conversation = await conversationService.deleteConversation(parsed.data.conversationId, user.id);
    revalidatePath(ROUTES.project(conversation.projectId));
    
    return { success: true, redirect: ROUTES.project(conversation.projectId) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
