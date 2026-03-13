
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVisits } from '@/hooks/useVisits';
import { useClients } from '@/hooks/useClients';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, GestureResponderEvent, Image, LayoutAnimation, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, UIManager, View } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { THEME_COLORS } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import NavHeader from '../../common/Buttons/NavHeader';
import HistoryCard from '../../common/Cards/HistoryCard';
import FilterInput, { FilterSection } from '../../common/Inputs/FilterInput';
import SearchInput from '../../common/Inputs/SearchInput';
import Input from '../../common/Inputs/Input';
import { Visit } from '@/services/visitService';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type IonIconName = React.ComponentProps<typeof Ionicons>['name'];

interface HistoryProps {
  onBack?: () => void;
  onNavigateToNewVisit?: () => void;
}

// Mock data removed for API integration

const History: React.FC<HistoryProps> = ({ onNavigateToNewVisit }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // --- Hooks & Services ---
  const { visits, isLoading: isVisitsLoading, deleteVisit, isDeleting, updateVisit, isUpdating } = useVisits();
  const { clients } = useClients();

  const [searchText, setSearchText] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [customerDropdownVisible, setCustomerDropdownVisible] = useState(false);

  // Sorting State
  const [sortOption, setSortOption] = useState<string>('newest');
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);

  // Edit Modal Specific UI State
  const [expandedSection, setExpandedSection] = useState<string | null>('customer');

  const topServices = ['Haircut', 'Coloring', 'Styling'];
  const topTags = ['Premium', 'Regular', 'VIP'];

  // Edit Modal Data States
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState<string>('');

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState<string>('');

  const [tempNotes, setTempNotes] = useState<string>('');
  const [tempPhotos, setTempPhotos] = useState<string[]>([]);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  const filterSections: FilterSection[] = [
    // Name filter removed as per request

    {
      id: 'category_filter',
      title: 'Filter By Service',
      type: 'selection',
      multiSelect: true,
      options: [
        { label: 'Haircut', value: 'Haircut' },
        { label: 'Color Expert', value: 'Color' },
        { label: 'Styling', value: 'Styling' },
        { label: 'Facial', value: 'Facial' },
      ],
    },
    {
      id: 'tag_filter',
      title: 'Filter By Tag',
      type: 'selection',
      multiSelect: true,
      options: [
        { label: 'New Client', value: 'New' },
        { label: 'Regular', value: 'Regular' },
        { label: 'VIP', value: 'VIP' },
      ],
    },
    {
      id: 'date_filter',
      title: 'Filter By Date',
      type: 'date-range',
    },
  ];

  const filteredCustomers = (clients || []).filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

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

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true
    });
    if (!result.canceled) {
      setTempPhotos(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setTempPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenMenu = (event: GestureResponderEvent, item: any) => {
    const { pageY } = event.nativeEvent;
    const screenHeight = Dimensions.get('window').height;
    const isLowerHalf = pageY > screenHeight / 2;
    const adjustedTop = isLowerHalf ? pageY - 140 : pageY - 10;

    setMenuPosition({ top: adjustedTop, right: 40 });
    setSelectedId(item.id);

    setCustomerSearch(item.client?.name || "");
    setSelectedCustomer(item.client);
    setSelectedServices(item.services || []);
    setSelectedTags(item.tags || []);
    setTempNotes(item.notes || "");
    setTempPhotos(item.photos?.map((p: any) => p.url) || []);

    setMenuVisible(true);
  };

  const handleSaveEdit = async () => {
    if (selectedId === null) return;
    
    const formData = new FormData();
    formData.append('notes', tempNotes);
    formData.append('client_id', selectedCustomer?.id.toString() || "");
    selectedServices.forEach(s => formData.append('services[]', s));
    selectedTags.forEach(t => formData.append('tags[]', t));

    tempPhotos.forEach((uri) => {
      if (!uri.startsWith('http')) {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('photos[]', { uri, name: filename, type } as any);
      }
    });

    try {
      await updateVisit({ id: selectedId, formData });
      setEditModalVisible(false);
    } catch (err) {
      console.error("Update visit failed:", err);
    }
  };

  const handleViewDetails = () => {
    setMenuVisible(false);
    router.push('/(tabs)/view-history' as any);
  };

  const handleDeleteItem = () => {
    if (selectedId === null) return;
    setDeleteModalVisible(true);
    setMenuVisible(false);
  };

  const confirmDeleteItem = async () => {
    if (selectedId === null) return;
    try {
      await deleteVisit(selectedId);
      setDeleteModalVisible(false);
    } catch (err) {
      console.error("Delete visit failed:", err);
    }
  };

  const handleSelectCustomer = (name: string) => {
    setActiveFilters(prev => ({
      ...prev,
      selected_customer: name
    }));
    setCustomerDropdownVisible(false);
    setSearchText('');
  };

  const filteredData = (visits || []).filter((item) => {
    if (!item || !item.client) return false;
    const query = searchText.toLowerCase().trim();

    // 1. Global Search
    const searchMatch = !query ? true : (
      (item.client.name || "").toLowerCase().includes(query) ||
      (item.client.phone || "").includes(query) ||
      (item.services || []).some((s: string) => s.toLowerCase().includes(query)) ||
      (item.notes || "").toLowerCase().includes(query) ||
      (item.tags || []).some((t: string) => t.toLowerCase().includes(query))
    );

    // 2. Customer Filter
    const customerFilter = activeFilters.selected_customer as string | undefined;
    const customerMatch = customerFilter ? item.client.name === customerFilter : true;

    // 3. Service Filter (Multi Select)
    const serviceFilters = (activeFilters.category_filter as string[]) || [];
    const serviceMatch = serviceFilters.length > 0
      ? (item.services || []).some((s: string) => serviceFilters.some(filter => s.includes(filter)))
      : true;

    // 4. Tag Filter (Multi Select)
    const tagFilters = (activeFilters.tag_filter as string[]) || [];
    const tagMatch = tagFilters.length > 0
      ? (item.tags || []).some((t: string) => tagFilters.some(filter => t.includes(filter)))
      : true;

    // 5. Date Filter (Range)
    const dateFilter = activeFilters.date_filter as { start?: string; end?: string } | undefined;
    let dateRangeMatch = true;
    if (dateFilter && (dateFilter.start || dateFilter.end)) {
      const itemDate = new Date(item.visit_date).getTime();
      const startDate = dateFilter.start ? new Date(dateFilter.start).getTime() : 0;
      let endDate = Number.MAX_SAFE_INTEGER;
      if (dateFilter.end) {
        endDate = new Date(dateFilter.end).getTime() + 86399999;
      }
      dateRangeMatch = itemDate >= startDate && itemDate <= endDate;
    }

    return searchMatch && customerMatch && serviceMatch && tagMatch && dateRangeMatch;
  }).sort((a, b) => {
    switch (sortOption) {
      case 'name_asc':
        return (a.client?.name || "").localeCompare(b.client?.name || "");
      case 'name_desc':
        return (b.client?.name || "").localeCompare(a.client?.name || "");
      case 'oldest':
        return new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime();
      case 'newest':
      default:
        return new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime();
    }
  });

  const getSortLabel = () => {
    switch (sortOption) {
      case 'name_asc': return 'Name (A-Z)';
      case 'name_desc': return 'Name (Z-A)';
      case 'oldest': return 'Oldest First';
      case 'newest': return 'Newest First';
      default: return 'Newest First';
    }
  };

  // 1. Jab Customer Dropdown khule, toh Sort Menu band ho jaye
  useEffect(() => {
    if (customerDropdownVisible && showSortMenu) {
      setShowSortMenu(false);
    }
  }, [customerDropdownVisible, showSortMenu]);

  // 2. Jab Sort Menu khule, toh Customer Dropdown band ho jaye
  useEffect(() => {
    if (showSortMenu && customerDropdownVisible) {
      setCustomerDropdownVisible(false);
    }
  }, [showSortMenu, customerDropdownVisible]);



  return (
    <LinearGradient colors={colors.bgGradient} style={styles.gradientContainer}>
      {/* Yeh wrapper poori screen par click detect karega */}
      <TouchableWithoutFeedback
        onPress={() => {
          setCustomerDropdownVisible(false);
          setShowSortMenu(false);
        }}
      >
        <SafeAreaView style={styles.masterContainer} edges={['top', 'bottom']}>
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

          <NavHeader title="All History !" titleColor={isDark ? "#FFFFFF" : "#5152B3"}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>

              {/* New Visit Button */}
              <TouchableOpacity onPress={() => onNavigateToNewVisit?.()} activeOpacity={0.8}>
                <LinearGradient
                  colors={THEME_COLORS.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.newVisitHeaderBtn}
                >
                  <Text style={styles.newVisitBtnText}>New Visit</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Customer Dropdown Wrapper */}
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[styles.customerMenuBtn, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}
                  onPress={() => {
                    setCustomerDropdownVisible(!customerDropdownVisible);
                    setShowSortMenu(false); // Doosra menu band kar dein
                  }}

                >
                  <Ionicons name="people" size={18} color={colors.primary} />
                  <Ionicons name="chevron-down" size={12} color={isDark ? "#FFFFFF" : "#334155"} />
                </TouchableOpacity>

                {/* Actual Dropdown Menu */}
                {customerDropdownVisible && (
                  <View style={[styles.customerDropdownMenu, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border }]}>
                    <ScrollView bounces={false} style={{ maxHeight: 250 }}>
                      {(clients || []).map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.customerDropDownItem, { borderBottomColor: colors.border }]}
                          onPress={() => handleSelectCustomer(item.name)}
                        >
                          <Text style={[styles.dropDownName, { color: colors.text }]}>{item.name}</Text>
                          <Text style={styles.dropDownPhone}>{item.phone}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

            </View>
          </NavHeader>

          <View style={styles.searchFixedWrapper}>
            <SearchInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search history..."
              showFilterIcon={true}
              onFilterIconPress={() => setIsFilterVisible(true)}
              containerStyle={styles.searchBar}
              backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
              textColor={isDark ? "#FFFFFF" : "#333333"}
              iconColor={isDark ? "#94A3B8" : "#888888"}
              showFilterSort={false}
            />



            {/* --- Active Filters Section --- */}
            {Object.keys(activeFilters).length > 0 && (
              <View style={styles.activeFiltersContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.activeFiltersScroll}
                >



                  {Object.entries(activeFilters).map(([key, value]) => {
                    if (!value) return null;

                    if (key === 'selected_customer') {
                      return (
                        <TouchableOpacity
                          key="filter-customer"
                          style={[styles.filterChip, { backgroundColor: colors.primary + '15', borderColor: colors.border }]}
                          onPress={() => {
                            // Remove selected_customer from filters when clicking "X"
                            const newFilters = { ...activeFilters };
                            delete newFilters.selected_customer;
                            setActiveFilters(newFilters);
                          }}
                        >
                          <Ionicons name="person" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                          <Text style={[styles.filterChipText, { color: colors.text }]}>{value as string}</Text>
                          <Ionicons name="close-circle" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                      );
                    }

                    // --- 2. Agar Date Filter hai ---
                    if (key === 'date_filter' && (value.start || value.end)) {
                      const dateLabel = `${value.start || '...'} - ${value.end || '...'}`;
                      return (
                        <TouchableOpacity
                          key="filter-date"
                          style={[styles.filterChip, { backgroundColor: colors.primary + '15', borderColor: colors.border }]}
                          onPress={() => {
                            const newFilters = { ...activeFilters };
                            delete newFilters.date_filter;
                            setActiveFilters(newFilters);
                          }}
                        >
                          <Text style={[styles.filterChipText, { color: colors.text }]}>{dateLabel}</Text>
                          <Ionicons name="close-circle" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                      );
                    }

                    // --- 2. Agar Multiple Selection (Array) hai - Services/Tags ---
                    if (Array.isArray(value) && value.length > 0) {
                      return value.map((item, index) => (
                        <TouchableOpacity
                          key={`filter-${key}-${index}`}
                          style={[styles.filterChip, { backgroundColor: colors.primary + '15', borderColor: colors.border }]}
                          onPress={() => {
                            const newFilters = { ...activeFilters };
                            newFilters[key] = value.filter(v => v !== item);
                            if (newFilters[key].length === 0) delete newFilters[key];
                            setActiveFilters(newFilters);
                          }}
                        >
                          <Text style={[styles.filterChipText, { color: colors.text }]}>{item}</Text>
                          <Ionicons name="close-circle" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                      ));
                    }

                    return null;
                  })}
                </ScrollView>
              </View>
            )}


            {/* Sticky Results & Sort Bar */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 15, // Increased margin to move it down slightly
              paddingHorizontal: 5
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#94A3B8' : '#64748B'
              }}>
                Results: {filteredData.length}
              </Text>

              <View style={{ position: 'relative', zIndex: 100 }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    setShowSortMenu(!showSortMenu);
                    setCustomerDropdownVisible(false); // Pehla menu band kar dein
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: isDark ? '#FFFFFF' : '#334155',
                    marginRight: 6
                  }}>
                    Sort By:
                  </Text>
                  <View style={{
                    backgroundColor: isDark ? '#334155' : '#e5ecf7ff', // Proper background for selected value
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    marginRight: 4,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
                      {getSortLabel()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={16} color={isDark ? '#FFFFFF' : '#334155'} />
                </TouchableOpacity>

                {/* Sort Menu Dropdown */}
                {showSortMenu && (
                  <View style={{
                    position: 'absolute',
                    top: 35,
                    right: 0,
                    width: 170,
                    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                    borderRadius: 12,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    paddingVertical: 5,
                    borderWidth: 1,
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    zIndex: 200
                  }}>
                    {[
                      { label: 'Newest First', value: 'newest' },
                      { label: 'Oldest First', value: 'oldest' },
                      { label: 'Name (A-Z)', value: 'name_asc' },
                      { label: 'Name (Z-A)', value: 'name_desc' }
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 15,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: sortOption === opt.value ? (isDark ? '#334155' : '#F1F5F9') : 'transparent'
                        }}
                        onPress={() => {
                          setSortOption(opt.value);
                          setShowSortMenu(false);
                        }}
                      >
                        <Text style={{
                          fontSize: 13,
                          color: sortOption === opt.value ? colors.primary : (isDark ? '#CBD5E1' : '#475569'),
                          fontWeight: sortOption === opt.value ? '600' : '400'
                        }}>
                          {opt.label}
                        </Text>
                        {sortOption === opt.value && <Ionicons name="checkmark" size={14} color={colors.primary} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.mainScroll, { paddingBottom: insets.bottom + 80 }]}
          >
            {isVisitsLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : filteredData.length > 0 ? (
              filteredData.map((item: Visit) => (
                <HistoryCard
                  key={item.id}
                  customer={item.client ? { 
                    name: item.client.name, 
                    phone: item.client.phone, 
                    img: item.client.profile_image 
                  } : { name: "Unknown", phone: "" }}
                  services={item.services?.map((s: any) => s.name) || []}
                  tags={item.tags?.map((t: any) => t.name) || []}
                  date={item.visit_date}
                  time={item.visit_time}
                  containerStyle={{ borderColor: colors.border }}
                  onMenuPress={(e: any) => handleOpenMenu(e, item)}
                />
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons name="calendar-outline" size={60} color={colors.textSecondary} />
                <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                  No history found for these filters
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Menu Popover */}
          <Modal visible={menuVisible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
              <View style={styles.modalOverlayDimmed}>
                <View style={[styles.menuPopup, { top: menuPosition.top, right: menuPosition.right, backgroundColor: colors.card }]}>
                  <TouchableOpacity style={styles.menuItem} onPress={handleViewDetails}>
                    <MaterialCommunityIcons name="eye" size={20} color={colors.textSecondary} />
                    <Text style={[styles.menuText, { color: colors.text }]}>View</Text>
                  </TouchableOpacity>
                  <View style={styles.menuSeparator} />
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      setEditModalVisible(true);
                    }}
                  >
                    <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
                    <Text style={[styles.menuText, { color: colors.text }]}>Edit</Text>
                  </TouchableOpacity>
                  <View style={styles.menuSeparator} />
                  <TouchableOpacity style={styles.menuItem} onPress={handleDeleteItem}>
                    <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
                    <Text style={[styles.menuText, { color: colors.text }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Edit Visit Modal (Synced with NewVisit.tsx UI) */}
          <Modal visible={editModalVisible} transparent animationType="slide">
            <View style={styles.modalOverlayCenterDark}>
              <View style={[styles.editPopup, { backgroundColor: colors.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.editTitle, { color: colors.text }]}>Edit Visit Info</Text>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                  {/* 1. Customer Section */}
                  <View style={[styles.accordionCard, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('customer')}>
                      <View style={styles.headerTitleRow}>
                        <Ionicons name="person-outline" size={20} color={colors.primary} />
                        <Text style={[styles.accordionTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}>Customer</Text>
                      </View>
                      <Ionicons name={(expandedSection === 'customer' ? 'chevron-up' : 'chevron-down') as IonIconName} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {expandedSection === 'customer' && (
                      <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                        <View style={styles.inputWrapper}>
                          <Input
                            value={customerSearch}
                            onChangeText={(val) => {
                              setCustomerSearch(val);
                              if (selectedCustomer) setSelectedCustomer(null);
                            }}
                            placeholder="Search customer..."
                            leftIcon="account-search"
                            variant="outlined"
                            backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}

                            // --- YEH HACK USE KAREIN ---
                            // Isse design wahi rahega jo Input component ka hai,
                            // lekin text color white force ho jayega.
                            {...({
                              style: { color: isDark ? "#FFFFFF" : "#1E293B" }
                            } as any)}

                            placeholderTextColor={isDark ? "#94A3B8" : "#64748B"}
                          />

                          {customerSearch.length > 0 && !selectedCustomer && filteredCustomers.length > 0 && (
                            <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                              <ScrollView style={{ maxHeight: 150 }} keyboardShouldPersistTaps="handled">
                                {filteredCustomers.map(c => (
                                  <TouchableOpacity
                                    key={c.id}
                                    style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                                    onPress={() => { setSelectedCustomer(c); setCustomerSearch(c.name); }}
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
                            <Text style={[styles.selectedBadgeText, { color: isDark ? "#FFFFFF" : '#065F46' }]}>
                              Selected: {selectedCustomer.name}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {/* 2. Services Section */}
                  <View style={[styles.accordionCard, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('services')}>
                      <View style={styles.headerTitleRow}>
                        <MaterialCommunityIcons name="content-cut" size={20} color={colors.primary} />
                        <Text style={[styles.accordionTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}>Services</Text>
                      </View>
                      <Ionicons name={(expandedSection === 'services' ? 'chevron-up' : 'chevron-down') as IonIconName} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {expandedSection === 'services' && (
                      <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                        <View style={styles.chipsRow}>
                          {selectedServices.map(s => (
                            <TouchableOpacity key={s} style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => removeChip(s, 'service')}>
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
                          backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
                        />
                        <View style={styles.quickSelectRow}>
                          {topServices.filter(s => !selectedServices.includes(s)).map(s => (
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
                            <TouchableOpacity style={styles.suggestionItem} onPress={() => handleAddItem(serviceSearch, 'service')}>
                              <Ionicons name="add-circle" size={22} color={colors.primary} />
                              <Text style={[styles.itemTitle, { color: colors.text }]}>Add &quot;{serviceSearch}&quot;</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {/* 3. Tags Section */}
                  <View style={[styles.accordionCard, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('tags')}>
                      <View style={styles.headerTitleRow}>
                        <MaterialCommunityIcons name="tag-outline" size={20} color={colors.primary} />
                        <Text style={[styles.accordionTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}>Tags</Text>
                      </View>
                      <Ionicons name={(expandedSection === 'tags' ? 'chevron-up' : 'chevron-down') as IonIconName} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {expandedSection === 'tags' && (
                      <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                        <View style={styles.chipsRow}>
                          {selectedTags.map(t => (
                            <TouchableOpacity key={t} style={[styles.chip, styles.tagChip, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => removeChip(t, 'tag')}>
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
                          backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
                        />
                        <View style={styles.quickSelectRow}>
                          {topTags.filter(t => !selectedTags.includes(t)).map(t => (
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
                            <TouchableOpacity style={styles.suggestionItem} onPress={() => handleAddItem(tagSearch, 'tag')}>
                              <Ionicons name="add-circle" size={22} color={colors.primary} />
                              <Text style={[styles.itemTitle, { color: colors.text }]}>Add &quot;#{tagSearch}&quot;</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {/* 4. Notes Section */}
                  <View style={[styles.accordionCard, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('notes')}>
                      <View style={styles.headerTitleRow}>
                        <MaterialCommunityIcons name="notebook-outline" size={20} color={colors.primary} />
                        <Text style={[styles.accordionTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}>Notes</Text>
                      </View>
                      <Ionicons name={(expandedSection === 'notes' ? 'chevron-up' : 'chevron-down') as IonIconName} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {expandedSection === 'notes' && (
                      <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                        <TextInput
                          style={[styles.textArea, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border, color: colors.text }]}
                          value={tempNotes}
                          onChangeText={setTempNotes}
                          multiline
                          placeholder="Formulas/Notes..."
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                    )}
                  </View>

                  {/* 5. Photos Section */}
                  <View style={[styles.accordionCard, { backgroundColor: isDark ? "#1e293b" : "#FFFFFF", borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('photos')}>
                      <View style={styles.headerTitleRow}>
                        <Ionicons name="images-outline" size={20} color={colors.primary} />
                        <Text style={[styles.accordionTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}>Photos</Text>
                      </View>
                      <Ionicons name={(expandedSection === 'photos' ? 'chevron-up' : 'chevron-down') as IonIconName} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {expandedSection === 'photos' && (
                      <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                        <View style={styles.photoGrid}>
                          <TouchableOpacity style={[styles.addPhotoBox, { backgroundColor: colors.background, borderColor: colors.primary }]} onPress={handleImagePick}>
                            <MaterialCommunityIcons name="camera-plus" size={24} color={colors.primary} />
                            <Text style={[styles.addPhotoText, { color: colors.primary }]}>Add</Text>
                          </TouchableOpacity>
                          {tempPhotos.map((uri, i) => (
                            <View key={i} style={styles.imageWrapper}>
                              <Image source={{ uri }} style={styles.uploadedImg} />
                              <TouchableOpacity style={[styles.removeBtn, { backgroundColor: colors.card }]} onPress={() => removeImage(i)}>
                                <Ionicons name="close-circle" size={20} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
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

                </ScrollView>
              </View>
            </View>
          </Modal>

          <FilterInput
            isVisible={isFilterVisible}
            onClose={() => setIsFilterVisible(false)}
            backgroundColor={isDark ? "#1e293b" : "#F8FAFC"}
            textColor={isDark ? "#FFFFFF" : "#334155"}
            chipInactiveBackgroundColor={isDark ? "#334155" : "#FFFFFF"}
            sections={filterSections}
            onApply={(selections) => {
              setActiveFilters(selections);
              setIsFilterVisible(false);
            }}
            onReset={() => setActiveFilters({})}
            title="Search Filters"
            borderColor={colors.border}
          />


          {/* --- Delete History Item Modal --- */}
          <Modal visible={deleteModalVisible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
              <View style={styles.modalOverlayCenterDark}>
                <TouchableWithoutFeedback onPress={() => { }}>
                  <View style={[styles.editPopup, { backgroundColor: colors.card }]}>
                    <Text style={[styles.editTitle, { color: colors.text, marginBottom: 10 }]}>Confirm Delete</Text>
                    <Text style={{ color: colors.textSecondary, textAlign: 'left', marginBottom: 25, fontSize: 16 }}>
                      Are you sure?
                    </Text>

                    <View style={styles.actionRow}>
                      <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: '#EF4444' }]}
                onPress={confirmDeleteItem}
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
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

        </SafeAreaView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  masterContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  newVisitHeaderBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newVisitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  searchFixedWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    zIndex: 10,
  },
  searchBar: {
    width: '100%',
    marginBottom: 0,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  cardOuterWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardItem: {
    marginBottom: 0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  actionButton: {
    position: 'absolute',
    right: 15,
    top: 30,
    padding: 10,
    zIndex: 10,
  },
  modalOverlayDimmed: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalOverlayCenterDark: {
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
    zIndex: 9999, // Taake sab ke upar nazar aaye
    // niche koi aur position property (like bottom) nahi honi chahiye
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 10,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  editPopup: {
    borderRadius: 24,
    width: '92%',
    maxHeight: '90%',
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  accordionCard: {
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 1,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  accordionBody: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    marginTop: 10,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    borderRadius: 15,
    elevation: 8,
    zIndex: 9999,
    borderWidth: 1,
    padding: 5,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 12,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
  },
  selectedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagChip: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  tagChipText: {
    color: '#64748B',
  },
  quickSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginTop: 10,
    fontSize: 13,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },
  addPhotoBox: {
    width: 70,
    height: 70,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
  },
  imageWrapper: {
    width: 70,
    height: 70,
    position: 'relative',
  },
  uploadedImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 10,
    zIndex: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 20,
    marginTop: 15,
    paddingBottom: 10,
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeFiltersContainer: {
    marginTop: 10,
    marginBottom: 5,
    maxHeight: 45, // Container ki height set rakhen
  },
  activeFiltersScroll: {
    paddingHorizontal: 15, // Horizontal padding
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerDropdownIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerMenuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  customerDropdownMenu: {
    position: 'absolute',
    top: 45, // Button ke niche dikhanay ke liye
    right: 0,
    width: 180,
    borderRadius: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderWidth: 1,
    zIndex: 9999, // Taake list ke upar nazar aaye
    overflow: 'hidden',
  },
  customerDropDownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  dropDownName: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropDownPhone: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  mainScroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  noDataContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
  },
  cancelLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  updateBtn: {
    backgroundColor: '#5152B3',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  updateTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default History;
