
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

/**
 * Animated Mesh Gradient Background
 * Creates a fluid, living background
 */
export const MeshGradientBackground = () => {
    const animation = useSharedValue(0);

    useEffect(() => {
        animation.value = withRepeat(
            withTiming(1, {
                duration: 8000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(animation.value, [0, 1], [0, 30]);
        const translateY = interpolate(animation.value, [0, 1], [0, -20]);
        const scale = interpolate(animation.value, [0, 1], [1, 1.1]);

        return {
            transform: [
                { translateX },
                { translateY },
                { scale },
            ],
        };
    });

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Base gradient */}
            <LinearGradient
                colors={['#0a0e27', '#1a1444', '#0f0a1f']}
                style={StyleSheet.absoluteFill}
            />

            {/* Animated blob 1 */}
            <Animated.View style={[styles.blob, styles.blob1, animatedStyle]}>
                <LinearGradient
                    colors={['rgba(99, 102, 241, 0.4)', 'rgba(168, 85, 247, 0.3)']}
                    style={styles.blobGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* Animated blob 2 */}
            <Animated.View style={[styles.blob, styles.blob2, animatedStyle]}>
                <LinearGradient
                    colors={['rgba(59, 130, 246, 0.3)', 'rgba(14, 165, 233, 0.2)']}
                    style={styles.blobGradient}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
            </Animated.View>

            {/* Noise texture overlay for depth */}
            <View style={styles.noise} />
        </View>
    );
};

/**
 * Floating Card with Spring Animation
 */
export const FloatingCard = ({ children, delay = 0, style, contentStyle }) => {
    const translateY = useSharedValue(20);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withTiming(0, {
            duration: 600,
            delay,
            easing: Easing.out(Easing.cubic),
        });
        opacity.value = withTiming(1, { duration: 400, delay });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.card, animatedStyle, style]}>
            <View style={[styles.cardInner, contentStyle]}>
                {children}
            </View>
        </Animated.View>
    );
};

/**
 * Glowing Orb Button (for voice recording)
 */
export const GlowOrb = ({ isActive, onPress, size = 80 }) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
        if (isActive) {
            scale.value = withRepeat(
                withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
            glowOpacity.value = withRepeat(
                withTiming(0.8, { duration: 1500 }),
                -1,
                true
            );
        } else {
            scale.value = withTiming(1, { duration: 300 });
            glowOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [isActive]);

    const orbStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <Animated.View style={[orbStyles.container, { width: size, height: size }]}>
            {/* Glow layer */}
            <Animated.View style={[orbStyles.glow, glowStyle, { width: size * 1.6, height: size * 1.6 }]}>
                <LinearGradient
                    colors={isActive ? ['rgba(239, 68, 68, 0.4)', 'transparent'] : ['rgba(99, 102, 241, 0.4)', 'transparent']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* Orb */}
            <Animated.View style={[orbStyles.orb, orbStyle, { width: size, height: size, borderRadius: size / 2 }]}>
                <LinearGradient
                    colors={isActive ? ['#EF4444', '#DC2626'] : ['#6366F1', '#8B5CF6']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    blob: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.6,
    },
    blob1: {
        width: width * 1.2,
        height: width * 1.2,
        top: -width * 0.4,
        left: -width * 0.2,
    },
    blob2: {
        width: width * 0.9,
        height: width * 0.9,
        bottom: -width * 0.3,
        right: -width * 0.3,
    },
    blobGradient: {
        flex: 1,
        borderRadius: 999,
    },
    noise: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.02)',
        opacity: 0.3,
    },
    card: {
        marginHorizontal: 20,
        marginVertical: 12,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    cardInner: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        padding: 20,
        overflow: 'hidden',
    },
});

const orbStyles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        position: 'absolute',
        borderRadius: 999,
    },
    orb: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
        overflow: 'hidden',
    },
});
