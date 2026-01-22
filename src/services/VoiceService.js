import { Platform } from 'react-native';

/**
 * Web-compatible Audio Recording using MediaRecorder API
 * Native implementation using expo-av
 */

let mediaRecorder = null;
let audioChunks = [];
let stream = null;
let startTime = 0;

export const requestPermissions = async () => {
    if (Platform.OS === 'web') {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            return true;
        } catch (err) {
            console.error('Microphone permission denied:', err);
            return false;
        }
    } else {
        const { Audio } = require('expo-av');
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') return false;

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            return true;
        } catch (err) {
            console.error('Failed to get native permissions:', err);
            return false;
        }
    }
};

export const startRecording = async () => {
    try {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return null;

        if (Platform.OS === 'web') {
            audioChunks = [];
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
            startTime = Date.now();
            mediaRecorder.start();
            return { isWeb: true, startTime };
        } else {
            const { Audio } = require('expo-av');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            return recording;
        }
    } catch (err) {
        console.error('Start recording error:', err);
        return null;
    }
};

export const stopRecording = async (recording) => {
    if (!recording) return null;

    if (Platform.OS === 'web' || recording.isWeb) {
        if (!mediaRecorder) return null;

        return new Promise((resolve) => {
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const uri = URL.createObjectURL(audioBlob);
                const end = Date.now();
                const start = recording.startTime || startTime || end;
                const duration = Math.max((end - start) / 1000, 0.1);

                const recordingData = {
                    uri,
                    duration,
                    timestamp: new Date().toISOString(),
                };

                mediaRecorder = null;
                audioChunks = [];
                resolve(recordingData);
            };

            mediaRecorder.stop();
        });
    } else {
        // Native
        try {
            if (typeof recording.stopAndUnloadAsync !== 'function') {
                console.error('Recording object is invalid (stopAndUnloadAsync missing)');
                return null;
            }
            // stopAndUnloadAsync returns the final status
            const status = await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            const duration = (status?.durationMillis || 0) / 1000;

            return {
                uri,
                duration: duration > 0 ? duration : 0.1, // Fallback if 0
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            console.error('Stop native recording error:', err);
            return null;
        }
    }
};

export const getRecordingStatus = async (recording) => {
    if (!recording) return null;

    if (Platform.OS === 'web' || recording.isWeb) {
        const duration = (Date.now() - (recording.startTime || startTime)) / 1000;
        return {
            durationMillis: duration * 1000,
            isRecording: true,
            isLoaded: true
        };
    } else {
        try {
            if (typeof recording.getStatusAsync !== 'function') return null;
            return await recording.getStatusAsync();
        } catch (err) {
            return null;
        }
    }
};

export const formatDuration = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const playRecording = async (uri) => {
    if (Platform.OS === 'web') {
        const audio = new Audio(uri);
        audio.play();
        return audio;
    } else {
        const { Audio } = require('expo-av');
        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true }
            );
            return sound;
        } catch (err) {
            console.error('Play error:', err);
            return null;
        }
    }
};
