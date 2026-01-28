import { BlurView } from 'expo-blur';
import { Send, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Stability Lock
const _STORY_CORE_STABILITY = React.version;

const { width, height } = Dimensions.get('window');

/**
 * StoryViewer Component
 * A full-screen story experience inspired by BrainBox Figma design.
 */
export const StoryViewer = ({ visible, stories, initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const progressInterval = useRef(null);

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
            startStory();
        } else {
            stopStory();
        }
    }, [visible, initialIndex]);

    const startStory = () => {
        setProgress(0);
        if (progressInterval.current) clearInterval(progressInterval.current);

        progressInterval.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 1) {
                    handleNext();
                    return 0;
                }
                return prev + 0.01;
            });
        }, 50); // 5 seconds per story roughly
    };

    const stopStory = () => {
        if (progressInterval.current) clearInterval(progressInterval.current);
    };

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setProgress(0);
        }
    };

    if (!visible || stories.length === 0) return null;

    const currentStory = stories[currentIndex];

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.container}>
                <Image source={{ uri: currentStory.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

                <SafeAreaView style={styles.safeArea}>
                    {/* Header: Progress Bars */}
                    <View style={styles.progressContainer}>
                        {stories.map((_, i) => (
                            <View key={i} style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { width: i < currentIndex ? '100%' : (i === currentIndex ? `${progress * 100}%` : '0%') }
                                    ]}
                                />
                            </View>
                        ))}
                    </View>

                    {/* Header: User Info */}
                    <View style={styles.header}>
                        <View style={styles.userInfo}>
                            <Image source={{ uri: currentStory.avatar }} style={styles.avatar} />
                            <View>
                                <Text style={styles.userName}>{currentStory.name}</Text>
                                <Text style={styles.time}>{currentStory.time}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Content: Gesture Areas */}
                    <View style={styles.content}>
                        <TouchableOpacity style={styles.prevZone} onPress={handlePrev} />
                        <TouchableOpacity style={styles.nextZone} onPress={handleNext} />
                    </View>

                    {/* Footer: Quick Reply */}
                    <View style={styles.footer}>
                        <BlurView intensity={50} tint="dark" style={styles.replyContainer}>
                            <Text style={styles.replyPlaceholder}>Send a message...</Text>
                            <Send size={20} color="#fff" />
                        </BlurView>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
    progressContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        height: 4,
        gap: 4,
    },
    progressBarBg: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 1,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fff',
    },
    userName: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    time: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    closeBtn: {
        padding: 5,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
    },
    prevZone: {
        flex: 1,
    },
    nextZone: {
        flex: 2,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    replyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 25,
        paddingHorizontal: 20,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    replyPlaceholder: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
    }
});
