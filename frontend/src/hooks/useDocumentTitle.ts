import { useEffect } from 'react';

/**
 * Sets document.title while the component is mounted, and restores the
 * previous title on unmount (so navigating away — e.g. back to Home —
 * doesn't leave a stale car name in the tab).
 */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
