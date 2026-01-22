import { BlurView } from 'expo-blur';
import { CheckCircle, Clock, MessageSquare, Mic, Square, Target, Zap } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * PROFESSIONAL COLOR PALETTE - "Tech Noir"
 * Primary: Electric Blue (#0EA5E9)
 * Secondary: Cyber Purple (#8B5CF6) 
 * Accent: Neon Green (#10B981)
 * Warning: Amber (#F59E0B)
 * Background: Deep Black with blue tints
 */

const COLORS = {
    primary: '#0EA5E9',
    secondary: '#8B5CF6',
    accent: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    bg: {
        dark: '#0A0E1A',
        darker: '#050810',
        light: 'rgba(255,255,255,0.05)'
    },
    text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255,255,255,0.7)',
        tertiary: 'rgba(255,255,255,0.4)'
    }
};

/**
 * Voice Recording Button with pulsing animation
 */
export const RecordButton = ({ isRecording, onPress, onLongPress, disabled }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
                ])
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
            glowAnim.setValue(0);
        }
    }, [isRecording]);

    const glowColor = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(239, 68, 68, 0)', 'rgba(239, 68, 68, 0.6)']
    });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={disabled}
        >
            <Animated.View style={[
                voiceStyles.recordButton,
                { transform: [{ scale: pulseAnim }] },
                isRecording && { backgroundColor: glowColor }
            ]}>
                <View style={[
                    voiceStyles.recordButtonInner,
                    isRecording && voiceStyles.recordingActive
                ]}>
                    {isRecording ? (
                        <Square color="#fff" size={32} fill="#fff" />
                    ) : (
                        <Mic color="#fff" size={36} />
                    )}
                </View>
            </Animated.View>
            <Text style={voiceStyles.recordHint}>
                {isRecording ? 'Tap to Stop' : 'Tap to Record'}
            </Text>
        </TouchableOpacity>
    );
};

/**
 * Insights Panel Component
 */
export const InsightsPanel = ({ insights, onClose }) => {
    const slideAnim = useRef(new Animated.Value(500)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true
        }).start();
    }, []);

    if (!insights) return null;

    return (
        <Animated.View style={[insightsStyles.container, { transform: [{ translateY: slideAnim }] }]}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

            <View style={insightsStyles.content}>
                <View style={insightsStyles.header}>
                    <View style={insightsStyles.iconBadge}>
                        <Zap color={COLORS.accent} size={20} />
                    </View>
                    <Text style={insightsStyles.title}>AI Insights</Text>
                    <TouchableOpacity onPress={onClose} style={insightsStyles.closeBtn}>
                        <Text style={insightsStyles.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary */}
                {insights.summary && (
                    <View style={insightsStyles.section}>
                        <Text style={insightsStyles.sectionTitle}>Summary</Text>
                        <Text style={insightsStyles.summaryText}>{insights.summary}</Text>
                    </View>
                )}

                {/* Action Items */}
                {insights.actionItems && insights.actionItems.length > 0 && (
                    <View style={insightsStyles.section}>
                        <View style={insightsStyles.sectionHeader}>
                            <CheckCircle color={COLORS.accent} size={16} />
                            <Text style={insightsStyles.sectionTitle}>Action Items ({insights.actionItems.length})</Text>
                        </View>
                        {insights.actionItems.map((item, i) => (
                            <View key={i} style={insightsStyles.listItem}>
                                <View style={insightsStyles.bullet} />
                                <Text style={insightsStyles.listText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Questions */}
                {insights.questions && insights.questions.length > 0 && (
                    <View style={insightsStyles.section}>
                        <View style={insightsStyles.sectionHeader}>
                            <MessageSquare color={COLORS.primary} size={16} />
                            <Text style={insightsStyles.sectionTitle}>Questions ({insights.questions.length})</Text>
                        </View>
                        {insights.questions.map((q, i) => (
                            <View key={i} style={insightsStyles.listItem}>
                                <Text style={insightsStyles.questionMark}>?</Text>
                                <Text style={insightsStyles.listText}>{q}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Key Topics */}
                {insights.topics && insights.topics.length > 0 && (
                    <View style={insightsStyles.section}>
                        <View style={insightsStyles.sectionHeader}>
                            <Target color={COLORS.secondary} size={16} />
                            <Text style={insightsStyles.sectionTitle}>Key Topics</Text>
                        </View>
                        <View style={insightsStyles.topicsRow}>
                            {insights.topics.map((topic, i) => (
                                <View key={i} style={insightsStyles.topicChip}>
                                    <Text style={insightsStyles.topicText}>{topic}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

/**
 * Live Recording Status Bar
 */
export const RecordingStatusBar = ({ duration }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.5, duration: 500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
            ])
        ).start();
    }, []);

    return (
        <View style={statusStyles.container}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={statusStyles.content}>
                <Animated.View style={[statusStyles.dot, { opacity: pulseAnim }]} />
                <Text style={statusStyles.text}>Recording</Text>
                <View style={statusStyles.divider} />
                <Clock color={COLORS.text.secondary} size={14} />
                <Text style={statusStyles.duration}>{duration}</Text>
            </View>
        </View>
    );
};

const voiceStyles = StyleSheet.create({
    recordButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    recordButtonInner: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    recordingActive: {
        backgroundColor: COLORS.danger,
    },
    recordHint: {
        marginTop: 16,
        fontSize: 14,
        color: COLORS.text.secondary,
        textAlign: 'center',
    }
});

const insightsStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '80%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    content: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(16,185,129,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        flex: 1,
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text.primary,
    },
    closeBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtnText: {
        fontSize: 24,
        color: COLORS.text.tertiary,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryText: {
        fontSize: 16,
        color: COLORS.text.primary,
        lineHeight: 24,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.accent,
        marginTop: 8,
    },
    questionMark: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 20,
    },
    listText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text.secondary,
        lineHeight: 22,
    },
    topicsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    topicChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(139,92,246,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.3)',
    },
    topicText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.secondary,
    }
});

const statusStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.danger,
    },
    text: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.danger,
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginLeft: 'auto',
    },
    duration: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.secondary,
        fontVariant: ['tabular-nums'],
    }
});

export { COLORS };
