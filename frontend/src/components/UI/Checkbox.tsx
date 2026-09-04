import React, { forwardRef } from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: string;
  badge?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, badge, className = '', id, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? `chk_${label.toLowerCase().replace(/\s+/g, '_')}` : undefined);

    return (
      <label htmlFor={inputId} className={`ui-checkbox-container ${className}`}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="ui-checkbox"
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--text-primary)]">{label}</span>
              {badge}
            </div>
            {description && (
              <span className="text-[11px] text-[var(--text-muted)] leading-tight">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
