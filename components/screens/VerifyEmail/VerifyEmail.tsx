import { THEME_COLORS } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;

interface VerifyEmailProps {
  email: string;
  onVerified: () => void;
  onBack?: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ email, onVerified, onBack }) => {
  const { colors, isDark } = useTheme();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (text: string, index: number) => {
    const sanitized = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = sanitized;
    setOtp(newOtp);

    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH).split('');
    const newOtp = Array(OTP_LENGTH).fill('');
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    const lastFilled = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      Alert.alert('Error', 'Please enter the complete 6-digit code.');
      return;
    }
    setIsVerifying(true);
    try {
      await authService.verifyEmail({ token: code, email });
      onVerified();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid or expired code. Please try again.';
      Alert.alert('Verification Failed', message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      await authService.resendEmailVerification();
      setResendCooldown(60);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      Alert.alert('Sent!', 'A new verification code has been sent to your email.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend code. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <LinearGradient
      colors={colors.bgGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Back Button */}
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
          style={styles.container}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.innerContainer}>

              <Image
                source={require('../../../assets/homeimages/logo.png')}
                style={styles.topImage}
                resizeMode="contain"
              />

              {/* Icon */}
              <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#1e293b' : '#EEF2FF' }]}>
                <MaterialCommunityIcons name="email-check-outline" size={44} color="#5152B3" />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>Verify Your Email</Text>

              <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
                {"We've sent a 6-digit verification code to\n"}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>

              {/* OTP Inputs */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      {
                        backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                        borderColor: digit
                          ? '#5152B3'
                          : isDark ? '#334155' : '#E2E8F0',
                        color: colors.text,
                      },
                    ]}
                    value={digit}
                    onChangeText={(text) => {
                      if (text.length > 1) {
                        handlePaste(text);
                      } else {
                        handleOtpChange(text, index);
                      }
                    }}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={OTP_LENGTH}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={handleVerify}
                style={[styles.buttonWrapper, !isOtpComplete && styles.buttonDisabled]}
                disabled={isVerifying || !isOtpComplete}
              >
                <LinearGradient
                  colors={THEME_COLORS.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {isVerifying ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Verify Email</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend */}
              <View style={styles.resendContainer}>
                <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                  {"Didn't receive the code? "}
                </Text>
                {isResending ? (
                  <ActivityIndicator size="small" color="#5152B3" />
                ) : resendCooldown > 0 ? (
                  <Text style={[styles.resendLink, styles.resendDisabled]}>
                    Resend in {resendCooldown}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollViewContent: { flexGrow: 1, justifyContent: 'center' },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
    padding: 6,
  },
  innerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 24,
    width: '100%',
  },
  topImage: {
    width: width * 0.55,
    height: 100,
    marginBottom: 16,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 15,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: '700',
    color: '#5152B3',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '700',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    color: '#5152B3',
    fontWeight: '700',
  },
  resendDisabled: {
    color: '#94a3b8',
    fontWeight: '400',
  },
});

export default VerifyEmail;
