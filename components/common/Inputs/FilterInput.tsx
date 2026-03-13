// import { THEME_COLORS } from '@/constants/Colors';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import React, { useState } from 'react';
// import {
//   LayoutAnimation,
//   Modal,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   UIManager,
//   View,
// } from 'react-native';

// // Android LayoutAnimation enable karne ke liye
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export type FilterType = 'selection' | 'text' | 'date-range';

// export interface FilterOption {
//   label: string;
//   value: string;
// }

// export interface FilterSection {
//   id: string;
//   title: string;
//   type?: FilterType;
//   options?: FilterOption[];
//   multiSelect?: boolean;
//   placeholder?: string;
// }

// interface FilterInputProps {
//   title?: string;
//   sections: FilterSection[];
//   onApply: (selections: Record<string, any>) => void;
//   onReset: () => void;
//   isVisible: boolean;
//   onClose: () => void;
//   backgroundColor?: string;
//   textColor?: string;
//   chipInactiveBackgroundColor?: string;
//   borderColor?: string;
// }

// const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// // Helper to parse "DD MMM YYYY" robustly
// const parseCalendarDate = (dateStr?: string): Date | null => {
//   if (!dateStr) return null;
//   const shortMonths: { [key: string]: number } = {
//     Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
//     Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
//   };
//   const parts = dateStr.split(' ');
//   // Check if format is likely "DD MMM YYYY"
//   if (parts.length === 3 && shortMonths[parts[1]] !== undefined) {
//     const day = parseInt(parts[0], 10);
//     const month = shortMonths[parts[1]];
//     const year = parseInt(parts[2], 10);
//     if (!isNaN(day) && !isNaN(year)) {
//       return new Date(year, month, day);
//     }
//   }
//   // Fallback
//   const d = new Date(dateStr);
//   return isNaN(d.getTime()) ? null : d;
// };

// const FilterInput: React.FC<FilterInputProps> = ({
//   title = "Filters",
//   sections,
//   onApply,
//   onReset,
//   isVisible,
//   onClose,
//   backgroundColor = '#FFFFFF',
//   textColor = '#334155',
//   chipInactiveBackgroundColor = '#FFFFFF',
//   borderColor = '#E2E8F0'
// }) => {
//   const [selections, setSelections] = useState<Record<string, any>>({});
//   const [expandedSection, setExpandedSection] = useState<string | null>(sections[0]?.id || null);

//   // Search query state for each section
//   const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

//   // Specific for Date Range interaction: 'start' or 'end'
//   const [activeDateInput, setActiveDateInput] = useState<'start' | 'end'>('start');
//   const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);


//   const toggleSection = (sectionId: string) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setExpandedSection(expandedSection === sectionId ? null : sectionId);
//   };

//   const handleSelect = (sectionId: string, value: string, multiSelect?: boolean) => {
//     setSelections((prev) => {
//       const current = prev[sectionId];
//       if (multiSelect) {
//         const list = Array.isArray(current) ? [...current] : [];
//         if (list.includes(value)) {
//           return { ...prev, [sectionId]: list.filter((item) => item !== value) };
//         } else {
//           return { ...prev, [sectionId]: [...list, value] };
//         }
//       } else {
//         return { ...prev, [sectionId]: current === value ? "" : value };
//       }
//     });
//   };

//   const handleTextChange = (sectionId: string, text: string) => {
//     setSelections((prev) => ({
//       ...prev,
//       [sectionId]: text
//     }));
//   };

//   const handleDateChange = (sectionId: string, type: 'start' | 'end', text: string) => {
//     setSelections((prev) => {
//       const current = prev[sectionId] || { start: '', end: '' };
//       return {
//         ...prev,
//         [sectionId]: { ...current, [type]: text }
//       };
//     });
//   };

//   const handleSearchChange = (sectionId: string, text: string) => {
//     setSearchQueries((prev) => ({
//       ...prev,
//       [sectionId]: text
//     }));
//   };

//   const handleReset = () => {
//     setSelections({});
//     setSearchQueries({});
//     onReset();
//   };

//   const handleApply = () => {
//     onApply(selections);
//     onClose();
//   };

//   return (
//     <Modal
//       visible={isVisible}
//       animationType="slide"
//       transparent={true}
//       statusBarTranslucent={true}
//       onRequestClose={onClose}
//     >
//       <Pressable style={styles.overlay} onPress={onClose}>
//         <Pressable
//           style={[styles.modalContent, { backgroundColor }]}
//           onPress={(e) => e.stopPropagation()}
//         >

//           {/* Header Section */}
//           <View style={[styles.header, { backgroundColor, borderBottomColor: borderColor }]}>
//             <View style={styles.dragHandle} />
//             <Text style={[styles.headerText, { color: textColor }]}>
//               {title}
//             </Text>
//           </View>

//           {/* Scrollable Body */}
//           <ScrollView
//             style={[styles.scrollBody, { backgroundColor }]}
//             contentContainerStyle={styles.scrollContent}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//           >
//             {sections.map((section) => {
//               const query = searchQueries[section.id] || "";
//               const sectionType = section.type || 'selection';

