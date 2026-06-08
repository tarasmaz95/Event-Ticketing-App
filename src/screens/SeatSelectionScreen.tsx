import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { PosterImage } from '../components/PosterImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { getShowItemById } from '../data/catalog';
import type { SelectedSession } from '../data/showtimes';
import type { CheckoutOrder } from '../data/checkout';
import { formatFromSession } from '../lib/api';
import { buildHallLayout, SEAT_COLORS, type CinemaSeat } from '../data/seats';

interface Props {
  itemId: string;
  session: SelectedSession;
  onBack: () => void;
  onCheckout: (order: CheckoutOrder) => void;
}

const SEAT_SIZE = 22;
const SEAT_GAP = 4;

export function SeatSelectionScreen({ itemId, session, onBack, onCheckout }: Props) {
  const item = getShowItemById(itemId);
  const layout = useMemo(() => buildHallLayout(), []);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (!item) return null;

  const toggleSeat = (seat: CinemaSeat) => {
    if (seat.sold) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(seat.id)) next.delete(seat.id);
      else next.add(seat.id);
      return next;
    });
  };

  const total = useMemo(() => {
    let sum = 0;
    layout.forEach((row) =>
      row.seats.forEach((s) => {
        if (s && selected.has(s.id)) sum += s.price;
      })
    );
    return sum;
  }, [layout, selected]);

  const maxCols = 18;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {item.title}, {session.hallFullName.length > 18
              ? `${session.hallFullName.slice(0, 15)}...`
              : session.hallFullName}
          </Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.venueTitle}>{session.hallFullName}</Text>

        <View style={styles.posterRow}>
          <PosterImage uri={item.imageUrl} seed={item.id} style={styles.posterThumb} />
          <View style={styles.posterInfo}>
            <Text style={styles.posterTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.posterMeta}>{session.dateLabel}</Text>
            <Text style={styles.posterMeta}>{session.time} · {session.room}</Text>
          </View>
        </View>

        {/* Session card */}
        <View style={styles.sessionCard}>
          <Text style={styles.sessionTime}>
            {session.time} - {session.endTime}
          </Text>
          <Text style={styles.sessionRoom}>{session.room}</Text>
          <Text style={styles.sessionDate}>{session.dateLabel}</Text>
        </View>

        {/* Screen */}
        <View style={styles.screenWrap}>
          <View style={styles.screenLine} />
          <Text style={styles.screenLabel}>Screen</Text>
        </View>

        {/* Seat map */}
        <View style={styles.map}>
          {layout.map((row) => (
            <View key={row.row} style={styles.seatRow}>
              <Text style={styles.rowNum}>{row.row}</Text>
              <View style={[styles.seatRowInner, { maxWidth: maxCols * (SEAT_SIZE + SEAT_GAP) }]}>
                {row.seats.map((seat, i) => {
                  if (!seat) {
                    return <View key={`gap-${row.row}-${i}`} style={styles.aisle} />;
                  }
                  const isSelected = selected.has(seat.id);
                  const bg = seat.sold
                    ? SEAT_COLORS.sold
                    : seat.category === 'superlux'
                      ? isSelected
                        ? SEAT_COLORS.superluxSelected
                        : SEAT_COLORS.superlux
                      : isSelected
                        ? SEAT_COLORS.goodSelected
                        : SEAT_COLORS.good;

                  return (
                    <TouchableOpacity
                      key={seat.id}
                      onPress={() => toggleSeat(seat)}
                      disabled={seat.sold}
                      activeOpacity={0.75}
                      style={[
                        styles.seat,
                        { backgroundColor: bg },
                        isSelected && styles.seatSelected,
                      ]}
                    >
                      {seat.sold && <Text style={styles.soldX}>✕</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: SEAT_COLORS.good }]} />
            <View>
              <Text style={styles.legendName}>GOOD</Text>
              <Text style={styles.legendPrice}>$19</Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: SEAT_COLORS.superlux }]} />
            <View>
              <Text style={styles.legendName}>SUPER LUX</Text>
              <Text style={styles.legendPrice}>$30</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {selected.size > 0 && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity
            style={styles.buyBtn}
            activeOpacity={0.88}
            onPress={() => {
              const seats = [...selected]
                .map((id) => {
                  for (const row of layout) {
                    const seat = row.seats.find((s) => s?.id === id);
                    if (seat) return seat;
                  }
                  return null;
                })
                .filter((s): s is CinemaSeat => s !== null)
                .map((s) => ({
                  id: s.id,
                  row: s.row,
                  number: s.number,
                  price: s.price,
                  category: s.category,
                }));

              onCheckout({
                itemId,
                itemTitle: item.title,
                itemImageUrl: item.imageUrl,
                format: formatFromSession(session.formats),
                session,
                seats,
                seatCount: seats.length,
                total,
              });
            }}
          >
            <Text style={styles.buyText}>
              Pay · ${total}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
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
  backIcon: { fontSize: 26, color: Colors.white, fontWeight: '600' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    paddingHorizontal: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  venueTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  posterRow: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  posterThumb: {
    width: 72,
    height: 100,
    borderRadius: 6,
    backgroundColor: '#ddd',
  },
  posterInfo: {
    flex: 1,
  },
  posterTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  posterMeta: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  sessionCard: {
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.red,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  sessionTime: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.red,
    marginBottom: 4,
  },
  sessionRoom: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.red,
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.red,
  },
  screenWrap: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  screenLine: {
    width: '80%',
    height: 3,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 6,
  },
  screenLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  map: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SEAT_GAP,
  },
  rowNum: {
    width: 20,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textAlign: 'right',
    marginRight: 6,
  },
  seatRowInner: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    gap: SEAT_GAP,
  },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatSelected: {
    borderWidth: 2,
    borderColor: Colors.red,
  },
  soldX: {
    fontSize: 10,
    color: '#888',
    fontWeight: '700',
  },
  aisle: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginTop: 28,
    paddingHorizontal: 16,
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
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: Colors.white,
  },
  buyBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: Colors.red,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buyText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
});
