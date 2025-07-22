import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@chat/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
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