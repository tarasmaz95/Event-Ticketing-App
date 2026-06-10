import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

interface Props {
  color?: string;
  size?: number;
}

export function BackIcon({ color = Colors.white, size = 28 }: Props) {
  return <Ionicons name="chevron-back" size={size} color={color} />;
}
