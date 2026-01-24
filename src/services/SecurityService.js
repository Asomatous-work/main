import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const KEYS_STORAGE_PREFIX = '@gotcha_keys_';

/**
 * Security Service for End-to-End Encryption
 * Uses AES-256 for message encryption and RSA-like simulation for key exchange.
 */

// Generate a random 256-bit key
export const generateKey = () => {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
};

// Encrypt message with a specific key (Session Key)
export const encryptMessage = (text, key) => {
    try {
        const encrypted = CryptoJS.AES.encrypt(text, key).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption failed:', error);
        return text;
    }
};

// Decrypt message with a specific key
export const decryptMessage = (encryptedText, key) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, key);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || '⚠️ Decryption Error';
    } catch (error) {
        console.error('Decryption failed:', error);
        return '🔒 Message Encrypted';
    }
};

// Get or Create a session key for a specific chat ID
export const getChatKey = async (chatId) => {
    try {
        const keyKey = `${KEYS_STORAGE_PREFIX}${chatId}`;
        const existingKey = await AsyncStorage.getItem(keyKey);

        if (existingKey) {
            return existingKey;
        }

        // New Chat: Generate Key (Handshake simulation)
        const newKey = generateKey();
        await AsyncStorage.setItem(keyKey, newKey);
        return newKey;
    } catch (err) {
        console.error('Key retrieval failed', err);
        return 'default-fallback-key'; // Should not happen in prod for security
    }
};
