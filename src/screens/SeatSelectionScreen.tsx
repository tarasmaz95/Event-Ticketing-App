import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { PosterImage } from '../components/PosterImage';
import { BackIcon } from '../components/BackIcon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { getShowItemById } from '../data/catalog';
import type { SelectedSession } from '../data/showtimes';
import type { CheckoutOrder } from '../data/checkout';
import { formatFromSession } from '../lib/api';
import { SEAT_COLORS } from '../data/seats';
import {
  fetchSeatLayout,
  type CinemaSeat,
  type SeatRow,
  type SeatZone,
} from '../lib/seatsApi';

const DEFAULT_ZONES: SeatZone[] = [
  { category: 'good', name: 'GOOD', price: 19 },
  { category: 'superlux', name: 'SUPER LUX', price: 30 },
];

interface Props {
  itemId: string;
  session: SelectedSession;
  onBack: () => void;
  onCheckout: (order: CheckoutOrder) => void;
}

const BASE_SEAT_SIZE = 22;
const BASE_SEAT_GAP = 4;
const ROW_LABEL_WIDTH = 26;
const MAP_SIDE_PADDING = 16;
const MIN_SEAT_SIZE = 14;

export function SeatSelectionScreen({ itemId, session, onBack, onCheckout }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const item = getShowItemById(itemId);
  const [layout, setLayout] = useState<SeatRow[]>([]);
  const [zones, setZones] = useState<SeatZone[]>(DEFAULT_ZONES);
  const [colors, setColors] = useState(SEAT_COLORS);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSelected(new Set());
    (async () => {
      try {
        const data = await fetchSeatLayout({
          itemId,
          dateLabel: session.dateLabel,
          time: session.time,
          hall: session.room,
        });
        if (!active) return;
        setLayout(data.rows);
        setZones(data.zones?.length ? data.zones : DEFAULT_ZONES);
        setColors({ ...SEAT_COLORS, ...data.colors });
      } catch {
        if (active) {
          setLayout([]);
          setZones(DEFAULT_ZONES);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [itemId, session.dateLabel, session.time, session.room]);

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

  const maxCols = useMemo(() => {
    let max = 0;
    for (const row of layout) {
      max = Math.max(max, row.seats.length);
    }
    return max || 18;
  }, [layout]);

  const seatMetrics = useMemo(() => {
    const contentWidth = Math.min(screenWidth, 480);
    const availableWidth = contentWidth - ROW_LABEL_WIDTH - MAP_SIDE_PADDING;
    const naturalWidth = maxCols * (BASE_SEAT_SIZE + BASE_SEAT_GAP) - BASE_SEAT_GAP;

    if (naturalWidth <= availableWidth) {
      return {
        seatSize: BASE_SEAT_SIZE,
        seatGap: BASE_SEAT_GAP,
        mapWidth: naturalWidth,
      };
    }

    const scale = availableWidth / naturalWidth;
    const seatSize = Math.max(MIN_SEAT_SIZE, Math.floor(BASE_SEAT_SIZE * scale));
    const seatGap = Math.max(2, Math.floor(BASE_SEAT_GAP * scale));
    const mapWidth = maxCols * (seatSize + seatGap) - seatGap;

    return { seatSize, seatGap, mapWidth };
  }, [maxCols, screenWidth]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <BackIcon size={26} />
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

        <View style={styles.sessionCard}>
          <Text style={styles.sessionTime}>
            {session.time} - {session.endTime}
          </Text>
          <Text style={styles.sessionRoom}>{session.room}</Text>
          <Text style={styles.sessionDate}>{session.dateLabel}</Text>
        </View>

        <View style={styles.screenWrap}>
          <View style={styles.screenLine} />
          <Text style={styles.screenLabel}>Screen</Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.red} />
          </View>
        ) : (
          <>
            <View style={styles.map}>
              {layout.map((row) => (
                <View key={row.row} style={styles.seatRow}>
                  <Text style={styles.rowNum}>{row.row}</Text>
                  <View
                    style={[
                      styles.seatRowInner,
                      {
                        width: seatMetrics.mapWidth,
                        gap: seatMetrics.seatGap,
                      },
                    ]}
                  >
                    {row.seats.map((seat, i) => {
                      if (!seat) {
                        return (
                          <View
                            key={`gap-${row.row}-${i}`}
                            style={{
                              width: seatMetrics.seatSize,
                              height: seatMetrics.seatSize,
                            }}
                          />
                        );
                      }
                      const isSelected = selected.has(seat.id);
                      const bg = seat.sold
                        ? colors.sold
                        : seat.category === 'superlux'
                          ? isSelected
                            ? colors.superluxSelected
                            : colors.superlux
                          : isSelected
                            ? colors.goodSelected
                            : colors.good;

                      return (
                        <TouchableOpacity
                          key={seat.id}
                          onPress={() => toggleSeat(seat)}
                          disabled={seat.sold}
                          activeOpacity={0.75}
                          style={[
                            styles.seat,
                            {
                              width: seatMetrics.seatSize,
                              height: seatMetrics.seatSize,
                              backgroundColor: bg,
                            },
                            isSelected && styles.seatSelected,
                          ]}
                        >
                          {seat.sold && (
                            <Text
                              style={[
                                styles.soldX,
                                { fontSize: Math.max(8, seatMetrics.seatSize * 0.45) },
                              ]}
                            >
                              ✕
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.legend}>
              {zones.map((zone) => (
                <View key={zone.category} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendSwatch,
                      { backgroundColor: colors[zone.category] ?? zone.color },
                    ]}
                  />
                  <View>
                    <Text style={styles.legendName}>{zone.name}</Text>
                    <Text style={styles.legendPrice}>${zone.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
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
                zones,
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
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
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
    marginBottom: 4,
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
    justifyContent: 'flex-start',
  },
  seat: {
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
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
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
