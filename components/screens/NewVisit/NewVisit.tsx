import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
  Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { THEME_COLORS } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useClients } from '@/hooks/useClients';
import { useVisits } from '@/hooks/useVisits';
import { useCatalogServices, useCatalogTags } from '@/hooks/useCatalog';
import NavHeader from '../../common/Buttons/NavHeader';
import Input from '../../common/Inputs/Input';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');
type IonIconName = React.ComponentProps<typeof Ionicons>['name'];

interface NewVisitProps {
  onBack: () => void;
}

const NewVisit: React.FC<NewVisitProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // --- Hooks & Services ---
  const { clients } = useClients();
  const { createVisit, isCreating } = useVisits();
  const { data: catalogServices } = useCatalogServices();
  const { data: catalogTags } = useCatalogTags();

  // --- States ---
  const [expandedSection, setExpandedSection] = useState<string | null>('customer');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const topServices = catalogServices?.slice(0, 3).map((s: any) => s.name) || ['Haircut', 'Coloring', 'Styling'];

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState<string>('');
  const topTags = catalogTags?.slice(0, 3).map((t: any) => t.name) || ['Premium', 'Regular', 'VIP'];

  const [notes, setNotes] = useState<string>('');
  const [isNotesFocused, setIsNotesFocused] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(-150)).current;

  // 1. Add Validation States
  const [showValidationError, setShowValidationError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- Filter Logic ---
  const filteredCustomers = (clients || []).filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const filteredServices = (catalogServices || [])
    .map((s: any) => s.name)
    .filter((s: string) =>
      s.toLowerCase().includes(serviceSearch.toLowerCase()) &&
      !selectedServices.includes(s)
    );

  const filteredTags = (catalogTags || [])
    .map((t: any) => t.name)
    .filter((t: string) =>
      t.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !selectedTags.includes(t)
    );

  // --- Handlers ---
  const closeDropdowns = () => {
    if (customerSearch !== '' || serviceSearch !== '' || tagSearch !== '') {
      setCustomerSearch('');
      setServiceSearch('');
      setTagSearch('');
    }
    Keyboard.dismiss();
  };

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddItem = (val: string, type: 'service' | 'tag') => {
    const trimmedVal = val.trim();
    if (!trimmedVal) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (type === 'service') {
      if (!selectedServices.includes(trimmedVal)) {
        setSelectedServices([...selectedServices, trimmedVal]);
      }
      setServiceSearch('');
    } else {
      if (!selectedTags.includes(trimmedVal)) {
        setSelectedTags([...selectedTags, trimmedVal]);
      }
      setTagSearch('');
    }
  };

  const removeChip = (val: string, type: 'service' | 'tag') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (type === 'service') {
      setSelectedServices(selectedServices.filter(s => s !== val));
    } else {
      setSelectedTags(selectedTags.filter(t => t !== val));
    }
  };

