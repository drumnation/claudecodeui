import React, { forwardRef } from 'react';
import { useScrollArea } from '@/shared-components/ScrollArea/ScrollArea.hook';
import { calculateThumbPosition } from '@/shared-components/ScrollArea/ScrollArea.logic';
import {
  ScrollAreaContainer,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from '@/shared-components/ScrollArea/ScrollArea.styles';

export const ScrollArea = forwardRef(({ 
  children, 
  showScrollbar = 'hover',
  scrollbarWidth = 10,
  ...props 
}, ref) => {
  const {
    scrollRef,
    isScrolling,
    showScrollbar: hasScroll,
    scrollPercentage,
    thumbHeight,
    handleScroll,
  } = useScrollArea();

  const shouldShowScrollbar = hasScroll && (showScrollbar === 'always' || (showScrollbar === 'hover' && isScrolling));
  const thumbPosition = calculateThumbPosition(scrollPercentage, thumbHeight);

  return (
    <ScrollAreaContainer ref={ref} {...props}>
      <ScrollAreaViewport
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {children}
      </ScrollAreaViewport>
      
      {hasScroll && (
        <ScrollAreaScrollbar
          $show={shouldShowScrollbar}
          style={{ width: `${scrollbarWidth}px` }}
        >
          <ScrollAreaThumb
            $height={thumbHeight}
            $top={thumbPosition}
          />
        </ScrollAreaScrollbar>
      )}
    </ScrollAreaContainer>
  );
});

ScrollArea.displayName = 'ScrollArea';