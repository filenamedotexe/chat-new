import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { toggleFeature } from '@/packages/database/src';

export async function POST(
  request: Request,
  { params }: { params: { name: string } }
) {
  const { user, error } = await requireAuth();
  
  if (error) {
    return error;
  }
  
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const feature = await toggleFeature(params.name);
    
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error('Failed to toggle feature:', error);
    return NextResponse.json({ error: 'Failed to toggle feature' }, { status: 500 });
  }
}