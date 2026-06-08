import React, { useState } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { fallbackImage } from '../data/images';

interface Props {
  uri: string;
  seed: string;
  style?: StyleProp<ImageStyle>;
}

export function PosterImage({ uri, seed, style }: Props) {
  const [src, setSrc] = useState(uri);

  return (
    <Image
      source={{ uri: src }}
      style={style}
      resizeMode="cover"
      onError={() => setSrc(fallbackImage(seed))}
    />
  );
}
