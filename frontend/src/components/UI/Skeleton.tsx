import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  rounded = 'md',
  className = '',
  style,
  ...props
}) => {
  const radiusClass =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === 'lg'
      ? 'rounded-[var(--radius-lg)]'
      : rounded === 'sm'
      ? 'rounded-[var(--radius-sm)]'
      : 'rounded-[var(--radius-md)]';

  return (
    <div
      className={`ui-skeleton ${radiusClass} ${className}`}
      style={{ width, height, ...style }}
      {...props}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="ui-card p-4 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton width="40%" height={16} />
      <Skeleton width="20%" height={14} />
    </div>
    <Skeleton width="80%" height={12} />
    <div className="grid grid-cols-2 gap-2 pt-2">
      <Skeleton height={36} />
      <Skeleton height={36} />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="ui-table-container p-2 space-y-2">
    <Skeleton height={28} width="100%" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} height={24} width="100%" />
    ))}
  </div>
);
