import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { CategorySlider } from '../components/CategorySlider';
import { PosterImage } from '../components/PosterImage';
import { getItemsByCategory, getComingSoonShowItems } from '../data/catalog';
import type { ShowItem } from '../data/catalog';
import type { CategoryKey } from '../data/events';
import {
  DEFAULT_LOCATION,
  getLocationLabel,
  type SelectedLocation,
} from '../data/locations';
import { LocationPickerScreen } from './LocationPickerScreen';
import { SideMenu } from '../components/SideMenu';
import { fetchTickets, type SavedTicket } from '../lib/api';
import { TicketDetailScreen } from './TicketDetailScreen';
import { TicketReturnsScreen } from './TicketReturnsScreen';

export type HomeTab = 'cinema' | 'soon' | 'tickets';

const BOTTOM_TABS = [
  { key: 'cinema', label: 'NOW PLAYING', icon: '🎬' },
  { key: 'soon', label: 'COMING SOON', icon: '▶' },
  { key: 'tickets', label: 'MY TICKETS', icon: '🎟' },
] as const;

function ItemCard({
  item,
  onPress,
  variant = 'default',
}: {
  item: ShowItem;
  onPress: () => void;
  variant?: 'default' | 'soon';
}) {
  const footerLabel =
    variant === 'soon'
      ? 'RELEASE DATE'
      : item.kind === 'movie'
        ? 'NEXT SHOWTIMES'
        : 'NEXT EVENT';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.posterWrap}>
        <PosterImage uri={item.imageUrl} seed={item.id} style={styles.poster} />
        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.ageRating}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.formats}</Text>
          </View>
        </View>
        <View style={styles.posterOverlay} />
        <View style={styles.posterBottom}>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingNum}>{item.rating}</Text>
          </View>
          <Text style={styles.itemTitle}>{item.title}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.sessionsLabel}>{footerLabel}</Text>
        <Text style={styles.sessionDate}>{item.nextSessionDate}</Text>
      </View>
    </TouchableOpacity>
  );
}

