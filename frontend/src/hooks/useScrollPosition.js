import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect scroll position
 * Uses hysteresis to prevent flickering at the threshold
 */
export const useScrollPosition = (threshold = 10) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Set initial state
    setIsScrolled(window.scrollY > threshold);

    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Use hysteresis to prevent flickering
          // Only change state if we've crossed the threshold by a margin
          if (isScrolled && currentScrollY < threshold - 5) {
            setIsScrolled(false);
          } else if (!isScrolled && currentScrollY > threshold + 5) {
            setIsScrolled(true);
          }
          
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, isScrolled]);

  return { isScrolled };
};

export default useScrollPosition;
