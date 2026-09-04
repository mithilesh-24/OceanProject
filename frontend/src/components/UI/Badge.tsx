import React from 'react';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'danger' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
  style,
  ...props
}) => {
  const normalizedVariant = variant === 'danger' ? 'error' : variant;
  const isOutline = variant === 'outline';

  return (
    <span
      className={`ui-badge ${isOutline ? 'ui-badge-neutral' : `ui-badge-${normalizedVariant}`} ${className}`}
      style={{
        ...(isOutline ? { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' } : {}),
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor:
              normalizedVariant === 'primary'
                ? 'var(--primary)'
                : normalizedVariant === 'success'
                ? 'var(--success)'
                : normalizedVariant === 'warning'
                ? 'var(--warning)'
                : normalizedVariant === 'error'
                ? 'var(--error)'
                : 'var(--text-muted)',
          }}
        />
      )}
      {children}
    </span>
  );
};
