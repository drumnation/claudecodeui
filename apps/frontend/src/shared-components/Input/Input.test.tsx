import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Input} from './Input';

describe('Input', () => {
  it('should render input with label', () => {
    render(<Input label="Username" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should handle value changes', () => {
    const handleChange = vi.fn();
    render(<Input value="test" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'new value'}});

    expect(handleChange).toHaveBeenCalled();
  });

  it('should display error message', () => {
    render(<Input error="This field is required" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display helper text', () => {
    render(<Input hint="Enter your username" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render as disabled', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should render as required', () => {
    render(<Input label="Email" required />);

    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('should render different sizes', () => {
    const {rerender} = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    rerender(<Input size="md" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should handle different input types', () => {
    const {rerender} = render(<Input type="password" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

    rerender(<Input type="email" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'email');
  });

  it('should render with placeholder', () => {
    render(<Input placeholder="Enter text here" />);

    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
  });

  it('should handle focus and blur events', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should render with left and right icons', () => {
    const Icon = () => <span data-testid="icon">👤</span>;

    render(<Input icon={<Icon />} iconPosition="left" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should handle maxLength', () => {
    render(<Input maxLength={10} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('should apply custom className', () => {
    render(<Input className="custom-input" />);

    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('should handle readonly state', () => {
    render(<Input readOnly value="readonly text" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('should handle textarea attributes', () => {
    render(<Input rows={4} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
  });

  it('should handle autoComplete', () => {
    render(<Input autoComplete="email" />);

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'autoComplete',
      'email',
    );
  });

  it('should handle autoFocus', () => {
    render(<Input autoFocus />);

    expect(screen.getByRole('textbox')).toHaveFocus();
  });
});
