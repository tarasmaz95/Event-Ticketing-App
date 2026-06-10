import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import type { TextInput as TextInputType } from 'react-native';
import { readWebInputValue } from '../lib/formUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { BackIcon } from '../components/BackIcon';
import type { CheckoutOrder, OrderSeat } from '../data/checkout';
import { getShowItemById } from '../data/catalog';
import { SEAT_COLORS } from '../data/seats';
import type { SeatZone } from '../lib/seatsApi';

const DEFAULT_ZONES: SeatZone[] = [
  { category: 'good', name: 'GOOD', price: 19 },
  { category: 'superlux', name: 'SUPER LUX', price: 30 },
];

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
}

interface Props {
  order: CheckoutOrder;
  onBack: () => void;
  onPay: (customer: CheckoutCustomer) => void;
}

function formatPhoneDisplay(digits: string): string {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function extractPhoneDigits(val: string): string {
  return val.replace(/\D/g, '').slice(0, 10);
}

function formatTimer(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CheckoutScreen({ order, onBack, onPay }: Props) {
  const item = getShowItemById(order.itemId);
  const zones = order.zones?.length ? order.zones : DEFAULT_ZONES;
  const [seats, setSeats] = useState<OrderSeat[]>(order.seats);
  const [timer, setTimer] = useState(7 * 60 + 23);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const phone = formatPhoneDisplay(phoneDigits);
  const [agreeRules, setAgreeRules] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const nameRef = useRef<TextInputType>(null);
  const emailRef = useRef<TextInputType>(null);
  const phoneRef = useRef<TextInputType>(null);

  const total = useMemo(() => seats.reduce((sum, s) => sum + s.price, 0), [seats]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const removeSeat = (id: string) => {
    const next = seats.filter((s) => s.id !== id);
    if (next.length === 0) {
      onBack();
      return;
    }
    setSeats(next);
  };

  const submit = () => {
    setFormError(null);

    const resolvedName = (name.trim() || readWebInputValue(nameRef)).trim();
    const resolvedEmail = (email.trim() || readWebInputValue(emailRef)).trim();
    const resolvedPhoneDigits =
      phoneDigits.length >= 10
        ? phoneDigits
        : extractPhoneDigits(readWebInputValue(phoneRef) || phone);

    if (seats.length === 0) {
      setFormError('Please select at least one seat.');
      return;
    }
    if (!resolvedName || !resolvedEmail || resolvedPhoneDigits.length < 10) {
      setFormError('Please enter your name, email, and a 10-digit phone number.');
      return;
    }
    if (!resolvedEmail.includes('@') || !resolvedEmail.includes('.')) {
      setFormError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!agreeRules || !agreeRefund) {
      setFormError('Please accept both terms and conditions to continue.');
      return;
    }

    onPay({
      name: resolvedName,
      email: resolvedEmail,
      phone: formatPhoneDisplay(resolvedPhoneDigits),
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <BackIcon size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.timerWrap}>
            <Text style={styles.timerIcon}>🕐</Text>
            <Text style={styles.timerText}>{formatTimer(timer)}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Seat legend */}
        <View style={styles.legend}>
          {zones.map((zone) => (
            <View key={zone.category} style={styles.legendItem}>
              <View
                style={[
                  styles.legendSwatch,
                  { backgroundColor: SEAT_COLORS[zone.category] ?? zone.color },
                ]}
              />
              <View>
                <Text style={styles.legendName}>{zone.name}</Text>
                <Text style={styles.legendPrice}>${zone.price}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Selected seats */}
        {seats.map((seat) => (
          <View key={seat.id} style={styles.seatRow}>
            <View style={styles.seatInfo}>
              <Text style={styles.ticketIcon}>🎟</Text>
              <View>
                <Text style={styles.seatLabel}>
                  Row {seat.row} · Seat {seat.number}
                </Text>
              </View>
            </View>
            <Text style={styles.seatPrice}>${seat.price}</Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeSeat(seat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Summary */}
        <View style={styles.summaryRow}>
          <Text style={styles.promoText}>Have a promo code?</Text>
          <Text style={styles.summaryTotal}>
            {seats.length} 🎟 / ${total}
          </Text>
        </View>

        {item && (
          <Text style={styles.eventTitle} numberOfLines={1}>
            {item.title}
          </Text>
        )}

        <View style={styles.divider} />

        <TextInput
          ref={nameRef}
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (formError) setFormError(null);
          }}
          autoComplete="name"
        />
        <TextInput
          ref={emailRef}
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (formError) setFormError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <View style={styles.phoneWrap}>
          <Text style={styles.phoneLabel}>Phone number</Text>
          <TextInput
            ref={phoneRef}
            style={styles.phoneInput}
            placeholder="(555) 123-4567"
            placeholderTextColor="#aaa"
            value={phone}
            onChangeText={(v) => {
              setPhoneDigits(extractPhoneDigits(v));
              if (formError) setFormError(null);
            }}
            keyboardType={Platform.OS === 'web' ? 'default' : 'phone-pad'}
            inputMode={Platform.OS === 'web' ? 'tel' : undefined}
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={14}
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => {
            setAgreeRules((v) => !v);
            if (formError) setFormError(null);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreeRules && styles.checkboxOn]}>
            {agreeRules && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.checkText}>
            I agree to the venue rules and confirm that I am aware of any age restrictions
            for this event.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => {
            setAgreeRefund((v) => !v);
            if (formError) setFormError(null);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreeRefund && styles.checkboxOn]}>
            {agreeRefund && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.checkText}>
            I understand that ticket refunds may be issued as promo codes for future events.
            Cash refunds to your card are not available. Charity screenings are non-refundable.
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {formError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={styles.submitBtn} onPress={submit} activeOpacity={0.88}>
          <Text style={styles.submitText}>Next</Text>
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
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
  },
  timerIcon: { fontSize: 14 },
  timerText: { fontSize: 15, fontWeight: '700', color: Colors.white },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    paddingVertical: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendSwatch: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  legendPrice: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },

  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  seatInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ticketIcon: { fontSize: 18 },
  seatLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  seatPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.red,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '700',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  promoText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  summaryTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.red,
  },
  eventTitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 14,
    backgroundColor: Colors.white,
  },
  phoneWrap: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    paddingTop: 8,
    position: 'relative',
  },
  phoneLabel: {
    position: 'absolute',
    top: -9,
    left: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 4,
    fontSize: 12,
    color: Colors.textMuted,
  },
  phoneInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textDark,
    backgroundColor: Colors.white,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as const } : {}),
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#bbb',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxOn: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  checkMark: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  checkText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 20,
  },

  footer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: Colors.red,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  submitBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: Colors.red,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
