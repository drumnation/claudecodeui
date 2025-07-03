/**
 * Sidebar Styling Constants
 * Based on original Sidebar.jsx styling
 */

export const sidebarStyles = {
  container: "h-full flex flex-col bg-card md:select-none",
  
  header: {
    desktop: "hidden md:flex items-center justify-between",
    mobile: "md:hidden p-3 border-b border-border",
    wrapper: "md:p-4 md:border-b md:border-border"
  },
  
  logo: {
    container: "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
    icon: "w-5 h-5"
  },
  
  title: {
    main: "text-lg font-bold text-foreground",
    subtitle: "text-sm text-muted-foreground"
  },
  
  buttons: {
    refresh: "h-9 w-9 px-0 hover:bg-accent transition-colors duration-200 group",
    refreshIcon: (isRefreshing: boolean) => 
      `w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform duration-300`,
    newProject: "h-9 w-9 px-0 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md",
    settings: "p-2 hover:bg-accent rounded-lg transition-colors duration-200"
  },
  
  projectItem: {
    container: (isExpanded: boolean) => 
      `w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
        isExpanded ? 'bg-primary/10' : 'bg-muted'
      }`,
    icon: {
      expanded: "w-4 h-4 text-primary",
      collapsed: "w-4 h-4 text-muted-foreground"
    },
    input: "w-full px-3 py-2 text-sm border-2 border-primary/40 focus:border-primary rounded-lg bg-background text-foreground shadow-sm focus:shadow-md transition-all duration-200 focus:outline-none"
  },
  
  sessionItem: {
    container: (isSelected: boolean) => 
      `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'bg-primary/10 text-primary shadow-sm' 
          : 'hover:bg-accent/50 text-foreground'
      }`,
    icon: {
      selected: "w-4 h-4 text-primary flex-shrink-0",
      default: "w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0"
    },
    badge: {
      selected: "bg-primary/20 text-primary border-transparent",
      default: "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground"
    }
  },
  
  mobileNav: {
    container: "md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg",
    button: "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors",
    buttonActive: "text-primary",
    buttonInactive: "text-muted-foreground"
  }
};