import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { createOrganization, getOrganizations } from '@/features/organizations/data/organizations';
import type { UserRole } from '@chat/shared-types';

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    
    if (error) {
      return error;
    }

    const organizations = await getOrganizations(user.id, user.role as UserRole);
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    
    if (error) {
      return error;
    }

    // Only admins can create organizations
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.slug || !body.type) {
      return NextResponse.json(
        { error: 'Name, slug, and type are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Validate type
    if (body.type !== 'agency' && body.type !== 'client') {
      return NextResponse.json(
        { error: 'Type must be either "agency" or "client"' },
        { status: 400 }
      );
    }

    const organization = await createOrganization({
      name: body.name,
      slug: body.slug,
      type: body.type,
      description: body.description || null,
      website: body.website || null,
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
      address: body.address || null,
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to create organization:', error);
    
    // Check for unique constraint violations
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'An organization with this slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}