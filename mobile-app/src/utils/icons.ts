import { Ionicons } from '@expo/vector-icons';

export function iconName(icon: string | null | undefined): keyof typeof Ionicons.glyphMap {
  if (icon && icon in Ionicons.glyphMap) {
    return icon as keyof typeof Ionicons.glyphMap;
  }
  return 'pricetag-outline';
}
