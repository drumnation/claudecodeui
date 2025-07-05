import React from 'react';
import { NavButton, ActiveIndicator, IconWrapper } from '@/layouts/root/MobileNav/MobileNav.styles';

export const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;

  const handleTouchStart = (e) => {
    e.preventDefault();
    onClick();
  };

  return (
    <NavButton
      isActive={isActive}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      aria-label={item.label}
      aria-pressed={isActive}
    >
      <IconWrapper>
        <Icon />
      </IconWrapper>
      {isActive && <ActiveIndicator />}
    </NavButton>
  );
};