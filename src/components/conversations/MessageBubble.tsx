import { MarkdownRenderer } from './MarkdownRenderer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  if (role === 'system' || role === 'data') return null;

  const isUser = role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        <div className="flex-shrink-0 mt-1">
          <Avatar className="h-8 w-8">
            {isUser ? (
              <AvatarFallback className="bg-primary text-primary-foreground"><User className="h-4 w-4" /></AvatarFallback>
            ) : (
              <AvatarFallback className="bg-secondary text-secondary-foreground border"><Bot className="h-4 w-4" /></AvatarFallback>
            )}
          </Avatar>
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="text-sm font-medium mb-1 text-muted-foreground">
            {isUser ? 'You' : 'ConverseKey AI'}
          </div>
          <div 
            className={`rounded-2xl px-5 py-3 ${
              isUser 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted/50 border shadow-sm'
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{content}</div>
            ) : (
              <MarkdownRenderer content={content} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
