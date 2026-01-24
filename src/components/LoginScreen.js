
import { BlurView } from 'expo-blur';
import { ArrowRight, Smartphone } from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { MeshGradientBackground } from './PremiumUI';

const { width } = Dimensions.get('window');

/**
 * Login Screen for Mobile Number Auth
 * Simulates the flow of a modern authenticatior.
 */
export const LoginScreen = ({ onLogin }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [otp, setOtp] = useState('');

    const handleSendCode = () => {
        if (phoneNumber.length < 10) {
            Alert.alert("Invalid Number", "Please enter a valid mobile number.");
            return;
        }
        setStep('otp');
    };

    const handleVerify = () => {
        if (otp.length !== 6) {
            Alert.alert("Invalid Code", "Please enter the 6-digit code.");
            return;
        }
        onLogin(phoneNumber);
    };

    return (
        <View style={styles.container}>
            <MeshGradientBackground />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.card}>
                    <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

                    <View style={styles.content}>
                        <View style={styles.iconCircle}>
                            <Smartphone size={32} color="#fff" />
                        </View>

                        <Text style={styles.title}>
                            {step === 'phone' ? 'Welcome to Gotcha' : 'Verify Identity'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {step === 'phone'
                                ? 'Enter your mobile number to get started with secure messaging.'
                                : `Enter the code sent to ${phoneNumber}`}
                        </Text>

                        {step === 'phone' ? (
                            <View style={styles.inputContainer}>
                                <Text style={styles.prefix}>+1</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mobile Number"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    maxLength={12}
                                />
                            </View>
                        ) : (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
                                    placeholder="000 000"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    keyboardType="number-pad"
                                    value={otp}
                                    onChangeText={setOtp}
                                    maxLength={6}
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.btn}
                            onPress={step === 'phone' ? handleSendCode : handleVerify}
                        >
                            <Text style={styles.btnText}>
                                {step === 'phone' ? 'Get Verification Code' : 'Verify & Login'}
                            </Text>
                            <ArrowRight size={20} color="#000" />
                        </TouchableOpacity>

                        {step === 'otp' && (
                            <TouchableOpacity onPress={() => setStep('phone')} style={styles.backBtn}>
                                <Text style={styles.backText}>Change Number</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    content: {
        padding: 32,
        alignItems: 'center',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 24,
    },
    prefix: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.5)',
        marginRight: 12,
        fontWeight: '600',
    },
    input: {
        flex: 1,
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        height: 56,
        width: '100%',
        gap: 8,
    },
    btnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    backBtn: {
        marginTop: 20,
    },
    backText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    }
});
