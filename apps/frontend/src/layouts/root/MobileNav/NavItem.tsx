import React from 'react';
import {
  NavButton,
  ActiveIndicator,
  IconWrapper,
} from '@/layouts/root/MobileNav/MobileNav.styles';
import {NavItemProps} from './MobileNav.types';

export const NavItem = ({item, isActive, onClick}: NavItemProps) => {
  const Icon = item.icon;

  return (
    <NavButton
      isActive={isActive}
      onClick={onClick}
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
