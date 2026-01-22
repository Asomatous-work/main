import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    return finalStatus === 'granted';
};

/**
 * Schedules a local notification (Reminder)
 * @param {string} title 
 * @param {string} body 
 * @param {Date} date 
 */
export const scheduleReminder = async (title, body, date) => {
    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            console.warn('Notification permissions denied');
            return null;
        }

        // Android Channel configuration (Essential for Android 8+)
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('reminders', {
                name: 'Reminders',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        // Ensure date is in the future
        const now = new Date();
        if (date <= now) {
            date = new Date(now.getTime() + 60 * 1000);
        }

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: `🧠 Mindspace: ${title}`,
                body: body,
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: { title, body },
            },
            trigger: {
                date: date,
                channelId: 'reminders', // Explicitly provide channelId to satisfy the validator
            },
        });

        return id;
    } catch (err) {
        console.error('Failed to schedule notification:', err);
        return null;
    }
};

export const cancelAllReminders = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};
