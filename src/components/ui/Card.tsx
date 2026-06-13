// ============================================================
// EcoTrack – Reusable Card component
// ============================================================

import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 p-5',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  titleId?: string;
}

export function CardHeader({ title, subtitle, icon, titleId }: CardHeaderProps) {
  return (
    <div className="mb-4">
      <h2
        id={titleId}
        className="text-base font-semibold text-gray-800 flex items-center gap-2"
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {title}
      </h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
