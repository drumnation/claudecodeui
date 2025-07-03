import * as React from "react";
import { useLogger } from "@kit/logger/react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollHideDelay?: number;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = 'vertical', scrollHideDelay = 600, onScroll, ...props }, ref) => {
    const logger = useLogger({ scope: 'ScrollArea' });
    const [isScrolling, setIsScrolling] = React.useState(false);
    const scrollTimeoutRef = React.useRef<NodeJS.Timeout>();

    const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set new timeout to hide scroll indicators
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, scrollHideDelay);

      logger.debug('ScrollArea scrolled', {
        orientation,
        scrollTop: event.currentTarget.scrollTop,
        scrollLeft: event.currentTarget.scrollLeft,
        isScrolling: true
      });

      onScroll?.(event);
    }, [orientation, scrollHideDelay, onScroll, logger]);

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    const getScrollClasses = () => {
      const baseClasses = "h-full w-full rounded-[inherit]";
      
      switch (orientation) {
        case 'horizontal':
          return `${baseClasses} overflow-x-auto overflow-y-hidden`;
        case 'both':
          return `${baseClasses} overflow-auto`;
        case 'vertical':
        default:
          return `${baseClasses} overflow-y-auto overflow-x-hidden`;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          isScrolling && "scrolling",
          className
        )}
        {...props}
      >
        <div 
          className={getScrollClasses()}
          onScroll={handleScroll}
        >
          {children}
        </div>
        
        {/* Optional scroll indicators */}
        {isScrolling && orientation !== 'horizontal' && (
          <div className="absolute right-1 top-2 bottom-2 w-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-70 transition-opacity" />
        )}
        
        {isScrolling && orientation !== 'vertical' && (
          <div className="absolute bottom-1 left-2 right-2 h-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-70 transition-opacity" />
        )}
      </div>
    );
  },
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };