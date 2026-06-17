import React, {useCallback} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Text,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useQueryClient} from '@tanstack/react-query';

import AppHeader from '../../components/common/AppHeader';
import HeroBannerSection from '../../components/home/HeroBannerSection';
import GridBannerSection from '../../components/home/GridBannerSection';
import RecentlyViewedSection from '../../components/home/RecentlyViewedSection';

import {useBudgetBanners} from '../../hooks/useBudgetBanners';
import {colors} from '../../theme/theme';

// ── HomeScreen ────────────────────────────────────────────────────────────────
const HomeScreen = ({navigation}) => {
  const queryClient = useQueryClient();
  const {data: budgetBannerResponse, isLoading, isRefetching} = useBudgetBanners();

  const handleBannerPress = useCallback(
    (params, meta) => {
      if (!params && !meta?.filterId) return;
      navigation.navigate('Products', {
        filters: params,
        filterId: meta?.filterId ?? null,
        title: meta?.alt || 'Products',
      });
    },
    [navigation],
  );

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({queryKey: ['budget-banners']});
    queryClient.invalidateQueries({queryKey: ['recentlyViewed']});
    queryClient.invalidateQueries({queryKey: ['todayRate']});
  }, [queryClient]);

  const bannerMap = budgetBannerResponse?.data ?? {};
  const bannerEntries = Object.entries(bannerMap)
    .filter(([, banner]) => banner?.isVisible !== false)
    // Respect the configured display order (heroBanner → bmgWorld → …)
    .sort(
      ([, a], [, b]) =>
        (a?.displayOrder ?? 999) - (b?.displayOrder ?? 999),
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor={colors.headerBg} barStyle="light-content" />
      <AppHeader navigation={navigation} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }>
        {isLoading ? (
          <View style={styles.loadingWrap} />
        ) : bannerEntries.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No content available</Text>
          </View>
        ) : (
          bannerEntries.map(([key, banner]) => {
            const parsedBanner = {
              ...banner,
              visibleCount:
                typeof banner.visibleCount === 'string'
                  ? JSON.parse(banner.visibleCount)
                  : banner.visibleCount,
            };

            if (parsedBanner.isGrid) {
              return (
                <GridBannerSection
                  key={banner.imageKey || key}
                  banner={parsedBanner}
                  onBannerPress={handleBannerPress}
                />
              );
            }

            return (
              <HeroBannerSection
                key={banner.imageKey || key}
                banner={parsedBanner}
                onBannerPress={handleBannerPress}
              />
            );
          })
        )}

        <RecentlyViewedSection navigation={navigation} />
        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.headerBg},
  scroll: {flex: 1, backgroundColor: colors.background},
  scrollContent: {flexGrow: 1},
  loadingWrap: {padding: 8},
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {fontSize: 14, color: colors.textSecondary},
  bottomPad: {height: 24},
});
