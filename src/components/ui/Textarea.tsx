/**
 * Textarea Component
 * Reusable textarea with label and error handling
 */

import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = true, className, rows = 4, ...props }, ref) => {
    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {label && (
          <label className="label" htmlFor={props.id || props.name}>
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={clsx(
            'input resize-y',
            error && 'border-danger focus:ring-danger',
            className
          )}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-danger">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
