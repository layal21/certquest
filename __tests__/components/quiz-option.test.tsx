import { render, screen, fireEvent } from '@testing-library/react';
import { QuizOption } from '@/components/ui/quiz-option';

describe('QuizOption', () => {
  const defaultProps = {
    option: 'Test option',
    index: 0,
    selected: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders option with correct label', () => {
    render(<QuizOption {...defaultProps} />);
    
    expect(screen.getByText('Test option')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument(); // First option should have label 'A'
  });

  it('applies selected styles when selected', () => {
    render(<QuizOption {...defaultProps} selected={true} />);
    
    const option = screen.getByTestId('quiz-option-0');
    expect(option).toHaveClass('border-primary', 'bg-primary/5');
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<QuizOption {...defaultProps} onClick={mockOnClick} />);
    
    const option = screen.getByTestId('quiz-option-0');
    fireEvent.click(option);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('shows correct icon when answer is correct', () => {
    render(
      <QuizOption 
        {...defaultProps} 
        showResult={true} 
        isCorrect={true} 
      />
    );
    
    expect(screen.getByTestId('icon-correct')).toBeInTheDocument();
    const option = screen.getByTestId('quiz-option-0');
    expect(option).toHaveClass('border-success', 'bg-success/10');
  });

  it('shows incorrect icon when user answer is wrong', () => {
    render(
      <QuizOption 
        {...defaultProps} 
        showResult={true} 
        isUserAnswer={true} 
        isCorrect={false} 
      />
    );
    
    expect(screen.getByTestId('icon-incorrect')).toBeInTheDocument();
    const option = screen.getByTestId('quiz-option-0');
    expect(option).toHaveClass('border-destructive', 'bg-destructive/10');
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnClick = jest.fn();
    render(<QuizOption {...defaultProps} disabled={true} onClick={mockOnClick} />);
    
    const option = screen.getByTestId('quiz-option-0');
    fireEvent.click(option);
    
    expect(mockOnClick).not.toHaveBeenCalled();
    expect(option).toHaveClass('cursor-not-allowed', 'opacity-50');
  });

  it('handles keyboard navigation', () => {
    const mockOnClick = jest.fn();
    render(<QuizOption {...defaultProps} onClick={mockOnClick} />);
    
    const option = screen.getByTestId('quiz-option-0');
    fireEvent.keyDown(option, { key: 'Enter' });
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles space key navigation', () => {
    const mockOnClick = jest.fn();
    render(<QuizOption {...defaultProps} onClick={mockOnClick} />);
    
    const option = screen.getByTestId('quiz-option-0');
    fireEvent.keyDown(option, { key: ' ' });
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders different option labels for different indices', () => {
    const { rerender } = render(<QuizOption {...defaultProps} index={1} />);
    expect(screen.getByText('B')).toBeInTheDocument();
    
    rerender(<QuizOption {...defaultProps} index={2} />);
    expect(screen.getByText('C')).toBeInTheDocument();
    
    rerender(<QuizOption {...defaultProps} index={3} />);
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});
