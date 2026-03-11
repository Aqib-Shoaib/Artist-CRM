import { THEME_COLORS } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, Path, Svg } from 'react-native-svg';

import Input from '../../common/Inputs/Input';

const { width } = Dimensions.get('window');

type IconNames = keyof typeof MaterialCommunityIcons.glyphMap;

type SignupProps = {
  onBack: () => void;
  onNavigateToCompanyName?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToDashboard?: () => void;
};

const Signup = ({ onBack, onNavigateToCompanyName, onNavigateToLogin, onNavigateToDashboard }: SignupProps) => {
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  // Reset scroll karne ke liye ref use kiya hai
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Keyboard Hide Listener: Jab typing band hogi, view wapas reset hoga
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const signupMutation = useMutation({
    mutationFn: (data: any) => authService.register(data),
    onSuccess: async (data: any) => {
      console.log('Signup successful:', data);
      
      // Save token and user data
      if (data?.data?.token) {
        await authService.saveToken(data.data.token);
        queryClient.setQueryData(['user'], data.data.user);
      }
      
      // Redirect to Company Name screen so user can finish setup
      onNavigateToCompanyName?.();
    },
    onError: (error: any) => {
      console.error('Signup error:', error);
      const backendErrors = error.response?.data?.errors;
      let errorMessage = error.response?.data?.message || 'An error occurred during signup';
      
      if (backendErrors) {
        // Concatenate all error messages into a single string
        const errorDetails = Object.values(backendErrors)
          .flat()
          .join('\n');
        if (errorDetails) {
          errorMessage = errorDetails;
        }
      }
      
      Alert.alert('Signup Failed', errorMessage);
    },
  });

  const handleSignup = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the terms and services');
      return;
    }
    signupMutation.mutate({
      name,
      email,
      password,
      password_confirmation: confirmPassword
    });
  };

  const validatePassword = (pass: string) => {
    // Basic password validation: min 8 chars
    return pass.length >= 8;
  };

  return (
    <LinearGradient
      colors={colors.bgGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="rgba(0,0,0,0)" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.mainContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
          >
            {/* Background click par keyboard band karne ke liye TouchableOpacity */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={Keyboard.dismiss}
              style={styles.innerContainer}
            >
              <Image
                source={require('../../../assets/homeimages/logo.png')}
                style={styles.middleImage}
                resizeMode="contain"
              />

              <Text style={[styles.title, { color: colors.text }]}>Signup</Text>

              <View style={styles.formContainer}>
                <Input
                  value={name}
                  onChangeText={(text: string) => setName(text)}
                  placeholder="Full Name"
                  leftIcon={"account" as IconNames}
                  containerStyle={styles.inputContainer}
                  backgroundColor={isDark ? '#1e293b' : '#FFFFFF'}
                  focusBorderColor={isDark ? '#FFFFFF' : '#5152B3'}
                  borderColor={colors.border}
                  inputStyle={{ color: colors.text }}
                  placeholderTextColor={isDark ? '#94a3b8' : '#888'}
                  iconColor={isDark ? '#cbd5e1' : '#666'}
                  size="large"
                  variant="outlined"
                />

                <View style={styles.inputGap} />

                <Input
                  value={email}
                  onChangeText={(text: string) => setEmail(text)}
                  placeholder="Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={"email" as IconNames}
                  containerStyle={styles.inputContainer}
                  backgroundColor={isDark ? '#1e293b' : '#FFFFFF'}
                  focusBorderColor={isDark ? '#FFFFFF' : '#5152B3'}
                  borderColor={colors.border}
                  inputStyle={{ color: colors.text }}
                  placeholderTextColor={isDark ? '#94a3b8' : '#888'}
                  iconColor={isDark ? '#cbd5e1' : '#666'}
                  size="large"
                  variant="outlined"
                />

                <View style={styles.inputGap} />

                <Input
                  value={password}
                  onChangeText={(text: string) => setPassword(text)}
                  placeholder="Enter Password"
                  secureTextEntry={true}
                  leftIcon={"lock" as IconNames}
                  containerStyle={styles.inputContainer}
                  backgroundColor={isDark ? '#1e293b' : '#FFFFFF'}
                  focusBorderColor={isDark ? '#FFFFFF' : '#5152B3'}
                  borderColor={colors.border}
                  inputStyle={{ color: colors.text }}
                  placeholderTextColor={isDark ? '#94a3b8' : '#888'}
                  iconColor={isDark ? '#cbd5e1' : '#666'}
                  size="large"
                  variant="outlined"

                />

                <View style={styles.inputGap} />

                <Input
                  value={confirmPassword}
                  onChangeText={(text: string) => setConfirmPassword(text)}
                  placeholder="Confirm Password"
                  secureTextEntry={true}
                  leftIcon={"lock" as IconNames}
                  containerStyle={styles.inputContainer}
                  backgroundColor={isDark ? '#1e293b' : '#FFFFFF'}
                  focusBorderColor={isDark ? '#FFFFFF' : '#5152B3'}
                  borderColor={colors.border}
                  inputStyle={{ color: colors.text }}
                  placeholderTextColor={isDark ? '#94a3b8' : '#888'}
                  iconColor={isDark ? '#cbd5e1' : '#666'}
                  size="large"
                  variant="outlined"

                />

                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={styles.termsContainer}
                    onPress={() => setAgreeTerms(!agreeTerms)}
                  >
                    <MaterialCommunityIcons
                      name={agreeTerms ? "checkbox-marked" : "checkbox-blank-outline"}
                      size={22}
                      color="#5152B3"
                    />
                    <Text style={[styles.optionText, { color: colors.textSecondary }]}>I agree to Term & Services</Text>
                  </TouchableOpacity>
                </View>

                {/* Signup Button */}
                <TouchableOpacity
                  onPress={handleSignup}
                  style={styles.buttonWrapper}
                  disabled={signupMutation.isPending}
                >
                  <LinearGradient
                    colors={THEME_COLORS.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    {signupMutation.isPending ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Signup</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={[styles.socialText, { color: colors.textSecondary }]}>Signup using</Text>

                <View style={styles.socialContainer}>
                  <TouchableOpacity style={[styles.socialIconCircle, { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderColor: colors.border }]}>
                    <Svg width={24} height={24} viewBox="126.445 2.281 589 589">
                      <Circle cx="420.945" cy="296.781" r="294.5" fill="#3c5a9a" />
                      <Path d="M516.704 92.677h-65.239c-38.715 0-81.777 16.283-81.777 72.402.189 19.554 0 38.281 0 59.357H324.9v71.271h46.174v205.177h84.847V294.353h56.002l5.067-70.117h-62.531s.14-31.191 0-40.249c0-22.177 23.076-20.907 24.464-20.907 10.981 0 32.332.032 37.813 0V92.677h-.032z" fill="#ffffff" />
                    </Svg>
                  </TouchableOpacity>

                  <View style={styles.socialGap} />

                  <TouchableOpacity style={[styles.socialIconCircle, { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderColor: colors.border }]}>
                    <Svg width={24} height={24} viewBox="-3 0 262 262">
                      <Path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
                      <Path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" />
                      <Path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" />
                      <Path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
                    </Svg>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={onNavigateToLogin} style={styles.loginLinkContainer}>
                  <Text style={[styles.optionText, { color: colors.textSecondary }]}>Already have an Account?</Text>
                  <Text style={styles.forgotText}> Login</Text>
                </TouchableOpacity>

              </View>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  safeArea: { flex: 1 },
  mainContainer: { flex: 1 },
  scrollView: { flex: 1 },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center' // Elements center mein fix rakhta hai
  },
  innerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  middleImage: {
    width: width * 0.8,
    height: 160,
    marginBottom: 0,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  inputContainer: {
    width: '100%',
  },
  roundedInput: {
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
  },
  inputGap: {
    height: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '98%',
    marginBottom: 10,
    marginTop: 10,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  forgotText: {
    fontSize: 14,
    color: '#5152B3',
    fontWeight: 'bold',
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialText: {
    marginVertical: 8,
    color: '#888',
    fontSize: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
    marginTop: 2,
  },
  socialIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8FF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  socialGap: {
    width: 20,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
  },
});

export default Signup;