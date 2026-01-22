
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Bell, Check } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * A container that provides a "Glass" effect (Blur + Translucency).
 * Fallback to semi-transparent view on Android if Blur implies performance cost or old version,
 * but Expo Blur works well on modern Android.
 */
export const GlassCard = ({ children, style, intensity = 50 }) => {
    return (
        <View style={[styles.glassContainer, style]}>
            <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.glassContent}>{children}</View>
        </View>
    );
};

/**
 * A beautiful, cutting-edge permission request overlay.
 */
export const PermissionOverlay = ({ visible, onGrant, onDeny }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 7, useNativeDriver: true })
            ]).start();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <View style={styles.overlayBackdrop} />
            <Animated.View style={[styles.centered, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <GlassCard style={styles.permissionCard} intensity={80}>
                    <View style={styles.iconCircle}>
                        <Bell color="#fff" size={32} />
                    </View>
                    <Text style={styles.permTitle}>Don't Miss Out</Text>
                    <Text style={styles.permDesc}>
                        Gotcha works best when it can nudge you. We only send notifications for reminders you explicitly set.
                    </Text>

                    <TouchableOpacity style={styles.primaryButton} onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        onGrant();
                    }}>
                        <Text style={styles.primaryBtnText}>Enable Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={onDeny}>
                        <Text style={styles.secondaryBtnText}>Maybe Later</Text>
                    </TouchableOpacity>
                </GlassCard>
            </Animated.View>
        </View>
    );
};

/**
 * A HUD-style success overlay that appears when a task is executed.
 * Redesigned for a "Dynamic Island" feel.
 */
export const ExecutionHUD = ({ visible, title, subtext }) => {
    const slideAnim = useRef(new Animated.Value(-150)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 20,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -150,
                    duration: 400,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();
        }
    }, [visible]);

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.hudContainer,
                {
                    transform: [{ translateY: slideAnim }, {
                        scale: opacityAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1]
                        })
                    }],
                    opacity: opacityAnim
                }
            ]}
        >
            <View style={styles.dynamicIslandShadow}>
                <GlassCard style={styles.hudCard} intensity={95}>
                    <View style={styles.hudRow}>
                        <View style={styles.successIcon}>
                            <Check color="#000" size={14} strokeWidth={4} />
                        </View>
                        <View style={styles.hudTextContainer}>
                            <Text style={styles.hudTitle}>{title}</Text>
                            {subtext ? <Text style={styles.hudSub}>{subtext}</Text> : null}
                        </View>
                    </View>
                </GlassCard>
            </View>
        </Animated.View>
    );
};


const styles = StyleSheet.create({
    glassContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'rgba(30, 30, 30, 0.4)', // Fallback / tint
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    glassContent: {
        padding: 20,
        zIndex: 1,
        backdropFilter: 'blur(20px)', // Web support
    },
    overlayBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionCard: {
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        paddingVertical: 30,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    permTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    permDesc: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    primaryButton: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryBtnText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 16,
    },
    secondaryButton: {
        paddingVertical: 12,
    },
    secondaryBtnText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },

    // HUD
    hudContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
    },
    dynamicIslandShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    hudCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24, // Sophisticated Pill
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    hudRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    successIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hudTextContainer: {
        flexShrink: 1,
    },
    hudTitle: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: -0.3,
    },
    hudSub: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontWeight: '500',
    }
});
