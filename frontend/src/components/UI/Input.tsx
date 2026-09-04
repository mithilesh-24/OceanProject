import React, { forwardRef } from 'react';
import { X } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg' | number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, size = 'md', leftIcon, rightIcon, onClear, className = '', id, value, ...props }, ref) => {
    const inputId = id || (label ? `input_${label.toLowerCase().replace(/\s+/g, '_')}` : undefined);
    const sizeClass = typeof size === 'string' ? `ui-input-${size}` : '';

    return (
      <div className="ui-form-group">
        {label && (
          <label htmlFor={inputId} className="ui-label">
            {label}
          </label>
        )}
        <div className="ui-input-wrapper">
          {leftIcon && <span className="ui-input-left-icon">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            value={value}
            className={`ui-input ${sizeClass} ${leftIcon ? 'ui-input-has-left-icon' : ''} ${
              rightIcon || (onClear && value) ? 'ui-input-has-right-icon' : ''
            } ${error ? 'ui-input-error' : ''} ${className}`}
            size={typeof size === 'number' ? size : undefined}
            {...props}
          />
          {onClear && value && !props.disabled ? (
            <button
              type="button"
              className="ui-input-right-icon"
              onClick={onClear}
              aria-label="Clear input"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
            </button>
          ) : (
            rightIcon && <span className="ui-input-right-icon">{rightIcon}</span>
          )}
        </div>
        {error ? (
          <span className="ui-error-text">{error}</span>
        ) : (
          helperText && <span className="ui-helper-text">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
