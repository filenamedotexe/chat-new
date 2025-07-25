import { NextResponse } from 'next/server';
import { checkFeature } from '@/lib/features/featureFlags';

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const enabled = await checkFeature(params.name);
    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Failed to check feature:', error);
    return NextResponse.json({ enabled: false });
  }
}