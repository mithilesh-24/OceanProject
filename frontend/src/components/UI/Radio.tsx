import React, { forwardRef } from 'react';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? `radio_${label.toLowerCase().replace(/\s+/g, '_')}` : undefined);

    return (
      <label htmlFor={inputId} className={`ui-radio-container ${className}`}>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="ui-radio"
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-[var(--text-primary)]">{label}</span>
            {description && (
              <span className="text-[11px] text-[var(--text-muted)] leading-tight">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
