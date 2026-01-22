
/**
 * Mock Transcription Service
 * In a real app, this would use Google Cloud Speech-to-Text, Whisper API, or Expo Audio-to-Text.
 */
export const transcribeAudio = async (audioUri) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock responses based on random keywords
    const mocks = [
        "Remember to pick up the groceries and check if the milk is expired.",
        "Meeting with the design team tomorrow at 10 AM to discuss the new branding guidelines.",
        "Need to call Sarah about the weekend trip and confirm the hotel booking.",
        "The project deadline is approaching fast, make sure to finalize the documentation.",
        "Just a quick thought about the app architecture: we should use a more modular approach for the services."
    ];

    return mocks[Math.floor(Math.random() * mocks.length)];
};
