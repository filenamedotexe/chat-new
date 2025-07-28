import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { requireAuth } from '@/lib/auth/api-auth';

export async function POST(req: Request) {
  const { error } = await requireAuth();
  
  if (error) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
    system: 'You are a helpful assistant.',
  });

  return result.toDataStreamResponse();
}