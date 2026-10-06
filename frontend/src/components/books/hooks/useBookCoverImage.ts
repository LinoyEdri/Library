import { useState } from 'react';

// Remembers which image URL failed to load, so a broken or blocked image falls back to the
// built-in cover. Tracking the URL (not a flag) resets automatically when the image changes.
export const useBookCoverImage = (imageUrl: string) => {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  return {
    shouldShowPlaceholder: !imageUrl || failedImageUrl === imageUrl,
    handleImageError: () => setFailedImageUrl(imageUrl),
  };
};
