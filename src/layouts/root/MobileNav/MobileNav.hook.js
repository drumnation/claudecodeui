import { useMemo, useEffect, useState } from 'react';
import { getNavItems, detectDarkMode } from '@/layouts/root/MobileNav/MobileNav.logic';

export const useMobileNav = (setActiveTab) => {
  const [isDarkMode, setIsDarkMode] = useState(detectDarkMode());
  
  const navItems = useMemo(() => getNavItems(setActiveTab), [setActiveTab]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(detectDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return {
    navItems,
    isDarkMode
  };
};