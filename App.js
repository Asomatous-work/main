import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRef, useState } from 'react';
import { Alert, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GotchaChatList } from './src/components/GotchaChatList';
import { GotchaChatRoom } from './src/components/GotchaChatRoom';
import { LoginScreen } from './src/components/LoginScreen';
import { ExecutionHUD } from './src/components/ModernUI';
import { MeshGradientBackground } from './src/components/PremiumUI';
import { SettingsSheet } from './src/components/SettingsSheet';
import { sendMessage } from './src/services/ChatService';
import { formatDuration, getRecordingStatus, startRecording, stopRecording } from './src/services/VoiceService';

export default function App() {
    const [activeUser, setActiveUser] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordDuration, setRecordDuration] = useState('0:00');
    const [hudVisible, setHudVisible] = useState(false);
    const [hudData, setHudData] = useState({ title: '', subtext: '' });
    const [settingsVisible, setSettingsVisible] = useState(false);

    // Settings State
    const [useMesh, setUseMesh] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

    const durationInterval = useRef(null);
    const recordingRef = useRef(null);

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
                sendMessage(activeChat.id, `Voice message (${recordingData.duration.toFixed(1)}s)`, 'audio');
                setHudData({ title: 'Voice Sent', subtext: 'Audio message transmitted' });
                setHudVisible(true);
                setTimeout(() => setHudVisible(false), 2000);
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
                            onLogin={(phoneNumber) => {
                                setActiveUser({ id: phoneNumber, name: 'Me' });
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }}
                        />
                    ) : (
                        activeChat ? (
                            <GotchaChatRoom
                                chat={activeChat}
                                onBack={() => setActiveChat(null)}
                                onSendMessage={(id, txt) => sendMessage(id, txt)}
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
                                    darkMode={darkMode}
                                    isVaultUnlocked={isVaultUnlocked}
                                />
                            </SafeAreaView>
                        )
                    )}

                    <ExecutionHUD visible={hudVisible} title={hudData.title} subtext={hudData.subtext} />

                    <SettingsSheet
                        visible={settingsVisible}
                        onClose={() => setSettingsVisible(false)}
                        useMesh={useMesh}
                        onToggleMesh={setUseMesh}
                        darkMode={darkMode}
                        onToggleDarkMode={setDarkMode}
                        isVaultUnlocked={isVaultUnlocked}
                        onToggleVault={handleVaultToggle}
                    />
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
