import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { getCities, type SelectedLocation } from '../lib/locationsApi';

interface Props {
  selected: SelectedLocation;
  onSelect: (loc: SelectedLocation) => void;
  onBack: () => void;
}

export function LocationPickerScreen({ selected, onSelect, onBack }: Props) {
  const [expandedCity, setExpandedCity] = useState(selected.cityId);

  const toggleCity = (cityId: string) => {
    setExpandedCity((prev) => (prev === cityId ? '' : cityId));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Venues</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {getCities().map((city) => {
          const isExpanded = expandedCity === city.id;
          const isSelectedCity = selected.cityId === city.id;

          return (
            <View key={city.id}>
              <TouchableOpacity
                style={styles.cityRow}
                onPress={() => toggleCity(city.id)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.cityName,
                    (isExpanded || isSelectedCity) && styles.cityNameActive,
                  ]}
                >
                  {city.name}
                </Text>
                <Text style={[styles.chevron, isExpanded && styles.chevronOpen]}>›</Text>
              </TouchableOpacity>

              {isExpanded &&
                city.venues.map((venue) => {
                  const isActive =
                    selected.cityId === city.id && selected.venueId === venue.id;
                  return (
                    <TouchableOpacity
                      key={venue.id}
                      style={styles.venueRow}
                      onPress={() => {
                        onSelect({ cityId: city.id, venueId: venue.id });
                        onBack();
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.pinIcon}>📍</Text>
                      <View style={styles.venueInfo}>
                        <Text
                          style={[styles.venueName, isActive && styles.venueNameActive]}
                        >
                          {venue.name}
                        </Text>
                        <Text style={styles.venueAddress}>{venue.address}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

              <View style={styles.divider} />
            </View>
          );
        })}
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  scroll: { flex: 1 },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  cityName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  cityNameActive: {
    color: Colors.red,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textMuted,
    transform: [{ rotate: '90deg' }],
  },
  chevronOpen: {
    color: Colors.red,
    transform: [{ rotate: '270deg' }],
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 28,
    paddingRight: 20,
    paddingVertical: 14,
    gap: 10,
  },
  pinIcon: {
    fontSize: 16,
    marginTop: 2,
    opacity: 0.5,
  },
  venueInfo: { flex: 1 },
  venueName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  venueNameActive: {
    color: Colors.red,
  },
  venueAddress: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 20,
  },
});
