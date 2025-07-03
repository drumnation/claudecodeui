import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders with default type and classes', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders with custom type', () => {
    render(<Input type="email" placeholder="Enter email" />);
    const input = screen.getByPlaceholderText('Enter email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    const label = screen.getByText('Username');
    const input = screen.getByPlaceholderText('Enter username');
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test value');
  });

  it('handles focus and blur events', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(
      <Input 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        placeholder="Focus test" 
      />
    );
    
    const input = screen.getByPlaceholderText('Focus test');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('displays error message', () => {
    render(<Input error="This field is required" placeholder="Error test" />);
    const errorMessage = screen.getByText('This field is required');
    const input = screen.getByPlaceholderText('Error test');
    
    expect(errorMessage).toBeInTheDocument();
    expect(input).toHaveClass('border-destructive');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Custom class test" />);
    const input = screen.getByPlaceholderText('Custom class test');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} placeholder="Ref test" />);
    expect(ref).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled test" />);
    const input = screen.getByPlaceholderText('Disabled test');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('supports different input types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url'];
    
    types.forEach(type => {
      const { unmount } = render(<Input type={type as any} placeholder={`${type} input`} />);
      const input = screen.getByPlaceholderText(`${type} input`);
      expect(input).toHaveAttribute('type', type);
      unmount();
    });
  });

  it('shows validation state styling', () => {
    const { rerender } = render(<Input placeholder="Validation test" />);
    const input = screen.getByPlaceholderText('Validation test');
    
    // Normal state
    expect(input).not.toHaveClass('border-destructive');
    
    // Error state
    rerender(<Input error="Invalid input" placeholder="Validation test" />);
    expect(input).toHaveClass('border-destructive');
  });
});