// --- Form Reset Function ---
  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setSelectedServices([]);
    setServiceSearch('');
    setSelectedTags([]);
    setTagSearch('');
    setNotes('');
    setImages([]);
    setExpandedSection('customer');
  };

  const handleSave = async () => {
    if (isCreating) return;

    // Validation
    if (!selectedCustomer) {
      setErrorMessage("Please select or search for a customer first.");
      setShowValidationError(true);
      return;
    }
    if (selectedServices.length === 0) {
      setErrorMessage("Please select at least one service.");
      setShowValidationError(true);
      return;
    }

    const formData = new FormData();
    formData.append('client_id', selectedCustomer.id.toString());
    formData.append('visit_date', new Date().toISOString().split('T')[0]);
    formData.append('visit_time', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    formData.append('notes', notes);
    
    selectedServices.forEach(s => formData.append('services[]', s));
    selectedTags.forEach(t => formData.append('tags[]', t));

    images.forEach((uri, index) => {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('photos[]', { uri, name: filename, type } as any);
    });

    try {
      await createVisit(formData);
      setShowSuccess(true);
      
      Animated.spring(slideAnim, {
        toValue: Platform.OS === 'android' ? 50 : 60,
        useNativeDriver: true,
        bounciness: 10
      }).start();

      setTimeout(() => {
        Animated.timing(slideAnim, { 
          toValue: -150, 
          duration: 400, 
          useNativeDriver: true 
        }).start(() => {
          setShowSuccess(false);
          resetForm(); 
          onBack(); 
        });
      }, 2000);
    } catch (err) {
      console.error("Save visit failed:", err);
      setErrorMessage("Failed to save visit. Please try again.");
      setShowValidationError(true);
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true
    });
    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  
  return (
    <TouchableWithoutFeedback onPress={closeDropdowns}>
      <LinearGradient colors={colors.bgGradient} style={styles.gradientContainer}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent" 
          translucent
        />

        {showSuccess && (
          <Animated.View style={[styles.successNotification, { transform: [{ translateY: slideAnim }] }]}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
            <View>
              <Text style={styles.successTitle}>Success!</Text>
              <Text style={styles.successMessage}>Visit details saved successfully.</Text>
            </View>
          </Animated.View>
        )}

        <SafeAreaView style={styles.masterContainer} edges={['top', 'bottom']}>
          <NavHeader title="Add New Visit !" showProfileIcon={false} titleColor={isDark ? "#FFFFFF" : "#5152B3"}>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.8} disabled={isCreating}>
              <LinearGradient
                colors={THEME_COLORS.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveHeaderBtn}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </NavHeader>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flexOne}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: 50 + insets.bottom }]}
              keyboardShouldPersistTaps="handled"
            >
              {/* 1. Customer Section */}
              <View style={[styles.card, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border, zIndex: 3000 }]}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('customer')}>
                  <View style={styles.headerTitleRow}>
                    <Ionicons name="person-outline" size={20} color={colors.primary} />
                    <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}>Customer</Text>
                  </View>
                  <Ionicons name={(expandedSection === 'customer' ? 'chevron-up' : 'chevron-down') as IonIconName} size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {expandedSection === 'customer' && (
                  <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
                    <View style={styles.inputWrapper}>
                      <Input
                        value={customerSearch}
                        onChangeText={(val) => {
                          setCustomerSearch(val);
                          if (selectedCustomer) setSelectedCustomer(null);
                        }}
                        placeholder="Search by name or phone..."
                        leftIcon="account-search"
                        variant="outlined"
                        inputStyle={{ color: isDark ? '#FFFFFF' : colors.text }} // Forced white in dark mode
                        placeholderTextColor={colors.textSecondary}
                        backgroundColor={isDark ? '#1e293b' : '#FFFFFF'}
                        focusBorderColor={isDark ? '#FFFFFF' : '#5152B3'}
                        borderColor={colors.border}
                      />
                      {customerSearch.length > 0 && !selectedCustomer && filteredCustomers.length > 0 && (
                        <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
                            {filteredCustomers.map(c => (
                              <TouchableOpacity
                                key={c.id}
                                style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                                onPress={() => {
                                  setSelectedCustomer(c);
                                  setCustomerSearch('');
                                }}
                              >
                                <MaterialCommunityIcons name="account-circle" size={22} color={colors.textSecondary} />
                                <View>
                                  <Text style={[styles.itemTitle, { color: colors.text }]}>{c.name}</Text>
                                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{c.phone}</Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                    {selectedCustomer && (
                      <View style={[styles.selectedBadge, { backgroundColor: isDark ? colors.border : '#ECFDF5' }]}>
                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                        <Text style={[styles.selectedBadgeText, { color: isDark ? colors.text : '#065F46' }]}>
                          Selected: {selectedCustomer.name}
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedCustomer(null)} style={{ marginLeft: 'auto' }}>
                          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity style={styles.addLink} onPress={() => router.push('/(tabs)/add-clients' as any)}>
                      <Text style={[styles.addLinkText, { color: colors.primary }]}>+ Add New Customer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* 2. Services Section */}
              <View style={[styles.card, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border, zIndex: 2000 }]}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('services')}>
                  <View style={styles.headerTitleRow}>
                    <MaterialCommunityIcons name="content-cut" size={20} color={colors.primary} />
                    <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}>Services</Text>
                  </View>
                  <Ionicons name={(expandedSection === 'services' ? 'chevron-up' : 'chevron-down') as IonIconName} size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {expandedSection === 'services' && (
                  <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
                    <View style={styles.chipsRow}>
                      {selectedServices.map(s => (
                        <TouchableOpacity
                          key={s}
                          style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}
                          onPress={() => removeChip(s, 'service')}
                        >
                          <Text style={[styles.chipText, { color: colors.primary }]}>{s} ✕</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Input
                      value={serviceSearch}
                      onChangeText={setServiceSearch}
                      placeholder="Search or add service..."
                      leftIcon="plus-circle-outline"
                      variant="outlined"
                      inputStyle={{ color: colors.text }}
                      placeholderTextColor={colors.textSecondary}
                      backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
                      focusBorderColor={isDark ? '#FFFFFF' : '#5152B3'}
                      borderColor={colors.border}
                    />
                    <View style={styles.quickSelectRow}>
                      {topServices
                        .filter((s: any) => !selectedServices.includes(s))
                        .map((s: any) => (
                          <TouchableOpacity
                            key={s}
                            style={[styles.quickChip, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => handleAddItem(s, 'service')}
                          >
                            <Text style={[styles.quickChipText, { color: colors.textSecondary }]}>+ {s}</Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                    {serviceSearch.length > 0 && (
                      <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TouchableOpacity
                          style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                          onPress={() => handleAddItem(serviceSearch, 'service')}
                        >
                          <Ionicons name="add-circle" size={22} color={colors.primary} />
                          <Text style={[styles.itemTitle, { color: colors.text }]}>Add {serviceSearch}</Text>
                        </TouchableOpacity>
                        {filteredServices.map((s: string) => (
                          <TouchableOpacity
                            key={s}
                            style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                            onPress={() => handleAddItem(s, 'service')}
                          >
                            <Text style={[styles.itemTitle, { color: colors.text }]}>{s}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* 3. Tags Section */}
              <View style={[styles.card, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border, zIndex: 1000 }]}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('tags')}>
                  <View style={styles.headerTitleRow}>
                    <MaterialCommunityIcons name="tag-outline" size={20} color={colors.primary} />
                    <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}>Tags</Text>
                  </View>
                  <Ionicons name={(expandedSection === 'tags' ? 'chevron-up' : 'chevron-down') as IonIconName} size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {expandedSection === 'tags' && (
                  <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
                    <View style={styles.chipsRow}>
                      {selectedTags.map(t => (
                        <TouchableOpacity
                          key={t}
                          style={[styles.chip, styles.tagChip, { backgroundColor: colors.background, borderColor: colors.border }]}
                          onPress={() => removeChip(t, 'tag')}
                        >
                          <Text style={[styles.chipText, styles.tagChipText, { color: colors.textSecondary }]}>{t} ✕</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Input
                      value={tagSearch}
                      onChangeText={setTagSearch}
                      placeholder="Add custom tags..."
                      leftIcon="tag-plus-outline"
                      variant="outlined"
                      inputStyle={{ color: colors.text }}
                      placeholderTextColor={colors.textSecondary}
                      backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
                      focusBorderColor={isDark ? '#FFFFFF' : '#5152B3'}
                      borderColor={colors.border}
                    />
                    <View style={styles.quickSelectRow}>
                      {topTags
                        .filter((t: any) => !selectedTags.includes(t))
                        .map((t: any) => (
                          <TouchableOpacity
                            key={t}
                            style={[styles.quickChip, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => handleAddItem(t, 'tag')}
                          >
                            <Text style={[styles.quickChipText, { color: colors.textSecondary }]}># {t}</Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                    {tagSearch.length > 0 && (
                      <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TouchableOpacity
                          style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                          onPress={() => handleAddItem(tagSearch, 'tag')}
                        >
                          <Ionicons name="add-circle" size={22} color={colors.primary} />
                          <Text style={[styles.itemTitle, { color: colors.text }]}>Add {tagSearch}</Text>
                        </TouchableOpacity>
                        {filteredTags.map((t: string) => (
                          <TouchableOpacity
                            key={t}
                            style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                            onPress={() => handleAddItem(t, 'tag')}
                          >
                            <Text style={[styles.itemTitle, { color: colors.text }]}>{t}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* 4. Notes Section */}
              <View style={[styles.card, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border }]}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('notes')}>
                  <View style={styles.headerTitleRow}>
                    <MaterialCommunityIcons name="notebook-outline" size={20} color={colors.primary} />
                    <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}>Notes</Text>
                  </View>
                  <Ionicons name={(expandedSection === 'notes' ? 'chevron-up' : 'chevron-down') as IonIconName} size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {expandedSection === 'notes' && (
                  <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
                    <TextInput
                      style={[
                        styles.textArea,
                        {
                          backgroundColor: isDark ? "#1e293b" : "#FFFFFF",
                          borderColor: isDark && isNotesFocused ? "#FFFFFF" : colors.border, // White focus in dark mode
                          color: isDark ? "#FFFFFF" : colors.text
                        }
                      ]}
                      placeholder="Technical formulas/Notes..."
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      value={notes}
                      onChangeText={setNotes}
                      onFocus={() => setIsNotesFocused(true)} // Track focus
                      onBlur={() => setIsNotesFocused(false)} // Track blur
                    />
                  </View>
                )}
              </View>

              {/* 5. Photos Section */}
              <View style={[styles.card, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border }]}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('photos')}>
                  <View style={styles.headerTitleRow}>
                    <Ionicons name="images-outline" size={20} color={colors.primary} />
                    <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}>Visit Photos</Text>
                  </View>
                  <Ionicons name={(expandedSection === 'photos' ? 'chevron-up' : 'chevron-down') as IonIconName} size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {expandedSection === 'photos' && (
                  <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
                    <View style={styles.photoGrid}>
                      <TouchableOpacity
                        style={[styles.addPhotoBox, { backgroundColor: colors.background, borderColor: colors.primary }]}
                        onPress={handleImagePick}
                      >
                        <MaterialCommunityIcons name="camera-plus" size={30} color={colors.primary} />
                        <Text style={[styles.addPhotoText, { color: colors.primary }]}>Add Photo</Text>
                      </TouchableOpacity>
                      {images.map((uri, i) => (
                        <View key={i} style={styles.imageWrapper}>
                          <Image source={{ uri }} style={styles.uploadedImg} />
                          <TouchableOpacity
                            style={[styles.removeBtn, { backgroundColor: colors.card }]}
                            onPress={() => removeImage(i)}
                          >
                            <Ionicons name="close-circle" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
        <Modal visible={showValidationError} transparent animationType="fade">
          <View style={styles.modalOverlayDark}>
            <View style={[styles.confirmBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Missing Info!</Text>

              <Text style={[styles.confirmDesc, { color: colors.textSecondary }]}>
                {errorMessage}
              </Text>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.primary, width: '100%' }]}
                onPress={() => setShowValidationError(false)}
              >
                <Text style={[styles.confirmBtnText, { color: '#FFF' }]}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1
  },
  masterContainer: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  flexOne: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10
  },
  saveHeaderBtn: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14
  },
  card: {
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    alignItems: 'center'
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  cardBody: {
    padding: 18,
    paddingTop: 0,
    borderTopWidth: 1
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    marginTop: 10
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 15,
    elevation: 8,
    zIndex: 9999,
    borderWidth: 1,
    padding: 5
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  itemSub: {
    fontSize: 12
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600'
  },
  tagChip: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0'
  },
  tagChipText: {
    color: '#64748B'
  },
  quickSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap'
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600'
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    gap: 8
  },
  selectedBadgeText: {
    fontSize: 13,
    fontWeight: '600'
  },
  addLink: {
    marginTop: 12
  },
  addLinkText: {
    fontSize: 13,
    fontWeight: '700'
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    marginTop: 12,
    fontSize: 14
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 15
  },
  addPhotoBox: {
    width: (width - 100) / 2,
    height: 110,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addPhotoText: {
    fontSize: 13,
    marginTop: 8,
    fontWeight: '700'
  },
  imageWrapper: {
    width: (width - 100) / 2,
    height: 110,
    position: 'relative'
  },
  uploadedImg: {
    width: '100%',
    height: '100%',
    borderRadius: 18
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: 12,
    elevation: 3
  },
  successNotification: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    zIndex: 9999,
    gap: 15,
    elevation: 10
  },
  successTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  successMessage: {
    color: '#E0F2FE',
    fontSize: 13
  },
  modalOverlayDark: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBox: {
    borderRadius: 24,
    width: '80%',
    padding: 25,
    elevation: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confirmDesc: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 15,
    lineHeight: 22,
  },
  confirmBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default NewVisit;