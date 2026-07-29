import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { ROUTES } from '@/config/routes';

interface ConversationCardProps {
  conversation: {
    id: string;
    title: string;
    createdAt: Date;
    model: string;
  };
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  return (
    <Link href={ROUTES.conversation(conversation.id)}>
      <Card className="hover:bg-muted/50 transition-colors h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <span className="truncate">{conversation.title}</span>
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Started {formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })}</span>
            <span className="text-xs border rounded-full px-2 py-0.5 bg-muted/50">{conversation.model}</span>
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
