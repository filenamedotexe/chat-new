'use client';

import { useEffect, useState } from 'react';
import type { ProjectProgress } from '../lib/calculate-progress';

interface ProgressBarProps {
  progress: ProjectProgress;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function ProgressBar({ 
  progress, 
  showLabel = true, 
  size = 'md',
  animated = true,
  className = ''
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Animate the progress bar on mount
    const timer = setTimeout(() => {
      setWidth(progress.progressPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress.progressPercentage]);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const getProgressColor = () => {
    if (progress.isComplete) return 'bg-green-500';
    if (progress.progressPercentage >= 75) return 'bg-blue-500';
    if (progress.progressPercentage >= 50) return 'bg-yellow-500';
    if (progress.progressPercentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {progress.progressPercentage}%
            {progress.isComplete && (
              <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
            )}
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full ${getProgressColor()} transition-all duration-1000 ease-out ${
            animated ? 'transition-all' : ''
          }`}
          style={{ width: animated ? `${width}%` : `${progress.progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={progress.progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {size === 'lg' && progress.progressPercentage > 0 && (
            <span className="flex items-center justify-center h-full text-xs font-medium text-white">
              {progress.progressPercentage}%
            </span>
          )}
        </div>
      </div>

      {/* Additional stats */}
      {size !== 'sm' && (
        <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">{progress.completedTasks}</span>
            <span className="ml-1">done</span>
          </div>
          <div>
            <span className="font-medium">{progress.inProgressTasks}</span>
            <span className="ml-1">in progress</span>
          </div>
          <div>
            <span className="font-medium">{progress.needsReviewTasks}</span>
            <span className="ml-1">review</span>
          </div>
          <div>
            <span className="font-medium">{progress.notStartedTasks}</span>
            <span className="ml-1">pending</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for use in cards
export function CompactProgressBar({ progress, className = '' }: { 
  progress: ProjectProgress;
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">
          {progress.completedTasks}/{progress.totalTasks} tasks
        </span>
        <span className="text-xs font-medium">
          {progress.progressPercentage}%
        </span>
      </div>
      <ProgressBar 
        progress={progress} 
        showLabel={false} 
        size="sm" 
        animated={false}
      />
    </div>
  );
}