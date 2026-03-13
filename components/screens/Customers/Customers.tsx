import * as ImagePicker from 'expo-image-picker';
import { useClients } from '@/hooks/useClients';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


import { useTheme } from '@/contexts/ThemeContext';
import NavHeader from '../../common/Buttons/NavHeader';
import ImageDesCard from '../../common/Cards/ImageDesCard';
import SearchInput from '../../common/Inputs/SearchInput';


const Customers: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // --- States ---
  const { 
    clients, 
    isLoading, 
    deleteClient, 
    isDeleting, 
    updateClient, 
    isUpdating 
  } = useClients();

  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const [tempTitle, setTempTitle] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempImg, setTempImg] = useState("");
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  // --- Search Logic ---
  const filteredCustomers = (clients || []).filter((customer: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setTempImg(result.assets[0].uri);
    }
  };

  const handleOpenMenu = (event: any, member: any) => {
    const { pageY } = event.nativeEvent;
    const adjustedTop = pageY > 500 ? pageY - 120 : pageY - 10;

    setMenuPosition({ top: adjustedTop, right: 40 });
    setSelectedId(member.id);
    setTempTitle(member.name);
    setTempPhone(member.phone);
    setTempEmail(member.email || "");
    setTempImg(member.profile_image);
    setMenuVisible(true);
  };

 // 2. handleSaveEdit check karein (wese hi rahega lekin confirm karein tempImg base64 ho)
const handleSaveEdit = async () => {
  if (!selectedId) return;

  const formData = new FormData();
  formData.append('name', tempTitle);
  formData.append('phone', tempPhone);
  formData.append('email', tempEmail);
  
  if (tempImg && !tempImg.startsWith('http')) {
    const filename = tempImg.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : `image`;
    formData.append('profile_image', { uri: tempImg, name: filename, type } as any);
  }

  try {
    await updateClient({ id: selectedId, formData });
    setEditModalVisible(false);
  } catch (err) {
    console.error("Update failed:", err);
  }
};

  const confirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteClient(selectedId);
      setDeleteModalVisible(false);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          translucent
          backgroundColor="transparent"
        />

        <NavHeader
          title="Our All Customers!"
          titleColor={isDark ? "#ffffffe3" : "#5152B3"}
        />

        {/* Search Section */}
        <View style={styles.searchFixedContainer}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Customer"
            showSearchType={false}
            backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
            textColor={colors.text}
            iconColor={colors.textSecondary}
          />
        </View>

        {/* List Section */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollArea, { paddingBottom: insets.bottom + 60 }]}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((member) => (
              <View key={member.id} style={styles.cardContainer}>
                <ImageDesCard
                  imageSource={member.profile_image ? { uri: member.profile_image } : require('../../../assets/images/icon.png')}
                  title={member.name}
                  description={`${member.phone}${member.email ? '\n' + member.email : ''}`}
                  backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
                  containerStyle={[styles.cardItem, { borderColor: colors.border }]}
                  titleStyle={{ color: colors.text }}
                  descriptionStyle={{ color: colors.textSecondary }}
                />
                <TouchableOpacity
                  style={styles.dots}
                  onPress={(e: any) => handleOpenMenu(e, member)}
                >
                  <MaterialCommunityIcons name="dots-vertical" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40 }}>
              No customers found.
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* --- OPTION MENU MODAL --- */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlayClear}>
            <View
              style={[
                styles.menuPopup,
                {
                  top: menuPosition.top,
                  right: menuPosition.right,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setMenuVisible(false);
                  setTimeout(() => setEditModalVisible(true), 200);
                }}
              >
                <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
                <Text style={[styles.menuOptionText, { color: colors.text }]}>Edit</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setMenuVisible(false);
                  setDeleteModalVisible(true);
                }}
              >
                <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
                <Text style={[styles.menuOptionText, { color: colors.text }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlayDark}>
          <View style={[styles.confirmBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm Delete</Text>

            <Text style={[styles.confirmDesc, { color: colors.textSecondary }]}>
              Are you sure you want to delete this customer
            </Text>

            <View style={styles.confirmBtnGroup}>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  { backgroundColor: isDark ? '#334155' : '#F1F5F9' },
                ]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.confirmBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: '#EF4444' }]}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[styles.confirmBtnText, { color: '#FFF' }]}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- EDIT CUSTOMER MODAL --- */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlayDark}>
          <View style={[styles.editBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Customer</Text>

            {/* Image Upload Section */}
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                <View style={[styles.imageWrapper, { borderColor: colors.primary }]}>
                  {tempImg ? (
                    <Image source={{ uri: tempImg }} style={styles.previewImage} />
                  ) : (
                    <MaterialCommunityIcons name="camera-plus" size={30} color={colors.primary} />
                  )}
                  <View style={styles.cameraIconBadge}>
                    <MaterialCommunityIcons name="camera" size={14} color="#FFF" />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={[styles.label, { marginTop: 8 }]}>Tap to change photo</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Client Name</Text>
              <TextInput
                style={[styles.field, { color: colors.text, borderColor: colors.border }]}
                value={tempTitle}
                onChangeText={setTempTitle}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.field, { color: colors.text, borderColor: colors.border }]}
                value={tempPhone}
                onChangeText={setTempPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.field, { color: colors.text, borderColor: colors.border }]}
                value={tempEmail}
                onChangeText={setTempEmail}
                autoCapitalize="none"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.btnGroup}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} disabled={isUpdating}>
                <Text style={styles.cancelLink}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.updateBtn} onPress={handleSaveEdit} disabled={isUpdating}>
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.updateTxt}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  searchFixedContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    marginTop: 10,
    zIndex: 10,
  },
  scrollArea: {
    paddingHorizontal: 15,
  },
  cardContainer: {
    position: 'relative',
    marginBottom: -10,
  },
  cardItem: {
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
  },
  dots: {
    position: 'absolute',
    right: 15,
    top: 25,
    padding: 10,
    zIndex: 5,
  },
  modalOverlayClear: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  modalOverlayDark: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuPopup: {
    position: 'absolute',
    borderRadius: 12,
    width: 140,
    paddingVertical: 5,
    elevation: 15,
    zIndex: 9999,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 10,
  },
  confirmBox: {
    borderRadius: 24,
    width: '85%',
    padding: 25,
    elevation: 20,
    alignItems: 'center',
  },
  confirmDesc: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 25,
    lineHeight: 22,
  },
  confirmBtnGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  editBox: {
    borderRadius: 24,
    width: '90%',
    padding: 20,
    elevation: 10,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5152B3',
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
    fontSize: 13,
    color: '#64748B',
  },
  field: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 15,
  },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 25,
    marginTop: 20,
    alignItems: 'center',
  },
  cancelLink: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 15,
  },
  updateBtn: {
    backgroundColor: '#5152B3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  updateTxt: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default Customers;