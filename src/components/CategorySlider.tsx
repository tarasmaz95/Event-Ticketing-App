import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Colors } from '../theme';
import type { CategoryKey } from '../data/events';
import { CATEGORIES } from '../data/events';

interface Props {
  active: CategoryKey;
  onChange: (key: CategoryKey) => void;
}

export function CategorySlider({ active, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sliderContent}
        style={styles.slider}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.key;
          return (
            <Pressable
              key={cat.key}
              style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
              onPress={() => onChange(cat.key)}
              hitSlop={6}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {cat.label}
              </Text>
              {isActive && <View style={styles.underline} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 44,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: Colors.red,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  slider: {
    height: 44,
    flexGrow: 0,
    flexShrink: 0,
  },
  sliderContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 44,
  },
  tabPressed: {
    opacity: 0.8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.4,
  },
  tabLabelActive: {
    color: Colors.white,
  },
  underline: {
    position: 'absolute',
    bottom: 2,
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
});
