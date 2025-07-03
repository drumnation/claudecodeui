import React from "react";
import { useLogger } from "@kit/logger/react";
import {
  MessageSquare,
  Folder,
  Terminal,
  GitBranch,
  Globe,
  LucideIcon,
} from "lucide-react";

export type MobileNavTab = "chat" | "shell" | "files" | "git" | "preview";

export interface NavItem {
  id: MobileNavTab;
  icon: LucideIcon;
  onClick: () => void;
}

export interface MobileNavProps {
  activeTab: MobileNavTab;
  setActiveTab: (tab: MobileNavTab) => void;
  isInputFocused: boolean;
}

function MobileNav({
  activeTab,
  setActiveTab,
  isInputFocused,
}: MobileNavProps) {
  const logger = useLogger({ scope: 'MobileNav' });

  React.useEffect(() => {
    logger.info('MobileNav mounted', {
      activeTab,
      isInputFocused,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    });
  }, [activeTab, isInputFocused, logger]);

  // Detect dark mode
  const isDarkMode: boolean =
    document.documentElement.classList.contains("dark");
    
  const handleTabChange = (newTab: MobileNavTab) => {
    logger.info('Mobile navigation tab changed', {
      previousTab: activeTab,
      newTab,
      timestamp: new Date().toISOString(),
      touchDevice: 'ontouchstart' in window
    });
    setActiveTab(newTab);
  };

  const navItems: NavItem[] = [
    {
      id: "chat",
      icon: MessageSquare,
      onClick: () => handleTabChange("chat"),
    },
    {
      id: "shell",
      icon: Terminal,
      onClick: () => handleTabChange("shell"),
    },
    {
      id: "files",
      icon: Folder,
      onClick: () => handleTabChange("files"),
    },
    {
      id: "git",
      icon: GitBranch,
      onClick: () => handleTabChange("git"),
    },
    {
      id: "preview",
      icon: Globe,
      onClick: () => handleTabChange("preview"),
    },
  ];

  // Log input focus changes
  React.useEffect(() => {
    logger.debug('Mobile nav visibility changed', {
      isInputFocused,
      isVisible: !isInputFocused,
      activeTab
    });
  }, [isInputFocused, activeTab, logger]);

  return (
    <>
      <style>
        {`
          .mobile-nav-container {
            background-color: ${isDarkMode ? "#1f2937" : "#ffffff"} !important;
          }
          .mobile-nav-container:hover {
            background-color: ${isDarkMode ? "#1f2937" : "#ffffff"} !important;
          }
        `}
      </style>
      <div
        className={`mobile-nav-container fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 z-50 ios-bottom-safe transform transition-transform duration-300 ease-in-out shadow-lg ${
          isInputFocused ? "translate-y-full" : "translate-y-0"
        }`}
        data-testid="mobile-nav"
      >
        <div className="flex items-center justify-around py-1">
          {navItems.map((item: NavItem) => {
            const Icon = item.icon;
            const isActive: boolean = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                onTouchStart={(e: React.TouchEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  logger.debug('Mobile nav touch interaction', {
                    tab: item.id,
                    wasActive: isActive,
                    touchType: 'touchstart'
                  });
                  item.onClick();
                }}
                className={`flex items-center justify-center p-2 rounded-lg min-h-[40px] min-w-[40px] relative touch-manipulation ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                aria-label={`Navigate to ${item.id} tab`}
                aria-pressed={isActive}
                data-testid={`mobile-nav-${item.id}`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export { MobileNav };