import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import type { CheckoutOrder } from '../data/checkout';
import { getShowItemById } from '../data/catalog';

const STRIPE_PURPLE = '#635BFF';

export interface PaymentCustomer {
  name: string;
  email: string;
}

interface Props {
  order: CheckoutOrder;
  customer: PaymentCustomer;
  onBack: () => void;
  onPay: () => void;
}

function formatCardNumber(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function StripePaymentScreen({ order, customer, onBack, onPay }: Props) {
  const item = getShowItemById(order.itemId);
  const total = useMemo(
    () => order.seats.reduce((sum, s) => sum + s.price, 0),
    [order.seats]
  );

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paying, setPaying] = useState(false);

  const cardDigits = cardNumber.replace(/\D/g, '');
  const cvcDigits = cvc.replace(/\D/g, '');
  const expiryDigits = expiry.replace(/\D/g, '');

  const handlePay = async () => {
    if (cardDigits.length < 16) {
      Alert.alert('Invalid card', 'Please enter a valid 16-digit card number.');
      return;
    }
    if (expiryDigits.length < 4) {
      Alert.alert('Invalid expiry', 'Please enter expiry as MM/YY.');
      return;
    }
    if (cvcDigits.length < 3) {
      Alert.alert('Invalid CVC', 'Please enter the 3-digit security code.');
      return;
    }

    setPaying(true);
    await new Promise((r) => setTimeout(r, 900));
    setPaying(false);
    onPay();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={STRIPE_PURPLE} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.stripeLogoWrap}>
            <Text style={styles.stripeLogo}>stripe</Text>
          </View>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Order summary</Text>
          <Text style={styles.summaryTitle} numberOfLines={2}>
            {item?.title ?? order.itemTitle}
          </Text>
          <Text style={styles.summaryMeta}>
            {order.seats.length} ticket{order.seats.length !== 1 ? 's' : ''} ·{' '}
            {order.session.dateLabel} · {order.session.time}
          </Text>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total due</Text>
            <Text style={styles.summaryTotal}>${total}</Text>
          </View>
          <Text style={styles.summaryEmail}>{customer.email}</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment details</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Card number</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="1234 1234 1234 1234"
              placeholderTextColor="#aab0bc"
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCardNumber(v))}
              keyboardType="number-pad"
              maxLength={19}
            />
            <Text style={styles.cardBrand}>💳</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={[styles.fieldGroup, styles.fieldHalf]}>
            <Text style={styles.fieldLabel}>Expiry</Text>
            <TextInput
              style={styles.input}
              placeholder="MM / YY"
              placeholderTextColor="#aab0bc"
              value={expiry}
              onChangeText={(v) => setExpiry(formatExpiry(v))}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          <View style={[styles.fieldGroup, styles.fieldHalf]}>
            <Text style={styles.fieldLabel}>CVC</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              placeholderTextColor="#aab0bc"
              value={cvc}
              onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Name on card</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#aab0bc"
            value={customer.name}
            editable={false}
          />
        </View>

        <View style={styles.secureRow}>
          <Text style={styles.secureIcon}>🔒</Text>
          <Text style={styles.secureText}>
            Payments are securely processed by Stripe. Demo mode — use any test card.
          </Text>
        </View>

        <View style={styles.testHint}>
          <Text style={styles.testHintTitle}>Test card</Text>
          <Text style={styles.testHintText}>4242 4242 4242 4242 · 12/34 · 123</Text>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, paying && styles.payBtnDisabled]}
          onPress={() => void handlePay()}
          activeOpacity={0.88}
          disabled={paying}
        >
          {paying ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.payBtnText}>Pay ${total}</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.poweredBy}>Powered by Stripe</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9fc',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  headerSafe: { backgroundColor: STRIPE_PURPLE },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: STRIPE_PURPLE,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 26,
    color: Colors.white,
    fontWeight: '600',
  },
  stripeLogoWrap: { flex: 1, alignItems: 'center' },
  stripeLogo: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e6ebf1',
    shadowColor: '#0a2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8898aa',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a2540',
    marginBottom: 6,
  },
  summaryMeta: {
    fontSize: 13,
    color: '#697386',
    lineHeight: 18,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e6ebf1',
    marginVertical: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#425466',
  },
  summaryTotal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a2540',
  },
  summaryEmail: {
    marginTop: 8,
    fontSize: 13,
    color: '#8898aa',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0a2540',
    marginBottom: 12,
  },
  fieldGroup: { marginBottom: 14 },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldHalf: { flex: 1 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#425466',
    marginBottom: 6,
  },
  inputRow: {
    position: 'relative',
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e0e6ee',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0a2540',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as const } : {}),
  },
  cardBrand: {
    position: 'absolute',
    right: 12,
    top: 14,
    fontSize: 18,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  secureIcon: { fontSize: 14, marginTop: 1 },
  secureText: {
    flex: 1,
    fontSize: 12,
    color: '#697386',
    lineHeight: 17,
  },
  testHint: {
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  testHintTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: STRIPE_PURPLE,
    marginBottom: 4,
  },
  testHintText: {
    fontSize: 13,
    color: '#425466',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footer: {
    backgroundColor: '#f6f9fc',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e6ebf1',
  },
  payBtn: {
    backgroundColor: STRIPE_PURPLE,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: STRIPE_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnDisabled: { opacity: 0.8 },
  payBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  poweredBy: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8898aa',
    marginTop: 10,
    marginBottom: 4,
  },
});
