import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { getShowItemById } from '../data/catalog';
import { PosterImage } from '../components/PosterImage';
import { BackIcon } from '../components/BackIcon';

interface Props {
  itemId: string;
  onBack: () => void;
  onShowtimes: () => void;
}

export function MovieDetailScreen({ itemId, onBack, onShowtimes }: Props) {
  const item = getShowItemById(itemId);
  if (!item) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <PosterImage uri={item.imageUrl} seed={item.id} style={styles.heroImage} />
          <View style={styles.heroOverlay} />

          <SafeAreaView edges={['top']} style={styles.heroHeader}>
            <TouchableOpacity onPress={onBack} style={styles.iconBtn} activeOpacity={0.7}>
              <BackIcon size={26} />
            </TouchableOpacity>
            <Text style={styles.heroTitle} numberOfLines={1}>{item.title}</Text>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Share', item.title)}
            >
              <Text style={styles.shareIcon}>↗</Text>
            </TouchableOpacity>
          </SafeAreaView>

          <TouchableOpacity
            style={styles.playBtn}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Trailer', 'Playing trailer (demo)')}
          >
            <Text style={styles.playTriangle}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Rating cards */}
        <View style={styles.ratingCards}>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingValue}>Not yet rated</Text>
            <Text style={styles.ratingLabel}>Audience score</Text>
          </View>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingValue}>Not yet rated</Text>
            <Text style={styles.ratingLabel}>Critics score</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.duration} | {item.genres}
          </Text>
          <Text style={styles.description}>{item.description}</Text>

          {item.venue ? (
            <>
              <Text style={styles.fieldLabel}>Venue</Text>
              <Text style={styles.fieldValue}>{item.venue}</Text>
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>Original title</Text>
              <Text style={styles.fieldValue}>{item.originalTitle}</Text>
            </>
          )}

          {item.kind === 'movie' ? (
            <>
              <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Release date</Text>
              <Text style={styles.fieldValue}>{item.releaseDate}</Text>
            </>
          ) : null}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* CTA */}
      <SafeAreaView edges={['bottom']} style={styles.ctaSafe}>
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.88}
          onPress={onShowtimes}
        >
          <Text style={styles.ctaText}>{item.kind === 'movie' ? 'Showtimes' : 'Get Tickets'}</Text>
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
  hero: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 22,
    color: Colors.white,
    fontWeight: '600',
  },
  heroTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    paddingHorizontal: 8,
  },
  playBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playTriangle: {
    color: Colors.white,
    fontSize: 22,
    marginLeft: 4,
  },
  ratingCards: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: -36,
    zIndex: 2,
  },
  ratingCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: Colors.textDark,
    lineHeight: 24,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  ctaSafe: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  ctaBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: Colors.red,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
