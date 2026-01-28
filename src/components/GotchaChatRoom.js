
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
    Check,
    CheckCheck,
    ChevronLeft,
    Lock,
    MoreHorizontal,
    Plus,
    Send,
    Smile
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
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
import Animated, { FadeIn, Layout, SlideInRight } from 'react-native-reanimated';
import { GlowOrb } from './PremiumUI';

const { width } = Dimensions.get('window');

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
    const scrollRef = useRef(null);

    useEffect(() => {
        setMessages(chat?.messages || []);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, [chat?.id, chat?.messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const newMsgId = Date.now().toString();
        const newMsg = {
            id: newMsgId,
            text: inputText,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            status: 'sent' // sent | delivered | read
        };

        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        setInputText('');

        onSendMessage(chat.id, inputText);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Simulate real-time status updates - UX from advanced apps
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: 'delivered' } : m));
        }, 1500);

        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: 'read' } : m));
        }, 3000);
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
                        <View style={[
                            styles.bubble,
                            msg.sender === 'me' ? styles.myBubble : (darkMode ? styles.theirBubble : styles.theirBubbleLight)
                        ]}>
                            <Text style={[
                                styles.messageText,
                                msg.sender === 'me' ? styles.myText : (darkMode ? styles.theirText : styles.textDark)
                            ]}>
                                {msg.text}
                            </Text>
                            <View style={styles.msgDetails}>
                                <Text style={[styles.timeText, msg.sender === 'me' && styles.myTimeText]}>{msg.time}</Text>
                                {msg.sender === 'me' && (
                                    <View style={styles.statusCheck}>
                                        {renderStatusIcon(msg.status || 'read')}
                                    </View>
                                )}
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </ScrollView>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <BlurView intensity={darkMode ? 40 : 80} tint={darkMode ? "dark" : "light"} style={styles.inputWrapper}>
                    <View style={[styles.inputFieldContainer, !darkMode && styles.inputFieldLight]}>
                        <TouchableOpacity style={styles.inputAction}>
                            <Plus size={22} color="#6366F1" />
                        </TouchableOpacity>

                        <TextInput
                            style={[styles.input, !darkMode && styles.textDark]}
                            placeholder="Type a message..."
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
                        {inputText.trim() ? (
                            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                                <Send size={24} color="#fff" />
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
        paddingTop: Platform.OS === 'ios' ? 54 : 20,
        paddingBottom: 12,
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        paddingTop: 10,
        gap: 10,
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
    textDark: {
        color: '#1A1D23',
    },
    textDarkDim: {
        color: '#6C757D',
    }
});
