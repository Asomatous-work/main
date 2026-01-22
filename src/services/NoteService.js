import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple unique ID generator for React Native
const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const NOTES_KEY = '@gotcha_notes';
const ACTIONS_KEY = '@gotcha_actions';

/**
 * Note structure:
 * {
 *   id: string,
 *   title: string,
 *   content: string,
 *   createdAt: Date,
 *   updatedAt: Date,
 *   detectedActions: [{ type: 'reminder', data: {...}, confirmed: bool }]
 * }
 */

export const getAllNotes = async () => {
    try {
        const data = await AsyncStorage.getItem(NOTES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading notes:', e);
        return [];
    }
};

export const getNote = async (id) => {
    const notes = await getAllNotes();
    return notes.find(n => n.id === id);
};

export const createNote = async (title = 'Untitled', content = '') => {
    const notes = await getAllNotes();
    const newNote = {
        id: generateId(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        detectedActions: []
    };
    notes.unshift(newNote); // Add to beginning
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return newNote;
};

export const updateNote = async (id, updates) => {
    const notes = await getAllNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
        notes[index] = {
            ...notes[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
        return notes[index];
    }
    return null;
};

export const deleteNote = async (id) => {
    const notes = await getAllNotes();
    const filtered = notes.filter(n => n.id !== id);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
};

export const cleanupExpiredNotes = async () => {
    const notes = await getAllNotes();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const filtered = notes.filter(n => {
        if (!n.expires) return true;
        const updatedAt = new Date(n.updatedAt);
        return updatedAt > sevenDaysAgo;
    });

    if (filtered.length !== notes.length) {
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
        return true;
    }
    return false;
};

// Actions (confirmed reminders/tasks from notes)
export const saveAction = async (action) => {
    const actions = await getAllActions();
    actions.push({ ...action, id: generateId(), createdAt: new Date().toISOString() });
    await AsyncStorage.setItem(ACTIONS_KEY, JSON.stringify(actions));
};

export const getAllActions = async () => {
    try {
        const data = await AsyncStorage.getItem(ACTIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};
