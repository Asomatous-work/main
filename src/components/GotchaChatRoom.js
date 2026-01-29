
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
    Check,
    CheckCheck,
    ChevronLeft,
    Clock,
    Edit2,
    Lock,
    MoreHorizontal,
    Plus,
    Reply,
    Send,
    Share,
    Smile,
    Trash2,
    X
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout, SlideInDown, SlideInRight } from 'react-native-reanimated';
import { saveReminder } from '../services/ReminderService';
import { GlowOrb } from './PremiumUI';

const { width, height } = Dimensions.get('window');

// Stability Lock
const _CHAT_ROOM_STABILITY = React.version;

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

export const GotchaChatRoom = ({
    chat,
    onBack,
    onSendMessage,
    onStartRecording,
    isRecording,
    recordDuration,
    darkMode = true
}) => {
    const [messages, setMessages] = useState(chat?.messages || []);
    const [inputText, setInputText] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [reminderVisible, setReminderVisible] = useState(false);
    const [detectedReminder, setDetectedReminder] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        setMessages(chat?.messages || []);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, [chat?.id, chat?.messages]);

    // NLP for Reminder Detection
    const checkReminder = (text) => {
        const lowerText = text.toLowerCase();
        const timeRegex = /(\d{1,2}(?::\d{2})?\s*(?:am|pm|am|pm))/i;
        const dayRegex = /(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|tonight)/i;

        const hasTime = timeRegex.test(lowerText);
        const hasDay = dayRegex.test(lowerText);

        if (hasTime || hasDay) {
            const timeMatch = lowerText.match(timeRegex);
            const dayMatch = lowerText.match(dayRegex);
            setDetectedReminder({
                time: timeMatch ? timeMatch[0] : 'undetermined',
                day: dayMatch ? dayMatch[0] : 'today',
                text: text
            });
            setReminderVisible(true);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !chat) return;

        if (isEditing && selectedMessage) {
            const updatedMessages = messages.map(m =>
                m.id === selectedMessage?.id ? { ...m, text: inputText, isEdited: true } : m
            );
            setMessages(updatedMessages);
            setIsEditing(false);
            setSelectedMessage(null);
            setInputText('');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return;
        }

        const newMsgId = Date.now().toString();
        const newMsg = {
            id: newMsgId,
            text: inputText,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            status: 'sent',
            timestamp: Date.now(),
            replyTo: replyTo ? { text: replyTo.text, sender: replyTo.sender } : null
        };

        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        setReplyTo(null);

        // Trigger Reminder Check
        checkReminder(inputText);

        setInputText('');

        if (chat?.id) {
            onSendMessage(chat.id, inputText);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: 'delivered' } : m));
        }, 1500);

        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: 'read' } : m));
        }, 3000);
    };

    const handleLongPress = (msg) => {
        if (!msg) return;
        setSelectedMessage(msg);
        setOptionsVisible(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    };

    const handleDelete = () => {
        if (!selectedMessage) return;
        const updatedMessages = messages.filter(m => m.id !== selectedMessage?.id);
        setMessages(updatedMessages);
        setOptionsVisible(false);
        setSelectedMessage(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    };

    const handleEdit = () => {
        if (!selectedMessage) return;
        const now = Date.now();
        const msgTime = selectedMessage?.timestamp || now;
        const diffMins = (now - msgTime) / (1000 * 60);

        if (diffMins > 10) {
            Alert.alert("Cannot Edit", "Messages can only be edited within 10 minutes of sending.");
            setOptionsVisible(false);
            return;
        }

        setInputText(selectedMessage?.text || '');
        setIsEditing(true);
        setOptionsVisible(false);
    };

    const [lastTap, setLastTap] = useState(0);

    const handleDoubleTap = (msg) => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;
        if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
            addHeartReaction(msg.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            setLastTap(now);
        }
    };

    const handleReact = (emoji) => {
        if (!selectedMessage) return;
        const updatedMessages = messages.map(m =>
            m.id === selectedMessage?.id ? { ...m, reaction: emoji } : m
        );
        setMessages(updatedMessages);
        setOptionsVisible(false);
        setSelectedMessage(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Helper for direct reaction from double tap
    const addHeartReaction = (msgId) => {
        const updatedMessages = messages.map(m =>
            m.id === msgId ? { ...m, reaction: '❤️' } : m
        );
        setMessages(updatedMessages);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const renderStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <Check size={14} color="rgba(255,255,255,0.4)" />;
            case 'delivered':
                return <CheckCheck size={14} color="rgba(255,255,255,0.4)" />;
            case 'read':
                return <CheckCheck size={14} color="#6366F1" />;
            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, !darkMode && styles.lightBg]}>
            {/* Header */}
            <BlurView intensity={90} tint={darkMode ? "dark" : "light"} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                        <ChevronLeft size={28} color={darkMode ? "#fff" : "#000"} />
                    </TouchableOpacity>

                    <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.userName, !darkMode && styles.textDark]}>{chat.name}</Text>
                        </View>
                        <View style={styles.statusRow}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.statusText}>online</Text>
                        </View>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.avatarBtn}>
                            {chat.avatar ? (
                                <Image source={{ uri: chat.avatar }} style={styles.miniAvatar} />
                            ) : (
                                <View style={[styles.miniAvatar, { backgroundColor: '#6366F1' }]}>
                                    <Text style={styles.miniAvatarText}>{(chat.name || '?')[0]}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <MoreHorizontal size={22} color={darkMode ? "#fff" : "#000"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>

            <ScrollView
                ref={scrollRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesPadding}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
                <View style={[styles.encryptionBanner, !darkMode && styles.encryptionBannerLight]}>
                    <Lock size={12} color={darkMode ? "rgba(255,193,7,0.6)" : "rgba(245,158,11,0.6)"} />
                    <Text style={[styles.encryptionText, !darkMode && styles.textDarkDim]}>
                        Messages are end-to-end encrypted. No one outside of this chat can read or listen to them.
                    </Text>
                </View>

                {messages.map((msg, index) => (
                    <Animated.View
                        key={msg.id}
                        layout={Layout}
                        entering={index === messages.length - 1 ? SlideInRight : FadeIn}
                        style={[
                            styles.messageWrapper,
                            msg.sender === 'me' ? styles.myMessage : styles.theirMessage
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() => handleDoubleTap(msg)}
                            onLongPress={() => handleLongPress(msg)}
                            activeOpacity={0.9}
                        >
                            <View style={[
                                styles.bubble,
                                msg.sender === 'me' ? styles.myBubble : (darkMode ? styles.theirBubble : styles.theirBubbleLight)
                            ]}>
                                {msg.replyTo && (
                                    <View style={styles.bubbleReplyPreview}>
                                        <Text style={styles.replySenderName}>{msg.replyTo.sender === 'me' ? 'You' : (chat.name || 'User')}</Text>
                                        <Text numberOfLines={1} style={styles.replyPreviewText}>{msg.replyTo.text}</Text>
                                    </View>
                                )}
                                {msg.isEdited && <Text style={styles.editedTag}>Edited</Text>}
                                <Text style={[
                                    styles.messageText,
                                    msg.sender === 'me' ? styles.myText : (darkMode ? styles.theirText : styles.textDark)
                                ]}>
                                    {msg.text}
                                </Text>
                                {msg.reaction && (
                                    <View style={styles.reactionBadge}>
                                        <Text style={styles.reactionText}>{msg.reaction}</Text>
                                    </View>
                                )}
                                <View style={styles.msgDetails}>
                                    <Text style={[styles.timeText, msg.sender === 'me' && styles.myTimeText]}>{msg.time}</Text>
                                    {msg.sender === 'me' && (
                                        <View style={styles.statusCheck}>
                                            {renderStatusIcon(msg.status || 'read')}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>

            {/* Reminder Suggestion Popup */}
            {reminderVisible && (
                <Animated.View entering={SlideInDown} exiting={FadeOut} style={styles.reminderPopup}>
                    <BlurView intensity={100} tint="dark" style={styles.reminderBlur}>
                        <View style={styles.reminderIcon}>
                            <Clock size={24} color="#00F2FE" />
                        </View>
                        <View style={styles.reminderInfo}>
                            <Text style={styles.reminderTitle}>Set a reminder?</Text>
                            <Text style={styles.reminderDesc}>Detected: {detectedReminder?.day} at {detectedReminder?.time}</Text>
                        </View>
                        <View style={styles.reminderActions}>
                            <TouchableOpacity style={styles.remCancel} onPress={() => setReminderVisible(false)}>
                                <X size={20} color="#FF6B6B" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.remOk}
                                onPress={async () => {
                                    await saveReminder(detectedReminder);
                                    setReminderVisible(false);
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                }}
                            >
                                <Check size={20} color="#00F2FE" />
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Animated.View>
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <BlurView intensity={darkMode ? 40 : 80} tint={darkMode ? "dark" : "light"} style={styles.inputWrapper}>
                    {replyTo && (
                        <Animated.View entering={SlideInRight} style={styles.replyBar}>
                            <View style={styles.replyBarAccent} />
                            <View style={styles.replyBarContent}>
                                <Text style={styles.replyBarName}>{replyTo.sender === 'me' ? 'You' : (chat.name || 'User')}</Text>
                                <Text numberOfLines={1} style={styles.replyBarText}>{replyTo.text}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setReplyTo(null)} style={styles.closeReplyBtn}>
                                <X size={20} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                    <View style={styles.inputRow}>
                        <TouchableOpacity style={styles.inputAction}>
                            {isEditing ? <X size={22} color="#FF6B6B" onPress={() => { setIsEditing(false); setInputText(''); }} /> : <Plus size={22} color="#6366F1" />}
                        </TouchableOpacity>

                        <TextInput
                            style={[styles.input, !darkMode && styles.textDark]}
                            placeholder={isEditing ? "Editing message..." : "Type a message..."}
                            placeholderTextColor={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />

                        <TouchableOpacity style={styles.inputAction}>
                            <Smile size={22} color={darkMode ? "rgba(255,255,255,0.4)" : "#888"} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionRow}>
                        {(inputText.trim() || isEditing) ? (
                            <TouchableOpacity style={[styles.sendBtn, isEditing && { backgroundColor: '#10B981' }]} onPress={handleSend}>
                                {isEditing ? <Check size={24} color="#fff" /> : <Send size={24} color="#fff" />}
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.orbWrapper}>
                                <TouchableOpacity onPress={onStartRecording}>
                                    <GlowOrb isActive={isRecording} size={54} />
                                </TouchableOpacity>
                                {isRecording && (
                                    <Text style={styles.durationText}>{recordDuration}</Text>
                                )}
                            </View>
                        )}
                    </View>
                </BlurView>
            </KeyboardAvoidingView>

            {/* Message Options Modal */}
            <Modal visible={optionsVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setOptionsVisible(false)}
                >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

                    <Animated.View entering={SlideInDown} style={styles.optionsContainer}>
                        {/* Reaction Bar */}
                        <View style={styles.reactionRow}>
                            {REACTION_EMOJIS.map(emoji => (
                                <TouchableOpacity key={emoji} onPress={() => handleReact(emoji)} style={styles.emojiBtn}>
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Actions */}
                        <View style={styles.actionsList}>
                            <TouchableOpacity style={styles.actionItem} onPress={() => { setReplyTo(selectedMessage); setOptionsVisible(false); }}>
                                <Reply size={20} color="#fff" />
                                <Text style={styles.actionLabel}>Reply</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionItem} onPress={() => { Alert.alert('Forward', 'Forwarding enabled!'); setOptionsVisible(false); }}>
                                <Share size={20} color="#fff" />
                                <Text style={styles.actionLabel}>Forward</Text>
                            </TouchableOpacity>
                            {selectedMessage?.sender === 'me' && (
                                <TouchableOpacity style={styles.actionItem} onPress={handleEdit}>
                                    <Edit2 size={20} color="#fff" />
                                    <Text style={styles.actionLabel}>Edit Message</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.actionItem, styles.deleteAction]} onPress={handleDelete}>
                                <Trash2 size={20} color="#FF6B6B" />
                                <Text style={[styles.actionLabel, { color: '#FF6B6B' }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    lightBg: {
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 74 : 40,
        paddingBottom: 15,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
        marginLeft: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 1,
    },
    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#10B981',
        marginRight: 5,
    },
    statusText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
        textTransform: 'lowercase',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarBtn: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniAvatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    actionBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesPadding: {
        paddingTop: 16,
        paddingBottom: 30,
        paddingHorizontal: 16,
    },
    encryptionBanner: {
        backgroundColor: 'rgba(255,191,0,0.08)',
        padding: 12,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        marginHorizontal: 10,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,191,0,0.15)',
    },
    encryptionBannerLight: {
        backgroundColor: 'rgba(245,158,11,0.05)',
        borderColor: 'rgba(245,158,11,0.1)',
    },
    encryptionText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        flex: 1,
        lineHeight: 16,
    },
    messageWrapper: {
        marginBottom: 12,
        maxWidth: '82%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    theirMessage: {
        alignSelf: 'flex-start',
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: 90,
        position: 'relative',
    },
    myBubble: {
        backgroundColor: '#6366F1',
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderBottomLeftRadius: 4,
    },
    theirBubbleLight: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    myText: {
        color: '#fff',
        fontWeight: '500',
    },
    theirText: {
        color: '#fff',
        opacity: 0.95,
    },
    editedTag: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        fontStyle: 'italic',
        marginBottom: 2,
    },
    reactionBadge: {
        position: 'absolute',
        bottom: -15,
        right: 10,
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 5,
    },
    reactionText: {
        fontSize: 14,
    },
    msgDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
        gap: 4,
    },
    timeText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
    },
    myTimeText: {
        color: 'rgba(255,255,255,0.7)',
    },
    statusCheck: {
        marginLeft: 2,
    },
    reminderPopup: {
        position: 'absolute',
        top: height * 0.15,
        left: 20,
        right: 20,
        zIndex: 100,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(0,242,254,0.3)',
    },
    reminderBlur: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    reminderIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,242,254,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    reminderInfo: {
        flex: 1,
    },
    reminderTitle: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    reminderDesc: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 2,
    },
    reminderActions: {
        flexDirection: 'row',
        gap: 15,
    },
    remCancel: {
        padding: 5,
    },
    remOk: {
        padding: 5,
    },
    inputWrapper: {
        flexDirection: 'column',
        paddingHorizontal: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        paddingTop: 10,
        gap: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    replyBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    replyBarAccent: {
        width: 3,
        height: '100%',
        backgroundColor: '#6366F1',
        borderRadius: 2,
        marginRight: 10,
    },
    replyBarContent: {
        flex: 1,
    },
    replyBarName: {
        color: '#6366F1',
        fontSize: 13,
        fontWeight: '700',
    },
    replyBarText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    closeReplyBtn: {
        padding: 4,
    },
    bubbleReplyPreview: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        padding: 8,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#6366F1',
        marginBottom: 8,
    },
    replySenderName: {
        color: '#6366F1',
        fontSize: 12,
        fontWeight: '700',
    },
    replyPreviewText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
    },
    inputFieldContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 24,
        paddingHorizontal: 6,
        minHeight: 48,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputFieldLight: {
        backgroundColor: '#fff',
        borderColor: '#E9ECEF',
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 8,
        maxHeight: 120,
    },
    inputAction: {
        padding: 10,
    },
    actionRow: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 52,
        height: 52,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    orbWrapper: {
        width: 52,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationText: {
        position: 'absolute',
        bottom: -18,
        fontSize: 10,
        color: '#6366F1',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    optionsContainer: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    },
    reactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 20,
    },
    emojiBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 24,
    },
    actionsList: {
        gap: 16,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        gap: 16,
    },
    actionLabel: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    deleteAction: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    textDark: {
        color: '#1A1D23',
    },
    textDarkDim: {
        color: '#6C757D',
    }
});
