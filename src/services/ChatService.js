import AsyncStorage from '@react-native-async-storage/async-storage';
import { decryptMessage, encryptMessage, getChatKey } from './SecurityService';

const CHATS_STORAGE_KEY = '@gotcha_chats_v1';

// Initial Seed Data (Only encrypted on first run)
const SEED_CHATS = [
    {
        id: '2',
        name: 'Design Team',
        lastMessage: 'The new mesh gradients look sick! 🔥',
        time: '10:23 AM',
        unread: 2,
        avatar: 'https://images.unsplash.com/photo-1522071823991-b59fea12f4ef?w=100&h=100&fit=crop',
        messages: [
            { id: 'm1', text: 'Did you see the new UI?', sender: 'other', time: '10:20 AM' },
            { id: 'm2', text: 'The new mesh gradients look sick! 🔥', sender: 'other', time: '10:23 AM' }
        ]
    },
    {
        id: '3',
        name: 'Sarah Jordan',
        lastMessage: 'Voice note sent (0:12)',
        time: 'Yesterday',
        unread: 0,
        isPrivate: true,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        messages: [
            { id: 'm1', text: 'Hey, checking in on the project.', sender: 'other', time: 'Yesterday' }
        ]
    },
    {
        id: '4',
        name: 'Alex Chen',
        lastMessage: 'Sure, I can meet at 5.',
        time: 'Monday',
        unread: 0,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        messages: [
            { id: 'm1', text: 'Are we still on for today?', sender: 'me', time: 'Monday' },
            { id: 'm2', text: 'Sure, I can meet at 5.', sender: 'other', time: 'Monday' }
        ]
    }
];

export const getChats = async () => {
    try {
        const storedChats = await AsyncStorage.getItem(CHATS_STORAGE_KEY);
        let chats = [];

        if (!storedChats) {
            // First Launch: Seed DB and Encrypt everything
            chats = await Promise.all(SEED_CHATS.map(async (chat) => {
                const key = await getChatKey(chat.id);
                // Encrypt initial messages
                const encryptedMessages = chat.messages.map(m => ({
                    ...m,
                    text: encryptMessage(m.text, key),
                    isEncrypted: true
                }));
                return { ...chat, messages: encryptedMessages };
            }));
            await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
        } else {
            chats = JSON.parse(storedChats);
        }

        // Decrypt for UI display
        return await Promise.all(chats.map(async (chat) => {
            const key = await getChatKey(chat.id);
            const decryptedMessages = chat.messages.map(m => ({
                ...m,
                originalText: m.text, // Store encrypted version if needed
                text: m.isEncrypted ? decryptMessage(m.text, key) : m.text // Handle legacy/plain
            }));
            return {
                ...chat,
                messages: decryptedMessages,
                // Decrypt last message preview too if needed
                // lastMessage: chat.lastMessage
            };
        }));

    } catch (err) {
        console.error('Failed to load chats', err);
        return [];
    }
};

export const sendMessage = async (chatId, text, type = 'text') => {
    try {
        const key = await getChatKey(chatId);
        const encryptedText = encryptMessage(text, key);

        const newMsg = {
            id: Math.random().toString(36).substr(2, 9),
            text: encryptedText, // Save encrypted
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            type,
            isEncrypted: true
        };

        // Update Storage
        const storedChats = await AsyncStorage.getItem(CHATS_STORAGE_KEY);
        if (storedChats) {
            let chats = JSON.parse(storedChats);
            chats = chats.map(c => {
                if (c.id === chatId) {
                    return {
                        ...c,
                        lastMessage: type === 'audio' ? 'Voice Message' : text, // Preview usually plaintext or specific placeholder
                        time: 'Just now',
                        messages: [...c.messages, newMsg]
                    };
                }
                return c;
            });
            await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
        }

        // Return decrypted version for UI immediate update
        return { ...newMsg, text: text };
    } catch (err) {
        console.error('Failed to send message', err);
        return null;
    }
};

export const createChat = async (contact) => {
    try {
        const storedChats = await AsyncStorage.getItem(CHATS_STORAGE_KEY);
        let chats = storedChats ? JSON.parse(storedChats) : [];

        // Check if chat already exists
        const existingChat = chats.find(c => c.id === contact.id || c.phoneNumber === contact.phoneNumber);
        if (existingChat) return existingChat;

        const newChat = {
            id: contact.id || Math.random().toString(36).substr(2, 9),
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            lastMessage: 'Started a new conversation',
            time: 'Just now',
            unread: 0,
            avatar: contact.avatar,
            messages: []
        };

        chats.unshift(newChat);
        await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
        return newChat;
    } catch (err) {
        console.error('Failed to create chat', err);
        return null;
    }
};
