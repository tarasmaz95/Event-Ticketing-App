import type { RefObject } from 'react';
import { Platform } from 'react-native';
import type { TextInput } from 'react-native';

export function readWebInputValue(ref: RefObject<TextInput | null>): string {
  if (Platform.OS !== 'web' || !ref.current) return '';
  const node = ref.current as unknown as HTMLElement;
  if (node instanceof HTMLInputElement) return node.value;
  const input = node.querySelector('input');
  return input?.value ?? '';
}

export function isValidExpiry(expiryDigits: string): boolean {
  if (expiryDigits.length < 4) return false;
  const month = Number(expiryDigits.slice(0, 2));
  return month >= 1 && month <= 12;
}
