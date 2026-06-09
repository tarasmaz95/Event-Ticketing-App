import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';

const menuLogo = require('../../assets/splash-avatar.png');

const MENU_ITEMS = [
  { key: 'events', label: 'Events' },
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
  { key: 'help', label: 'Help' },
  { key: 'returns', label: 'Ticket Returns' },
] as const;

interface Props {
  visible: boolean;
  onClose: () => void;
  onEvents?: () => void;
  onReturns?: () => void;
  userName?: string;
}

export function SideMenu({ visible, onClose, onEvents, onReturns, userName = 'Guest' }: Props) {
  const handlePress = (key: (typeof MENU_ITEMS)[number]['key']) => {
    if (key === 'events') {
      onEvents?.();
      onClose();
      return;
    }
    if (key === 'returns') {
      onReturns?.();
      onClose();
      return;
    }
    const item = MENU_ITEMS.find((m) => m.key === key);
    Alert.alert(item?.label ?? '', 'This section is coming soon (demo).');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <SafeAreaView edges={['top', 'bottom']} style={styles.panelSafe}>
            <View style={styles.logoWrap}>
              <Image source={menuLogo} style={styles.logoAvatar} resizeMode="contain" />
              <View style={styles.logoShape}>
                <Text style={styles.logoText}>Chibuzor Okoye</Text>
              </View>
              <Text style={styles.logoTagline}>Events & Tickets</Text>
            </View>

            <Text style={styles.greeting}>Hi, {userName}!</Text>

            <View style={styles.menuList}>
              {MENU_ITEMS.map((item, i) => (
                <View key={item.key}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handlePress(item.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuChevron}>›</Text>
                  </TouchableOpacity>
                  {i < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </SafeAreaView>
        </View>

        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  panel: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panelSafe: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  logoAvatar: {
    width: 88,
    height: 88,
    marginBottom: 14,
  },
  logoShape: {
    backgroundColor: Colors.red,
    paddingHorizontal: 20,
    paddingVertical: 14,
    transform: [{ skewX: '-8deg' }],
    borderRadius: 2,
  },
  logoText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
    transform: [{ skewX: '8deg' }],
  },
  logoTagline: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 28,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  menuLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textDark,
  },
  menuChevron: {
    fontSize: 22,
    color: Colors.textMuted,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
});
