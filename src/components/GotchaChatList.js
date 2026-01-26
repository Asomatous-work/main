
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Edit3, Lock, Plus, Search, Settings, UserPlus, X } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { createChat, getChats } from '../services/ChatService';
import { getPhoneContacts } from '../services/ContactService';

const { width, height } = Dimensions.get('window');

export const GotchaChatList = ({ onSelectChat, onOpenSettings, onOpenBrainBox, darkMode, isVaultUnlocked }) => {
    const [chats, setChats] = useState([]);
    const [search, setSearch] = useState('');
    const [contactsModalVisible, setContactsModalVisible] = useState(false);
    const [phoneContacts, setPhoneContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [contactSearch, setContactSearch] = useState('');

    React.useEffect(() => {
        loadChats();
    }, []);

    const loadChats = async () => {
        const data = await getChats();
        setChats(data);
    };

    const handleSyncContacts = async () => {
        setLoadingContacts(true);
        setContactsModalVisible(true);
        const data = await getPhoneContacts();
        setPhoneContacts(data);
        setLoadingContacts(false);
    };

    const handleStartChat = async (contact) => {
        const newChat = await createChat(contact);
        setContactsModalVisible(false);
        loadChats(); // Refresh list
        onSelectChat(newChat);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const filteredChats = chats.filter(c =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.lastMessage || '').toLowerCase().includes(search.toLowerCase())
    );

    const filteredContacts = phoneContacts.filter(c =>
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.phoneNumber.includes(contactSearch.toLowerCase())
    );

    const renderChatItem = ({ item, index }) => {
        const isHidden = item.isPrivate && !isVaultUnlocked;

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
                <TouchableOpacity
                    style={styles.chatCard}
                    activeOpacity={0.7}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onSelectChat(item);
                    }}
                >
                    <View style={styles.avatarContainer}>
                        {item.avatar ? (
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: `hsl(${(index * 137) % 360}, 70%, 60%)` }]}>
                                <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
                            </View>
                        )}
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
                    <Text style={[styles.greeting, !darkMode && styles.textDarkDim]}>Gotcha Bharat</Text>
                    <Text style={[styles.title, !darkMode && styles.textDark]}>Messages</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={[styles.iconBtn, styles.aiBtn]} onPress={onOpenBrainBox}>
                        <Sparkles size={22} color="#00F2FE" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings}>
                        <Settings size={22} color={darkMode ? "#fff" : "#000"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={handleSyncContacts}>
                        <UserPlus size={22} color={darkMode ? "#fff" : "#000"} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stories-like placeholder - Advanced UI from Figma */}
            <View style={styles.activeContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeScroll}>
                    <TouchableOpacity style={styles.activeItem} onPress={handleSyncContacts}>
                        <View style={styles.addActive}>
                            <Plus size={24} color="#6366F1" />
                        </View>
                        <Text style={[styles.activeName, !darkMode && styles.textDarkDim]}>You</Text>
                    </TouchableOpacity>
                    {chats.slice(0, 5).map((chat, i) => (
                        <TouchableOpacity key={chat.id} style={styles.activeItem} onPress={() => onSelectChat(chat)}>
                            <View style={styles.activeAvatarWrapper}>
                                {chat.avatar ? (
                                    <Image source={{ uri: chat.avatar }} style={styles.activeAvatar} />
                                ) : (
                                    <View style={[styles.activeAvatar, { backgroundColor: `hsl(${(i * 97) % 360}, 60%, 50%)` }]}>
                                        <Text style={styles.avatarText}>{(chat.name || '?')[0]}</Text>
                                    </View>
                                )}
                                <View style={styles.onlineIndicator} />
                            </View>
                            <Text numberOfLines={1} style={[styles.activeName, !darkMode && styles.textDarkDim]}>
                                {chat.name.split(' ')[0]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No conversations yet.</Text>
                        <TouchableOpacity style={styles.syncBtn} onPress={handleSyncContacts}>
                            <Text style={styles.syncBtnText}>Sync Phone Contacts</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleSyncContacts}
            >
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
                    <View style={styles.fabContent}>
                        <Edit3 size={24} color="#fff" />
                    </View>
                </BlurView>
            </TouchableOpacity>

            {/* Contacts Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={contactsModalVisible}
                onRequestClose={() => setContactsModalVisible(false)}
            >
                <View style={styles.modalBg}>
                    <BlurView intensity={100} tint={darkMode ? "dark" : "light"} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, !darkMode && styles.textDark]}>New Message</Text>
                            <TouchableOpacity onPress={() => setContactsModalVisible(false)}>
                                <X size={24} color={darkMode ? "#fff" : "#000"} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, styles.modalSearch, !darkMode && styles.searchLight]}>
                            <Search size={18} color={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
                            <TextInput
                                style={[styles.searchInput, !darkMode && styles.textDark]}
                                placeholder="Search contacts"
                                placeholderTextColor={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                                value={contactSearch}
                                onChangeText={setContactSearch}
                            />
                        </View>

                        {loadingContacts ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#6366F1" />
                                <Text style={styles.loadingText}>Syncing your contacts...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredContacts}
                                keyExtractor={item => item.id}
                                renderItem={({ item, index }) => (
                                    <Animated.View entering={FadeInUp.delay(index * 20)}>
                                        <TouchableOpacity
                                            style={styles.contactItem}
                                            onPress={() => handleStartChat(item)}
                                        >
                                            <View style={[styles.contactAvatar, { backgroundColor: `hsl(${(index * 47) % 360}, 50%, 40%)` }]}>
                                                <Text style={styles.avatarText}>{item.initials}</Text>
                                            </View>
                                            <View>
                                                <Text style={[styles.contactName, !darkMode && styles.textDark]}>{item.name}</Text>
                                                <Text style={styles.contactNumber}>{item.phoneNumber}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                )}
                                contentContainerStyle={styles.contactList}
                            />
                        )}
                    </BlurView>
                </View>
            </Modal>
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
        marginBottom: 10,
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
    aiBtn: {
        backgroundColor: 'rgba(0,242,254,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(0,242,254,0.2)',
    },
    activeContainer: {
        height: 100,
        marginBottom: 10,
    },
    activeScroll: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    activeItem: {
        alignItems: 'center',
        marginRight: 20,
        width: 60,
    },
    activeAvatarWrapper: {
        position: 'relative',
        marginBottom: 6,
    },
    activeAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6366F1',
    },
    activeName: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    addActive: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1.5,
        borderColor: '#6366F1',
        marginBottom: 6,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#000',
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
        paddingVertical: 14,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
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
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 16,
        marginBottom: 20,
    },
    syncBtn: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    syncBtnText: {
        color: '#fff',
        fontWeight: '700',
    },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: height * 0.85,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        paddingTop: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    modalSearch: {
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'rgba(255,255,255,0.6)',
        marginTop: 16,
        fontSize: 16,
    },
    contactList: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    contactAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    contactNumber: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
    }
});
