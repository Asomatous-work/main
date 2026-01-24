
const MOCK_CHATS = [
    {
        id: '2',
        name: 'Design Team',
        lastMessage: 'The new mesh gradients look sick! 🔥',
        time: '10:23 AM',
        unread: 2,
        avatar: 'https://images.unsplash.com/photo-1522071823991-b59fea12f4ef?w=100&h=100&fit=crop',
        messages: [
            { id: 'm1', text: 'Did you see the new UI?', sender: 'other', time: '10:20 AM' },
            { id: 'm2', text: 'The new mesh gradients look sick! 🔥', sender: 'other', time: '10:23 AM' }
        ]
    },
    {
        id: '3',
        name: 'Sarah Jordan',
        lastMessage: 'Voice note sent (0:12)',
        time: 'Yesterday',
        unread: 0,
        isPrivate: true,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        messages: [
            { id: 'm1', text: 'Hey, checking in on the project.', sender: 'other', time: 'Yesterday' }
        ]
    },
    {
        id: '4',
        name: 'Alex Chen',
        lastMessage: 'Sure, I can meet at 5.',
        time: 'Monday',
        unread: 0,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        messages: [
            { id: 'm1', text: 'Are we still on for today?', sender: 'me', time: 'Monday' },
            { id: 'm2', text: 'Sure, I can meet at 5.', sender: 'other', time: 'Monday' }
        ]
    }
];

export const getChats = async () => {
    // Simulate API delay
    return new Promise(resolve => setTimeout(() => resolve(MOCK_CHATS), 500));
};

export const sendMessage = (chatId, text, type = 'text') => {
    console.log(`Sending to ${chatId}: ${text} (${type})`);
    return {
        id: Math.random().toString(36).substr(2, 9),
        text,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        type
    };
};
