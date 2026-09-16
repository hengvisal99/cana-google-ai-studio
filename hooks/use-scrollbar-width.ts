'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Width of a scroll container's vertical scrollbar.
 *
 * A scrollbar is carved out of the scroll container's content box, so anything
 * rendered outside that container (a header sibling, say) sits that many pixels
 * further right than the scrolled content. Feed this value back as a CSS
 * variable to keep the two right edges aligned.
 *
 * Pair with `scrollbar-gutter: stable` on the container, otherwise the measured
 * width flips to 0 whenever the content is short enough not to scroll and the
 * aligned sibling visibly jumps.
 */
export function useScrollbarWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => setWidth(element.offsetWidth - element.clientWidth);
    measure();

    // Catches layout changes (sidebar collapse, window resize, zoom)
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}
