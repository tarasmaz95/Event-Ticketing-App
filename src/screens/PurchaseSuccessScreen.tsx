import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { BackIcon } from '../components/BackIcon';

interface Props {
  onBack: () => void;
  onTickets: () => void;
  email?: string;
}

export function PurchaseSuccessScreen({ onBack, onTickets, email }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <BackIcon size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        <Text style={styles.confettiTL}>✦</Text>
        <Text style={styles.confettiTR}>•</Text>

        <View style={styles.illustration}>
          <View style={styles.yellowCircle} />
          <View style={styles.ticketStub}>
            <Text style={styles.ticketText}>TICKET</Text>
          </View>
        </View>

        <Text style={styles.thanks}>Thank you!</Text>
        <Text style={styles.subThanks}>Tickets successfully purchased.</Text>
        <Text style={styles.emailNote}>Your ticket has been sent to your email.</Text>
        {email ? <Text style={styles.emailValue}>{email}</Text> : null}
      </View>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity style={styles.ticketsBtn} onPress={onTickets} activeOpacity={0.88}>
          <Text style={styles.ticketsBtnText}>Tickets</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.red,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    position: 'relative',
  },
  confettiTL: {
    position: 'absolute',
    top: 20,
    left: 24,
    fontSize: 20,
    color: '#9B59B6',
    opacity: 0.6,
  },
  confettiTR: {
    position: 'absolute',
    top: 32,
    right: 40,
    fontSize: 16,
    color: '#F4A261',
    opacity: 0.7,
  },
  illustration: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    marginTop: 16,
  },
  yellowCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F5C518',
    position: 'absolute',
  },
  ticketStub: {
    width: 56,
    height: 72,
    backgroundColor: Colors.red,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  ticketText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    transform: [{ rotate: '90deg' }],
  },
  thanks: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.red,
    marginBottom: 8,
  },
  subThanks: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.red,
    marginBottom: 12,
    textAlign: 'center',
  },
  emailNote: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 6,
  },
  emailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 32,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: Colors.white,
  },
  ticketsBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: Colors.red,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ticketsBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
