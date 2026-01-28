
import { BlurView } from 'expo-blur';
import { Quote } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Stability Lock
const _STAB_LOCK = React.version;

const QUOTES = [
    { text: "Your potential is the sum of all the possibilities you have yet to explore.", author: "O.W. Holmes" },
    { text: "Security is not a product, but a process.", author: "Bruce Schneier" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Privacy is not an option, and it shouldn't be the price we pay for just getting on the Internet.", author: "Gary Kovacs" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "Happiness is not something readymade. It comes from your own actions.", author: "Dalai Lama" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" }
];

export const DailyQuote = ({ darkMode }) => {
    const [quote, setQuote] = useState(QUOTES[0]);

    useEffect(() => {
        // Pick a random quote daily (simulated for now)
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        setQuote(QUOTES[randomIndex]);
    }, []);

    return (
        <Animated.View entering={FadeInUp.delay(300)} style={styles.container}>
            <BlurView intensity={darkMode ? 30 : 60} tint={darkMode ? "dark" : "light"} style={styles.blur}>
                <Quote size={16} color={darkMode ? "#6366F1" : "#4F46E5"} style={styles.icon} />
                <View style={styles.content}>
                    <Text numberOfLines={2} style={[styles.quoteText, !darkMode && styles.textDark]}>
                        "{quote.text}"
                    </Text>
                    <Text style={styles.authorText}>— {quote.author}</Text>
                </View>
            </BlurView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    blur: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 12,
        opacity: 0.8,
    },
    content: {
        flex: 1,
    },
    quoteText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    authorText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
        textAlign: 'right',
        fontWeight: '700',
    },
    textDark: {
        color: '#111827',
    },
});
