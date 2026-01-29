
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDERS_KEY = '@gotcha_reminders_v1';

/**
 * Reminder Service
 * Handles persistence of smart reminders detected in chats.
 */

export const saveReminder = async (reminder) => {
    try {
        const stored = await AsyncStorage.getItem(REMINDERS_KEY);
        let reminders = stored ? JSON.parse(stored) : [];

        const newReminder = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: 'pending', // pending | completed | dismiss
            ...reminder
        };

        reminders.unshift(newReminder);
        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
        return newReminder;
    } catch (e) {
        console.error('Failed to save reminder', e);
        return null;
    }
};

export const getReminders = async () => {
    try {
        const stored = await AsyncStorage.getItem(REMINDERS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load reminders', e);
        return [];
    }
};

export const updateReminderStatus = async (id, status) => {
    try {
        const stored = await AsyncStorage.getItem(REMINDERS_KEY);
        let reminders = stored ? JSON.parse(stored) : [];

        reminders = reminders.map(r => r.id === id ? { ...r, status } : r);
        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
        return reminders;
    } catch (e) {
        console.error('Failed to update reminder', e);
        return null;
    }
};

export const deleteReminder = async (id) => {
    try {
        const stored = await AsyncStorage.getItem(REMINDERS_KEY);
        let reminders = stored ? JSON.parse(stored) : [];

        reminders = reminders.filter(r => r.id !== id);
        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
        return reminders;
    } catch (e) {
        console.error('Failed to delete reminder', e);
        return null;
    }
};
