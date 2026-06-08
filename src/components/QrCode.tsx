import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'qrcode';
import { Colors } from '../theme';

interface QrCodeProps {
  value: string;
  size?: number;
}

export function QrCode({ value, size = 240 }: QrCodeProps) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUri(null);

    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#111111', light: '#ffffff' },
    })
      .then((dataUrl) => {
        if (!cancelled) setUri(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setUri(null);
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="contain" />
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={Colors.red} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
