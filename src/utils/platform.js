/**
 * Platform-safe exports for web compatibility
 */
import { Platform } from 'react-native';

// Haptics - no-op on web
export const Haptics = Platform.OS === 'web'
    ? {
        impactAsync: async () => { },
        selectionAsync: async () => { },
        notificationAsync: async () => { },
        ImpactFeedbackStyle: { Light: 0, Medium: 1, Heavy: 2 },
        NotificationFeedbackType: { Success: 0, Warning: 1, Error: 2 }
    }
    : require('expo-haptics');

// BlurView - CSS fallback on web
export const BlurView = Platform.OS === 'web'
    ? require('react-native').View
    : require('expo-blur').BlurView;
