// app/components/common/SmartImage.tsx
// Image with a guaranteed fallback to assets/icon.png when the URI is missing
// or fails to load. Use everywhere a remote product/banner/category image renders.
import React, { useState } from 'react';
import { Image, StyleProp, ImageStyle, ImageResizeMode } from 'react-native';

export const FALLBACK_IMAGE = require('../../assets/images/icon.png');

type Props = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
};

export const SmartImage: React.FC<Props> = ({ uri, style, resizeMode = 'cover' }) => {
  const [errored, setErrored] = useState(false);
  const source = !uri || errored ? FALLBACK_IMAGE : { uri };
  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={() => setErrored(true)}
    />
  );
};

export default SmartImage;
