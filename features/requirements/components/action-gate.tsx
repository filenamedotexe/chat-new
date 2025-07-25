'use client';

import React from 'react';
import { Card } from '@chat/ui';
import { Button } from '@chat/ui';
import Link from 'next/link';
import { IconAlertCircle, IconLock, IconArrowRight } from '@tabler/icons-react';
import type { Requirement, RequirementCheck } from '../lib/requirements';

interface ActionGateProps {
  requirement: RequirementCheck;
  children: React.ReactNode;
  showBlockedUI?: boolean;
  className?: string;
  onActionClick?: () => void;
}

export function ActionGate({ 
  requirement, 
  children, 
  showBlockedUI = true,
  className = '',
  onActionClick
}: ActionGateProps) {
  // If requirement passed, show children
  if (requirement.passed) {
    return <>{children}</>;
  }

  // If no UI should be shown when blocked, return null
  if (!showBlockedUI) {
    return null;
  }

  // Show blocked UI
  const req = requirement.requirement!;
  
  return (
    <Card className={`p-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <IconLock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
            <IconAlertCircle className="h-5 w-5" />
            {req.message}
          </h3>
          {req.helpText && (
            <p className="mt-2 text-sm text-orange-700 dark:text-orange-300">
              {req.helpText}
            </p>
          )}
          {req.action && (
            <div className="mt-4">
              {req.actionUrl ? (
                <Link href={req.actionUrl}>
                  <Button size="sm">
                    {req.action}
                    <IconArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="sm"
                  onClick={onActionClick}
                >
                  {req.action}
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface MultiActionGateProps {
  requirements: RequirementCheck[];
  children: React.ReactNode;
  showAll?: boolean;
  className?: string;
}

export function MultiActionGate({ 
  requirements, 
  children, 
  showAll = false,
  className = ''
}: MultiActionGateProps) {
  const failedRequirements = requirements.filter(req => !req.passed);
  
  // If all requirements passed, show children
  if (failedRequirements.length === 0) {
    return <>{children}</>;
  }

  // Show either all failed requirements or just the first one
  const requirementsToShow = showAll ? failedRequirements : [failedRequirements[0]];

  return (
    <div className={`space-y-4 ${className}`}>
      {requirementsToShow.map((req, index) => (
        <ActionGate 
          key={index} 
          requirement={req} 
          showBlockedUI={true}
        >
          {null}
        </ActionGate>
      ))}
    </div>
  );
}

interface InlineActionGateProps {
  requirement: RequirementCheck;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function InlineActionGate({ 
  requirement, 
  children,
  fallback
}: InlineActionGateProps) {
  if (requirement.passed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default inline fallback
  const req = requirement.requirement!;
  return (
    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <IconLock className="h-4 w-4" />
      <span>{req.message}</span>
      {req.action && req.actionUrl && (
        <Link 
          href={req.actionUrl}
          className="text-primary hover:underline"
        >
          {req.action}
        </Link>
      )}
    </div>
  );
}

interface TooltipActionGateProps {
  requirement: RequirementCheck;
  children: React.ReactElement;
}

export function TooltipActionGate({ 
  requirement, 
  children
}: TooltipActionGateProps) {
  if (requirement.passed) {
    return children;
  }

  const req = requirement.requirement!;
  
  // Clone the child element and add disabled state and title
  return React.cloneElement(children, {
    disabled: true,
    title: `${req.message}. ${req.helpText || ''}`,
    className: `${children.props.className || ''} opacity-50 cursor-not-allowed`
  });
}