
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
    CheckCheck,
    ChevronLeft,
    Info,
    MoreHorizontal,
    Plus,
    Send,
    Smile
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { GlowOrb } from './PremiumUI';

const { width, height } = Dimensions.get('window');

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
    }, [chat?.id]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMsg = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        };

        setMessages([...messages, newMsg]);
        setInputText('');
        onSendMessage(chat.id, inputText);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    };

    return (
        <View style={[styles.container, !darkMode && styles.lightBg]}>
            {/* Header */}
            <BlurView intensity={80} tint={darkMode ? "dark" : "light"} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                        <ChevronLeft size={28} color={darkMode ? "#fff" : "#000"} />
                    </TouchableOpacity>

                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, !darkMode && styles.textDark]}>{chat.name}</Text>
                        <View style={styles.statusRow}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.statusText}>Active now</Text>
                        </View>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Info size={22} color={darkMode ? "#fff" : "#000"} />
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
                {messages.map((msg, index) => (
                    <Animated.View
                        key={msg.id}
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
                            {msg.sender === 'me' && (
                                <View style={styles.statusCheck}>
                                    <CheckCheck size={14} color="rgba(255,255,255,0.7)" />
                                </View>
                            )}
                        </View>
                        <Text style={styles.timeText}>{msg.time}</Text>
                    </Animated.View>
                ))}
            </ScrollView>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputWrapper, !darkMode && styles.inputWrapperLight]}>
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
                </View>
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
        backgroundColor: '#F2F2F7',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.1)',
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
        alignItems: 'flex-start',
    },
    userInfo: {
        flex: 1,
        marginLeft: 8,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesPadding: {
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 16,
    },
    messageWrapper: {
        marginBottom: 16,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    theirMessage: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        minWidth: 80, // Minimum width for check icon
    },
    myBubble: {
        backgroundColor: '#6366F1',
        borderBottomRightRadius: 4,
        paddingBottom: 22, // Space for check icon
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
        elevation: 2,
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
        opacity: 0.9,
    },
    statusCheck: {
        position: 'absolute',
        bottom: 4,
        right: 8,
    },
    timeText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        marginTop: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        paddingTop: 10,
        gap: 8,
    },
    inputWrapperLight: {
        backgroundColor: '#F2F2F7',
    },
    inputFieldContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 28,
        paddingHorizontal: 8,
        minHeight: 48,
    },
    inputFieldLight: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
        width: 56,
        height: 56,
    },
    sendBtn: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbWrapper: {
        width: 54,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationText: {
        position: 'absolute',
        bottom: -20,
        fontSize: 10,
        color: '#6366F1',
        fontWeight: 'bold',
    },
    textDark: {
        color: '#111827',
    }
});
