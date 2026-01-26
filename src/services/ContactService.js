import * as Contacts from 'expo-contacts';

/**
 * Contact Service for Gotcha
 * Handles fetching, searching, and formatting real phone contacts.
 */

export const getPhoneContacts = async () => {
    try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
                fields: [
                    Contacts.Fields.Name,
                    Contacts.Fields.PhoneNumbers,
                    Contacts.Fields.Emails,
                    Contacts.Fields.Image
                ],
            });

            if (data.length > 0) {
                // Filter contacts with phone numbers and format them
                return data
                    .filter(c => c.phoneNumbers && c.phoneNumbers.length > 0)
                    .map(contact => ({
                        id: contact.id,
                        name: contact.name,
                        phoneNumber: contact.phoneNumbers[0].number.replace(/\s/g, ''),
                        avatar: contact.imageAvailable ? contact.image.uri : null,
                        initials: contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
            }
        }
        return [];
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];
    }
};

export const searchContacts = (contacts, query) => {
    if (!query) return contacts;
    const lowerQuery = query.toLowerCase();
    return contacts.filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phoneNumber.includes(lowerQuery)
    );
};
