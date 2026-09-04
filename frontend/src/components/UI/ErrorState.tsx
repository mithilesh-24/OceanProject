import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocean Data Request Error',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-4 border border-[var(--error)]/30 bg-[var(--error-subtle)] rounded-[var(--radius-md)] flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[var(--error)] shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-xs font-semibold text-[var(--error)]">{title}</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <div className="flex justify-end pt-1">
          <Button
            variant="danger"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
