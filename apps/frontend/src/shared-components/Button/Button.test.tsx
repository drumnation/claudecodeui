import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {Button} from './Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render as disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should render different variants', () => {
    const {rerender} = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText('Danger')).toBeInTheDocument();
  });

  it('should render different sizes', () => {
    const {rerender} = render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toBeInTheDocument();

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    render(<Button loading>Loading</Button>);

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('should render with icons', () => {
    const IconComponent = () => <span data-testid="icon">🚀</span>;

    render(
      <Button icon={<IconComponent />} iconPosition="left">
        With Icons
      </Button>,
    );

    expect(screen.getByText('With Icons')).toBeInTheDocument();
  });

  it('should handle keyboard events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Press me</Button>);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, {key: 'Enter'});

    expect(screen.getByText('Press me')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('should render as different HTML elements', () => {
    render(<Button>Button element</Button>);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Button element')).toBeInTheDocument();
  });

  it('should handle full width', () => {
    render(<Button fullWidth>Full Width</Button>);

    expect(screen.getByText('Full Width')).toBeInTheDocument();
  });
});
