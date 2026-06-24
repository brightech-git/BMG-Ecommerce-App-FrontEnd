// app/layout/PersistentBottomTab.tsx
// Floating bottom tab overlay for stack screens.
// Does NOT use useNavigation / useNavigationState because this component
// renders as a sibling of StackNavigator (outside any navigator screen).
// Instead it receives the current route as props (tracked via onStateChange
// in Route.tsx) and navigates via the navigationRef singleton.

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Image, Platform,
  Text, TouchableOpacity, View,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { IMAGES } from '../constants/Images';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { navigateToTab } from '../Navigations/navigationRef';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/* ─── Routes where this overlay must NOT appear ─────────────────── */
const HIDDEN_ROUTES = new Set([
  'DrawerNavigation',   // already has animated BottomTab via BottomNavigation
  'Onbording',
  'SignIn', 'SignUp', 'ForgotPassword', 'EnterCode',
  'SignUpVerifyOTP', 'GoogleContactUpload', 'GoogleContactVerify', 'NewPassword',
  'Products', 'ProductDetails',
  'Checkout', 'Payment', 'PaymentStatus',
  '',                   // initial empty state
]);

/* ─── Tab definitions ───────────────────────────────────────────── */
const TABS = [
  { label: 'Home',         icon: IMAGES.home,      route: 'Home' },
  { label: 'MyCart',       icon: IMAGES.shopping2, route: 'MyCart' },
  { label: 'Category',     icon: IMAGES.document,  route: 'Category' },
  { label: 'Wishlist',     icon: IMAGES.heart2,    route: 'Wishlist' },
  { label: 'Notification', icon: IMAGES.bell2,     route: 'Notification' },
] as const;

/* ─── Individual tab item (defined outside parent — stable identity) */
type TabItemProps = {
  tab: typeof TABS[number];
  isFocused: boolean;
  titleColor: string;
  onPress: () => void;
};

const TabItem = ({ tab, isFocused, titleColor, onPress }: TabItemProps) => {
  const iconTranslateY = useRef(new Animated.Value(isFocused ? -18 : 0)).current;

  useEffect(() => {
    Animated.timing(iconTranslateY, {
      toValue: isFocused ? -18 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        marginTop: isFocused ? 15 : 0,
        zIndex: 12,
      }}
    >
      <Animated.View style={{ transform: [{ translateY: iconTranslateY }] }}>
        <Image
          style={{
            width: 21,
            height: 21,
            tintColor: isFocused ? COLORS.white : titleColor,
            resizeMode: 'contain',
          }}
          source={tab.icon}
        />
      </Animated.View>
      {isFocused && (
        <Text style={{ ...FONTS.fontMedium, color: titleColor, fontSize: 11, zIndex: 15 }}>
          {tab.label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

/* ─── Props ─────────────────────────────────────────────────────── */
type Props = {
  rootRoute: string;   // top-level stack route name
  activeRoute: string; // deepest focused route name
  isDark: boolean;
  cardColor: string;
  titleColor: string;
  bgColor: string;
};

/* ─── Component ─────────────────────────────────────────────────── */
const PersistentBottomTab = ({
  rootRoute, activeRoute, isDark, cardColor, titleColor, bgColor,
}: Props) => {
  const [tabWidth, setTabWidth] = useState(wp('100%'));
  const tabWD = tabWidth < SIZES.container
    ? (tabWidth - 20) / 5
    : SIZES.container / 5;

  const circlePosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', (val) => {
      setTabWidth(val.window.width);
    });
    return () => sub?.remove?.();
  }, []);

  const activeIndex = TABS.findIndex((t) => t.route === activeRoute);

  useEffect(() => {
    if (activeIndex >= 0) {
      Animated.spring(circlePosition, {
        toValue: activeIndex * tabWD,
        useNativeDriver: true,
      }).start();
    }
  }, [activeIndex, tabWidth]);

  // Hide on excluded routes
  if (HIDDEN_ROUTES.has(rootRoute)) return null;

  const handleTabPress = (route: string, index: number) => {
    Animated.spring(circlePosition, {
      toValue: index * tabWD,
      useNativeDriver: true,
    }).start();
    navigateToTab(route);
  };

  return (
    <View
      style={[
        GlobalStyleSheet.container,
        {
          padding: 0,
          backgroundColor: bgColor,
          shadowColor: isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          position: 'absolute',
          width: 'auto',
          left: 10,
          right: 10,
          bottom: 10,
          borderRadius: 15,
          zIndex: 999,
          elevation: 10,
        },
        Platform.OS === 'ios' && { backgroundColor: cardColor, borderRadius: 15 },
      ]}
    >
      <View style={{ height: 65, backgroundColor: cardColor, borderRadius: 15 }}>
        <View
          style={[
            GlobalStyleSheet.container,
            { padding: 0, flexDirection: 'row', alignItems: 'center', paddingTop: 0, paddingBottom: 0 },
          ]}
        >
          {/* Sliding circle — hidden when not on a tab screen */}
          {activeIndex >= 0 && (
            <>
              <Animated.View
                style={{
                  width: tabWD, position: 'absolute',
                  transform: [{ translateX: circlePosition }],
                  zIndex: 1, top: -40, bottom: 0, left: 0,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <View style={{ height: 50, width: 50, borderRadius: 40, backgroundColor: COLORS.primary, marginTop: 5 }} />
              </Animated.View>

              {/* Circle shadow image */}
              <Animated.View
                style={{
                  position: 'absolute', height: '100%', width: tabWD,
                  alignItems: 'center', justifyContent: 'center',
                  transform: [{ translateX: circlePosition }],
                }}
              >
                <Image
                  style={{ tintColor: cardColor, resizeMode: 'contain', marginTop: Platform.OS === 'web' ? -70 : -80 }}
                  source={IMAGES.cricle}
                />
              </Animated.View>
            </>
          )}

          {TABS.map((tab, index) => (
            <TabItem
              key={tab.route}
              tab={tab}
              isFocused={activeIndex === index}
              titleColor={titleColor}
              onPress={() => handleTabPress(tab.route, index)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default PersistentBottomTab;
