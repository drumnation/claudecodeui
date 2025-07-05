import { useRef, useState, useEffect } from 'react';

export const useMessage = ({ autoExpandTools, isExpanded: initialExpanded, message }) => {
  const messageRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(initialExpanded || false);

  useEffect(() => {
    if (!autoExpandTools || !messageRef.current || !message.isToolUse) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isExpanded) {
            setIsExpanded(true);
            // Find all details elements and open them
            const details = messageRef.current.querySelectorAll('details');
            details.forEach(detail => {
              detail.open = true;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(messageRef.current);

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, [autoExpandTools, isExpanded, message.isToolUse]);

  return {
    messageRef,
    isExpanded,
    setIsExpanded
  };
};