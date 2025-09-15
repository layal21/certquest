import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface QuizOptionProps {
  option: string;
  index: number;
  selected: boolean;
  showResult?: boolean;
  isCorrect?: boolean;
  isUserAnswer?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuizOption({ 
  option, 
  index, 
  selected, 
  showResult = false, 
  isCorrect = false, 
  isUserAnswer = false, 
  onClick, 
  disabled = false 
}: QuizOptionProps) {
  const getOptionClasses = () => {
    const baseClasses = 'quiz-option p-4 border rounded-lg cursor-pointer transition-all';
    
    if (disabled) {
      return cn(baseClasses, 'cursor-not-allowed opacity-50');
    }
    
    if (showResult) {
      if (isCorrect) {
        return cn(baseClasses, 'border-success bg-success/10');
      } else if (isUserAnswer && !isCorrect) {
        return cn(baseClasses, 'border-destructive bg-destructive/10');
      } else {
        return cn(baseClasses, 'border-border');
      }
    }
    
    if (selected) {
      return cn(baseClasses, 'border-primary bg-primary/5');
    }
    
    return cn(baseClasses, 'border-border hover:border-primary hover:bg-primary/5');
  };

  const getIconClasses = () => {
    const baseClasses = 'w-6 h-6 rounded-full flex items-center justify-center';
    
    if (showResult && isCorrect) {
      return cn(baseClasses, 'bg-success border-2 border-success');
    } else if (showResult && isUserAnswer && !isCorrect) {
      return cn(baseClasses, 'bg-destructive border-2 border-destructive');
    } else if (selected) {
      return cn(baseClasses, 'bg-primary border-2 border-primary');
    } else {
      return cn(baseClasses, 'border-2 border-border');
    }
  };

  const renderIcon = () => {
    if (showResult && isCorrect) {
      return <Check className="h-3 w-3 text-white" data-testid="icon-correct" />;
    } else if (showResult && isUserAnswer && !isCorrect) {
      return <X className="h-3 w-3 text-white" data-testid="icon-incorrect" />;
    } else if (selected) {
      return <span className="text-xs font-medium text-primary-foreground">{optionLabels[index]}</span>;
    } else {
      return <span className="text-sm font-medium text-muted-foreground">{optionLabels[index]}</span>;
    }
  };

  return (
    <div
      className={getOptionClasses()}
      onClick={disabled ? undefined : onClick}
      data-testid={`quiz-option-${index}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center space-x-3">
        <div className={getIconClasses()}>
          {renderIcon()}
        </div>
        <span className={cn(
          'text-foreground',
          showResult && isCorrect && 'font-medium',
          showResult && isUserAnswer && !isCorrect && 'font-medium'
        )}>
          {option}
        </span>
      </div>
    </div>
  );
}
