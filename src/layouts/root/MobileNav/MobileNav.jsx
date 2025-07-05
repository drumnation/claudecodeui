import React from 'react';
import { MobileNavContainer, NavWrapper } from '@/layouts/root/MobileNav/MobileNav.styles';
import { NavItem } from '@/layouts/root/MobileNav/NavItem';
import { useMobileNav } from '@/layouts/root/MobileNav/MobileNav.hook';

export const MobileNav = ({ activeTab, setActiveTab, isInputFocused }) => {
  const { navItems, isDarkMode } = useMobileNav(setActiveTab);

  return (
    <MobileNavContainer 
      isInputFocused={isInputFocused}
      isDarkMode={isDarkMode}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <NavWrapper>
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onClick={item.onClick}
          />
        ))}
      </NavWrapper>
    </MobileNavContainer>
  );
};