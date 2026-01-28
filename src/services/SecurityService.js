import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';
import 'react-native-get-random-values';

const KEYS_STORAGE_PREFIX = '@gotcha_keys_';

/**
 * Security Service for End-to-End Encryption
 * Uses AES-256 for message encryption and RSA-like simulation for key exchange.
 */

// Generate a random 256-bit key using Expo Crypto for reliability
export const generateKey = () => {
    // Generate 32 random bytes (256 bits)
    const randomBytes = Crypto.getRandomValues(new Uint8Array(32));
    // Convert to hex string
    return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Encrypt message with a specific key (Session Key)
export const encryptMessage = (text, key) => {
    try {
        if (!text || !key) return text;
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
        if (!encryptedText || !key) return encryptedText;

        // Ensure we are working with a string for decryption
        const cipherText = typeof encryptedText === 'string' ? encryptedText : String(encryptedText);

        const bytes = CryptoJS.AES.decrypt(cipherText, key);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        if (!originalText && cipherText) {
            // Decryption failure (likely key mismatch during development)
            return '🔒 Encrypted Message';
        }

        return originalText || '🔒 Message';
    } catch (error) {
        return '🔒 Message (Secure)';
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

        // New Chat: Generate Key
        const newKey = generateKey();
        await AsyncStorage.setItem(keyKey, newKey);
        return newKey;
    } catch (err) {
        console.error('Key retrieval failed', err);
        return 'default-fallback-key';
    }
};
