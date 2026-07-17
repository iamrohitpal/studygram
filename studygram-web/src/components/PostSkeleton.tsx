import React from 'react';

export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden p-4 space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="space-y-2">
            <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
        <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>

      {/* Body Text Skeleton */}
      <div className="space-y-2">
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="w-5/6 h-3 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>

      {/* Media Box Skeleton */}
      <div className="w-full aspect-square max-h-[300px] bg-slate-200 dark:bg-slate-800 rounded-2xl" />

      {/* Footer Action Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
    </div>
  );
};