//               // Filter logic based on current search query (only for selection type)
//               const filteredOptions = (section.options || []).filter((opt) =>
//                 opt.label.toLowerCase().includes(query.toLowerCase())
//               );

//               const currentSelection = selections[section.id];

//               let selectionText = "";
//               if (sectionType === 'selection') {
//                 if (Array.isArray(currentSelection) && currentSelection.length > 0) {
//                   selectionText = `Selected: ${currentSelection.length}`;
//                 } else if (typeof currentSelection === 'string' && currentSelection) {
//                   selectionText = `Selected: ${currentSelection}`;
//                 }
//               } else if (sectionType === 'text' && currentSelection) {
//                 selectionText = currentSelection;
//               } else if (sectionType === 'date-range' && (currentSelection?.start || currentSelection?.end)) {
//                 selectionText = `${currentSelection.start || ''} - ${currentSelection.end || ''}`;
//               }

//               return (
//                 <View
//                   key={section.id}
//                   style={[styles.sectionWrapper, { borderColor: borderColor }]}
//                 >
//                   {/* Section Header (Accordion) */}
//                   <TouchableOpacity
//                     style={styles.accordionHeader}
//                     onPress={() => toggleSection(section.id)}
//                     activeOpacity={0.7}
//                   >
//                     <View>
//                       <Text style={[styles.sectionLabel, { color: textColor }]}>
//                         {section.title}
//                       </Text>
//                       {selectionText ? (
//                         <Text style={styles.activeSelectionText} numberOfLines={1}>
//                           {selectionText}
//                         </Text>
//                       ) : null}
//                     </View>
//                     <Ionicons
//                       name={expandedSection === section.id ? "chevron-up" : "chevron-down"}
//                       size={20}
//                       color={textColor}
//                     />
//                   </TouchableOpacity>

//                   {/* Section Content */}
//                   {expandedSection === section.id && (
//                     <View style={styles.expandedContent}>

//                       {/* Type: TEXT INPUT */}
//                       {sectionType === 'text' && (
//                         <View style={[styles.searchContainer, { backgroundColor: textColor === '#FFFFFF' ? '#334155' : '#FFFFFF', borderColor: borderColor || (textColor === '#FFFFFF' ? '#475569' : '#E2E8F0'), borderWidth: 1 }]}>
//                           <TextInput
//                             style={[styles.searchInput, { color: textColor, marginLeft: 0 }]}
//                             placeholder={section.placeholder || "Enter text..."}
//                             placeholderTextColor={textColor === '#FFFFFF' ? '#94A3B8' : '#94A3B8'}
//                             value={currentSelection || ''}
//                             onChangeText={(text) => handleTextChange(section.id, text)}
//                           />
//                         </View>
//                       )}

//                       {/* Type: DATE RANGE (Professional Calendar) */}
//                       {sectionType === 'date-range' && (
//                         <View>
//                           {/* Quick Filter Buttons */}
//                           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
//                             {['Today', 'Yesterday', 'Last 7 Days', 'This Week'].map((filter) => {
//                               const isActive = activeQuickFilter === filter;
//                               const activeBg = backgroundColor === '#FFFFFF' ? '#5152B3' : '#818CF8';
//                               const activeText = '#FFFFFF';
//                               const inactiveBorder = borderColor || '#E2E8F0';

//                               return (
//                                 <TouchableOpacity
//                                   key={filter}
//                                   style={{
//                                     paddingHorizontal: 12,
//                                     paddingVertical: 6,
//                                     borderRadius: 20,
//                                     borderWidth: 1,
//                                     borderColor: isActive ? activeBg : inactiveBorder,
//                                     backgroundColor: isActive ? activeBg : 'transparent'
//                                   }}
//                                   onPress={() => {
//                                     setActiveQuickFilter(filter);
//                                     const today = new Date();
//                                     let start = new Date();
//                                     let end = new Date();

//                                     if (filter === 'Today') {
//                                       start = today;
//                                       end = today;
//                                     } else if (filter === 'Yesterday') {
//                                       start.setDate(today.getDate() - 1);
//                                       end = new Date(start);
//                                     } else if (filter === 'Last 7 Days') {
//                                       start = new Date(today);
//                                       start.setDate(today.getDate() - 6);
//                                       end = today;
//                                     } else if (filter === 'This Week') {
//                                       const day = today.getDay() || 7; // 1=Mon, 7=Sun
//                                       if (day !== 1) {
//                                         start.setDate(today.getDate() - (day - 1));
//                                       }
//                                       end = today;
//                                     }

//                                     // Format to "D MMM YYYY"
//                                     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//                                     const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

