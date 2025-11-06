/**
 * Badge Component
 * Status badges with color variants
 */

import type { ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  dot = false
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';

  const variantStyles = {
    success: 'bg-success-light text-success-dark border border-success',
    warning: 'bg-warning-light text-warning-dark border border-warning',
    danger: 'bg-danger-light text-danger-dark border border-danger',
    info: 'bg-info-light text-info-dark border border-info',
    default: 'bg-gray-100 text-gray-800 border border-gray-300'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const dotSizeStyles = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5'
  };

  const dotColorStyles = {
    success: 'bg-success-dark',
    warning: 'bg-warning-dark',
    danger: 'bg-danger-dark',
    info: 'bg-info-dark',
    default: 'bg-gray-600'
  };

  return (
    <span
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'rounded-full',
            dotSizeStyles[size],
            dotColorStyles[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};
