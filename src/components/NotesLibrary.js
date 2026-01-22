import { Clock, FileText, Plus, Zap } from 'lucide-react-native';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlassCard } from './ModernUI';

const { width } = Dimensions.get('window');

export const NotesLibrary = ({ notes, onCreateNote, onSelectNote }) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const renderNoteCard = ({ item }) => {
        const preview = item.content.slice(0, 120) || 'Empty note...';
        const actionCount = item.detectedActions?.length || 0;

        return (
            <TouchableOpacity
                style={styles.noteCardWrapper}
                onPress={() => onSelectNote(item)}
                activeOpacity={0.8}
            >
                <GlassCard style={styles.noteCard} intensity={70}>
                    <View style={styles.noteHeader}>
                        <View style={styles.iconCircle}>
                            <FileText color="#d8b4fe" size={18} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.noteTitle} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <View style={styles.metaRow}>
                                <Clock color="rgba(255,255,255,0.4)" size={12} />
                                <Text style={styles.noteTime}>{formatDate(item.updatedAt)}</Text>
                            </View>
                        </View>
                        {actionCount > 0 && (
                            <View style={styles.badge}>
                                <Zap color="#000" size={12} />
                                <Text style={styles.badgeText}>{actionCount}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.notePreview} numberOfLines={3}>
                        {preview}
                    </Text>
                </GlassCard>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Your Notes</Text>
                    <Text style={styles.headerSubtitle}>
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                    </Text>
                </View>

                <TouchableOpacity style={styles.createBtn} onPress={onCreateNote}>
                    <Plus color="#000" size={24} strokeWidth={3} />
                </TouchableOpacity>
            </View>

            {notes.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <FileText color="rgba(255,255,255,0.3)" size={48} />
                    </View>
                    <Text style={styles.emptyTitle}>No notes yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Tap + to start writing{'\n'}AI will detect actions automatically
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notes}
                    renderItem={renderNoteCard}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
    },
    createBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#d8b4fe',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#d8b4fe',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    noteCardWrapper: {
        marginBottom: 16,
    },
    noteCard: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(216,180,254,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    noteTime: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#4ade80',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
    },
    notePreview: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 24,
    }
});
