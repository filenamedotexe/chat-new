'use client';

import React from 'react';
import { format } from 'date-fns';
// import type { ActivityLog } from '../types/activity';

interface ActivityTableProps {
  activities: any[];
}

export function ActivityTable({ activities }: ActivityTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-sm">Time</th>
            <th className="text-left py-3 px-4 font-medium text-sm">User</th>
            <th className="text-left py-3 px-4 font-medium text-sm">Action</th>
            <th className="text-left py-3 px-4 font-medium text-sm">Resource</th>
            <th className="text-left py-3 px-4 font-medium text-sm">Details</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 text-sm">
                {format(new Date(activity.createdAt), 'MMM d, HH:mm')}
              </td>
              <td className="py-3 px-4 text-sm">
                {activity.userName || activity.userEmail || 'System'}
              </td>
              <td className="py-3 px-4 text-sm capitalize">
                {activity.action.replace('_', ' ')}
              </td>
              <td className="py-3 px-4 text-sm">
                {activity.resourceType || activity.entityType}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {activity.metadata?.name || activity.resourceId || activity.entityName || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}