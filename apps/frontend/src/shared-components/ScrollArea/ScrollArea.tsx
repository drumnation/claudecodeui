import React, {forwardRef} from 'react';
import {useScrollArea} from '@/shared-components/ScrollArea/ScrollArea.hook';
import {calculateThumbPosition} from '@/shared-components/ScrollArea/ScrollArea.logic';
import {ScrollAreaProps} from '@/shared-components/ScrollArea/ScrollArea.types';
import {
  ScrollAreaContainer,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from '@/shared-components/ScrollArea/ScrollArea.styles';

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      children,
      showScrollbar = 'hover',
      scrollbarWidth = 10,
      onScroll,
      ...props
    },
    ref,
  ) => {
    const {
      scrollRef,
      isScrolling,
      showScrollbar: hasScroll,
      scrollPercentage,
      thumbHeight,
      handleScroll,
    } = useScrollArea();

    const shouldShowScrollbar =
      hasScroll &&
      (showScrollbar === 'always' ||
        (showScrollbar === 'hover' && isScrolling));
    const thumbPosition = calculateThumbPosition(scrollPercentage, thumbHeight);

    const handleScrollEvent = (event: React.UIEvent<HTMLDivElement>) => {
      handleScroll();
      if (onScroll) {
        const target = event.target as HTMLDivElement;
        onScroll({
          scrollTop: target.scrollTop,
          scrollLeft: target.scrollLeft,
          scrollHeight: target.scrollHeight,
          scrollWidth: target.scrollWidth,
          clientHeight: target.clientHeight,
          clientWidth: target.clientWidth,
        });
      }
    };

    return (
      <ScrollAreaContainer ref={ref} {...props}>
        <ScrollAreaViewport ref={scrollRef} onScroll={handleScrollEvent}>
          {children}
        </ScrollAreaViewport>

        {hasScroll && (
          <ScrollAreaScrollbar
            $show={shouldShowScrollbar}
            style={{width: `${scrollbarWidth}px`}}
          >
            <ScrollAreaThumb $height={thumbHeight} $top={thumbPosition} />
          </ScrollAreaScrollbar>
        )}
      </ScrollAreaContainer>
    );
  },
);

ScrollArea.displayName = 'ScrollArea';
