
import { BlurView } from 'expo-blur';
import { ArrowRight, CheckCircle2, Smartphone } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
    Alert,
    Animated,
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
 * Gotcha Login Screen - Optimized for India (+91)
 * Features a high-fidelity OTP verification experience.
 */
export const LoginScreen = ({ onLogin }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const otpRefs = useRef([]);

    const handleSendCode = () => {
        if (phoneNumber.length !== 10) {
            Alert.alert("Invalid Number", "Please enter a 10-digit mobile number.");
            return;
        }

        setLoading(true);

        // Generate a random 6-digit OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);

        // Log to terminal as requested
        console.log("-----------------------------------------");
        console.log(`📲 GOTCHA LOGIN OTP FOR +91 ${phoneNumber}:`);
        console.log(`👉 CODE: ${newOtp}`);
        console.log("-----------------------------------------");

        // Simulate premium loading/network delay
        setTimeout(() => {
            setLoading(false);
            transitionStep('otp');
        }, 1500);
    };

    const transitionStep = (newStep) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            setStep(newStep);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();
        });
    };

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }

        // Check if complete
        if (newOtp.join('').length === 6) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleVerify = (finalOtp) => {
        const fullOtp = finalOtp || otp.join('');
        if (fullOtp.length !== 6) return;

        setLoading(true);
        console.log(`[DEBUG] Verifying OTP: ${fullOtp} against ${generatedOtp}`);

        setTimeout(() => {
            setLoading(false);
            if (fullOtp === generatedOtp || fullOtp === '000000') { // Added 000000 bypass for testing
                console.log("[DEBUG] OTP Correct. Calling onLogin...");
                onLogin(`+91${phoneNumber}`);
            } else {
                console.log("[DEBUG] OTP Incorrect.");
                Alert.alert("Verification Failed", "The code you entered is incorrect. Please try again.");
                setOtp(['', '', '', '', '', '']);
                otpRefs.current[0].focus();
            }
        }, 800);
    };

    return (
        <View style={styles.container}>
            <MeshGradientBackground />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />

                    <View style={styles.content}>
                        <View style={styles.iconCircle}>
                            <Smartphone size={32} color="#fff" />
                        </View>

                        <Text style={styles.title}>
                            {step === 'phone' ? 'Gotcha Messenger' : 'Verification'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {step === 'phone'
                                ? 'Bharat\'s most secure messaging app. Enter your number to join.'
                                : `Verification code sent to +91 ${phoneNumber}`}
                        </Text>

                        {step === 'phone' ? (
                            <View style={styles.inputWrapper}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.prefix}>🇮🇳 +91</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Mobile Number"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        keyboardType="phone-pad"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        maxLength={10}
                                        autoFocus
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.btn, loading && styles.btnDisabled]}
                                    onPress={handleSendCode}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Text style={styles.btnText}>Requesting OTP...</Text>
                                    ) : (
                                        <>
                                            <Text style={styles.btnText}>Get OTP Code</Text>
                                            <ArrowRight size={20} color="#000" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.otpWrapper}>
                                <View style={styles.otpGrid}>
                                    {otp.map((digit, i) => (
                                        <TextInput
                                            key={i}
                                            ref={el => otpRefs.current[i] = el}
                                            style={styles.otpInput}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={(v) => handleOtpChange(v, i)}
                                            onKeyPress={({ nativeEvent }) => {
                                                if (nativeEvent.key === 'Backspace' && !digit && i > 0) {
                                                    otpRefs.current[i - 1].focus();
                                                }
                                            }}
                                            placeholder="-"
                                            placeholderTextColor="rgba(255,255,255,0.2)"
                                        />
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={[styles.btn, loading && styles.btnDisabled]}
                                    onPress={() => handleVerify()}
                                    disabled={loading}
                                >
                                    <Text style={styles.btnText}>
                                        {loading ? 'Verifying...' : 'Finish Setup'}
                                    </Text>
                                    {!loading && <CheckCircle2 size={20} color="#000" />}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => transitionStep('phone')} style={styles.backBtn}>
                                    <Text style={styles.backText}>Edit Number</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Secure End-to-End Encryption 🔒</Text>
                        </View>
                    </View>
                </Animated.View>
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
        padding: 20,
    },
    card: {
        borderRadius: 36,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    content: {
        padding: 32,
        alignItems: 'center',
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginBottom: 36,
        lineHeight: 24,
    },
    inputWrapper: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 64,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },
    prefix: {
        fontSize: 18,
        color: '#fff',
        marginRight: 12,
        fontWeight: '700',
    },
    input: {
        flex: 1,
        fontSize: 20,
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 1,
    },
    otpWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    otpGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 32,
    },
    otpInput: {
        width: width / 9.5,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        height: 64,
        width: '100%',
        gap: 12,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    btnDisabled: {
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    btnText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#000',
    },
    backBtn: {
        marginTop: 24,
        padding: 10,
    },
    backText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    footer: {
        marginTop: 32,
    },
    footerText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontWeight: '500',
    }
});
