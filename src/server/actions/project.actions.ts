'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { projectService } from '@/server/services/project.service';
import { createProjectSchema, updateProjectSchema, deleteProjectSchema } from '@/lib/validations/project.schema';
import { ROUTES } from '@/config/routes';

async function getUserOrThrow() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function createProjectAction(formData: FormData) {
  try {
    const user = await getUserOrThrow();
    const data = Object.fromEntries(formData.entries());
    const parsed = createProjectSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const project = await projectService.createProject(user.id, parsed.data);
    revalidatePath(ROUTES.projects);
    revalidatePath(ROUTES.dashboard);
    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProjectAction(formData: FormData) {
  try {
    const user = await getUserOrThrow();
    const data = Object.fromEntries(formData.entries());
    
    // Parse boolean if it exists
    if (typeof data.archived === 'string') {
      (data as Record<string, string | boolean>).archived = data.archived === 'true';
    }

    const parsed = updateProjectSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const project = await projectService.updateProject(user.id, parsed.data);
    revalidatePath(ROUTES.projects);
    revalidatePath(ROUTES.project(project.id));
    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProjectAction(formData: FormData) {
  try {
    const user = await getUserOrThrow();
    const data = Object.fromEntries(formData.entries());
    const parsed = deleteProjectSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    await projectService.deleteProject(parsed.data.projectId, user.id);
    revalidatePath(ROUTES.projects);
    revalidatePath(ROUTES.dashboard);
    
    return { success: true, redirect: ROUTES.projects };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
