import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ExecutionHUD } from './src/components/ModernUI';
import { PremiumNoteEditor } from './src/components/PremiumNoteEditor';
import { PremiumNotesLibrary } from './src/components/PremiumNotesLibrary';
import { MeshGradientBackground } from './src/components/PremiumUI';
import { SettingsSheet } from './src/components/SettingsSheet';
import { cleanupExpiredNotes, createNote, deleteNote, getAllNotes, updateNote } from './src/services/NoteService';
import { formatDuration, getRecordingStatus, startRecording, stopRecording } from './src/services/VoiceService';

export default function App() {
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);
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

    useEffect(() => {
        const startup = async () => {
            await cleanupExpiredNotes();
            loadNotes();
        };
        startup();
    }, []);

    const loadNotes = async () => {
        const loadedNotes = await getAllNotes();
        setNotes(loadedNotes);
    };

    const handleCreateNote = async () => {
        const newNote = await createNote('New Note', '');
        setNotes([newNote, ...notes]);
        setCurrentNote(newNote);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handleSelectNote = (note) => {
        setCurrentNote(note);
    };

    const handleBackToLibrary = () => {
        setCurrentNote(null);
        loadNotes();
    };

    const handleNoteUpdate = async (updatedNote) => {
        await updateNote(updatedNote.id, updatedNote);
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    };

    const handleNoteDelete = async (id) => {
        await deleteNote(id);
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        if (currentNote?.id === id) setCurrentNote(null);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setHudData({ title: 'Note Removed', subtext: 'Successfully deleted' });
        setHudVisible(true);
        setTimeout(() => setHudVisible(false), 2000);
    };

    const handleVaultToggle = async () => {
        if (isVaultUnlocked) {
            setIsVaultUnlocked(false);
            Alert.alert('Vault Locked');
            return;
        }

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

        if (!hasHardware || supportedTypes.length === 0) {
            // Simulator fallback or devices without biometrics
            setIsVaultUnlocked(true);
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock Privacy Vault',
            fallbackLabel: 'Use Passcode',
            disableDeviceFallback: false,
        });

        if (result.success) {
            setIsVaultUnlocked(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Alert.alert('Authentication Failed');
        }
    };

    const handleToggleRecording = async () => {
        if (isRecording) {
            // STOP
            const recordingData = await stopRecording(recordingRef.current);
            setIsRecording(false);
            if (durationInterval.current) clearInterval(durationInterval.current);
            recordingRef.current = null;

            if (recordingData && currentNote) {
                const updatedNote = {
                    ...currentNote,
                    voiceRecordings: [...(currentNote.voiceRecordings || []), recordingData],
                    content: currentNote.content + `\n\n[Audio capture: ${recordingData.duration.toFixed(1)}s]`
                };
                handleNoteUpdate(updatedNote);
                setCurrentNote(updatedNote);

                setHudData({ title: 'Audio Captured', subtext: 'Added to current note' });
                setHudVisible(true);
                setTimeout(() => setHudVisible(false), 2500);
            }
        } else {
            // START
            const recording = await startRecording();
            if (recording) {
                recordingRef.current = recording;
                setIsRecording(true);
                setRecordDuration('0:00');

                durationInterval.current = setInterval(async () => {
                    const status = await getRecordingStatus(recordingRef.current);
                    if (status && (status.isRecording || Platform.OS === 'web')) {
                        const duration = (status.durationMillis || 0) / 1000;
                        setRecordDuration(formatDuration(duration));
                    }
                }, 1000);
            } else {
                Alert.alert('Recording Failed', 'Ensure microphone permissions are granted.');
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

                    <SafeAreaView style={styles.safeArea}>
                        {currentNote ? (
                            <PremiumNoteEditor
                                note={currentNote}
                                onUpdate={handleNoteUpdate}
                                onStartRecording={handleToggleRecording}
                                isRecording={isRecording}
                                recordDuration={recordDuration}
                                onDelete={() => handleNoteDelete(currentNote.id)}
                                onBack={handleBackToLibrary}
                                darkMode={darkMode}
                            />
                        ) : (
                            <PremiumNotesLibrary
                                notes={notes}
                                onCreateNote={handleCreateNote}
                                onSelectNote={handleSelectNote}
                                onDeleteNote={handleNoteDelete}
                                onOpenSettings={() => setSettingsVisible(true)}
                                darkMode={darkMode}
                                isVaultUnlocked={isVaultUnlocked}
                            />
                        )}
                    </SafeAreaView>

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
