import * as Calendar from 'expo-calendar';

export const requestCalendarPermissions = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
        await Calendar.requestRemindersPermissionsAsync(); // For iOS Reminders
    }
    return status === 'granted';
};

/**
 * Gets the default calendar ID (Mindspace specific if possible)
 */
const getDefaultCalendarId = async () => {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
    return defaultCalendar ? defaultCalendar.id : null;
};

/**
 * Schedules an event in the system calendar
 */
export const scheduleCalendarEvent = async (title, body, date) => {
    try {
        const hasPermission = await requestCalendarPermissions();
        if (!hasPermission) return null;

        const calendarId = await getDefaultCalendarId();
        if (!calendarId) return null;

        const startDate = new Date(date);
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 min duration

        const eventId = await Calendar.createEventAsync(calendarId, {
            title: `🧠 Mindspace: ${title}`,
            notes: body,
            startDate,
            endDate,
            timeZone: 'GMT', // Adjust if needed
            alarms: [{ relativeOffset: -10 }], // 10 mins before
        });

        return eventId;
    } catch (err) {
        console.error('Failed to schedule calendar event:', err);
        return null;
    }
};
