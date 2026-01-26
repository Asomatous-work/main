
import { BlurView } from 'expo-blur';
import { MessageSquare, Sparkles, Wand2, X } from 'lucide-react-native';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BrainBoxAI } from './BrainBoxAI';

const { width, height } = Dimensions.get('window');

/**
 * BrainBox Home Screen
 * A high-fidelity AI portal inspired by the BrainBox Figma design.
 */
export const BrainBoxHome = ({ onClose, onStartAiChat }) => {
    return (
        <View style={styles.container}>
            <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={28} color="#fff" />
            </TouchableOpacity>

            <View style={styles.content}>
                <Animated.View entering={FadeInUp.delay(200).duration(800)}>
                    <BrainBoxAI size={220} />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)} style={styles.textGroup}>
                    <Text style={styles.title}>BrainBox AI</Text>
                    <Text style={styles.subtitle}>
                        Your intelligent partner for secure and rapid communication.
                    </Text>
                </Animated.View>

                <View style={styles.capabilities}>
                    <CapabilityItem
                        icon={<MessageSquare size={20} color="#00F2FE" />}
                        text="Natural Chat"
                        delay={600}
                    />
                    <CapabilityItem
                        icon={<Sparkles size={20} color="#00F2FE" />}
                        text="Smart Summaries"
                        delay={700}
                    />
                    <CapabilityItem
                        icon={<Wand2 size={20} color="#00F2FE" />}
                        text="Instant Assistance"
                        delay={800}
                    />
                </View>

                <TouchableOpacity style={styles.startBtn} onPress={onStartAiChat}>
                    <Text style={styles.startBtnText}>Initialize Intelligence</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const CapabilityItem = ({ icon, text, delay }) => (
    <Animated.View entering={FadeInDown.delay(delay)} style={styles.capItem}>
        <View style={styles.capIcon}>{icon}</View>
        <Text style={styles.capText}>{text}</Text>
    </Animated.View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    closeBtn: {
        position: 'absolute',
        top: 60,
        right: 24,
        zIndex: 100,
        padding: 8,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    textGroup: {
        alignItems: 'center',
        marginTop: 40,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
    },
    capabilities: {
        width: '100%',
        marginTop: 40,
        gap: 16,
    },
    capItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,242,254,0.1)',
    },
    capIcon: {
        marginRight: 16,
    },
    capText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    startBtn: {
        backgroundColor: '#fff',
        height: 64,
        width: '100%',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        shadowColor: '#00F2FE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    startBtnText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
    }
});
