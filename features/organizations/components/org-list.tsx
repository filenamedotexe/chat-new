'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@chat/ui';
import { IconBuilding, IconEdit, IconTrash, IconUsers } from '@tabler/icons-react';
import { Organization } from '../data/organizations';
import Link from 'next/link';

interface OrgListProps {
  organizations: Organization[];
  onEdit?: (org: Organization) => void;
  onDelete?: (org: Organization) => void;
  loading?: boolean;
}

export function OrgList({ organizations, onEdit, onDelete, loading = false }: OrgListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="organizations-loading">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (organizations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <IconBuilding className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No organizations yet</p>
          <p className="text-sm text-muted-foreground">Create your first organization to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <Card key={org.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="line-clamp-1">{org.name}</CardTitle>
                <CardDescription className="capitalize">{org.type} Organization</CardDescription>
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(org)}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                    title="Edit organization"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(org)}
                    className="p-2 hover:bg-muted rounded-md transition-colors text-red-600"
                    title="Delete organization"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {org.description || 'No description provided'}
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {org.contactEmail && (
                  <span className="text-muted-foreground">
                    {org.contactEmail}
                  </span>
                )}
              </div>
              <Link 
                href={`/organizations/${org.id}`}
                className="text-primary hover:underline font-medium"
              >
                View Details →
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}