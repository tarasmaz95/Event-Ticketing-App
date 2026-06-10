import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getDevApiHost(): string | null {
  const hostUri =
    Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  return hostUri.split(':')[0] ?? null;
}

function resolveApiBase(): string {
  if (Platform.OS === 'web') {
    const hostname =
      typeof window !== 'undefined' ? window.location?.hostname : undefined;
    if (hostname === 'localhost') {
      return 'http://localhost:8001/api';
    }
  }

  const devHost = getDevApiHost();
  if (__DEV__ && devHost && devHost !== 'localhost') {
    // Tunnel only proxies Metro (8081); API stays on the dev machine LAN IP.
    if (devHost.endsWith('.exp.direct')) {
      return 'http://192.168.0.102:8001/api';
    }
    return `http://${devHost}:8001/api`;
  }

  return 'https://tickets-backend.tm1.website/api';
}

/** Resolved on each call so Expo Go host info is available on native. */
export function getApiBase(): string {
  return resolveApiBase();
}

/** Rewrite localhost asset URLs so they work on a physical device. */
export function resolveAssetUrl(url: string): string {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      return url;
    }

    if (Platform.OS === 'web') {
      const hostname =
        typeof window !== 'undefined' ? window.location?.hostname : undefined;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return url;
      }
    }

    const api = new URL(getApiBase());
    parsed.protocol = api.protocol;
    parsed.hostname = api.hostname;
    parsed.port = api.port;
    return parsed.toString();
  } catch {
    return url;
  }
}
