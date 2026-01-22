import * as Haptics from 'expo-haptics';
import { Bell, Calendar, Check, CheckSquare, Clock, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { analyzeNoteContent } from '../utils/nlp';
import { GlassCard } from './ModernUI';

/**
 * Smart Note Editor with inline AI suggestions
 */
export const NoteEditor = ({ note, onUpdate, onActionConfirm }) => {
    const [content, setContent] = useState(note?.content || '');
    const [detectedActions, setDetectedActions] = useState([]);
    const [dismissedActions, setDismissedActions] = useState(new Set());
    const debounceTimer = useRef(null);
    const slideAnims = useRef({}).current;

    // Analyze content when it changes
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            const actions = analyzeNoteContent(content);

            // Filter out dismissed actions
            const newActions = actions.filter(
                action => !dismissedActions.has(action.lineText)
            );

            if (newActions.length > 0) {
                Haptics.selectionAsync();
            }

            setDetectedActions(newActions);

            // Update parent
            onUpdate({ ...note, content, detectedActions: newActions });
        }, 800);

        return () => clearTimeout(debounceTimer.current);
    }, [content]);

    // Initialize slide animations for new actions
    useEffect(() => {
        detectedActions.forEach((action, index) => {
            const key = action.lineText + index;
            if (!slideAnims[key]) {
                slideAnims[key] = new Animated.Value(200);
                Animated.spring(slideAnims[key], {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 8
                }).start();
            }
        });
    }, [detectedActions]);

    const handleConfirmAction = (action, index) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onActionConfirm(action);

        // Remove from visible actions
        setDetectedActions(prev => prev.filter((_, i) => i !== index));
    };

    const handleDismissAction = (action, index) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Add to dismissed set
        setDismissedActions(prev => new Set([...prev, action.lineText]));

        // Animate out
        const key = action.lineText + index;
        if (slideAnims[key]) {
            Animated.timing(slideAnims[key], {
                toValue: 200,
                duration: 200,
                useNativeDriver: true
            }).start(() => {
                setDetectedActions(prev => prev.filter((_, i) => i !== index));
            });
        } else {
            setDetectedActions(prev => prev.filter((_, i) => i !== index));
        }
    };

    const getActionIcon = (type) => {
        switch (type) {
            case 'call': return <Bell color="#fff" size={16} />;
            case 'meeting': return <Calendar color="#fff" size={16} />;
            case 'task': return <CheckSquare color="#fff" size={16} />;
            case 'deadline': return <Clock color="#fff" size={16} />;
            default: return <Bell color="#fff" size={16} />;
        }
    };

    const getActionColor = (type) => {
        switch (type) {
            case 'call': return '#3b82f6';
            case 'meeting': return '#8b5cf6';
            case 'task': return '#10b981';
            case 'deadline': return '#ef4444';
            default: return '#6366f1';
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.textArea}
                placeholder="Start typing your thoughts..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                value={content}
                onChangeText={setContent}
                selectionColor="#d8b4fe"
                autoFocus
            />

            {/* Floating Action Suggestions */}
            {detectedActions.length > 0 && (
                <View style={styles.actionsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.actionsScroll}
                    >
                        {detectedActions.map((action, index) => {
                            const key = action.lineText + index;
                            return (
                                <Animated.View
                                    key={key}
                                    style={[
                                        styles.actionCardWrapper,
                                        { transform: [{ translateY: slideAnims[key] || 0 }] }
                                    ]}
                                >
                                    <GlassCard style={styles.actionCard} intensity={80}>
                                        <View style={[styles.typeIndicator, { backgroundColor: getActionColor(action.type) }]}>
                                            {getActionIcon(action.type)}
                                        </View>

                                        <View style={styles.actionContent}>
                                            <Text style={styles.actionType}>{action.type.toUpperCase()}</Text>
                                            <Text style={styles.actionTitle} numberOfLines={2}>{action.title}</Text>
                                            <Text style={styles.actionDate}>
                                                {action.date.toLocaleString([], {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Text>
                                        </View>

                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={styles.dismissBtn}
                                                onPress={() => handleDismissAction(action, index)}
                                            >
                                                <X color="#ff6b6b" size={18} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.confirmBtn, { backgroundColor: getActionColor(action.type) }]}
                                                onPress={() => handleConfirmAction(action, index)}
                                            >
                                                <Check color="#fff" size={18} />
                                            </TouchableOpacity>
                                        </View>
                                    </GlassCard>
                                </Animated.View>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textArea: {
        flex: 1,
        color: '#fff',
        fontSize: 17,
        lineHeight: 26,
        padding: 20,
        textAlignVertical: 'top',
    },
    actionsContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
    },
    actionsScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    actionCardWrapper: {
        marginRight: 12,
    },
    actionCard: {
        width: 260,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    typeIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionContent: {
        marginBottom: 12,
    },
    actionType: {
        color: '#d8b4fe',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    actionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    actionDate: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    dismissBtn: {
        flex: 1,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,107,107,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,107,107,0.2)',
    },
    confirmBtn: {
        flex: 2,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
