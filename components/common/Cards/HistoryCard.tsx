import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import {
  GestureResponderEvent,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface HistoryCardProps {
  customer: {
    name: string;
    phone: string;
    img?: string;
  };
  services: string[];
  tags: string[];
  notes?: string;
  photos?: string[];
  date: string;
  time: string;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  shadowColor?: string;
  elevation?: number;
  titleColor?: string;
  phoneColor?: string;
  noteColor?: string;
  dateColor?: string;
  onMenuPress?: (event: GestureResponderEvent) => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  customer,
  services,
  tags,
  notes,
  photos,
  date,
  time,
  onPress,
  containerStyle,
  backgroundColor = '#FFFFFF',
  shadowColor = '#000',
  elevation = 2,
  titleColor = '#1E293B',
  phoneColor = '#64748B',
  noteColor = '#475569',
  dateColor = '#5152B3',
  onMenuPress,
}) => {
  const { isDark } = useTheme();

  const displayedServices = services?.slice(0, 3) || [];
  const displayedTags = tags?.slice(0, 2) || [];
  const displayedPhotos = photos?.slice(0, 4) || [];
  const morePhotosCount = (photos?.length || 0) - 4;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor, shadowColor, elevation },
        containerStyle,
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.nameBlock}>
            <Text style={[styles.nameText, { color: titleColor }]} numberOfLines={1}>
              {customer.name}
            </Text>
            <Text style={[styles.phoneText, { color: phoneColor }]}>{customer.phone}</Text>
          </View>
        </View>

        <View style={styles.chipsRow}>
          {displayedServices.map((service, index) => (
            <View key={`s-${index}`} style={[
              styles.serviceChip,
              isDark && { backgroundColor: '#312e81', borderColor: '#4338ca' }
            ]}>
              <Text style={[styles.serviceChipText, isDark && { color: '#e0e7ff' }]}>{service}</Text>
            </View>
          ))}
          {services?.length > 3 && (
             <Text style={[styles.moreText, { color: phoneColor }]}>+{services.length - 3} more</Text>
          )}
        </View>

        <View style={styles.chipsRow}>
          {displayedTags.map((tag, index) => (
            <View key={`t-${index}`} style={[
              styles.tagChip,
              isDark && { backgroundColor: '#064e3b', borderColor: '#065f46' }
            ]}>
              <Text style={[styles.tagChipText, isDark && { color: '#d1fae5' }]}>{tag}</Text>
            </View>
          ))}
          {tags?.length > 2 && (
            <Text style={[styles.moreText, { color: phoneColor }]}>+{tags.length - 2} more</Text>
          )}
        </View>

        {notes ? (
          <Text 
            style={[styles.notesText, { color: noteColor }]} 
            numberOfLines={2}
          >
            <Text style={[styles.noteLabel, isDark && { color: '#e2e8f0' }]}>Note: </Text>
            {notes}
          </Text>
        ) : null}

        {photos && photos.length > 0 && (
          <View style={styles.photoGrid}>
            {displayedPhotos.map((photo, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: photo }} style={styles.miniPhoto} />
                {index === 3 && morePhotosCount > 0 && (
                  <View style={styles.morePhotosOverlay}>
                    <Text style={styles.morePhotosText}>+{morePhotosCount}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.footerRow}>
          <View style={styles.dateBlock}>
            <Text style={[styles.dateText, { color: dateColor }]}>  {time} | {date}</Text>
          </View>
          {onMenuPress && (
            <TouchableOpacity 
              onPress={onMenuPress}
              style={styles.menuIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="dots-vertical" size={20} color={phoneColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contentContainer: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameBlock: {
    flex: 1,
    paddingRight: 10,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneText: {
    fontSize: 12,
    marginTop: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center'
  },
  serviceChip: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  serviceChipText: {
    fontSize: 10,
    color: '#5152B3',
    fontWeight: '600',
  },
  tagChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tagChipText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  moreText: {
    fontSize: 10,
    fontWeight: '700',
  },
  noteLabel: {
    fontWeight: 'bold',
    color: '#334155',
  },
  notesText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
    lineHeight: 18,
    flexShrink: 1,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
    width: '100%',
  },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative'
  },
  miniPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  morePhotosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  dateBlock: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timeText: {
    fontSize: 9,
    marginTop: 1,
  },
  menuIcon: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default HistoryCard;