//                                     handleDateChange(section.id, 'start', fmt(start));
//                                     handleDateChange(section.id, 'end', fmt(end));
//                                     setActiveDateInput('start'); // Reset focus
//                                   }}
//                                 >
//                                   <Text style={{
//                                     fontSize: 12,
//                                     fontWeight: '600',
//                                     color: isActive ? activeText : textColor
//                                   }}>
//                                     {filter}
//                                   </Text>
//                                 </TouchableOpacity>
//                               );
//                             })}
//                           </View>

//                           {/* Inputs Row */}
//                           <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
//                             {/* Start Date Input */}
//                             <TouchableOpacity
//                               style={[
//                                 styles.searchContainer,
//                                 {
//                                   flex: 1,
//                                   backgroundColor: activeDateInput === 'start'
//                                     ? (textColor === '#FFFFFF' ? '#475569' : '#EEF2FF') // Active tint
//                                     : (textColor === '#FFFFFF' ? '#334155' : '#FFFFFF'),
//                                   borderColor: activeDateInput === 'start'
//                                     ? (backgroundColor === '#FFFFFF' ? '#5152B3' : '#818CF8')
//                                     : (borderColor || (textColor === '#FFFFFF' ? '#475569' : '#E2E8F0')),
//                                   borderWidth: activeDateInput === 'start' ? 2 : 1
//                                 }
//                               ]}
//                               onPress={() => setActiveDateInput('start')}
//                             >
//                               <Ionicons
//                                 name="calendar-outline"
//                                 size={18}
//                                 color={activeDateInput === 'start' ? (backgroundColor === '#FFFFFF' ? '#5152B3' : '#818CF8') : "#94A3B8"}
//                                 style={{ marginRight: 8 }}
//                               />
//                               <TextInput
//                                 style={[styles.searchInput, { color: textColor, marginLeft: 0 }]}
//                                 placeholder="Start Date"
//                                 placeholderTextColor="#94A3B8"
//                                 value={currentSelection?.start || ''}
//                                 editable={false}
//                                 onPressIn={() => setActiveDateInput('start')} // Redundant but safe
//                               />
//                             </TouchableOpacity>

//                             {/* End Date Input */}
//                             <TouchableOpacity
//                               style={[
//                                 styles.searchContainer,
//                                 {
//                                   flex: 1,
//                                   backgroundColor: activeDateInput === 'end'
//                                     ? (textColor === '#FFFFFF' ? '#475569' : '#EEF2FF') // Active tint
//                                     : (textColor === '#FFFFFF' ? '#334155' : '#FFFFFF'),
//                                   borderColor: activeDateInput === 'end'
//                                     ? (backgroundColor === '#FFFFFF' ? '#5152B3' : '#818CF8')
//                                     : (borderColor || (textColor === '#FFFFFF' ? '#475569' : '#E2E8F0')),
//                                   borderWidth: activeDateInput === 'end' ? 2 : 1
//                                 }
//                               ]}
//                               onPress={() => setActiveDateInput('end')}
//                             >
//                               <Ionicons
//                                 name="calendar-outline"
//                                 size={18}
//                                 color={activeDateInput === 'end' ? (backgroundColor === '#FFFFFF' ? '#5152B3' : '#818CF8') : "#94A3B8"}
//                                 style={{ marginRight: 8 }}
//                               />
//                               <TextInput
//                                 style={[styles.searchInput, { color: textColor, marginLeft: 0 }]}
//                                 placeholder="End Date"
//                                 placeholderTextColor="#94A3B8"
//                                 value={currentSelection?.end || ''}
//                                 editable={false}
//                                 onPressIn={() => setActiveDateInput('end')}
//                               />
//                             </TouchableOpacity>
//                           </View>

//                           {/* Calendar UI */}
//                           <CalendarView
//                             startDate={currentSelection?.start}
//                             endDate={currentSelection?.end}
//                             // Pass Start Date as minimum valid date when selecting End Date
//                             minDate={activeDateInput === 'end' ? currentSelection?.start : undefined}
//                             onSelectDate={(date) => {
//                               const newDate = parseCalendarDate(date);
//                               const currentStartStr = currentSelection?.start;
//                               const dStart = parseCalendarDate(currentStartStr);
//                               const dCurrentEnd = parseCalendarDate(currentSelection?.end);

//                               if (!newDate) return;

//                               if (activeDateInput === 'start') {
//                                 handleDateChange(section.id, 'start', date);
//                                 // If new Start is after old End, clear End
//                                 if (dCurrentEnd && newDate > dCurrentEnd) {
//                                   handleDateChange(section.id, 'end', '');
//                                 }
//                                 setActiveDateInput('end');
//                               } else {
//                                 // When picking End Date
//                                 // If new Date is before Start, treat as correction (swap or restart)
//                                 if (dStart && newDate < dStart) {
//                                   handleDateChange(section.id, 'start', date);
//                                   handleDateChange(section.id, 'end', '');
//                                   setActiveDateInput('end');
//                                 } else {
//                                   handleDateChange(section.id, 'end', date);
//                                 }
//                               }
//                             }}
//                             textColor={textColor}
//                             accentColor={backgroundColor === '#FFFFFF' ? '#5152B3' : '#818CF8'}
//                           />
//                         </View>
//                       )}

