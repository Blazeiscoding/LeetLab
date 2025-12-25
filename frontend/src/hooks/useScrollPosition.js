import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to detect scroll position and direction
 * Returns scroll state useful for navbar styling
 */
export const useScrollPosition = (threshold = 10) => {
  const [scrollState, setScrollState] = useState({
    isScrolled: false,
    scrollY: 0,
    scrollDirection: 'up',
  });

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    setScrollState((prev) => ({
      isScrolled: currentScrollY > threshold,
      scrollY: currentScrollY,
      scrollDirection: currentScrollY > prev.scrollY ? 'down' : 'up',
    }));
  }, [threshold]);

  useEffect(() => {
    // Set initial state
    handleScroll();

    // Throttle scroll events for performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  return scrollState;
};

export default useScrollPosition;
