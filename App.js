
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { BrainBoxHome } from './src/components/BrainBoxHome';
import { GotchaChatList } from './src/components/GotchaChatList';
import { GotchaChatRoom } from './src/components/GotchaChatRoom';
import { LoginScreen } from './src/components/LoginScreen';
import { MeshGradientBackground } from './src/components/PremiumUI';
import { ReminderHistory } from './src/components/ReminderHistory';
import { SettingsSheet } from './src/components/SettingsSheet';
import { createChat, sendMessage } from './src/services/ChatService';
import { formatDuration, getRecordingStatus, startRecording, stopRecording } from './src/services/VoiceService';

const USER_SESSION_KEY = '@gotcha_active_user';

// Force React presence to prevent auto-stripping by misconfigured linters
const _REACT_STABILITY_LOCK = React.version;

export default function App() {
    const [activeUser, setActiveUser] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [brainBoxVisible, setBrainBoxVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordDuration, setRecordDuration] = useState('0:00');
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [remindersVisible, setRemindersVisible] = useState(false);

    // Settings State
    const [useMesh, setUseMesh] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

    const durationInterval = useRef(null);
    const recordingRef = useRef(null);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const savedUser = await AsyncStorage.getItem(USER_SESSION_KEY);
            if (savedUser) {
                setActiveUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error('Failed to load session', e);
        }
    };

    const handleLogin = async (phoneNumber) => {
        console.log(`[DEBUG] handleLogin triggered for ${phoneNumber}`);
        const user = { id: phoneNumber, name: 'Me' };
        setActiveUser(user);
        await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleLogout = async () => {
        setActiveUser(null);
        setActiveChat(null);
        await AsyncStorage.removeItem(USER_SESSION_KEY);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    };

    const handleVaultToggle = async () => {
        if (isVaultUnlocked) {
            setIsVaultUnlocked(false);
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock Private Chats',
        });

        if (result.success) {
            setIsVaultUnlocked(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handleToggleRecording = async () => {
        if (isRecording) {
            const recordingData = await stopRecording(recordingRef.current);
            setIsRecording(false);
            if (durationInterval.current) clearInterval(durationInterval.current);
            recordingRef.current = null;

            if (recordingData && activeChat) {
                await sendMessage(activeChat.id, `Voice message (${recordingData.duration.toFixed(1)}s)`, 'audio');
            }
        } else {
            const recording = await startRecording();
            if (recording) {
                recordingRef.current = recording;
                setIsRecording(true);
                setRecordDuration('0:00');

                durationInterval.current = setInterval(async () => {
                    const status = await getRecordingStatus(recordingRef.current);
                    if (status) {
                        const duration = (status.durationMillis || 0) / 1000;
                        setRecordDuration(formatDuration(duration));
                    }
                }, 1000);
            }
        }
    };

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={[styles.container, !darkMode && styles.lightContainer]}>
                    {useMesh && <MeshGradientBackground />}
                    {!useMesh && !darkMode && <View style={styles.solidLightBg} />}

                    <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

                    {!activeUser ? (
                        <LoginScreen
                            onLogin={handleLogin}
                        />
                    ) : (
                        activeChat ? (
                            <GotchaChatRoom
                                chat={activeChat}
                                onBack={() => setActiveChat(null)}
                                onSendMessage={async (id, txt) => await sendMessage(id, txt)}
                                onStartRecording={handleToggleRecording}
                                isRecording={isRecording}
                                recordDuration={recordDuration}
                                darkMode={darkMode}
                            />
                        ) : (
                            <SafeAreaView style={styles.safeArea}>
                                <GotchaChatList
                                    onSelectChat={(chat) => {
                                        if (chat.isPrivate && !isVaultUnlocked) {
                                            Alert.alert('Chat Hidden', 'Please unlock the vault in settings to view private conversations.');
                                        } else {
                                            setActiveChat(chat);
                                        }
                                    }}
                                    onOpenSettings={() => setSettingsVisible(true)}
                                    onOpenReminders={() => setRemindersVisible(true)}
                                    onOpenBrainBox={() => setBrainBoxVisible(true)}
                                    darkMode={darkMode}
                                    isVaultUnlocked={isVaultUnlocked}
                                />
                            </SafeAreaView>
                        )
                    )}

                    <Modal visible={brainBoxVisible} animationType="slide">
                        <BrainBoxHome
                            onClose={() => setBrainBoxVisible(false)}
                            onStartAiChat={() => {
                                setBrainBoxVisible(false);
                                // Start a chat with AI
                                const aiContact = {
                                    id: 'ai_brainbox',
                                    name: 'BrainBox AI',
                                    avatar: 'https://img.icons8.com/isometric/512/artificial-intelligence.png',
                                    phoneNumber: 'AI_BOT'
                                };
                                createChat(aiContact).then(chat => setActiveChat(chat));
                            }}
                        />
                    </Modal>

                    <SettingsSheet
                        visible={settingsVisible}
                        onClose={() => setSettingsVisible(false)}
                        useMesh={useMesh}
                        onToggleMesh={setUseMesh}
                        darkMode={darkMode}
                        onToggleDarkMode={setDarkMode}
                        isVaultUnlocked={isVaultUnlocked}
                        onToggleVault={handleVaultToggle}
                        onLogout={handleLogout}
                    />

                    <Modal visible={remindersVisible} animationType="slide">
                        <ReminderHistory
                            onBack={() => setRemindersVisible(false)}
                            darkMode={darkMode}
                        />
                    </Modal>
                </View>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    lightContainer: {
        backgroundColor: '#F2F2F7',
    },
    solidLightBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    }
});
