import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { QrCode } from '../components/QrCode';
import { sendTicketEmail, type SavedTicket } from '../lib/api';

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
  const [sending, setSending] = useState(false);

  const handleSendEmail = async () => {
    setSending(true);
    try {
      await sendTicketEmail(ticket.id);
      Alert.alert('Sent', 'Ticket has been sent to your email.');
    } catch {
      Alert.alert('Error', 'Could not send email. Make sure the backend is running.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.red} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tickets</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        <Text style={styles.kindLabel}>Movie</Text>
        <Text style={styles.title}>{ticket.title}</Text>

        <View style={styles.qrWrap}>
          <QrCode value={scanCode(ticket)} size={260} />
        </View>

        <Text style={styles.code}>{displayCode(ticket)}</Text>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <TouchableOpacity
          style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
          onPress={() => void handleSendEmail()}
          activeOpacity={0.85}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.sendBtnText}>Send to email</Text>
          )}
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
  backIcon: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '600',
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
  },
  code: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.red,
    letterSpacing: 0.5,
  },
  footerSafe: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sendBtn: {
    backgroundColor: Colors.red,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnDisabled: {
    opacity: 0.75,
  },
  sendBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
