'use client';
import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Send, Square, AlertCircle, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChatWindowProps {
  conversationId: string;
  initialMessages?: { id?: string; role: 'user' | 'assistant' | 'system' | 'data'; content: string }[];
}

export function ChatWindow({ conversationId, initialMessages = [] }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const chat = useChat({
    id: conversationId,
  });
  const { messages, status, error, stop } = chat;
  const isLoading = status === 'streaming' || status === 'submitted';
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!input.trim() || isLoading) return; chat.sendMessage({ text: input.trim() }); setInput(''); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); formRef.current?.requestSubmit(); } };
  const getTextContent = (msg: { parts?: Array<{ type: string; text?: string }>; content?: unknown }): string => {
    if (msg.parts) return msg.parts.filter((p) => p.type === 'text').map((p) => p.text ?? '').join('');
    if (typeof msg.content === 'string') return msg.content;
    return '';
  };
  return (<div className="flex flex-col h-[calc(100vh-8rem)]">
    {error && (<Alert variant="destructive" className="mb-4 flex-shrink-0"><AlertCircle className="h-4 w-4" /><AlertDescription>{error.message || 'An error occurred.'}</AlertDescription></Alert>)}
    <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4 pb-4 space-y-6">
      {messages.length === 0 ? (<div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-2"><MessageSquare className="h-10 w-10 opacity-20" /><p>Start a conversation...</p></div>)
        : messages.map((message) => (<MessageBubble key={message.id} role={message.role as 'user' | 'assistant'} content={getTextContent(message as { parts?: Array<{ type: string; text?: string }>; content?: unknown })} />))}
      <div className="h-4 w-full" />
    </div>
    <div className="mt-auto pt-4 flex-shrink-0">
      <form ref={formRef} onSubmit={handleSubmit} className="relative flex items-center shadow-sm rounded-xl border bg-background focus-within:ring-1 focus-within:ring-ring">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." className="flex min-h-[60px] w-full resize-none bg-transparent px-4 py-4 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" rows={1} disabled={isLoading && !input} />
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          {isLoading ? (<Button type="button" size="icon" variant="destructive" onClick={stop} className="h-8 w-8 rounded-lg"><Square className="h-4 w-4 fill-current" /><span className="sr-only">Stop</span></Button>)
            : (<Button type="submit" size="icon" disabled={!input.trim()} className="h-8 w-8 rounded-lg"><Send className="h-4 w-4" /><span className="sr-only">Send</span></Button>)}
        </div>
      </form>
      <p className="text-center text-xs text-muted-foreground mt-2">AI can make mistakes.</p>
    </div>
  </div>);
}
