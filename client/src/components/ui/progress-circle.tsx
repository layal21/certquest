interface ProgressCircleProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function ProgressCircle({ 
  progress, 
  size = 'md', 
  showPercentage = true, 
  className = '' 
}: ProgressCircleProps) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`} data-testid="progress-circle">
      <svg 
        className={`${sizeClasses[size]} progress-ring`} 
        viewBox="0 0 90 90"
        data-testid="progress-circle-svg"
      >
        <circle 
          cx="45" 
          cy="45" 
          r="40" 
          stroke="hsl(var(--muted))" 
          strokeWidth="8" 
          fill="none" 
        />
        <circle 
          cx="45" 
          cy="45" 
          r="40" 
          stroke="hsl(var(--primary))" 
          strokeWidth="8" 
          fill="none"
          className="progress-ring-circle"
          style={{ strokeDashoffset }}
          data-testid="progress-circle-progress"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className={`${textSizeClasses[size]} font-bold text-primary`}
            data-testid="progress-circle-percentage"
          >
            {progress}%
          </span>
        </div>
      )}
    </div>
  );
}
