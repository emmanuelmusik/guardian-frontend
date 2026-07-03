import { useEffect, useState, useRef } from 'react';

// Instagram-style header behavior: hidden while scrolling down, shown
// again while scrolling up, always shown near the very top of the page.
export function useHideOnScroll(threshold = 8) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastY.current;

      if (currentY < 40) {
        setVisible(true);
      } else if (delta > threshold) {
        setVisible(false);
      } else if (delta < -threshold) {
        setVisible(true);
      }
      lastY.current = currentY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return visible;
}
