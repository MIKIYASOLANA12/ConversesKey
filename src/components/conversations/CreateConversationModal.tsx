'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { createConversationAction } from '@/server/actions/conversation.actions';
import { createConversationSchema } from '@/lib/validations/conversation.schema';
import { DEFAULT_MODEL } from '@/config/ai';

export function CreateConversationModal({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof createConversationSchema>>({
    resolver: zodResolver(createConversationSchema),
    defaultValues: {
      projectId,
      title: '',
      model: DEFAULT_MODEL,
    },
  });

  function onSubmit(values: z.infer<typeof createConversationSchema>) {
    setGlobalError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('projectId', values.projectId);
      formData.append('title', values.title);
      formData.append('model', values.model);

      const result = await createConversationAction(formData);

      if (!result.success) {
        setGlobalError(result.error ?? 'An unexpected error occurred.');
      } else {
        form.reset();
        setOpen(false);
        if (result.redirect) {
          router.push(result.redirect);
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <DialogDescription>
            Begin a new AI chat thread inside this project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic / Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Brainstorming ideas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {globalError && (
              <p className="text-sm font-medium text-destructive">{globalError}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Starting...' : 'Start Chat'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
