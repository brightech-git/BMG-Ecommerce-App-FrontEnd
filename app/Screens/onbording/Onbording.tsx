// app/Screens/onbording/Onbording.tsx
import React, { useRef, useState, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import {
  View, Text, Image, Animated,
  StyleSheet, Platform, TouchableOpacity,
  ActivityIndicator, FlatList,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import Button from '../../components/Button/Button';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { AsyncStorageHelper } from '../../utils/AsyncStorageHelper';
import { callApi } from '../../api/apiClient';
import { ONBOARD } from '../../api/endpoints';
import { absUrl } from '../../utils/image';

interface AppBanner {
  id: number;
  title: string;
  subtitle: string;
  image_path: string;
}

const fetchBanners = () =>
  callApi<null, AppBanner[]>({ method: 'get', url: ONBOARD.BANNER_LIST });

/* ─── Dot indicator ──────────────────────────────────────────────── */
function Dot({ i, scrollValue }: { i: number; scrollValue: Animated.Value }) {
  const translateX = useMemo(() => scrollValue.interpolate({
    inputRange: [
      -SIZES.width + i * SIZES.width,
       i * SIZES.width,
       SIZES.width + i * SIZES.width,
    ],
    outputRange: [-20, 0, 20],
  }), [scrollValue, i]);

  return (
    <View style={styles.dot}>
      <Animated.View style={[styles.dotActive, { transform: [{ translateX }] }]} />
    </View>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────── */
type Props = StackScreenProps<RootStackParamList, 'Onbording'>;

const Onbording = ({ navigation }: Props) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const flatRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['app-banners'],
    queryFn: fetchBanners,
    staleTime: 10 * 60 * 1000,
  });

  const handleSkip = async () => {
    await AsyncStorageHelper.setOnboarded();
    navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigation' }] });
  };

  const handleNext = async () => {
    if (currentIndex === banners.length - 1) {
      await handleSkip();
      return;
    }
    const next = currentIndex + 1;
    flatRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrentIndex(next);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index ?? 0);
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isLoading && banners.length === 0) {
    AsyncStorageHelper.setOnboarded().then(() =>
      navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigation' }] })
    );
    return null;
  }

  const isLast = currentIndex === banners.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Full-screen image slides — no SafeAreaView so image fills edge-to-edge */}
      <Animated.FlatList
        ref={flatRef}
        data={banners}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <Image
            source={{ uri: absUrl(item.image_path) ?? '' }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        style={StyleSheet.absoluteFill}
      />

      {/* Buttons overlaid at the bottom of the image */}
      <View style={styles.overlay}>
        {/* Dots */}
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <Dot key={i} i={i} scrollValue={scrollX} />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ width: isLast ? '48%' : '32%' }}>
            <Button
              onPress={handleNext}
              title={isLast ? 'Get Started' : 'Next'}
              btnRounded
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  image: {
    width: SIZES.width,
    height: SIZES.height,
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    paddingHorizontal: 40,
    paddingTop: 16,
    // backgroundColor: 'rgba(0,0,0,0.28)',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    height: 10, width: 10, borderRadius: 5,
    marginHorizontal: 5, borderWidth: 1, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderColor: 'rgba(255,255,255,0.30)',
  },
  dotActive: {
    height: '100%', width: '100%',
    backgroundColor: COLORS.primary, borderRadius: 10,
  },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skip: {
    ...FONTS.fontRegular,
    fontSize: 16,
    color: COLORS.white,
    textDecorationLine: 'underline',
  },
});

export default Onbording;
