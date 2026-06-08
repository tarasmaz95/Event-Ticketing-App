import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';

interface Props {
  onFinish: () => void;
}

const SPLASH_DURATION_MS = 2200;

export function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <View style={styles.ticketIcon}>
              <Text style={styles.ticketEmoji}>🎟</Text>
            </View>
          </View>

          <Text style={styles.brand}>Your Brand</Text>
          <Text style={styles.tagline}>Events & Tickets</Text>
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
  logoWrap: {
    marginBottom: 28,
  },
  ticketIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  ticketEmoji: {
    fontSize: 48,
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
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
