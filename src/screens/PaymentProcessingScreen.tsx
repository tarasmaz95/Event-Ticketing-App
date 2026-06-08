import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';

interface Props {
  onComplete: () => void | Promise<void>;
}

export function PaymentProcessingScreen({ onComplete }: Props) {
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 2000));
      if (!cancelled) await onComplete();
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Checkout</Text>
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        <View style={styles.stripeBadge}>
          <Text style={styles.stripeText}>stripe</Text>
        </View>

        <ActivityIndicator size="large" color={Colors.red} style={styles.spinner} />

        <Text style={styles.title}>Processing payment…</Text>
        <Text style={styles.subtitle}>Please wait, do not close this window.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  headerSafe: { backgroundColor: Colors.red },
  header: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.red,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stripeBadge: {
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#635BFF',
  },
  stripeText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  spinner: { marginBottom: 24 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
