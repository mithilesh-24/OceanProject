import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg' | number;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, size = 'md', options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? `select_${label.toLowerCase().replace(/\s+/g, '_')}` : undefined);
    const sizeClass = typeof size === 'string' ? `ui-input-${size}` : '';

    return (
      <div className="ui-form-group">
        {label && (
          <label htmlFor={selectId} className="ui-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`ui-select ${sizeClass} ${error ? 'ui-input-error' : ''} ${className}`}
          size={typeof size === 'number' ? size : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <span className="ui-error-text">{error}</span>
        ) : (
          helperText && <span className="ui-helper-text">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
