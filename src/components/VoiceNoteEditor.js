import * as Haptics from 'expo-haptics';
import { Sparkles, Zap } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { formatDuration, getRecordingStatus, startRecording, stopRecording } from '../services/VoiceService';
import { analyzeNoteInsights, suggestQuestions } from '../utils/aiInsights';
import { GlassCard } from './ModernUI';
import { COLORS, InsightsPanel, RecordButton, RecordingStatusBar } from './VoiceUI';

/**
 * Enhanced Note Editor with Voice Recording and AI Insights
 */
export const VoiceNoteEditor = ({ note, onUpdate, onVoiceRecorded }) => {
    const [content, setContent] = useState(note?.content || '');
    const [isRecording, setIsRecording] = useState(false);
    const [recordDuration, setRecordDuration] = useState('0:00');
    const [insights, setInsights] = useState(null);
    const [showInsights, setShowInsights] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);

    const debounceTimer = useRef(null);
    const durationInterval = useRef(null);

    // Analyze content for insights
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            if (content.length > 50) {
                const newInsights = analyzeNoteInsights(content);
                const questions = suggestQuestions(content);

                setInsights(newInsights);
                setSuggestedQuestions(questions);

                if (newInsights) {
                    Haptics.selectionAsync();
                }
            }

            // Update parent
            onUpdate({ ...note, content });
        }, 1000);

        return () => clearTimeout(debounceTimer.current);
    }, [content]);

    // Handle voice recording
    const handleToggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            const recordingData = await stopRecording();
            setIsRecording(false);
            clearInterval(durationInterval.current);

            if (recordingData) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onVoiceRecorded(recordingData);

                // Add placeholder text for voice note
                setContent(prev =>
                    prev + `\n\n[Voice Recording - ${formatDuration(recordingData.duration)}]\n`
                );
            }
        } else {
            // Start recording
            const recording = await startRecording();
            if (recording) {
                setIsRecording(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

                // Update duration every second
                durationInterval.current = setInterval(async () => {
                    const status = await getRecordingStatus();
                    if (status) {
                        const duration = status.durationMillis / 1000;
                        setRecordDuration(formatDuration(duration));
                    }
                }, 1000);
            }
        }
    };

    const handleShowInsights = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowInsights(true);
    };

    const handleInsertQuestion = (question) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setContent(prev => prev + `\n\n${question}`);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Recording Status Bar */}
            {isRecording && <RecordingStatusBar duration={recordDuration} />}

            {/* Note Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <TextInput
                    style={styles.textArea}
                    placeholder="Start typing your meeting notes..."
                    placeholderTextColor={COLORS.text.tertiary}
                    multiline
                    value={content}
                    onChangeText={setContent}
                    selectionColor={COLORS.primary}
                />

                {/* Suggested Questions */}
                {suggestedQuestions.length > 0 && !isRecording && (
                    <View style={styles.suggestionsContainer}>
                        <View style={styles.suggestionsHeader}>
                            <Sparkles color={COLORS.secondary} size={16} />
                            <Text style={styles.suggestionsTitle}>Suggested Questions</Text>
                        </View>
                        {suggestedQuestions.map((q, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.suggestionChip}
                                onPress={() => handleInsertQuestion(q)}
                            >
                                <Text style={styles.suggestionText}>{q}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <GlassCard style={styles.actionsCard} intensity={60}>
                    <View style={styles.actionsRow}>

                        {/* Voice Record Button */}
                        <RecordButton
                            isRecording={isRecording}
                            onPress={handleToggleRecording}
                            disabled={false}
                        />

                        {/* Insights Button */}
                        {insights && !isRecording && (
                            <TouchableOpacity
                                style={styles.insightsButton}
                                onPress={handleShowInsights}
                            >
                                <View style={styles.insightsBadge}>
                                    <Zap color={COLORS.accent} size={20} />
                                </View>
                                <Text style={styles.insightsButtonText}>View Insights</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </GlassCard>
            </View>

            {/* Insights Panel */}
            {showInsights && (
                <InsightsPanel
                    insights={insights}
                    onClose={() => setShowInsights(false)}
                />
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 200, // Space for bottom actions
    },
    textArea: {
        color: COLORS.text.primary,
        fontSize: 17,
        lineHeight: 26,
        minHeight: 300,
    },
    suggestionsContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: 'rgba(139,92,246,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.2)',
    },
    suggestionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    suggestionsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    suggestionChip: {
        backgroundColor: 'rgba(139,92,246,0.1)',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.2)',
    },
    suggestionText: {
        fontSize: 14,
        color: COLORS.text.secondary,
    },
    bottomActions: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    actionsCard: {
        padding: 20,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    actionsRow: {
        alignItems: 'center',
        gap: 20,
    },
    insightsButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    insightsBadge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(16,185,129,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.accent,
    },
    insightsButtonText: {
        marginTop: 8,
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.accent,
    }
});
