import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
    ArrowLeft,
    Calendar,
    Check, Clock, FileText,
    Image as ImageIcon,
    List,
    Lock,
    Mic,
    Paperclip,
    Play,
    Sparkles,
    Timer,
    Trash2,
    Unlock,
    X,
    Zap
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

import { scheduleReminder } from '../services/NotificationService';
import { transcribeAudio } from '../services/TranscriptionService';
import { playRecording } from '../services/VoiceService';
import { analyzeNoteInsights, suggestQuestions } from '../utils/aiInsights';
import { analyzeNoteContent } from '../utils/nlp';
import { GlowOrb } from './PremiumUI';

const { height, width } = Dimensions.get('window');

/**
 * Premium Voice Note Editor - v2.5 (Polish & Stability)
 */
export const PremiumNoteEditor = ({
    note, onUpdate, onStartRecording, isRecording,
    recordDuration, onDelete, onBack, darkMode = true
}) => {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [attachments, setAttachments] = useState(note?.attachments || []);
    const [isPrivate, setIsPrivate] = useState(note?.isPrivate || false);

    const [insights, setInsights] = useState(null);
    const [showInsights, setShowInsights] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [detectedAction, setDetectedAction] = useState(null);
    const [voiceRecordings, setVoiceRecordings] = useState(note?.voiceRecordings || []);
    const [expires, setExpires] = useState(note?.expires || false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const debounceTimer = useRef(null);
    const sheetTranslateY = useSharedValue(height);
    const editorScrollRef = useRef(null);

    // Sync state with note on open or change
    useEffect(() => {
        setTitle(note?.title || '');
        setContent(note?.content || '');
        setAttachments(note?.attachments || []);
        setIsPrivate(note?.isPrivate || false);
        setVoiceRecordings(note?.voiceRecordings || []);
        setExpires(note?.expires || false);
    }, [note?.id, note?.voiceRecordings?.length]);

    // Auto-Title Logic
    useEffect(() => {
        if ((!title || title === 'New Note' || title === 'Untitled') && content.length > 5) {
            const firstLine = content.split('\n')[0].trim();
            const autoTitle = firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
            if (autoTitle) setTitle(autoTitle);
        }
    }, [content]);

    // Analyze content (AI + NLP)
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        const timeout = setTimeout(() => {
            onUpdate({ ...note, title, content, attachments, isPrivate, voiceRecordings, expires });

            if (content.length > 2) {
                const newInsights = analyzeNoteInsights(content);
                const questions = suggestQuestions(content);
                setInsights(newInsights);
                setSuggestedQuestions(questions);

                const actions = analyzeNoteContent(content);
                if (actions && actions.length > 0) {
                    setDetectedAction(actions[0]);
                } else {
                    setDetectedAction(null);
                }
            }
        }, 1000);

        debounceTimer.current = timeout;

        return () => clearTimeout(debounceTimer.current);
    }, [content, title, attachments, isPrivate]);

    // Animate insights sheet
    useEffect(() => {
        if (showInsights) {
            sheetTranslateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        } else {
            sheetTranslateY.value = withTiming(height, { duration: 300 });
        }
    }, [showInsights]);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetTranslateY.value }],
    }));

    const handleInsertQuestion = (question) => {
        setContent(prev => prev + `\n\n${question}`);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleAttachMedia = async () => {
        Alert.alert('Attach', 'Choose format', [
            {
                text: 'Image',
                onPress: async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    });
                    if (!result.canceled) {
                        setAttachments([...attachments, { type: 'image', uri: result.assets[0].uri }]);
                    }
                }
            },
            {
                text: 'Document',
                onPress: async () => {
                    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
                    if (!result.canceled) {
                        setAttachments([...attachments, { type: 'doc', uri: result.assets[0].uri, name: result.assets[0].name }]);
                    }
                }
            },
            { text: 'Cancel', style: 'cancel' }
        ]);
    };

    const handleTranscribe = async (index) => {
        if (isTranscribing) return;
        setIsTranscribing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const recording = voiceRecordings[index];
            if (recording.duration < 0.5) {
                Alert.alert('Audio too short', 'Recording is too short to transcribe.');
                return;
            }
            const transcript = await transcribeAudio(recording.uri);

            const updatedRecs = [...voiceRecordings];
            updatedRecs[index] = { ...recording, transcript };
            setVoiceRecordings(updatedRecs);

            // Append to content if desired
            setContent(prev => prev + `\n\n[Transcript]: ${transcript}`);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
            Alert.alert('Error', 'Transcription failed');
        } finally {
            setIsTranscribing(false);
        }
    };

    const handlePlayAudio = async (uri) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await playRecording(uri);
    };

    const handleConfirmAction = async () => {
        if (!detectedAction || !detectedAction.date) return;

        const d = new Date(detectedAction.date);
        if (isNaN(d.getTime())) {
            Alert.alert('Error', 'Invalid time detected');
            return;
        }

        const reminderId = await scheduleReminder(
            detectedAction.title || 'Note Reminder',
            `Regarding: ${title}`,
            d
        );

        if (reminderId) {
            // Also sync to System Calendar
            await scheduleCalendarEvent(
                detectedAction.title || 'Note Reminder',
                `Regarding: ${title}\n\nNotes from Mindspace`,
                d
            );

            const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            Alert.alert(
                'Reminder Set',
                `Scheduled for ${timeStr} and synced to your system Calendar.`
            );
            setDetectedAction(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Alert.alert('Permission Required', 'Please enable notifications in settings to set reminders.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Absolute Top Header (Fixed for Navigation Stability) */}
            <View style={[styles.topHeader, !darkMode && styles.headerLight]}>
                <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
                    <ArrowLeft size={24} color={darkMode ? "#fff" : "#000"} />
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.headerBtn, isPrivate && styles.activeLock]}
                        onPress={() => setIsPrivate(!isPrivate)}
                    >
                        {isPrivate ? <Lock size={20} color="#F59E0B" /> : <Unlock size={20} color={darkMode ? "rgba(255,255,255,0.4)" : "#666"} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.headerBtn, styles.deleteAction]}
                        onPress={() => {
                            Alert.alert('Delete Note?', 'This will be permanently removed.', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', onPress: onDelete, style: 'destructive' }
                            ]);
                        }}
                    >
                        <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    ref={editorScrollRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title Area */}
                    <TextInput
                        style={[styles.titleInput, !darkMode && styles.textDark]}
                        placeholder="Untitled Note"
                        placeholderTextColor={darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                        value={title}
                        onChangeText={setTitle}
                        maxLength={80}
                        multiline={false}
                    />

                    {/* Metadata Row */}
                    <View style={styles.metaRow}>
                        <Clock size={12} color={darkMode ? "rgba(255,255,255,0.4)" : "#888"} />
                        <Text style={[styles.metaText, !darkMode && styles.textDarkDim]}>
                            Edited {new Date(note?.updatedAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>

                        <TouchableOpacity
                            style={[styles.expiresToggle, expires && styles.expiresActive]}
                            onPress={() => {
                                setExpires(!expires);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                        >
                            <Timer size={12} color={expires ? "#F87171" : (darkMode ? "rgba(255,255,255,0.4)" : "#888")} />
                            <Text style={[styles.metaText, expires && styles.expiresText]}>
                                {expires ? 'Expires in 7d' : 'Save Forever'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Attachments List */}
                    {attachments.length > 0 && (
                        <ScrollView horizontal style={styles.attachList} showsHorizontalScrollIndicator={false}>
                            {attachments.map((att, i) => (
                                <View key={i} style={[styles.attachmentChip, !darkMode && styles.chipLight]}>
                                    {att.type === 'image' ? (
                                        <Image source={{ uri: att.uri }} style={styles.attachThumb} />
                                    ) : (
                                        <FileText size={20} color={darkMode ? "#fff" : "#333"} />
                                    )}
                                    {att.name && <Text numberOfLines={1} style={[styles.docName, !darkMode && styles.textDark]}>{att.name}</Text>}
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    {/* Voice Recordings List */}
                    {voiceRecordings.length > 0 && (
                        <View style={styles.voiceSection}>
                            {voiceRecordings.map((rec, i) => (
                                <View key={i} style={[styles.voiceCard, !darkMode && styles.cardLight]}>
                                    <View style={styles.voiceHeader}>
                                        <View style={styles.voiceIcon}>
                                            <Mic size={16} color="#fff" />
                                        </View>
                                        <Text style={[styles.voiceDuration, !darkMode && styles.textDark]}>
                                            Recording {i + 1} ({rec.duration.toFixed(1)}s)
                                        </Text>
                                        {!rec.transcript && (
                                            <TouchableOpacity
                                                style={styles.transcribeBtn}
                                                onPress={() => handleTranscribe(i)}
                                                disabled={isTranscribing}
                                            >
                                                <Sparkles size={12} color="#fff" />
                                                <Text style={styles.transcribeBtnText}>Transcribe</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {rec.transcript ? (
                                        <View style={styles.transcriptView}>
                                            <Text style={[styles.transcriptText, !darkMode && styles.textDark]}>
                                                "{rec.transcript}"
                                            </Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.playInline}
                                            onPress={() => handlePlayAudio(rec.uri)}
                                        >
                                            <Play size={14} color="#6366F1" />
                                            <Text style={styles.playText}>Listen to audio</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Action Reminder Card (Inline) */}
                    {detectedAction && detectedAction.date && !isRecording && (
                        <Animated.View entering={FadeIn.delay(200)} style={[styles.actionCard, !darkMode && styles.cardLight]}>
                            <View style={styles.actionHeader}>
                                <View style={styles.actionIcon}>
                                    <Calendar size={18} color="#fff" />
                                </View>
                                <Text style={styles.actionTitle}>System Reminder detected</Text>
                            </View>
                            <Text style={[styles.actionText, !darkMode && styles.textDark]}>
                                "{detectedAction.title}" for {(() => {
                                    const d = new Date(detectedAction.date);
                                    return isNaN(d.getTime()) ? 'Invalid Time' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                                })()}
                            </Text>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmAction}>
                                <Check size={16} color="#fff" />
                                <Text style={styles.btnTextPrim}>Schedule Actually</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* Main Content Body */}
                    <TextInput
                        style={[styles.textArea, !darkMode && styles.textDark]}
                        placeholder="Type / to use AI or start writing..."
                        placeholderTextColor={darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                        multiline
                        value={content}
                        onChangeText={setContent}
                        selectionColor="#6366F1"
                        scrollEnabled={false} // Let the outer ScrollView handle it
                    />

                    {/* AI Suggested Questions (Premium look) */}
                    {suggestedQuestions.length > 0 && !isRecording && (
                        <View style={[styles.suggestionsBox, !darkMode && styles.cardLight]}>
                            <View style={styles.suggestionsHeader}>
                                <Sparkles size={16} color="#8B5CF6" />
                                <Text style={styles.suggestionsTitle}>Thinking suggestions</Text>
                            </View>
                            {suggestedQuestions.map((q, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.suggestionChip, !darkMode && styles.chipLight]}
                                    onPress={() => handleInsertQuestion(q)}
                                >
                                    <Text style={[styles.suggestionText, !darkMode && styles.textDark]}>{q}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Floating ToolBar (Bottom Bar) */}
                <View style={styles.bottomWrapper}>
                    <View style={[styles.toolbar, !darkMode && styles.toolbarLight]}>
                        <TouchableOpacity style={styles.toolBtn} onPress={handleAttachMedia}>
                            <Paperclip size={22} color={darkMode ? "#fff" : "#333"} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolBtn}>
                            <ImageIcon size={22} color={darkMode ? "#fff" : "#333"} />
                        </TouchableOpacity>

                        {/* Record Button */}
                        <TouchableOpacity onPress={onStartRecording} style={styles.orbContainer}>
                            <GlowOrb isActive={isRecording} size={60} />
                            {isRecording && <Text style={styles.durationLabel}>{recordDuration}</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolBtn}>
                            <List size={22} color={darkMode ? "#fff" : "#333"} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.toolBtn}
                            onPress={() => setShowInsights(true)}
                        >
                            <View style={styles.zapWrapper}>
                                <Zap size={22} color={insights ? "#10B981" : "rgba(255,255,255,0.3)"} />
                                {insights && <View style={styles.statusDot} />}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Insights Bottom Sheet */}
            <Animated.View style={[styles.sheet, !darkMode && styles.sheetLight, sheetStyle]}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetContent}>
                    <View style={styles.sheetHeader}>
                        <Text style={[styles.sheetTitle, !darkMode && styles.textDark]}>Contextual Insights</Text>
                        <TouchableOpacity onPress={() => setShowInsights(false)}>
                            <X size={24} color={darkMode ? "rgba(255,255,255,0.5)" : "#888"} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {insights?.summary && (
                            <View style={styles.insightSection}>
                                <Text style={styles.sectionLabel}>Summary</Text>
                                <Text style={[styles.insightText, !darkMode && styles.textDark]}>{insights.summary}</Text>
                            </View>
                        )}
                        {/* Add more insight blocks here if needed */}
                    </ScrollView>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 10,
        zIndex: 100,
        backgroundColor: 'transparent',
    },
    headerLight: {
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    activeLock: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    deleteAction: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderColor: 'rgba(239, 68, 68, 0.1)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 200,
    },
    titleInput: {
        fontSize: 34,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
        padding: 0,
        letterSpacing: -1,
    },
    textDark: {
        color: '#111827',
    },
    textDarkDim: {
        color: '#6B7280',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    metaText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '500',
    },
    textArea: {
        color: '#fff',
        fontSize: 19,
        lineHeight: 28,
        minHeight: 300,
        fontWeight: '400',
        marginTop: 10,
        paddingBottom: 40,
    },
    attachList: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    attachmentChip: {
        marginRight: 12,
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.07)',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipLight: {
        backgroundColor: '#fff',
        borderColor: 'rgba(0,0,0,0.1)',
    },
    attachThumb: {
        width: '100%',
        height: '100%',
    },
    docName: {
        fontSize: 10,
        color: '#fff',
        padding: 4,
        textAlign: 'center',
    },
    actionCard: {
        backgroundColor: '#1E1B4B',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.4)',
    },
    cardLight: {
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    actionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    actionIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTitle: {
        color: '#818CF8',
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    actionText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 16,
        lineHeight: 24,
    },
    confirmBtn: {
        backgroundColor: '#6366F1',
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    btnTextPrim: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    suggestionsBox: {
        marginTop: 20,
        backgroundColor: 'rgba(139,92,246,0.06)',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.15)',
    },
    suggestionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    suggestionsTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#8B5CF6',
        textTransform: 'uppercase',
    },
    suggestionChip: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    suggestionText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 15,
        fontWeight: '500',
    },
    bottomWrapper: {
        position: 'absolute',
        bottom: 34,
        width: '100%',
        paddingHorizontal: 20,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderRadius: 32,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    toolbarLight: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#E5E7EB',
        shadowOpacity: 0.1,
    },
    toolBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationLabel: {
        position: 'absolute',
        bottom: -18,
        color: '#6366F1',
        fontSize: 11,
        fontWeight: '800',
    },
    zapWrapper: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        borderWidth: 1.5,
        borderColor: '#000',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.7,
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        zIndex: 1000,
    },
    sheetLight: {
        backgroundColor: '#F3F4F6',
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'center',
        marginBottom: 20,
    },
    sheetTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    insightSection: {
        marginTop: 24,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8B5CF6',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    insightText: {
        fontSize: 17,
        color: '#fff',
        lineHeight: 26,
    },
    expiresToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    expiresActive: {
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
    },
    expiresText: {
        color: '#F87171',
    },
    voiceSection: {
        marginBottom: 24,
    },
    voiceCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    voiceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    voiceIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceDuration: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    transcribeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    transcribeBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    transcriptView: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    transcriptText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    playInline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    playText: {
        color: '#6366F1',
        fontSize: 12,
        fontWeight: '700',
    }
});
