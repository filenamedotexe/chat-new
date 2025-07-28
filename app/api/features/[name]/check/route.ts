import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/packages/database/src';
import { getUser } from '@/lib/auth/get-user';

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const user = await getUser();
    const userId = user?.id;
    const enabled = await isFeatureEnabled(params.name, userId);
    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Failed to check feature:', error);
    return NextResponse.json({ enabled: false });
  }
}