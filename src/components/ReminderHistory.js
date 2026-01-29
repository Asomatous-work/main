
import { Bell, Calendar, CheckCircle, ChevronLeft, Clock, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import { deleteReminder, getReminders, updateReminderStatus } from '../services/ReminderService';

const { width, height } = Dimensions.get('window');

// Stability Lock
const _REMINDER_STABILITY = React.version;

export const ReminderHistory = ({ onBack, darkMode = true }) => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await getReminders();
        setReminders(data);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        const updated = await deleteReminder(id);
        if (updated) setReminders(updated);
    };

    const handleToggleComplete = async (id, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        const updated = await updateReminderStatus(id, newStatus);
        if (updated) setReminders(updated);
    };

    const renderItem = ({ item, index }) => (
        <Animated.View
            entering={FadeInRight.delay(index * 50)}
            layout={Layout}
            style={[styles.card, !darkMode && styles.cardLight]}
        >
            <TouchableOpacity
                style={styles.checkArea}
                onPress={() => handleToggleComplete(item.id, item.status)}
            >
                <View style={[
                    styles.checkbox,
                    item.status === 'completed' && styles.checkboxActive
                ]}>
                    {item.status === 'completed' && <CheckCircle size={18} color="#fff" />}
                </View>
            </TouchableOpacity>

            <View style={styles.infoArea}>
                <Text style={[
                    styles.reminderText,
                    !darkMode && styles.textDark,
                    item.status === 'completed' && styles.textCompleted
                ]}>
                    {item.text}
                </Text>
                <View style={styles.metaRow}>
                    <View style={styles.meta}>
                        <Calendar size={12} color="#6366F1" />
                        <Text style={styles.metaText}>{item.day}</Text>
                    </View>
                    <View style={styles.meta}>
                        <Clock size={12} color="#00F2FE" />
                        <Text style={styles.metaText}>{item.time}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Trash2 size={18} color="#FF6B6B" />
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, !darkMode && styles.lightBg]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <ChevronLeft size={28} color={darkMode ? "#fff" : "#000"} />
                </TouchableOpacity>
                <Text style={[styles.title, !darkMode && styles.textDark]}>Reminder Hub</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={reminders}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <View style={styles.empty}>
                        <Bell size={48} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.emptyText}>No reminders caught yet.</Text>
                        <Text style={styles.emptySubtext}>Your AI assistant will suggest reminders during your chats.</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    lightBg: {
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    list: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardLight: {
        backgroundColor: '#fff',
        borderColor: '#E9ECEF',
    },
    checkArea: {
        paddingRight: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#6366F1',
        borderWidth: 0,
    },
    infoArea: {
        flex: 1,
    },
    reminderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    textCompleted: {
        textDecorationLine: 'line-through',
        opacity: 0.5,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    metaText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    deleteBtn: {
        padding: 8,
    },
    textDark: {
        color: '#1A1D23',
    },
    empty: {
        flex: 1,
        height: height * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    }
});
