import {useEffect, useRef, useState} from 'react';

/**
 * Performance monitoring utilities for the Claude Code UI frontend
 */

// Web Vitals monitoring
export const reportWebVitals = (metric: any) => {
  if (metric.label === 'web-vital') {
    console.log(`[Performance] ${metric.name}: ${metric.value}`);
    // Send to analytics service if configured
  }
};

// Component render tracking hook
export const useRenderCount = (componentName: string) => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Render] ${componentName} rendered ${renderCount.current} times`,
      );
    }
  });

  return renderCount.current;
};

// Debounce hook for expensive operations
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit,
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry?.isIntersecting ?? false);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

// Virtual list hook for large lists
export const useVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5,
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
};

// Memory leak detection hook
export const useMemoryLeakDetector = (componentName: string) => {
  useEffect(() => {
    const memory = (performance as any).memory;
    const startMemory = memory?.usedJSHeapSize;

    return () => {
      const currentMemory = (performance as any).memory;
      if (currentMemory?.usedJSHeapSize && startMemory) {
        const endMemory = currentMemory.usedJSHeapSize;
        const diff = endMemory - startMemory;

        if (diff > 1000000) {
          // 1MB threshold
          console.warn(
            `[Memory] Potential leak in ${componentName}: ${(diff / 1048576).toFixed(2)}MB`,
          );
        }
      }
    };
  }, [componentName]);
};

// Performance mark utilities
export const perfMark = {
  start: (name: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  },

  end: (name: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`);
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name)[0];
        if (measure) {
          console.log(
            `[Performance] ${name}: ${measure.duration.toFixed(2)}ms`,
          );
        }
      } catch (_e) {
        // Ignore if start mark doesn't exist
      }
    }
  },
};

// React DevTools profiler integration
export const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  _baseDuration: number,
  _startTime: number,
  _commitTime: number,
  _interactions: Set<any>,
) => {
  if (actualDuration > 16) {
    // Longer than one frame (60fps)
    console.warn(
      `[Performance] Slow render in ${id}: ${actualDuration.toFixed(2)}ms`,
    );
  }
};
