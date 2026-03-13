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
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Input from '../../common/Inputs/Input';

const { width } = Dimensions.get('window');

type IconNames = keyof typeof MaterialCommunityIcons.glyphMap;

interface CompanyNameProps {
  onBack?: () => void;
  onNavigateToProfile?: () => void;
}

const CompanyName: React.FC<CompanyNameProps> = ({
  onNavigateToProfile,
  onBack
}) => {
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [companyName, setCompanyName] = useState<string>('');
  const [website, setWebsite] = useState<string>('');

  const updateProfileMutation = useMutation({
    mutationFn: (data: { company_name: string }) => authService.updateProfile(data),
    onSuccess: (data: any) => {
      // Update cached user data with new company info
      queryClient.invalidateQueries({ queryKey: ['user'] });
      onNavigateToProfile?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to save company details. Please try again.';
      Alert.alert('Error', message);
    },
  });

  const handleSubmit = () => {
    if (!companyName.trim()) {
      Alert.alert('Error', 'Please enter your company name.');
      return;
    }
    updateProfileMutation.mutate({ company_name: companyName.trim() });
  };

  return (
    <LinearGradient
      colors={colors.bgGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        <KeyboardAvoidingView
          // Typing ke waqt halka sa scroll up karne ke liye offset add kiya hai
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
          style={styles.container}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          // scrollEnabled ko true rakha hai taake keyboard ane par view move ho sake
          >
            <View style={styles.innerContainer}>

              <Image
                source={require('../../../assets/homeimages/logo.png')}
                style={styles.topImage}
                resizeMode="contain"
              />

              <Text style={[styles.title, { color: colors.text }]}>Company Details</Text>

              <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
                Please provide your company information to{"\n"}continue
              </Text>

              <View style={styles.formContainer}>
                <Input
                  value={companyName}
                  onChangeText={(text: string) => setCompanyName(text)}
                  placeholder="Company Name"
                  leftIcon={"domain" as IconNames}
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
                  value={website}
                  onChangeText={(text: string) => setWebsite(text)}
                  placeholder="Website URL"
                  keyboardType="url"
                  autoCapitalize="none"
                  leftIcon={"web" as IconNames}
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

                <View style={styles.buttonGap} />

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.buttonWrapper}
                  disabled={updateProfileMutation.isPending}
                >
                  <LinearGradient
                    colors={THEME_COLORS.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    {updateProfileMutation.isPending ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Save</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient >
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
  topImage: {
    width: width * 0.85,
    height: 180,
    marginBottom: 5
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center'
  },
  inputContainer: {
    width: '100%'
  },
  roundedInput: {
    borderRadius: 25,
    backgroundColor: '#FFFFFF'
  },
  inputGap: {
    height: 15
  },
  buttonGap: {
    height: 30,
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
});

export default CompanyName;