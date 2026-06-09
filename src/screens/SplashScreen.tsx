import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';

const avatar = require('../../assets/splash-avatar.png');

interface Props {
  onFinish: () => void;
  onLoad?: () => Promise<void>;
}

const SPLASH_DURATION_MS = 2200;
const SPLASH_MAX_MS = 5000;

const TAGLINE_FONT =
  Platform.OS === 'web'
    ? '"Cormorant Garamond", Georgia, "Times New Roman", serif'
    : Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export function SplashScreen({ onFinish, onLoad }: Props) {
  useEffect(() => {
    let cancelled = false;

    const wait = async () => {
      const minDelay = new Promise((r) => setTimeout(r, SPLASH_DURATION_MS));
      const preload = onLoad?.().catch(() => undefined) ?? Promise.resolve();
      const maxWait = new Promise((r) => setTimeout(r, SPLASH_MAX_MS));
      await Promise.race([Promise.all([minDelay, preload]), maxWait]);
      if (!cancelled) onFinish();
    };

    wait();
    return () => {
      cancelled = true;
    };
  }, [onFinish, onLoad]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Image source={avatar} style={styles.avatar} resizeMode="contain" />
          <View style={styles.taglineWrap}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>Events & Tickets</Text>
            <View style={styles.taglineLine} />
          </View>
        </View>

        <View style={styles.footer}>
          <ActivityIndicator size="small" color={Colors.white} />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.red,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 280,
    height: 280,
    marginBottom: 8,
  },
  taglineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  taglineLine: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  tagline: {
    fontSize: 22,
    fontWeight: '400',
    fontFamily: TAGLINE_FONT,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    ...(Platform.OS === 'web' ? { fontStyle: 'italic' as const } : {}),
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
  },
});
