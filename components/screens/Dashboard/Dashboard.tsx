
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { THEME_COLORS } from '@/constants/Colors';
import NavButton from '../../common/Buttons/NavButton';
import NavHeader from '../../common/Buttons/NavHeader';
import ImageDesCard from '../../common/Cards/ImageDesCard';
import InfoCard from '../../common/Cards/InfoCard';

import { useTheme } from '@/contexts/ThemeContext';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useRecentVisitsList } from '@/hooks/useVisits';

interface DashboardProps {
  onBack?: () => void;
  onNavigateToWelcome?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: recentVisits, isLoading: isVisitsLoading } = useRecentVisitsList();

  const handleHomePress = () => { };
  const handleNewVisitPress = () => router.push('/(tabs)/new-visit');
  const handleHistoryPress = () => router.push('/(tabs)/history');
  const handleCustomersPress = () => router.push('/(tabs)/customers');
  const handleAddClientsPress = () => router.push('/(tabs)/add-clients');
  const handleProfilePress = () => router.push('/(tabs)/profile');

  const handleOtherPagePress = () => {
    router.push('/(tabs)/help');
  };

  // Computed Styles for Dark Mode
  const navContainerStyle = {
    paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
    height: 65 + insets.bottom,
    backgroundColor: isDark ? "#1e293b" : "#FFFFFF",
    borderTopColor: isDark ? "#334155" : "#F1F5F9"
  };

  const plusWrapperStyle = {
    backgroundColor: isDark ? "#1e293b" : "#FFFFFF",
    shadowColor: colors.shadow || '#000'
  };

  return (
    <LinearGradient
      colors={colors.bgGradient}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <NavHeader title="Dashboard !" showProfileIcon={false} titleColor={isDark ? "#FFFFFF" : "#5152B3"}>
          <View style={styles.headerIconsWrapper}>

          <TouchableOpacity onPress={handleOtherPagePress} activeOpacity={0.7}>
      <View style={[styles.secondaryIconContainer, { backgroundColor: isDark ? "#334155" : "#FFFFFF", borderColor: colors.border }]}>
        <Ionicons name="help-circle-outline" size={22} color={isDark ? "#FFFFFF" : colors.primary} />
      </View>
    </TouchableOpacity>

            <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.7}>
              <LinearGradient
                colors={THEME_COLORS.buttonGradient}
                style={styles.profileGradientIcon}
              >
                <Ionicons name="person" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </NavHeader>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.mainScroll,
            { paddingBottom: 100 + insets.bottom }
          ]}
        >
          <View style={styles.statsContainer}>
            <InfoCard
              title={isStatsLoading ? "..." : (stats?.total_clients || "0")}
              description="Total Clients"
              backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
              titleColor={isDark ? "#FFFFFF" : "#1E293B"}
              descriptionColor="#94A3B8"
              titleSize={26}
              margin={0}
              elevation={0}
              containerStyle={[styles.premiumInfoCard, { borderColor: colors.border }]}
            />
            <InfoCard
              title={isStatsLoading ? "..." : (stats?.active_clients || "0")}
              description="Active Clients"
              backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
              titleColor={isDark ? "#FFFFFF" : "#313867"}
              descriptionColor="#94A3B8"
              titleSize={26}
              margin={0}
              elevation={0}
              containerStyle={[styles.premiumInfoCard, { borderColor: colors.border }]}
            />
          </View>

          <View style={styles.sectionHeadingWrapper}>
            <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#5152B3" }]}>Recent Visits</Text>
            <TouchableOpacity onPress={handleHistoryPress}>
              <LinearGradient
                colors={THEME_COLORS.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.historyGradientBtn}
              >
                <Text style={styles.seeAllText}>View History</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.visitGrid}>
            {isVisitsLoading ? (
               <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : recentVisits && recentVisits.length > 0 ? (
              recentVisits.map((item: any, index: number) => {
                if (index % 2 === 0) {
                  const nextItem = recentVisits[index + 1];
                  return (
                    <View key={item.id} style={styles.row}>
                      <ImageDesCard
                        imageSource={item.client?.profile_image ? { uri: item.client.profile_image } : require('../../../assets/images/icon.png')}
                        title={item.client?.name || "Unknown"}
                        description={`Last visit: ${item.visit_date}`}
                        backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
                        titleStyle={[styles.visitTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}
                        descriptionStyle={[styles.visitDesc, { color: "#94A3B8" }]}
                        cardMargin={0}
                        cardPadding={12}
                        imageSize={40}
                        elevation={0}
                        containerStyle={[styles.visitCardBorder, { borderColor: colors.border, backgroundColor: isDark ? "#1e293b" : "#FFFFFF" }]}
                      />
                      {nextItem && (
                        <ImageDesCard
                          imageSource={nextItem.client?.profile_image ? { uri: nextItem.client.profile_image } : require('../../../assets/images/icon.png')}
                          title={nextItem.client?.name || "Unknown"}
                          description={`Last visit: ${nextItem.visit_date}`}
                          backgroundColor={isDark ? "#1e293b" : "#FFFFFF"}
                          titleStyle={[styles.visitTitle, { color: isDark ? "#FFFFFF" : "#1E293B" }]}
                          descriptionStyle={[styles.visitDesc, { color: "#94A3B8" }]}
                          cardMargin={0}
                          cardPadding={12}
                          imageSize={40}
                          elevation={0}
                          containerStyle={[styles.visitCardBorder, { borderColor: colors.border, backgroundColor: isDark ? "#1e293b" : "#FFFFFF" }]}
                        />
                      )}
                    </View>
                  );
                }
                return null;
              })
            ) : (
              <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>No recent visits found.</Text>
            )}
          </View>
        </ScrollView>

        <View style={[
          styles.bottomNavContainer,
          navContainerStyle
        ]}>
          <View style={styles.navBar}>
            <NavButton
              label="Home"
              icon={<MaterialCommunityIcons name="home-variant" size={24} />}
              isActive={true}
              onClick={handleHomePress}
              isDark={isDark}
            />
            <NavButton
              label="New Visit"
              icon={<MaterialCommunityIcons name="calendar-plus" size={24} />}
              isActive={false}
              onClick={handleNewVisitPress}
              isDark={isDark}
            />
            <View style={[styles.plusActionWrapper, plusWrapperStyle]}>
              <TouchableOpacity onPress={handleAddClientsPress} activeOpacity={0.8}>
                <LinearGradient
                  colors={THEME_COLORS.buttonGradient}
                  style={styles.plusGradientBtn}
                >
                  <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <NavButton
              label="History"
              icon={<MaterialCommunityIcons name="history" size={24} />}
              isActive={false}
              onClick={handleHistoryPress}
              isDark={isDark}
            />
            <NavButton
              label="Customers"
              icon={<FontAwesome5 name="users" size={20} />}
              isActive={false}
              onClick={handleCustomersPress}
              isDark={isDark}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerIconsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileGradientIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mainScroll: {
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 5,
  },
  premiumInfoCard: {
    width: '47.5%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 20,
    // backgroundColor: '#FFFFFF', // Removed to allow prop override
  },
  sectionHeadingWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5152B3',
  },
  historyGradientBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 25,
  },
  seeAllText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  visitGrid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  visitCardBorder: {
    width: '48.2%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  visitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'black',
    textTransform: "uppercase",
    marginTop: 8,
    textAlign: 'center',
  },
  visitDesc: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor removed to support dynamic theming
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingTop: 10,
    zIndex: 1000,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 50,
  },
  plusActionWrapper: {
    marginTop: -55,
    // backgroundColor removed to support dynamic theming
    padding: 6,
    borderRadius: 35,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 5,
  },
  plusGradientBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Dashboard;