function TicketCard({
  ticket,
  onPress,
}: {
  ticket: SavedTicket;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.ticketCard} onPress={onPress} activeOpacity={0.88}>
      <PosterImage
        uri={ticket.image_url}
        seed={ticket.item_id}
        style={styles.ticketPoster}
      />
      <View style={styles.ticketBody}>
        <View style={styles.ticketTopRow}>
          <Text style={styles.ticketNumber}>№ {ticket.ticket_number}</Text>
        </View>
        <Text style={styles.ticketTitle} numberOfLines={2}>
          {ticket.title}
        </Text>
        <View style={styles.ticketMetaGrid}>
          <View style={styles.ticketMetaItem}>
            <Text style={styles.ticketMetaLabel}>Date</Text>
            <Text style={styles.ticketMetaValue}>{ticket.date_label}</Text>
          </View>
          <View style={styles.ticketMetaItem}>
            <Text style={styles.ticketMetaLabel}>Time</Text>
            <Text style={styles.ticketMetaValue}>{ticket.time}</Text>
          </View>
          <View style={styles.ticketMetaItem}>
            <Text style={styles.ticketMetaLabel}>Hall</Text>
            <Text style={styles.ticketMetaValue}>{ticket.hall}</Text>
          </View>
          <View style={styles.ticketMetaItem}>
            <Text style={styles.ticketMetaLabel}>Row</Text>
            <Text style={styles.ticketMetaValue}>{ticket.row}</Text>
          </View>
          <View style={styles.ticketMetaItem}>
            <Text style={styles.ticketMetaLabel}>Seat</Text>
            <Text style={styles.ticketMetaValue}>{ticket.seat}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface Props {
  onItemPress: (id: string) => void;
  initialTab?: HomeTab;
  ticketsRefreshKey?: number;
}

export function HomeScreen({
  onItemPress,
  initialTab = 'cinema',
  ticketsRefreshKey = 0,
}: Props) {
  const [category, setCategory] = useState<CategoryKey>('home');
  const [activeTab, setActiveTab] = useState<HomeTab>(initialTab);
  const [location, setLocation] = useState<SelectedLocation>(DEFAULT_LOCATION);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tickets, setTickets] = useState<SavedTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SavedTicket | null>(null);
  const [showReturns, setShowReturns] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    setTicketsError(null);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch {
      setTickets([]);
      setTicketsError('Could not load tickets.');
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'tickets') void loadTickets();
  }, [activeTab, ticketsRefreshKey, loadTickets]);

  const catalogItems = useMemo(() => {
    if (activeTab === 'soon') return getComingSoonShowItems();
    if (activeTab === 'tickets') return [];
    return getItemsByCategory(category);
  }, [activeTab, category]);

  const items = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return catalogItems;
    return catalogItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.originalTitle.toLowerCase().includes(q),
    );
  }, [catalogItems, searchQuery]);

  if (showReturns) {
    return <TicketReturnsScreen onBack={() => setShowReturns(false)} />;
  }

  if (showLocationPicker) {
    return (
      <LocationPickerScreen
        selected={location}
        onSelect={setLocation}
        onBack={() => setShowLocationPicker(false)}
      />
    );
  }

  if (selectedTicket) {
    return (
      <TicketDetailScreen
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <View style={styles.topBar}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.menuBtn}
              activeOpacity={0.7}
              onPress={() => setMenuOpen(true)}
            >
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={() => setShowLocationPicker(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.headerTitle} numberOfLines={1}>
                {getLocationLabel(location)}
              </Text>
              <View style={styles.locationChevronWrap}>
                <Text style={styles.locationChevron}>▾</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuBtn}
              activeOpacity={searchQuery ? 0.7 : 1}
              onPress={() => searchQuery && setSearchQuery('')}
            >
              {searchQuery ? (
                <Text style={styles.clearSearch}>✕</Text>
              ) : (
                <Text style={styles.searchIcon}>⌕</Text>
              )}
            </TouchableOpacity>
          </View>
          {activeTab !== 'tickets' ? (
            <View style={styles.searchWrap}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name"
                placeholderTextColor="rgba(255,255,255,0.55)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>
          ) : null}
        </SafeAreaView>
        {activeTab !== 'soon' && activeTab !== 'tickets' && (
          <CategorySlider active={category} onChange={setCategory} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'tickets' ? (
          ticketsLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={Colors.red} />
              <Text style={styles.emptyText}>Loading tickets…</Text>
            </View>
          ) : tickets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎟</Text>
              <Text style={styles.emptyTitle}>No tickets yet</Text>
              <Text style={styles.emptyText}>
                {ticketsError ?? 'Your purchased tickets will appear here.'}
              </Text>
            </View>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onPress={() => setSelectedTicket(ticket)}
              />
            ))
          )
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎟</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'No results' : 'Nothing here'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? `No shows found for "${searchQuery.trim()}".`
                : 'Check back later for new shows.'}
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              variant={activeTab === 'soon' ? 'soon' : 'default'}
              onPress={() => onItemPress(item.id)}
            />
          ))
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.tabBarSafe}>
        <View style={styles.tabBar}>
          {BOTTOM_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => {
                  setActiveTab(tab.key);
                  if (tab.key === 'cinema') setCategory('cinema');
                  if (tab.key === 'soon') setCategory('home');
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                {active && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEvents={() => {
          setActiveTab('cinema');
          setCategory('home');
        }}
        onReturns={() => setShowReturns(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: Colors.red,
  },
  headerSafe: {
    backgroundColor: Colors.red,
    flexGrow: 0,
    flexShrink: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.red,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  menuLine: {
    width: 22,
    height: 2.5,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  locationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  locationChevronWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationChevron: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
    marginTop: 1,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  searchIcon: {
    fontSize: 22,
    color: Colors.white,
    fontWeight: '600',
  },
  clearSearch: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 14,
    paddingBottom: 24,
    gap: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
  },
  ticketCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    minHeight: 120,
  },
  ticketPoster: {
    width: 88,
    backgroundColor: '#ccc',
  },
  ticketBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 10,
    lineHeight: 18,
  },
  ticketMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ticketMetaItem: {
    minWidth: 52,
    marginRight: 4,
  },
  ticketMetaLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  ticketMetaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  posterWrap: { position: 'relative', height: 220 },
  poster: { width: '100%', height: '100%', backgroundColor: '#ccc' },
  badgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
    zIndex: 2,
  },
  badge: {
    backgroundColor: Colors.badge,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
  },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '600' },
  posterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    backgroundColor: Colors.overlay,
  },
  posterBottom: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    zIndex: 2,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  star: { color: Colors.white, fontSize: 13 },
  ratingNum: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  itemTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  sessionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  sessionDate: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 0.2,
  },
  tabBarSafe: {
    backgroundColor: Colors.red,
    flexGrow: 0,
    flexShrink: 0,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.red,
    paddingTop: 10,
    paddingBottom: 6,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 6, position: 'relative' },
  tabIcon: { fontSize: 20, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  tabIconActive: { color: Colors.white },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.4,
  },
  tabLabelActive: { color: Colors.white },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 48,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
});
