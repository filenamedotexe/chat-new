import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { getAllFeatures, createFeature } from '@/packages/database/src';

export async function GET() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const features = await getAllFeatures();
    return NextResponse.json(features);
  } catch (error) {
    console.error('Failed to get features:', error);
    return NextResponse.json({ error: 'Failed to get features' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json({ error: 'Feature name is required' }, { status: 400 });
    }

    const feature = await createFeature({
      name: data.name,
      description: data.description,
      enabled: data.enabled || false,
      enabledFor: data.enabledFor || []
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error('Failed to create feature:', error);
    return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 });
  }
}