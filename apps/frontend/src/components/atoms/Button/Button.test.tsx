import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default variant and size', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary', 'h-9');
  });

  it('applies custom variant and size', () => {
    render(<Button variant="outline" size="sm">Small button</Button>);
    const button = screen.getByRole('button', { name: /small button/i });
    expect(button).toHaveClass('border', 'border-input', 'h-8');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Disabled button</Button>);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    const button = screen.getByRole('button', { name: /button/i });
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Button</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it('renders all variant styles correctly', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>{variant} button</Button>);
      const button = screen.getByRole('button', { name: new RegExp(`${variant} button`, 'i') });
      expect(button).toBeInTheDocument();
      unmount();
    });
  });

  it('renders all size styles correctly', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;
    
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>{size} button</Button>);
      const button = screen.getByRole('button', { name: new RegExp(`${size} button`, 'i') });
      expect(button).toBeInTheDocument();
      unmount();
    });
  });
});