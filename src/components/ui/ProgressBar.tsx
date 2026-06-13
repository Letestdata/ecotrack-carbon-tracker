// ============================================================
// EcoTrack – Accessible Progress Bar
// ============================================================

import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;       // 0–100
  max?: number;
  label?: string;
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  color = 'bg-green-500',
  className,
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const pct = (clamped / max) * 100;

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          {label && <span>{label}</span>}
          {showLabel && <span>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div
        className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? 'Progress'}
      >
        <div
          className={cn('h-2.5 rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
