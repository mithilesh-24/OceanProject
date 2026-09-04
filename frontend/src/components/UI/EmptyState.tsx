import React from 'react';
import { Database, Search, FilterX, HelpCircle } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--bg-surface-secondary)]/50 ${className}`}>
      <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full text-[var(--text-muted)] mb-3">
        {icon || <Database className="w-6 h-6 text-[var(--text-muted)]" />}
      </div>
      <h4 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h4>
      {description && (
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
