import { createSupabaseServerClient } from '@/lib/supabase/server';
import { aiGateway } from '@/server/ai/gateway';
import { conversationService } from '@/server/services/conversation.service';
import { messageService } from '@/server/services/message.service';
import { NextResponse } from 'next/server';
import { AIModelId } from '@/config/ai';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, conversationId } = await req.json();

    if (!conversationId || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify conversation ownership
    const conversation = await conversationService.getConversation(conversationId, user.id);
    
    // The latest message is from the user
    const latestMessage = messages[messages.length - 1];

    // Save user message to DB asynchronously (don't block the stream)
    messageService.saveMessage({
      conversationId,
      role: 'user',
      content: latestMessage.content,
    }).catch(console.error);

    // Call the AI Gateway
    const response = await aiGateway.streamChat(
      conversation.model as AIModelId,
      messages.slice(0, -1), // History
      latestMessage.content  // New prompt
    );

    // After stream completes, save assistant message and log usage
    if (response.usage) {
      response.usage().then(async (usageStats) => {
        // Unfortunately standard Vercel AI SDK textStream doesn't easily expose the full text 
        // to a callback without dataStream/streamText standard callbacks.
        // We will rely on the client to save the AI message if we use basic streaming,
        // or we can use onFinish in the stream builder. 
        // For standard `ai` library 3.x, `textStream` is just the readable stream.
        // But since we are using `streamText` in the adapter, we can tap into it there, 
        // OR we just log usage here. Let's just log usage for now.
        await messageService.logUsage({
          userId: user.id,
          model: conversation.model,
          promptTokens: usageStats.promptTokens,
          completionTokens: usageStats.completionTokens,
        });
      }).catch(console.error);
    }

    return new Response(response.stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
