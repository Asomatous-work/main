
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Camera, Edit3, Lock, Search, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getChats } from '../services/ChatService';

const { width } = Dimensions.get('window');

export const GotchaChatList = ({ onSelectChat, onOpenSettings, darkMode, isVaultUnlocked }) => {
    const [chats, setChats] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadChats();
    }, []);

    const loadChats = async () => {
        const data = await getChats();
        setChats(data);
    };

    const filteredChats = chats.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase())
    );

    const renderChatItem = ({ item, index }) => {
        const isHidden = item.isPrivate && !isVaultUnlocked;

        return (
            <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
                <TouchableOpacity
                    style={styles.chatCard}
                    activeOpacity={0.7}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onSelectChat(item);
                    }}
                >
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        {item.unread > 0 && <View style={styles.unreadBadge} />}

                    </View>

                    <View style={styles.chatInfo}>
                        <View style={styles.chatHeader}>
                            <Text style={[styles.chatName, !darkMode && styles.textDark]}>{item.name}</Text>
                            <Text style={styles.chatTime}>{item.time}</Text>
                        </View>

                        <View style={styles.lastMsgRow}>
                            {item.isPrivate && <Lock size={12} color="#F59E0B" style={styles.lockIcon} />}
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.lastMessage,
                                    item.unread > 0 && styles.unreadText,
                                    isHidden && styles.hiddenText,
                                    !darkMode && styles.textDarkDim
                                ]}
                            >
                                {isHidden ? 'Private conversation is locked' : item.lastMessage}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, !darkMode && styles.textDarkDim]}>Gotcha</Text>
                    <Text style={[styles.title, !darkMode && styles.textDark]}>Messages</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings}>
                        <Settings size={22} color={darkMode ? "#fff" : "#000"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Camera size={22} color={darkMode ? "#fff" : "#000"} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View style={[styles.searchContainer, !darkMode && styles.searchLight]}>
                <Search size={18} color={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
                <TextInput
                    style={[styles.searchInput, !darkMode && styles.textDark]}
                    placeholder="Search people or groups"
                    placeholderTextColor={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* List */}
            <FlatList
                data={filteredChats}
                renderItem={renderChatItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
                    <View style={styles.fabContent}>
                        <Edit3 size={24} color="#fff" />
                    </View>
                </BlurView>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -1,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 24,
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 24,
        marginBottom: 10,
    },
    searchLight: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#fff',
        fontSize: 16,
    },
    listContent: {
        paddingTop: 10,
        paddingBottom: 100,
    },
    chatCard: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    unreadBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#6366F1',
        borderWidth: 2,
        borderColor: '#000',
    },
    aiTag: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#10B981',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#000',
    },
    aiTagText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 16,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
    },
    chatTime: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
    },
    lastMsgRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        flex: 1,
    },
    unreadText: {
        color: '#fff',
        fontWeight: '600',
    },
    hiddenText: {
        fontStyle: 'italic',
        opacity: 0.8,
    },
    lockIcon: {
        marginRight: 6,
    },
    textDark: {
        color: '#111827',
    },
    textDarkDim: {
        color: '#6B7280',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    fabContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
    }
});
