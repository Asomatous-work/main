import * as Haptics from 'expo-haptics';
import {
    ChevronRight,
    Clock,
    LayoutGrid,
    Lock,
    Mic, Plus, Search, Sparkles, Trash2
} from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';

import { FloatingCard } from './PremiumUI';

const { width } = Dimensions.get('window');

export const PremiumNotesLibrary = ({
    notes, onCreateNote, onSelectNote, onDeleteNote,
    onOpenSettings, darkMode = true, isVaultUnlocked = false
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const renderNoteCard = ({ item, index }) => {
        const isLocked = item.isPrivate && !isVaultUnlocked;
        const preview = isLocked
            ? 'This note is protected by your privacy vault. Unlock to view content.'
            : (item.content.slice(0, 100) || 'No content yet...');

        const hasVoice = item.voiceRecordings && item.voiceRecordings.length > 0;
        const hasInsights = item.detectedActions && item.detectedActions.length > 0;

        const handlePress = () => {
            if (isLocked) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                Alert.alert('Vault Locked', 'Please unlock your privacy vault in settings to view this note.');
            } else {
                onSelectNote(item);
            }
        };

        const renderRightActions = (progress, dragX) => {
            return (
                <TouchableOpacity
                    style={styles.deleteAction}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        onDeleteNote(item.id);
                    }}
                >
                    <Trash2 color="#fff" size={24} />
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            );
        };

        return (
            <FloatingCard
                delay={index * 50}
                style={styles.noteCard}
                contentStyle={{ padding: 0, backgroundColor: 'transparent', borderWidth: 0 }}
            >
                <Swipeable renderRightActions={renderRightActions}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handlePress}
                        onLongPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                            Alert.alert('Manage Note', item.title, [
                                { text: 'Edit', onPress: handlePress },
                                { text: 'Delete', onPress: () => onDeleteNote(item.id), style: 'destructive' },
                                { text: 'Cancel', style: 'cancel' }
                            ]);
                        }}
                        style={[styles.cardContent, !darkMode && styles.cardLight]}
                    >
                        {/* Header */}
                        <View style={styles.cardHeader}>
                            <View style={styles.titleRow}>
                                <View style={styles.titleWithIcon}>
                                    {item.isPrivate && <Lock size={14} color="#F59E0B" style={{ marginRight: 6 }} />}
                                    <Text style={[styles.noteTitle, !darkMode && styles.textDark]} numberOfLines={1}>
                                        {isLocked ? 'Encrypted Note' : item.title}
                                    </Text>
                                </View>

                                <View style={styles.badges}>
                                    {hasVoice && (
                                        <View style={[styles.badge, styles.voiceBadge]}>
                                            <Mic size={10} color="#fff" />
                                        </View>
                                    )}
                                    {hasInsights && (
                                        <View style={[styles.badge, styles.insightsBadge]}>
                                            <Sparkles size={10} color="#fff" />
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View style={styles.metaRow}>
                                <Clock size={12} color={darkMode ? "rgba(255,255,255,0.4)" : "#888"} />
                                <Text style={[styles.timestamp, !darkMode && styles.textDarkDim]}>{formatDate(item.updatedAt)}</Text>
                            </View>
                        </View>

                        {/* Preview */}
                        <Text style={[styles.preview, !darkMode && styles.textDarkDim]} numberOfLines={2}>
                            {preview}
                        </Text>

                        {!isLocked && (
                            <View style={styles.cardFooter}>
                                <ChevronRight size={16} color={darkMode ? "rgba(255,255,255,0.2)" : "#ccc"} />
                            </View>
                        )}
                    </TouchableOpacity>
                </Swipeable>
            </FloatingCard>
        );
    };

    return (
        <View style={styles.container}>
            {/* Hero Header */}
            <View style={styles.hero}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={[styles.heroTitle, !darkMode && styles.textDark]}>Mindspace</Text>
                        <Text style={[styles.heroSubtitle, !darkMode && styles.textDarkDim]}>
                            {notes.length} thoughts captured
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onOpenSettings} activeOpacity={0.8} style={styles.avatarBtn}>
                        <Image
                            source={{ uri: `https://ui-avatars.com/api/?name=User&background=6366F1&color=fff&size=128` }}
                            style={[styles.profileAvatar, !darkMode && styles.avatarLight]}
                        />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, !darkMode && styles.searchLight]}>
                    <Search size={18} color={darkMode ? "rgba(255,255,255,0.4)" : "#888"} />
                    <TextInput
                        style={[styles.searchInput, !darkMode && styles.textDark]}
                        placeholder="Search your mind..."
                        placeholderTextColor={darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)"}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Notes List or Empty State */}
            {notes.length === 0 ? (
                <Animated.View entering={FadeIn.delay(300)} style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <LayoutGrid size={64} color="rgba(99, 102, 241, 0.2)" />
                    </View>
                    <Text style={[styles.emptyTitle, !darkMode && styles.textDark]}>Begin your journey</Text>
                    <Text style={[styles.emptySubtitle, !darkMode && styles.textDarkDim]}>
                        Tap the plus to record a meeting or{'\n'}write down a quick insight.
                    </Text>
                </Animated.View>
            ) : (
                <FlatList
                    data={filteredNotes}
                    renderItem={renderNoteCard}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={onCreateNote}
                activeOpacity={0.9}
            >
                <View style={styles.fabInner}>
                    <Plus size={32} color="#fff" strokeWidth={2.5} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    hero: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '500',
    },
    avatarBtn: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    profileAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarLight: {
        borderColor: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        gap: 12,
    },
    searchLight: {
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
        padding: 0,
    },
    listContent: {
        paddingBottom: 140,
    },
    noteCard: {
        marginHorizontal: 20,
        marginVertical: 8,
    },
    cardContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        padding: 20,
        overflow: 'hidden',
    },
    cardLight: {
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    titleWithIcon: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    noteTitle: {
        flex: 1,
        fontSize: 19,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -0.3,
    },
    badges: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        width: 20,
        height: 20,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    voiceBadge: {
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
    },
    insightsBadge: {
        backgroundColor: '#10B981',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timestamp: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '600',
    },
    preview: {
        fontSize: 15,
        lineHeight: 22,
        color: 'rgba(255,255,255,0.5)',
    },
    cardFooter: {
        alignItems: 'flex-end',
        marginTop: 4,
    },
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: '100%',
        borderRadius: 24,
        gap: 4,
    },
    deleteText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 100,
    },
    emptyIcon: {
        marginBottom: 24,
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 24,
    },
    fab: {
        position: 'absolute',
        bottom: 34,
        right: 24,
        width: 68,
        height: 68,
        borderRadius: 34,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    fabInner: {
        flex: 1,
        backgroundColor: '#6366F1',
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    textDark: {
        color: '#111827',
    },
    textDarkDim: {
        color: '#6B7280',
    }
});