//                       {/* Type: SELECTION */}
//                       {sectionType === 'selection' && (
//                         <>
//                           {/* Search Input for the specific section */}
//                           <View
//                             style={[
//                               styles.searchContainer,
//                               {
//                                 backgroundColor: textColor === '#FFFFFF' ? '#334155' : '#FFFFFF',
//                                 borderColor: borderColor || (textColor === '#FFFFFF' ? '#475569' : '#E2E8F0'),
//                                 borderWidth: 1
//                               }
//                             ]}
//                           >
//                             <Ionicons name="search" size={16} color="#94A3B8" />
//                             <TextInput
//                               style={[styles.searchInput, { color: textColor }]}
//                               placeholder={`Search ${section.title}...`}
//                               placeholderTextColor="#94A3B8"
//                               value={query}
//                               onChangeText={(text) => handleSearchChange(section.id, text)}
//                             />
//                           </View>

//                           {/* Chips / Options Grid */}
//                           <View style={styles.optionsWrapper}>
//                             {filteredOptions.length > 0 ? (
//                               filteredOptions.map((option) => {
//                                 let isSelected = false;
//                                 if (section.multiSelect && Array.isArray(currentSelection)) {
//                                   isSelected = currentSelection.includes(option.value);
//                                 } else {
//                                   isSelected = currentSelection === option.value;
//                                 }

//                                 return (
//                                   <TouchableOpacity
//                                     key={option.value}
//                                     activeOpacity={0.7}
//                                     onPress={() => handleSelect(section.id, option.value, section.multiSelect)}
//                                     style={[
//                                       styles.chip,
//                                       isSelected
//                                         ? styles.chipActive
//                                         : [
//                                           styles.chipInactive,
//                                           {
//                                             backgroundColor: chipInactiveBackgroundColor,
//                                             borderColor: borderColor || '#E2E8F0'
//                                           }
//                                         ]
//                                     ]}
//                                   >
//                                     <Text
//                                       style={[
//                                         styles.chipText,
//                                         isSelected ? styles.textActive : [styles.textInactive, { color: textColor }]
//                                       ]}
//                                     >
//                                       {option.label}
//                                     </Text>
//                                   </TouchableOpacity>
//                                 );
//                               })
//                             ) : (
//                               <Text style={styles.noResultsText}>
//                                 No results found
//                               </Text>
//                             )}
//                           </View>
//                         </>
//                       )}
//                     </View>
//                   )}
//                 </View>
//               );
//             })}
//           </ScrollView>

//           {/* Footer Action Buttons */}
//           <View style={[styles.footer, { backgroundColor }]}>
//             <TouchableOpacity activeOpacity={0.8} onPress={handleApply}>
//               <LinearGradient
//                 colors={THEME_COLORS.buttonGradient}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={styles.primaryBtnGradient}
//               >
//                 <Text style={styles.primaryBtnText}>
//                   Apply Filters
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.secondaryBtn} onPress={handleReset}>
//               <Text style={styles.secondaryBtnText}>
//                 Reset All
//               </Text>
//             </TouchableOpacity>
//             <View style={styles.safeBottomSpacer} />
//           </View>

