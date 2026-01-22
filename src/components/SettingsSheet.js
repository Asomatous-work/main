import { ChevronRight, Moon, Palette, Shield, Zap } from 'lucide-react-native';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');

export const SettingsSheet = ({
    visible, onClose,
    useMesh, onToggleMesh,
    darkMode, onToggleDarkMode,
    isVaultUnlocked, onToggleVault
}) => {

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.sheet, !darkMode && styles.sheetLight]}>
                    {/* Draggable Handle */}
                    <View style={styles.handle} />

                    <View style={[styles.header, !darkMode && styles.headerLight]}>
                        <Text style={[styles.title, !darkMode && styles.textLight]}>Settings</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Profile Card */}
                        <View style={[styles.profileCard, !darkMode && styles.cardLight]}>
                            <Image
                                source={{ uri: 'https://ui-avatars.com/api/?name=User&background=6366F1&color=fff&size=128' }}
                                style={styles.avatar}
                            />
                            <View style={styles.profileInfo}>
                                <Text style={[styles.username, !darkMode && styles.textLight]}>Explorer</Text>
                                <Text style={styles.email}>pro@mindspace.app</Text>
                            </View>
                            <View style={styles.proBadge}>
                                <Text style={styles.proText}>PRO</Text>
                            </View>
                        </View>

                        {/* Section: Appearance */}
                        <Text style={styles.sectionHeader}>APPEARANCE</Text>
                        <View style={[styles.sectionContainer, !darkMode && styles.cardLight]}>

                            <View style={[styles.row, !darkMode && styles.rowLight]}>
                                <View style={styles.rowIconBg}>
                                    <Palette size={18} color="#fff" />
                                </View>
                                <Text style={[styles.rowLabel, !darkMode && styles.textLight]}>Liquid Wallpaper</Text>
                                <Switch
                                    value={useMesh}
                                    onValueChange={onToggleMesh}
                                    trackColor={{ false: '#333', true: '#6366F1' }}
                                    thumbColor="#fff"
                                />
                            </View>

                            <View style={[styles.row, styles.noBorder, !darkMode && styles.rowLight]}>
                                <View style={[styles.rowIconBg, { backgroundColor: '#4B5563' }]}>
                                    <Moon size={18} color="#fff" />
                                </View>
                                <Text style={[styles.rowLabel, !darkMode && styles.textLight]}>Dark Mode</Text>
                                <Switch
                                    value={darkMode}
                                    onValueChange={onToggleDarkMode}
                                    trackColor={{ false: '#333', true: '#6366F1' }}
                                    thumbColor="#fff"
                                />
                            </View>

                        </View>

                        {/* Section: Intelligence */}
                        <Text style={styles.sectionHeader}>INTELLIGENCE</Text>
                        <View style={[styles.sectionContainer, !darkMode && styles.cardLight]}>
                            <TouchableOpacity style={[styles.row, !darkMode && styles.rowLight]}>
                                <View style={[styles.rowIconBg, { backgroundColor: '#10B981' }]}>
                                    <Zap size={18} color="#fff" />
                                </View>
                                <Text style={[styles.rowLabel, !darkMode && styles.textLight]}>AI Model</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.valueText}>GPT-4o</Text>
                                    <ChevronRight size={16} color="rgba(150,150,150,0.5)" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.row, styles.noBorder, !darkMode && styles.rowLight]}
                                onPress={onToggleVault}
                            >
                                <View style={[styles.rowIconBg, { backgroundColor: isVaultUnlocked ? '#10B981' : '#F59E0B' }]}>
                                    <Shield size={18} color="#fff" />
                                </View>
                                <Text style={[styles.rowLabel, !darkMode && styles.textLight]}>
                                    {isVaultUnlocked ? 'Vault Unlocked' : 'Privacy Vault'}
                                </Text>
                                {!isVaultUnlocked && (
                                    <View style={styles.lockedBadge}>
                                        <Text style={styles.lockedText}>LOCKED</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Section: About */}
                        <Text style={styles.sectionHeader}>ABOUT</Text>
                        <View style={[styles.sectionContainer, !darkMode && styles.cardLight]}>
                            <View style={[styles.row, !darkMode && styles.rowLight]}>
                                <Text style={[styles.rowLabel, !darkMode && styles.textLight]}>Version</Text>
                                <Text style={styles.valueText}>2.3.0</Text>
                            </View>
                            <TouchableOpacity style={[styles.row, styles.noBorder, !darkMode && styles.rowLight]}>
                                <Text style={[styles.rowLabel, !darkMode && styles.textLight]}>Terms of Service</Text>
                                <ChevronRight size={16} color="rgba(150,150,150,0.5)" />
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        height: height * 0.92,
        backgroundColor: '#1C1C1E', // Apple System Gray 6 Dark
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 12,
        overflow: 'hidden',
    },
    sheetLight: {
        backgroundColor: '#F2F2F7', // Apple System Gray 6 Light
    },
    handle: {
        width: 36,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: 'rgba(150,150,150,0.3)',
        alignSelf: 'center',
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerLight: {
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
    textLight: {
        color: '#000',
    },
    doneText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#0A84FF', // iOS Blue
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
    },
    cardLight: {
        backgroundColor: '#fff',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    username: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 2,
    },
    email: {
        fontSize: 14,
        color: 'rgba(150,150,150,0.8)',
    },
    proBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    proText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#000',
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(150,150,150,0.6)',
        marginBottom: 8,
        marginLeft: 12,
        textTransform: 'uppercase',
    },
    sectionContainer: {
        backgroundColor: '#2C2C2E', // iOS Grouped Background
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'transparent',
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    rowLight: {
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    rowIconBg: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rowLabel: {
        flex: 1,
        fontSize: 17,
        color: '#fff',
    },
    valueText: {
        fontSize: 17,
        color: 'rgba(150,150,150,0.8)',
        marginRight: 6,
    },
    lockedBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    lockedText: {
        color: '#EF4444',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});
