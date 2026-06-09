import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { fetchTickets, returnOrder } from '../lib/api';
import type { SavedTicket } from '../types/ticket';

const RETURN_REASONS = ['Personal reasons', 'Other'] as const;

type ReturnReason = (typeof RETURN_REASONS)[number];

interface ReturnOrder {
  id: string;
  label: string;
}

function groupTicketsIntoOrders(tickets: SavedTicket[]): ReturnOrder[] {
  const groups = new Map<string, SavedTicket[]>();
  for (const ticket of tickets) {
    const key = `${ticket.created_at}|${ticket.item_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ticket);
  }

  return [...groups.entries()].map(([id, group]) => {
    const count = group.length;
    const ticketWord = count === 1 ? 'ticket' : 'tickets';
    return {
      id,
      label: `${group[0].title} · ${count} ${ticketWord}`,
    };
  });
}

interface SelectAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  onBack: () => void;
  onReturned?: () => void;
}

export function TicketReturnsScreen({ onBack, onReturned }: Props) {
  const selectRef = useRef<View>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ReturnOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<ReturnReason | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectAnchor, setSelectAnchor] = useState<SelectAnchor | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const tickets = await fetchTickets();
        if (!active) return;
        setOrders(groupTicketsIntoOrders(tickets));
      } catch {
        if (active) setOrders([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const canProceed = Boolean(selectedOrderId && selectedReason);

  const closePicker = () => {
    setPickerOpen(false);
    setSelectAnchor(null);
  };

  const togglePicker = () => {
    if (pickerOpen) {
      closePicker();
      return;
    }
    selectRef.current?.measureInWindow((x, y, width, height) => {
      setSelectAnchor({ x, y, width, height });
      setPickerOpen(true);
    });
  };

  const handleConfirmReturn = async () => {
    if (!selectedOrderId || !selectedReason) return;
    setSubmitting(true);
    try {
      const result = await returnOrder(selectedOrderId, selectedReason);
      if (!result.ok) {
        throw new Error(result.error || 'Could not return tickets');
      }
      onReturned?.();
      setConfirmOpen(false);
      setStep('success');
    } catch {
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <SafeAreaView style={styles.successSafe}>
          <View style={styles.successBody}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Ticket successfully returned</Text>
            <Text style={styles.successMessage}>All details have been sent to your email</Text>
          </View>
          <TouchableOpacity style={styles.successBtn} onPress={onBack} activeOpacity={0.88}>
            <Text style={styles.successBtnText}>Done</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ticket Returns</Text>
          <View style={styles.closeBtn} />
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.red} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {orders.length === 0 ? (
            <Text style={styles.emptyText}>No tickets available for return.</Text>
          ) : null}

          <Text style={styles.fieldLabel}>ORDER</Text>
          <View ref={selectRef} collapsable={false}>
            <TouchableOpacity
              style={[styles.selectField, pickerOpen && styles.selectFieldOpen]}
              onPress={orders.length ? togglePicker : undefined}
              activeOpacity={0.8}
              disabled={orders.length === 0}
            >
              <Text style={[styles.selectText, !selectedOrder && styles.selectPlaceholder]}>
                {selectedOrder?.label ?? 'Select order'}
              </Text>
              <Text style={styles.selectChevron}>▾</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>REASON FOR REFUND</Text>
          <View style={styles.reasonList}>
            {RETURN_REASONS.map((reason, index) => {
              const active = selectedReason === reason;
              return (
                <View key={reason}>
                  <TouchableOpacity
                    style={styles.reasonRow}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active ? <View style={styles.radioDot} /> : null}
                    </View>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                  {index < RETURN_REASONS.length - 1 ? <View style={styles.reasonDivider} /> : null}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <TouchableOpacity
          style={[styles.nextBtn, canProceed && styles.nextBtnActive]}
          disabled={!canProceed}
          onPress={() => setConfirmOpen(true)}
          activeOpacity={0.88}
        >
          <Text style={[styles.nextBtnText, canProceed && styles.nextBtnTextActive]}>Next</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={closePicker}>
        <Pressable style={styles.pickerOverlay} onPress={closePicker}>
          {selectAnchor ? (
            <Pressable
              style={[
                styles.floatingDropdown,
                {
                  left: selectAnchor.x,
                  width: selectAnchor.width,
                  top: selectAnchor.y + selectAnchor.height + 8,
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              {orders.map((order, index) => (
                <TouchableOpacity
                  key={order.id}
                  style={[
                    styles.dropdownOption,
                    index < orders.length - 1 && styles.dropdownOptionBorder,
                  ]}
                  onPress={() => {
                    setSelectedOrderId(order.id);
                    closePicker();
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.dropdownOptionText}>{order.label}</Text>
                </TouchableOpacity>
              ))}
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <Pressable style={styles.confirmOverlay} onPress={() => !submitting && setConfirmOpen(false)}>
          <Pressable style={styles.confirmSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.confirmTitle}>Confirm return?</Text>
            <Text style={styles.confirmDesc}>
              {selectedOrder?.label}
              {'\n'}
              Reason: {selectedReason}
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancel}
                onPress={() => setConfirmOpen(false)}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmOk}
                onPress={() => void handleConfirmReturn()}
                disabled={submitting}
                activeOpacity={0.88}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.confirmOkText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  headerSafe: { backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { fontSize: 22, color: Colors.textDark, fontWeight: '600' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  fieldLabelSpaced: { marginTop: 28 },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingDropdown: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
    maxHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: { fontSize: 16, color: Colors.textDark },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  selectFieldOpen: {
    borderColor: Colors.red,
  },
  selectText: { flex: 1, fontSize: 16, color: Colors.textDark, fontWeight: '500' },
  selectPlaceholder: { color: Colors.textMuted, fontWeight: '400' },
  selectChevron: { fontSize: 18, color: Colors.red, marginLeft: 12 },
  reasonList: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CFCFCF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.red },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.red,
  },
  reasonText: { fontSize: 16, color: Colors.textDark, fontWeight: '500' },
  reasonDivider: { height: 1, backgroundColor: '#EFEFEF', marginLeft: 52 },
  footerSafe: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextBtn: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  nextBtnActive: { backgroundColor: Colors.red },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#A0A0A0' },
  nextBtnTextActive: { color: Colors.white },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmSheet: {
    marginHorizontal: 24,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignSelf: 'center',
    width: '88%',
    maxWidth: 360,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmDesc: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmActions: { flexDirection: 'row', gap: 12 },
  confirmCancel: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
  confirmCancelText: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  confirmOk: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.red,
    minHeight: 48,
    justifyContent: 'center',
  },
  confirmOkText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  successSafe: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  successBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIconText: { fontSize: 36, color: '#16A34A', fontWeight: '800' },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  successBtn: {
    backgroundColor: Colors.red,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  successBtnText: { fontSize: 16, fontWeight: '800', color: Colors.white },
});