//         </Pressable>
//       </Pressable>
//     </Modal >
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     maxHeight: '85%',
//     width: '100%',
//   },
//   header: {
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     borderBottomWidth: 1,
//   },
//   dragHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: '#E2E8F0',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: '800',
//   },
//   scrollBody: {
//     flex: 0,
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingTop: 10,
//     paddingBottom: 20,
//   },
//   sectionWrapper: {
//     marginBottom: 12,
//     borderWidth: 1,
//     borderRadius: 18,
//     overflow: 'hidden',
//   },
//   accordionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//   },
//   sectionLabel: {
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   activeSelectionText: {
//     fontSize: 11,
//     color: '#5152B3',
//     fontWeight: '600',
//     marginTop: 2,
//   },
//   expandedContent: {
//     paddingHorizontal: 15,
//     paddingBottom: 15,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     height: 40,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 14,
//   },
//   optionsWrapper: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   chip: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 12,
//     borderWidth: 1,
//   },
//   chipInactive: {
//     borderColor: '#E2E8F0',
//   },
//   chipActive: {
//     borderColor: '#5152B3',
//     backgroundColor: '#5152B3',
//   },
//   chipText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   textInactive: {
//     color: '#64748B',
//   },
//   textActive: {
//     color: '#FFFFFF',
//   },
//   noResultsText: {
//     fontSize: 12,
//     color: '#94A3B8',
//     fontStyle: 'italic',
//     paddingLeft: 5,
//   },
//   footer: {
//     paddingHorizontal: 25,
//     paddingTop: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#F1F5F9',
//   },
//   primaryBtnGradient: {
//     paddingVertical: 14,
//     borderRadius: 25,
//     alignItems: 'center',
//     marginBottom: 10,
//     elevation: 3,
//   },
//   primaryBtnText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   secondaryBtn: {
//     paddingVertical: 8,
//     alignItems: 'center',
//   },
//   secondaryBtnText: {
//     color: '#94A3B8',
//     fontSize: 14,
//     fontWeight: '600',
//     textDecorationLine: 'underline',
//   },
//   safeBottomSpacer: {
//     height: Platform.OS === 'ios' ? 40 : 50,
//   },
//   // Calendar Styles
//   calendarContainer: {
//     marginTop: 20,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#E2E8F0',
//   },
//   calendarHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15
//   },
//   navBtn: {
//     padding: 5
//   },
//   monthTitle: {
//     fontSize: 16,
//     fontWeight: 'bold'
//   },
//   weekRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 10
//   },
//   weekDayText: {
//     width: '14.28%',
//     textAlign: 'center',
//     fontSize: 12,
//     fontWeight: '600'
//   },
//   daysGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   dayCell: {
//     width: '14.28%', // 100/7
//     aspectRatio: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 5
//   },
//   dayText: {
//     fontSize: 14,
//     fontWeight: '500'
//   },
// });

// // --- Calendar Sub-Component & Logic ---



// const CalendarView: React.FC<{
//   startDate?: string;
//   endDate?: string;
//   minDate?: string; // New prop for disabling past dates
//   onSelectDate: (date: string) => void;
//   textColor: string;
//   accentColor: string;
// }> = ({ startDate, endDate, minDate, onSelectDate, textColor, accentColor }) => {
//   const [viewDate, setViewDate] = useState(new Date());

//   // Auto-jump to start date when it changes (e.g., from Quick Filter)
//   React.useEffect(() => {
//     if (startDate) {
//       const d = parseCalendarDate(startDate);
//       if (d) {
//         setViewDate(d);
//       }
//     }
//   }, [startDate]);

//   const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
//   const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

//   const handlePrevMonth = () => {
//     setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
//   };

//   const handleNextMonth = () => {
//     setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
//   };

//   const renderDays = () => {
//     const year = viewDate.getFullYear();
//     const month = viewDate.getMonth();
//     const daysInMonth = getDaysInMonth(year, month);
//     const firstDay = getFirstDayOfMonth(year, month);

//     // Parse start/end for comparison
//     const dStart = parseCalendarDate(startDate);
//     const dEnd = parseCalendarDate(endDate);
//     const dMin = parseCalendarDate(minDate);

//     const days = [];
//     // Empty slots for prev month
//     for (let i = 0; i < firstDay; i++) {
//       days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
//     }

//     // Days
//     for (let i = 1; i <= daysInMonth; i++) {
//       const dateObj = new Date(year, month, i);
//       const dateStr = `${i} ${MONTHS[month].substring(0, 3)} ${year}`; // Format: 1 Jan 2026

//       const isStart = dStart && dateObj.toDateString() === dStart.toDateString();
//       const isEnd = dEnd && dateObj.toDateString() === dEnd.toDateString();
//       const isInRange = dStart && dEnd && dateObj > dStart && dateObj < dEnd;

//       // Strict equality check for dMin to allow selecting the same day
//       const isBeforeMin = dMin && dateObj < dMin && dateObj.toDateString() !== dMin.toDateString();
//       const isDisabled = !!isBeforeMin;

//       days.push(
//         <TouchableOpacity
//           key={i}
//           style={[
//             styles.dayCell,
//             (isStart || isEnd) && { backgroundColor: accentColor, borderRadius: 20 },
//             isInRange && { backgroundColor: accentColor + '33' }, // Transparent accent
//             isDisabled && { opacity: 0.3 } // Visual disabled state
//           ]}
//           disabled={isDisabled}
//           onPress={() => !isDisabled && onSelectDate(dateStr)}
//         >
//           <Text style={[
//             styles.dayText,
//             { color: (isStart || isEnd) ? '#FFF' : textColor },
//             isInRange && { color: accentColor },
//             isDisabled && { color: '#94A3B8' }
//           ]}>
//             {i}
//           </Text>
//         </TouchableOpacity>
//       );
//     }
//     return days;
//   };

//   return (
//     <View style={styles.calendarContainer}>
//       <View style={styles.calendarHeader}>
//         <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
//           <Ionicons name="chevron-back" size={20} color={textColor} />
//         </TouchableOpacity>
//         <Text style={[styles.monthTitle, { color: textColor }]}>
//           {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
//         </Text>
//         <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
//           <Ionicons name="chevron-forward" size={20} color={textColor} />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.weekRow}>
//         {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
//           <Text key={d} style={[styles.weekDayText, { color: '#94A3B8' }]}>{d}</Text>
//         ))}
//       </View>

//       <View style={styles.daysGrid}>
//         {renderDays()}
//       </View>
//     </View>
//   );
// };

// export default FilterInput;

import { THEME_COLORS } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
  Animated,
  Dimensions,
  PanResponder,
  KeyboardAvoidingView,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type FilterType = 'selection' | 'text' | 'date-range';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSection {
  id: string;
  title: string;
  type?: FilterType;
  options?: FilterOption[];
  multiSelect?: boolean;
  placeholder?: string;
}

interface FilterInputProps {
  title?: string;
  sections: FilterSection[];
  onApply: (selections: Record<string, any>) => void;
  onReset: () => void;
  isVisible: boolean;
  onClose: () => void;
  backgroundColor?: string;
  textColor?: string;
  chipInactiveBackgroundColor?: string;
  borderColor?: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parseCalendarDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const shortMonths: { [key: string]: number } = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  const parts = dateStr.split(' ');
  if (parts.length === 3 && shortMonths[parts[1]] !== undefined) {
    const day = parseInt(parts[0], 10);
    const month = shortMonths[parts[1]];
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const FilterInput: React.FC<FilterInputProps> = ({
  title = "Filters",
  sections,
  onApply,
  onReset,
  isVisible,
  onClose,
  backgroundColor = '#FFFFFF',
  textColor = '#334155',
  chipInactiveBackgroundColor = '#FFFFFF',
  borderColor = '#E2E8F0'
}) => {
  const [selections, setSelections] = useState<Record<string, any>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(sections[0]?.id || null);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [activeDateInput, setActiveDateInput] = useState<'start' | 'end'>('start');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  // --- Animation & Gesture Logic ---
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 150,
      }).start();
    }
  }, [isVisible, translateY]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      translateY.setValue(SCREEN_HEIGHT);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // --- Filter Functionality ---
  const toggleSection = (sectionId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleSelect = (sectionId: string, value: string, multiSelect?: boolean) => {
    setSelections((prev) => {
      const current = prev[sectionId];
      if (multiSelect) {
        const list = Array.isArray(current) ? [...current] : [];
        if (list.includes(value)) {
          return { ...prev, [sectionId]: list.filter((item) => item !== value) };
        } else {
          return { ...prev, [sectionId]: [...list, value] };
        }
      } else {
        return { ...prev, [sectionId]: current === value ? "" : value };
      }
    });
  };

  const handleTextChange = (sectionId: string, text: string) => {
    setSelections((prev) => ({ ...prev, [sectionId]: text }));
  };

  const handleDateChange = (sectionId: string, type: 'start' | 'end', text: string) => {
    setSelections((prev) => {
      const current = prev[sectionId] || { start: '', end: '' };
      return { ...prev, [sectionId]: { ...current, [type]: text } };
    });
  };

  const handleSearchChange = (sectionId: string, text: string) => {
    setSearchQueries((prev) => ({ ...prev, [sectionId]: text }));
  };

  const handleReset = () => {
    setSelections({});
    setSearchQueries({});
    onReset();
  };

  const handleApply = () => {
    onApply(selections);
    handleClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.modalContent,
              { backgroundColor, transform: [{ translateY }] }
            ]}
          >
            {/* Header / Swipe Handle Area */}
            <View {...panResponder.panHandlers} style={styles.swipeHandleArea}>
              <View style={styles.dragHandle} />
              <View style={[styles.header, { backgroundColor, borderBottomColor: borderColor }]}>
                <Text style={[styles.headerText, { color: textColor }]}>{title}</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close-circle" size={28} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={[styles.scrollBody, { backgroundColor }]}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {sections.map((section) => {
                const query = searchQueries[section.id] || "";
                const sectionType = section.type || 'selection';
                const filteredOptions = (section.options || []).filter((opt) =>
                  opt.label.toLowerCase().includes(query.toLowerCase())
                );
                const currentSelection = selections[section.id];
                let selectionText = "";

                if (sectionType === 'selection') {
                  if (Array.isArray(currentSelection) && currentSelection.length > 0) {
                    selectionText = `Selected: ${currentSelection.length}`;
                  } else if (typeof currentSelection === 'string' && currentSelection) {
                    selectionText = `Selected: ${currentSelection}`;
                  }
                } else if (sectionType === 'text' && currentSelection) {
                  selectionText = currentSelection;
                } else if (sectionType === 'date-range' && (currentSelection?.start || currentSelection?.end)) {
                  selectionText = `${currentSelection.start || ''} - ${currentSelection.end || ''}`;
                }

                return (
                  <View key={section.id} style={[styles.sectionWrapper, { borderColor: borderColor }]}>
                    <TouchableOpacity
                      style={styles.accordionHeader}
                      onPress={() => toggleSection(section.id)}
                      activeOpacity={0.7}
                    >
                      <View>
                        <Text style={[styles.sectionLabel, { color: textColor }]}>{section.title}</Text>
                        {selectionText ? (
                          <Text style={styles.activeSelectionText} numberOfLines={1}>{selectionText}</Text>
                        ) : null}
                      </View>
                      <Ionicons
                        name={expandedSection === section.id ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={textColor}
                      />
                    </TouchableOpacity>

                    {expandedSection === section.id && (
                      <View style={styles.expandedContent}>
                        {sectionType === 'text' && (
                          <View style={[styles.searchContainer, { backgroundColor: textColor === '#FFFFFF' ? '#334155' : '#FFFFFF', borderColor: borderColor || (textColor === '#FFFFFF' ? '#475569' : '#E2E8F0'), borderWidth: 1 }]}>
                            <TextInput
                              style={[styles.searchInput, { color: textColor, marginLeft: 0 }]}
                              placeholder={section.placeholder || "Enter text..."}
                              placeholderTextColor="#94A3B8"
                              value={currentSelection || ''}
                              onChangeText={(text) => handleTextChange(section.id, text)}
                            />
                          </View>
                        )}

                        {sectionType === 'date-range' && (
                          <View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
                              {['Today', 'Yesterday', 'Last 7 Days', 'This Week'].map((filter) => {
                                const isActive = activeQuickFilter === filter;
                                const activeBg = backgroundColor === '#FFFFFF' ? '#5152B3' : '#818CF8';
                                return (
                                  <TouchableOpacity
                                    key={filter}
                                    style={{
                                      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
                                      borderColor: isActive ? activeBg : (borderColor || '#E2E8F0'),
                                      backgroundColor: isActive ? activeBg : 'transparent'
                                    }}
                                    onPress={() => {
                                      setActiveQuickFilter(filter);
                                      const today = new Date();
                                      let start = new Date();
                                      let end = new Date();
                                      if (filter === 'Today') { start = today; end = today; }
                                      else if (filter === 'Yesterday') { start.setDate(today.getDate() - 1); end = new Date(start); }
                                      else if (filter === 'Last 7 Days') { start.setDate(today.getDate() - 6); end = today; }
                                      else if (filter === 'This Week') { 
                                        const day = today.getDay() || 7; 
                                        if (day !== 1) start.setDate(today.getDate() - (day - 1));
                                        end = today; 
                                      }
                                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                      const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
                                      handleDateChange(section.id, 'start', fmt(start));
                                      handleDateChange(section.id, 'end', fmt(end));
                                      setActiveDateInput('start');
                                    }}
                                  >
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: isActive ? '#FFF' : textColor }}>{filter}</Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>

                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                              {(['start', 'end'] as const).map((type) => (
                                <TouchableOpacity
                                  key={type}
                                  style={[styles.searchContainer, {
                                    flex: 1,
                                    backgroundColor: activeDateInput === type ? (textColor === '#FFFFFF' ? '#475569' : '#EEF2FF') : (textColor === '#FFFFFF' ? '#334155' : '#FFFFFF'),
                                    borderColor: activeDateInput === type ? (backgroundColor === '#FFFFFF' ? '#5152B3' : '#818CF8') : (borderColor || (textColor === '#FFFFFF' ? '#475569' : '#E2E8F0')),
                                    borderWidth: activeDateInput === type ? 2 : 1
                                  }]}
                                  onPress={() => setActiveDateInput(type)}
                                >
                                  <Ionicons name="calendar-outline" size={18} color={activeDateInput === type ? (backgroundColor === '#FFFFFF' ? '#5152B3' : '#818CF8') : "#94A3B8"} style={{ marginRight: 8 }} />
                                  <TextInput
                                    style={[styles.searchInput, { color: textColor, marginLeft: 0 }]}
                                    placeholder={type === 'start' ? "Start Date" : "End Date"}
                                    placeholderTextColor="#94A3B8"
                                    value={currentSelection?.[type] || ''}
                                    editable={false}
                                  />
                                </TouchableOpacity>
                              ))}
                            </View>

                            <CalendarView
                              startDate={currentSelection?.start}
                              endDate={currentSelection?.end}
                              minDate={activeDateInput === 'end' ? currentSelection?.start : undefined}
                              onSelectDate={(date) => {
                                const newDate = parseCalendarDate(date);
                                const dStart = parseCalendarDate(currentSelection?.start);
                                const dCurrentEnd = parseCalendarDate(currentSelection?.end);
                                if (!newDate) return;

                                if (activeDateInput === 'start') {
                                  handleDateChange(section.id, 'start', date);
                                  if (dCurrentEnd && newDate > dCurrentEnd) handleDateChange(section.id, 'end', '');
                                  setActiveDateInput('end');
                                } else {
                                  if (dStart && newDate < dStart) {
                                    handleDateChange(section.id, 'start', date);
                                    handleDateChange(section.id, 'end', '');
                                    setActiveDateInput('end');
                                  } else {
                                    handleDateChange(section.id, 'end', date);
                                  }
                                }
                              }}
                              textColor={textColor}
                              accentColor={backgroundColor === '#FFFFFF' ? '#5152B3' : '#818CF8'}
                            />
                          </View>
                        )}

                        {sectionType === 'selection' && (
                          <>
                            <View style={[styles.searchContainer, { backgroundColor: textColor === '#FFFFFF' ? '#334155' : '#FFFFFF', borderColor: borderColor || (textColor === '#FFFFFF' ? '#475569' : '#E2E8F0'), borderWidth: 1 }]}>
                              <Ionicons name="search" size={16} color="#94A3B8" />
                              <TextInput
                                style={[styles.searchInput, { color: textColor }]}
                                placeholder={`Search ${section.title}...`}
                                placeholderTextColor="#94A3B8"
                                value={query}
                                onChangeText={(text) => handleSearchChange(section.id, text)}
                              />
                            </View>
                            <View style={styles.optionsWrapper}>
                              {filteredOptions.length > 0 ? filteredOptions.map((option) => {
                                const isSelected = section.multiSelect && Array.isArray(currentSelection) ? currentSelection.includes(option.value) : currentSelection === option.value;
                                return (
                                  <TouchableOpacity
                                    key={option.value}
                                    activeOpacity={0.7}
                                    onPress={() => handleSelect(section.id, option.value, section.multiSelect)}
                                    style={[styles.chip, isSelected ? styles.chipActive : [styles.chipInactive, { backgroundColor: chipInactiveBackgroundColor, borderColor: borderColor || '#E2E8F0' }]]}
                                  >
                                    <Text style={[styles.chipText, isSelected ? styles.textActive : [styles.textInactive, { color: textColor }]]}>{option.label}</Text>
                                  </TouchableOpacity>
                                );
                              }) : <Text style={styles.noResultsText}>No results found</Text>}
                            </View>
                          </>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor }]}>
              <TouchableOpacity activeOpacity={0.8} onPress={handleApply}>
                <LinearGradient colors={THEME_COLORS.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtnGradient}>
                  <Text style={styles.primaryBtnText}>Apply Filters</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleReset}>
                <Text style={styles.secondaryBtnText}>Reset All</Text>
              </TouchableOpacity>
              <View style={styles.safeBottomSpacer} />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: SCREEN_HEIGHT * 0.85,
    width: '100%',
  },
  swipeHandleArea: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    width: '100%',
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollBody: {
    flex: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  sectionWrapper: {
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  activeSelectionText: {
    fontSize: 11,
    color: '#5152B3',
    fontWeight: '600',
    marginTop: 2,
  },
  expandedContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  optionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipInactive: {
    borderColor: '#E2E8F0',
  },
  chipActive: {
    borderColor: '#5152B3',
    backgroundColor: '#5152B3',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInactive: {
    color: '#64748B',
  },
  textActive: {
    color: '#FFFFFF',
  },
  noResultsText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingLeft: 5,
  },
  footer: {
    paddingHorizontal: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryBtnGradient: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  safeBottomSpacer: {
    height: Platform.OS === 'ios' ? 40 : 50,
  },
  calendarContainer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  navBtn: {
    padding: 5
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600'
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500'
  },
});

const CalendarView: React.FC<{
  startDate?: string;
  endDate?: string;
  minDate?: string;
  onSelectDate: (date: string) => void;
  textColor: string;
  accentColor: string;
}> = ({ startDate, endDate, minDate, onSelectDate, textColor, accentColor }) => {
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    if (startDate) {
      const d = parseCalendarDate(startDate);
      if (d) setViewDate(d);
    }
  }, [startDate]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const dStart = parseCalendarDate(startDate);
    const dEnd = parseCalendarDate(endDate);
    const dMin = parseCalendarDate(minDate);

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const dateStr = `${i} ${MONTHS[month].substring(0, 3)} ${year}`;
      const isStart = dStart && dateObj.toDateString() === dStart.toDateString();
      const isEnd = dEnd && dateObj.toDateString() === dEnd.toDateString();
      const isInRange = dStart && dEnd && dateObj > dStart && dateObj < dEnd;
      const isBeforeMin = dMin && dateObj < dMin && dateObj.toDateString() !== dMin.toDateString();
      const isDisabled = !!isBeforeMin;

      days.push(
        <TouchableOpacity
          key={i}
          style={[styles.dayCell, (isStart || isEnd) && { backgroundColor: accentColor, borderRadius: 20 }, isInRange && { backgroundColor: accentColor + '33' }, isDisabled && { opacity: 0.3 }]}
          disabled={isDisabled}
          onPress={() => !isDisabled && onSelectDate(dateStr)}
        >
          <Text style={[styles.dayText, { color: (isStart || isEnd) ? '#FFF' : textColor }, isInRange && { color: accentColor }, isDisabled && { color: '#94A3B8' }]}>{i}</Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}><Ionicons name="chevron-back" size={20} color={textColor} /></TouchableOpacity>
        <Text style={[styles.monthTitle, { color: textColor }]}>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}><Ionicons name="chevron-forward" size={20} color={textColor} /></TouchableOpacity>
      </View>
      <View style={styles.weekRow}>{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <Text key={d} style={[styles.weekDayText, { color: '#94A3B8' }]}>{d}</Text>)}</View>
      <View style={styles.daysGrid}>{renderDays()}</View>
    </View>
  );
};

export default FilterInput;
