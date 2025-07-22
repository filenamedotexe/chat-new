import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@chat/auth';
import { isFeatureEnabled } from '@chat/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { feature: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ enabled: false });
  }

  try {
    const enabled = await isFeatureEnabled(params.feature, session.user.id);
    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Error checking feature flag:', error);
    return NextResponse.json({ enabled: false });
  }
}