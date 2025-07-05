import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNav } from '@/layouts/root/MobileNav/MobileNav';

describe('MobileNav', () => {
  const mockSetActiveTab = jest.fn();

  beforeEach(() => {
    mockSetActiveTab.mockClear();
  });

  it('renders all navigation items', () => {
    render(
      <MobileNav
        activeTab="chat"
        setActiveTab={mockSetActiveTab}
        isInputFocused={false}
      />
    );

    expect(screen.getByLabelText('Chat')).toBeInTheDocument();
    expect(screen.getByLabelText('Shell')).toBeInTheDocument();
    expect(screen.getByLabelText('Files')).toBeInTheDocument();
    expect(screen.getByLabelText('Git')).toBeInTheDocument();
    expect(screen.getByLabelText('Preview')).toBeInTheDocument();
  });

  it('shows active indicator on active tab', () => {
    const { rerender } = render(
      <MobileNav
        activeTab="chat"
        setActiveTab={mockSetActiveTab}
        isInputFocused={false}
      />
    );

    // Check chat is active
    const chatButton = screen.getByLabelText('Chat');
    expect(chatButton).toHaveAttribute('aria-pressed', 'true');

    // Rerender with different active tab
    rerender(
      <MobileNav
        activeTab="files"
        setActiveTab={mockSetActiveTab}
        isInputFocused={false}
      />
    );

    // Check files is active
    const filesButton = screen.getByLabelText('Files');
    expect(filesButton).toHaveAttribute('aria-pressed', 'true');
    expect(chatButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('hides navigation when input is focused', () => {
    const { container } = render(
      <MobileNav
        activeTab="chat"
        setActiveTab={mockSetActiveTab}
        isInputFocused={true}
      />
    );

    const navContainer = container.firstChild;
    expect(navContainer).toHaveStyleRule('transform', 'translateY(100%)');
  });

  it('calls setActiveTab when navigation item is clicked', () => {
    render(
      <MobileNav
        activeTab="chat"
        setActiveTab={mockSetActiveTab}
        isInputFocused={false}
      />
    );

    fireEvent.click(screen.getByLabelText('Files'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('files');

    fireEvent.click(screen.getByLabelText('Git'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('git');
  });

  it('detects and applies dark mode', () => {
    // Add dark class to document
    document.documentElement.classList.add('dark');

    const { container } = render(
      <MobileNav
        activeTab="chat"
        setActiveTab={mockSetActiveTab}
        isInputFocused={false}
      />
    );

    const navContainer = container.firstChild;
    expect(navContainer).toHaveStyle({ backgroundColor: '#1f2937' });

    // Clean up
    document.documentElement.classList.remove('dark');
  });
});