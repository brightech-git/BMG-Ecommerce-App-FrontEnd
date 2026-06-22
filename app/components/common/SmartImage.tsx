// app/components/common/SmartImage.tsx
// Image with guaranteed fallback + auto-retry on transient network errors.
// FlatList recycles cells — URI change resets all state so a previously-failed
// cell never shows the fallback on a valid new URI.
// On error: waits 400 ms and retries up to 2 times before showing the fallback.
import React, { useState, useEffect, useCallback } from 'react';
import { Image, StyleProp, ImageStyle, ImageResizeMode } from 'react-native';

export const FALLBACK_IMAGE = require('../../assets/images/icon.png');

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 400;

type Props = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
};

export const SmartImage: React.FC<Props> = ({ uri, style, resizeMode = 'cover' }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [showFallback, setShowFallback] = useState(false);

  // Reset fully whenever the URI changes (FlatList cell recycling)
  useEffect(() => {
    setRetryCount(0);
    setShowFallback(false);
  }, [uri]);

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      // Force remount via key change after short delay — clears RN's cached error state
      setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, RETRY_DELAY_MS);
    } else {
      setShowFallback(true);
    }
  }, [retryCount]);

  const source = !uri || showFallback ? FALLBACK_IMAGE : { uri };

  return (
    <Image
      key={`${uri ?? 'no-uri'}-${retryCount}`}
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={handleError}
    />
  );
};

export default SmartImage;
