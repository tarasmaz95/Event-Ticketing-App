import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { PosterImage } from '../components/PosterImage';
import { BackIcon } from '../components/BackIcon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { getShowItemById } from '../data/catalog';
import type { SelectedSession } from '../data/showtimes';
import {
  fetchShowtimes,
  type CinemaHall,
  type DateOption,
} from '../lib/showtimesApi';

interface Props {
  itemId: string;
  onBack: () => void;
  onSessionSelect: (session: SelectedSession) => void;
}

export function ShowtimesScreen({ itemId, onBack, onSessionSelect }: Props) {
  const item = getShowItemById(itemId);
  const [loading, setLoading] = useState(true);
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState('d1');
  const [displayHalls, setDisplayHalls] = useState<CinemaHall[]>([]);
  const [activeDate, setActiveDate] = useState<DateOption | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchShowtimes(itemId, selectedDate);
        if (!active) return;
        setDateOptions(data.dates);
        setDisplayHalls(data.halls);
        setActiveDate(data.activeDate);
      } catch {
        if (active) {
          setDateOptions([]);
          setDisplayHalls([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [itemId, selectedDate]);

  if (!item) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <BackIcon size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      <PosterImage uri={item.imageUrl} seed={item.id} style={styles.banner} />

      <View style={styles.controlsSection}>
        <View style={styles.datePickerWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
            style={styles.dateScroll}
          >
            {dateOptions.map((d) => {
              const active = selectedDate === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.dateCard, active && styles.dateCardActive]}
                  onPress={() => setSelectedDate(d.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.dateDay, active && styles.dateTextActive]}>{d.day}</Text>
                  <Text style={[styles.dateNum, active && styles.dateTextActive]}>{d.date}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

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
          {displayHalls.map((hall) => (
            <View key={hall.id} style={styles.hallSection}>
              <PosterImage uri={hall.imageUrl} seed={hall.id} style={styles.hallImage} />
              <View style={styles.hallHeader}>
                <Text style={[styles.hallName, hall.highlighted && styles.hallNameRed]}>
                  {hall.name}
                </Text>
                <Text style={styles.hallAddress} numberOfLines={1}>{hall.address}</Text>
              </View>

              <View style={styles.timesGrid}>
                {hall.showtimes.map((st, i) => (
                  <TouchableOpacity
                    key={`${hall.id}-${selectedDate}-${st.time}-${i}`}
                    style={styles.timeCell}
                    activeOpacity={0.7}
                    onPress={() =>
                      onSessionSelect({
                        hallId: hall.id,
                        hallName: hall.name,
                        hallFullName: hall.fullName,
                        time: st.time,
                        endTime: st.endTime ?? '11:25',
                        room: st.room ?? 'Hall 2',
                        formats: st.formats,
                        dateLabel: activeDate?.label ?? '',
                      })
                    }
                  >
                    <Text style={styles.timeText}>{st.time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
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
    justifyContent: 'space-between',
    backgroundColor: Colors.red,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    paddingHorizontal: 8,
  },
  banner: {
    width: '100%',
    height: 140,
    backgroundColor: '#ddd',
  },
  controlsSection: {
    flexGrow: 0,
    flexShrink: 0,
  },
  datePickerWrap: {
    height: 84,
    flexGrow: 0,
    flexShrink: 0,
  },
  dateScroll: {
    height: 84,
    flexGrow: 0,
    flexShrink: 0,
  },
  dateRow: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 10,
    alignItems: 'center',
  },
  dateCard: {
    width: 56,
    height: 64,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCardActive: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  dateDay: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 2 },
  dateNum: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  dateTextActive: { color: Colors.white },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  hallSection: { marginBottom: 8 },
  hallImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#ddd',
  },
  hallHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  hallName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    flexShrink: 0,
  },
  hallNameRed: { color: Colors.red },
  hallAddress: {
    fontSize: 13,
    color: Colors.textMuted,
    flex: 1,
    textAlign: 'right',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  timeCell: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 14,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
});
