
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

/**
 * BrainBoxAI Mascot
 * A futuristic, animated AI character inspired by the Figma design.
 */
export const BrainBoxAI = ({ size = 200 }) => {
    const pulse = useSharedValue(1);
    const rotation = useSharedValue(0);

    React.useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 1500 }),
                withTiming(1, { duration: 1500 })
            ),
            -1,
            true
        );
        rotation.value = withRepeat(
            withTiming(360, { duration: 10000 }),
            -1,
            false
        );
    }, []);

    const outerCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: interpolate(pulse.value, [1, 1.1], [0.3, 0.6])
    }));

    const innerCoreStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }]
    }));

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Outer Glow */}
            <Animated.View style={[styles.outerGlow, outerCircleStyle, { width: size, height: size }]} />

            {/* Main Body */}
            <LinearGradient
                colors={['#00F2FE', '#4FACFE']}
                style={[styles.mainBody, { width: size * 0.8, height: size * 0.8, borderRadius: (size * 0.8) / 2 }]}
            >
                {/* Futuristic Patterns */}
                <Animated.View style={[styles.innerCore, innerCoreStyle, { width: size * 0.6, height: size * 0.6 }]}>
                    <View style={styles.orbitLine} />
                    <View style={[styles.orbitLine, { transform: [{ rotate: '60deg' }] }]} />
                    <View style={[styles.orbitLine, { transform: [{ rotate: '120deg' }] }]} />
                </Animated.View>

                {/* Eye/Core */}
                <View style={styles.eyeCore}>
                    <View style={styles.pupil} />
                </View>
            </LinearGradient>

            {/* Float Particles Overlay */}
            <View style={styles.particlesContainer}>
                {/* Simplified particles for now */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    outerGlow: {
        position: 'absolute',
        backgroundColor: '#4FACFE',
        borderRadius: 999,
    },
    mainBody: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        shadowColor: '#4FACFE',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    innerCore: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbitLine: {
        position: 'absolute',
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    eyeCore: {
        width: '30%',
        height: '30%',
        backgroundColor: '#fff',
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#fff',
        shadowRadius: 10,
        shadowOpacity: 0.5,
    },
    pupil: {
        width: '50%',
        height: '50%',
        backgroundColor: '#000',
        borderRadius: 999,
    },
    particlesContainer: {
        ...StyleSheet.absoluteFillObject,
    }
});
