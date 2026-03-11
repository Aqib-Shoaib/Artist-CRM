import { THEME_COLORS } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, Path, Svg } from 'react-native-svg';

import Input from '../../common/Inputs/Input';

const { width } = Dimensions.get('window');

interface LoginProps {
  onBack: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToMainHome?: () => void;
  onNavigateToDashboard?: () => void;
}

const Login = ({ onBack, onNavigateToDashboard, onNavigateToSignup }: LoginProps) => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const { colors, isDark } = useTheme();

  const loginMutation = useMutation({
    mutationFn: (data: any) => authService.login(data),
    onSuccess: async (data: any) => {
      // Handle successful login (e.g., save token)
      console.log('Login successful:', data);
      
      if (data?.data?.token) {
        await authService.saveToken(data.data.token);
        queryClient.setQueryData(['user'], data.data.user);
      }
      
      onNavigateToDashboard?.();
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      const backendErrors = error.response?.data?.errors;
      let errorMessage = error.response?.data?.message || 'An error occurred during login';

      if (backendErrors) {
        const errorDetails = Object.values(backendErrors)
          .flat()
          .join('\n');
        if (errorDetails) {
          errorMessage = errorDetails;
        }
      }

      Alert.alert('Login Failed', errorMessage);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <LinearGradient
      colors={colors.bgGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

              <Text style={[styles.title, { color: colors.text }]}>Login</Text>

              <View style={styles.formContainer}>
                <Input
                  value={email}
                  onChangeText={(text: string) => setEmail(text)}
                  placeholder="Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="email"
                 containerStyle={styles.fullWidthInput}
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
                  placeholder="Passwords..."
                  secureTextEntry={!showPassword}
                  leftIcon="lock"
                  rightIcon={showPassword ? "eye" : "eye-off"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  containerStyle={styles.fullWidthInput}
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
                    style={styles.rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <MaterialCommunityIcons
                      name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"}
                      size={22}
                      color="#5152B3"
                    />
                    <Text style={[styles.optionText, { color: colors.textSecondary }]}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  style={styles.buttonWrapper}
                  disabled={loginMutation.isPending}
                >
                  <LinearGradient
                    colors={THEME_COLORS.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    {loginMutation.isPending ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Login</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={[styles.socialText, { color: colors.textSecondary }]}>Login using</Text>

                <View style={styles.socialContainer}>
                  {/* Facebook Icon - Background set to white by using socialIconCircle style */}
                  <TouchableOpacity style={[styles.socialIconCircle, { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderColor: colors.border }]}>
                    <Svg width={24} height={24} viewBox="126.445 2.281 589 589">
                      <Circle cx="420.945" cy="296.781" r="294.5" fill="#3c5a9a" />
                      <Path d="M516.704 92.677h-65.239c-38.715 0-81.777 16.283-81.777 72.402.189 19.554 0 38.281 0 59.357H324.9v71.271h46.174v205.177h84.847V294.353h56.002l5.067-70.117h-62.531s.14-31.191 0-40.249c0-22.177 23.076-20.907 24.464-20.907 10.981 0 32.332.032 37.813 0V92.677h-.032z" fill="#ffffff" />
                    </Svg>
                  </TouchableOpacity>

                  <View style={styles.socialGap} />

                  {/* Google Icon */}
                  <TouchableOpacity style={[styles.socialIconCircle, { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderColor: colors.border }]}>
                    <Svg width={24} height={24} viewBox="-3 0 262 262">
                      <Path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
                      <Path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" />
                      <Path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" />
                      <Path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
                    </Svg>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.signupContainer}
                  onPress={() => onNavigateToSignup?.()}
                >
                  <Text style={[styles.optionText, { color: colors.textSecondary }]}>{"Don't have an account? "}</Text>
                  <Text style={styles.forgotText}>Sign Up</Text>
                </TouchableOpacity>

              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1
  },
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  innerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  topImage: {
    width: width * 0.85,
    height: 180,
    marginBottom: 5
  },
  formContainer: {
    width: '100%',
    alignItems: 'center'
  },
  inputContainer: {
    width: '100%'
  },
  fullWidthInput: {
    width: '100%'
  },
  roundedInput: {
    borderRadius: 25,
    backgroundColor: '#FFFFFF'
  },
  inputGap: { height: 10 },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '98%',
    marginBottom: 15,
    marginTop: 25,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6
  },
  forgotText: {
    fontSize: 14,
    color: '#5152B3',
    fontWeight: 'bold'
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  socialText: {
    marginVertical: 10,
    color: '#888',
    fontSize: 15
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
    marginTop: 10,
  },
  socialIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  socialIcon: {
    width: 24,
    height: 24,
  },
  socialGap: {
    width: 10
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center'
  },
});

export default Login;