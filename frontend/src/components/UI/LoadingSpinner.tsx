import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, className = '' }) => {
  const dim = size === 'sm' ? 16 : size === 'lg' ? 32 : 22;

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 p-4 ${className}`}>
      <div className="ui-spinner" style={{ width: dim, height: dim }} aria-hidden="true" />
      {text && <span className="text-xs font-medium text-[var(--text-muted)]">{text}</span>}
    </div>
  );
};

export const LoadingOverlay: React.FC<{ text?: string }> = ({ text = 'Loading ocean data...' }) => (
  <div className="absolute inset-0 bg-[var(--bg-surface)]/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);
