import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

// Emotion cache that flips CSS (margin-left -> margin-right, etc.) for the Hebrew RTL layout
export const rightToLeftEmotionCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});
