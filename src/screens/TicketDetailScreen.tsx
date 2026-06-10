import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { BackIcon } from '../components/BackIcon';
import type { SavedTicket } from '../lib/api';
import { ticketCategoryLabel } from '../lib/ticketCategory';

const ticketQrImage = require('../../assets/ticket-qr.png');

interface Props {
  ticket: SavedTicket;
  onBack: () => void;
}

function scanCode(ticket: SavedTicket): string {
  return `T${ticket.hall}0${ticket.ticket_number}`;
}

function displayCode(ticket: SavedTicket): string {
  const raw = scanCode(ticket);
  if (raw.length > 4) return `${raw.slice(0, 4)} ${raw.slice(4)}`;
  return raw;
}

export function TicketDetailScreen({ ticket, onBack }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <BackIcon size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tickets</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        <Text style={styles.kindLabel}>{ticketCategoryLabel(ticket.category)}</Text>
        <Text style={styles.title}>{ticket.title}</Text>

        <View style={styles.qrWrap}>
          <Image source={ticketQrImage} style={styles.qrImage} resizeMode="contain" />
        </View>

        <Text style={styles.code}>{displayCode(ticket)}</Text>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <Text style={styles.emailNote}>Your ticket has been sent to your email.</Text>
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
  headerSafe: {
    backgroundColor: Colors.red,
    flexGrow: 0,
    flexShrink: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.red,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  kindLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  qrWrap: {
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  qrImage: {
    width: 260,
    height: 260,
  },
  code: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.red,
    letterSpacing: 0.5,
  },
  footerSafe: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  emailNote: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
