import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  PanResponder,
  Animated,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { THEME_COLORS } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import NavHeader from '../../common/Buttons/NavHeader';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QueryTicket {
  id: string;
  type: 'Visit Issue' | 'App Feedback';
  subject: string;
  status: 'In Progress' | 'Resolved' | 'Pending';
  date: string;
  description: string;
}

const Help: React.FC = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // --- States ---
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // --- Animation States ---
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(-150)).current;
  const [showAlert, setShowAlert] = useState(false);
  const alertAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // --- Modal Open Animation ---
  useEffect(() => {
    if (showForm) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 150,
      }).start();
    }
  }, [showForm, translateY]);

  // --- Handlers ---
  const closeForm = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowForm(false);
      translateY.setValue(SCREEN_HEIGHT);
    });
  };

  const triggerAlert = () => {
    setShowAlert(true);
    Animated.spring(alertAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeAlert = () => {
    Animated.timing(alertAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowAlert(false));
  };

  const handleFinalSubmit = () => {
    if (name.trim() === "" || email.trim() === "" || message.trim() === "") {
      triggerAlert();
      return;
    }

    closeForm();

    setTimeout(() => {
      setShowSuccess(true);
      Animated.spring(successAnim, {
        toValue: Platform.OS === 'ios' ? 60 : 50,
        useNativeDriver: true,
        bounciness: 10,
      }).start();

      setTimeout(() => {
        Animated.timing(successAnim, {
          toValue: -150,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setShowSuccess(false);
          setName("");
          setEmail("");
          setMessage("");
          setImages([]);
        });
      }, 2500);
    }, 300);
  };

  // --- Swipe Logic ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          closeForm();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.6,
    });
    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...selectedUris]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const queries: QueryTicket[] = [
    {
      id: '1',
      type: 'Visit Issue',
      subject: 'Visit History Not Syncing',
      status: 'In Progress',
      date: 'Feb 06, 2026',
      description: 'I recently added a visit for Salman Khan but it is not appearing in history.',
    },
    {
      id: '2',
      type: 'App Feedback',
      subject: 'Dark Mode Improvement',
      status: 'Resolved',
      date: 'Feb 02, 2026',
      description: 'The contrast in dark mode is much better now. Thank you!',
    }
  ];

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.masterGradient}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />

      {/* 1. SUCCESS NOTIFICATION */}
      {showSuccess && (
        <Animated.View style={[styles.successBar, { transform: [{ translateY: successAnim }] }]}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
          <View>
            <Text style={styles.successTitle}>Request Sent!</Text>
            <Text style={styles.successMessage}>Admin will respond shortly.</Text>
          </View>
        </Animated.View>
      )}

      {/* 2. CUSTOM THEMED ALERT */}
      <Modal visible={showAlert} transparent animationType="fade">
        <View style={styles.alertBackdrop}>
          <Animated.View style={[
            styles.alertBox,
            {
              backgroundColor: isDark ? "#1e293b" : "#FFFFFF",
              borderColor: colors.border,
              opacity: alertAnim,
              transform: [{ scale: alertAnim }]
            }
          ]}>
            <Text style={[styles.alertTitle, { color: colors.text }]}>Required Fields !</Text>
            <Text style={[styles.alertSub, { color: colors.textSecondary }]}>
              Please fill All the required fields.
            </Text>
            <TouchableOpacity
              style={[styles.alertBtn, { backgroundColor: colors.primary }]}
              onPress={closeAlert}
            >
              <Text style={styles.alertBtnText}>Got it</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <SafeAreaView style={styles.safeContainer} edges={['top']}>
        <NavHeader 
          title="Support !" 
          showProfileIcon={false} 
          titleColor={isDark ? "#FFFFFF" : "#5152B3"} 
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.flexOne}
          contentContainerStyle={[styles.mainScroll, { paddingBottom: insets.bottom + 80 }]}
        >
          {/* Branding Section */}
          <View style={[
            styles.brandingCard, 
            { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(81, 82, 179, 0.08)" }
          ]}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome to Support Center</Text>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              Facing any issues with records or team data?
            </Text>

            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowForm(true)}>
              <LinearGradient 
                colors={THEME_COLORS.buttonGradient} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }} 
                style={styles.submitBtn}
              >
                <MaterialCommunityIcons name="chat-plus" size={20} color="white" />
                <Text style={styles.submitBtnText}>Submit Request</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* List Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Queries</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.countText}>{queries.length}</Text>
            </View>
          </View>

          {/* Ticket List */}
          {queries.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.ticketCard, 
                { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border }
              ]}
            >
              <View style={styles.ticketTopRow}>
                <View style={[
                  styles.typeBadge, 
                  { backgroundColor: item.type === 'Visit Issue' ? '#FEE2E2' : '#E0E7FF' }
                ]}>
                  <Text style={[
                    styles.typeBadgeText, 
                    { color: item.type === 'Visit Issue' ? '#EF4444' : '#5152B3' }
                  ]}>
                    {item.type}
                  </Text>
                </View>
                <Text style={[
                  styles.statusIndicator, 
                  { color: item.status === 'Resolved' ? '#10B981' : '#F59E0B' }
                ]}>
                  ● {item.status}
                </Text>
              </View>
              <Text style={[styles.ticketSubject, { color: colors.text }]}>{item.subject}</Text>
              <Text 
                style={[styles.ticketDesc, { color: colors.textSecondary }]} 
                numberOfLines={2}
              >
                {item.description}
              </Text>
              <View style={styles.ticketFooter}>
                <Text style={styles.dateLabel}>{item.date}</Text>
                <View style={styles.viewChatLink}>
                  <Text style={[styles.chatLinkText, { color: colors.primary }]}>View Response</Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- Submission Modal --- */}
        <Modal 
          visible={showForm} 
          transparent 
          animationType="none" 
          onRequestClose={closeForm}
        >
          <View style={styles.modalBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeForm} />
            
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
              style={styles.keyboardView}
            >
              <Animated.View
                style={[
                  styles.modalSheet, 
                  { 
                    backgroundColor: isDark ? "#0f172a" : "#FFFFFF", 
                    transform: [{ translateY }] 
                  }
                ]}
              >
                {/* Fixed Grab Area / Drag Handle */}
                <View {...panResponder.panHandlers} style={styles.swipeHandleArea}>
                  <View style={styles.modalHandle} />
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Submit Query</Text>
                    <TouchableOpacity onPress={closeForm}>
                      <Ionicons name="close-circle" size={30} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Form Content */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                  contentContainerStyle={styles.formScrollContent}
                >
                  <View style={styles.formBody}>
                    <Text style={styles.fieldLabel}>Enter-Name</Text>
                    <TextInput
                      style={[styles.fieldInput, { borderColor: colors.border, color: colors.text }]}
                      placeholder="Enter Name..."
                      placeholderTextColor="#94A3B8"
                      value={name}
                      onChangeText={setName}
                    />

                    <Text style={styles.fieldLabel}>Email-Address</Text>
                    <TextInput
                      style={[styles.fieldInput, { borderColor: colors.border, color: colors.text }]}
                      placeholder="Email Address..."
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />

                    <Text style={styles.fieldLabel}>Enter-Message</Text>
                    <TextInput
                      style={[styles.fieldArea, { borderColor: colors.border, color: colors.text }]}
                      multiline
                      placeholder="Type Your Issues..."
                      placeholderTextColor="#94A3B8"
                      value={message}
                      onChangeText={setMessage}
                    />

                    <Text style={styles.fieldLabel}>Upload-Photos</Text>
                    <View style={styles.attachmentGrid}>
                      <TouchableOpacity 
                        style={[styles.imageAddBtn, { borderColor: colors.primary }]} 
                        onPress={pickImages}
                      >
                        <MaterialCommunityIcons name="camera-plus-outline" size={26} color={colors.primary} />
                        <Text style={[styles.addBtnText, { color: colors.primary }]}>Add Photo</Text>
                      </TouchableOpacity>
                      
                      {images.map((img, i) => (
                        <View key={i} style={styles.thumbWrapper}>
                          <Image source={{ uri: img }} style={styles.thumbImage} />
                          <TouchableOpacity 
                            style={styles.removeThumbBtn} 
                            onPress={() => removeImage(i)}
                          >
                            <Ionicons name="close-circle" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.submitFinalBtn}
                      onPress={handleFinalSubmit}
                    >
                      <LinearGradient
                        colors={THEME_COLORS.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientFinal}
                      >
                        <Text style={styles.finalBtnText}>Submit</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </Animated.View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  masterGradient: { 
    flex: 1 
  },
  safeContainer: { 
    flex: 1 
  },
  flexOne: { 
    flex: 1 
  },
  mainScroll: { 
    padding: 20 
  },
  brandingCard: {
    padding: 25,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 35,
    borderWidth: 1,
    borderColor: 'rgba(81, 82, 179, 0.1)'
  },
  welcomeText: { 
    fontSize: 22, 
    fontWeight: '900', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  subText: { 
    fontSize: 14, 
    textAlign: 'center', 
    marginBottom: 25, 
    lineHeight: 20, 
    fontWeight: '500' 
  },
  submitBtn: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 35,
    alignItems: 'center',
    gap: 12,
    elevation: 8
  },
  submitBtnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 15 
  },
  sectionHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    marginBottom: 20, 
    paddingLeft: 5 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800' 
  },
  countBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 3, 
    borderRadius: 12 
  },
  countText: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  ticketCard: { 
    padding: 18, 
    borderRadius: 24, 
    borderWidth: 1, 
    marginBottom: 18, 
    elevation: 3 
  },
  ticketTopRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  typeBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 10 
  },
  typeBadgeText: { 
    fontSize: 10, 
    fontWeight: '900', 
    textTransform: 'uppercase' 
  },
  statusIndicator: { 
    fontSize: 12, 
    fontWeight: '800' 
  },
  ticketSubject: { 
    fontSize: 17, 
    fontWeight: '700', 
    marginBottom: 8 
  },
  ticketDesc: { 
    fontSize: 13, 
    lineHeight: 20, 
    marginBottom: 15 
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12
  },
  dateLabel: { 
    fontSize: 12, 
    color: '#94A3B8', 
    fontWeight: '500' 
  },
  viewChatLink: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  chatLinkText: { 
    fontSize: 13, 
    fontWeight: '800' 
  },
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end' 
  },
  keyboardView: { 
    width: '100%', 
    justifyContent: 'flex-end' 
  },
  modalSheet: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    maxHeight: SCREEN_HEIGHT * 0.88,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  swipeHandleArea: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  modalHandle: { 
    width: 50, 
    height: 6, 
    backgroundColor: '#E2E8F0', 
    borderRadius: 10, 
    marginBottom: 15 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%', 
    marginBottom: 10 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '900' 
  },
  formScrollContent: { 
    paddingBottom: 20 
  },
  formBody: { 
    paddingBottom: 20 
  },
  fieldLabel: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#64748B', 
    marginBottom: 10, 
    marginTop: 20, 
    marginLeft: 2 
  },
  fieldInput: { 
    borderWidth: 1.5, 
    borderRadius: 16, 
    padding: 15, 
    fontSize: 15 
  },
  fieldArea: { 
    borderWidth: 1.5, 
    borderRadius: 16, 
    padding: 15, 
    fontSize: 15, 
    height: 120, 
    textAlignVertical: 'top' 
  },
  attachmentGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    marginTop: 5 
  },
  imageAddBtn: {
    width: 75,
    height: 75,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(81, 82, 179, 0.03)'
  },
  addBtnText: { 
    fontSize: 10, 
    marginTop: 5, 
    fontWeight: '800' 
  },
  thumbWrapper: { 
    width: 75, 
    height: 75, 
    position: 'relative' 
  },
  thumbImage: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 18 
  },
  removeThumbBtn: { 
    position: 'absolute', 
    top: -8, 
    right: -8, 
    backgroundColor: 'white', 
    borderRadius: 12, 
    elevation: 2 
  },
  submitFinalBtn: { 
    marginTop: 40, 
    marginBottom: 10, 
    borderRadius: 20, 
    overflow: 'hidden' 
  },
  gradientFinal: { 
    paddingVertical: 18, 
    borderRadius: 20, 
    alignItems: 'center' 
  },
  finalBtnText: { 
    color: '#FFFFFF', 
    fontWeight: '900', 
    fontSize: 16, 
    letterSpacing: 0.5 
  },
  successBar: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    zIndex: 10000,
    gap: 15,
    elevation: 15,
  },
  successTitle: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  successMessage: { 
    color: '#E0F2FE', 
    fontSize: 12 
  },
  alertBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  alertBox: { 
    width: '85%', 
    padding: 25, 
    borderRadius: 30, 
    alignItems: 'center', 
    elevation: 25, 
    borderWidth: 1 
  },
  alertTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  alertSub: { 
    fontSize: 14, 
    textAlign: 'center', 
    lineHeight: 20, 
    marginBottom: 15, 
    fontWeight: '500' 
  },
  alertBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 40, 
    borderRadius: 15, 
    width: '100%', 
    alignItems: 'center' 
  },
  alertBtnText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});

export default Help;