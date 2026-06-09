import { Alert, Platform } from 'react-native';

export function showUserMessage(title: string, message?: string): void {
  const text = message ? `${title}\n\n${message}` : title;
  if (Platform.OS === 'web') {
    window.alert(text);
    return;
  }
  Alert.alert(title, message);
}
