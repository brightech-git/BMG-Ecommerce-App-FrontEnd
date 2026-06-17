/**
 * MobileDrawerMenu — slide-in drawer with header-nav sections.
 * Mirrors the website's Mobilemenu component.
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useHeaderNav} from '../../hooks/useHeaderNav';
import {colors, fonts, radius, shadows} from '../../theme/theme';
import Logo from './Logo';

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');
const DRAWER_W = SCREEN_W * 0.82;
const IMG_BASE = 'https://app.bmgjewellers.com';

const MobileDrawerMenu = ({visible, onClose, navigation}) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_W)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const {data: navData, isLoading} = useHeaderNav();
  const [expandedIdx, setExpandedIdx] = useState(null);

  const menuSections = navData?.menuSections ?? [];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_W,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleItemPress = item => {
    const filters = {};
    if (item.keyName && item.keyValue !== undefined) {
      filters[item.keyName] = item.keyValue;
    }
    if (item.menuKey && item.value) {
      filters[item.menuKey] = item.value;
    }
    if (item.filterId) {
      filters.filterId = item.filterId;
    }
    if (item.filterContentId) {
      filters.filterContentId = item.filterContentId;
    }
    if (item.itemIds) {
      filters.itemIds = item.itemIds;
    }

    onClose();
    navigation.navigate('Products', {
      filters,
      title: item.name || item.label || 'Products',
    });
  };

  const handleSectionPress = idx => {
    setExpandedIdx(prev => (prev === idx ? null : idx));
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

      {/* Overlay */}
      <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, {transform: [{translateX: slideAnim}]}]}>
        {/* Drawer Header */}
        <View style={styles.drawerHeader}>
          <Logo width={120} height={38} />
          <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Menu Content */}
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Loading menu…</Text>
            </View>
          ) : (
            menuSections.map((section, sIdx) => {
              const isExpanded = expandedIdx === sIdx;
              const sectionLabel = section.label || section.name || `Section ${sIdx + 1}`;
              const items = section.items || section.menuList || [];

              return (
                <View key={sIdx} style={styles.section}>
                  {/* Section Header */}
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => handleSectionPress(sIdx)}
                    activeOpacity={0.7}>
                    <Text style={styles.sectionLabel}>{sectionLabel}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {/* Section Items */}
                  {isExpanded && (
                    <View style={styles.sectionItems}>
                      {items.map((item, iIdx) => {
                        const label = item.name || item.label || item.value || '';
                        const imageUri = item.image
                          ? item.image.startsWith('http')
                            ? item.image
                            : `${IMG_BASE}${item.image}`
                          : null;

                        return (
                          <TouchableOpacity
                            key={iIdx}
                            style={styles.menuItem}
                            onPress={() => handleItemPress(item)}
                            activeOpacity={0.75}>
                            {imageUri && (
                              <Image
                                source={{uri: imageUri}}
                                style={styles.menuItemImage}
                                resizeMode="cover"
                              />
                            )}
                            <Text style={styles.menuItemText}>{label}</Text>
                            <Ionicons
                              name="chevron-forward"
                              size={14}
                              color={colors.textLight}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })
          )}

          {/* Quick Links */}
          <View style={styles.quickLinks}>
            <QuickLink
              icon="home-outline"
              label="Home"
              onPress={() => {
                onClose();
                navigation.navigate('Home');
              }}
            />
            <QuickLink
              icon="heart-outline"
              label="Wishlist"
              onPress={() => {
                onClose();
                navigation.navigate('Wishlist');
              }}
            />
            <QuickLink
              icon="cart-outline"
              label="Cart"
              onPress={() => {
                onClose();
                navigation.navigate('Cart');
              }}
            />
            <QuickLink
              icon="person-outline"
              label="Account"
              onPress={() => {
                onClose();
                navigation.navigate('Account');
              }}
            />
            <QuickLink
              icon="time-outline"
              label="Orders"
              onPress={() => {
                onClose();
                navigation.navigate('OrderHistory');
              }}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const QuickLink = ({icon, label, onPress}) => (
  <TouchableOpacity style={styles.quickLinkItem} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon} size={20} color={colors.primary} />
    <Text style={styles.quickLinkText}>{label}</Text>
  </TouchableOpacity>
);

export default MobileDrawerMenu;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_W,
    height: SCREEN_H,
    backgroundColor: colors.surface,
    ...shadows.lg,
  },

  // Drawer header
  drawerHeader: {
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  logoRow: {flexDirection: 'row', alignItems: 'center'},
  logoText: {
    fontSize: 20,
    fontWeight: fonts.weight.black,
    color: colors.headerText,
    letterSpacing: 2,
  },
  logoDivider: {
    width: 1.5,
    height: 16,
    backgroundColor: colors.white,
    marginHorizontal: 6,
    opacity: 0.6,
  },
  logoSub: {
    fontSize: 8,
    fontWeight: fonts.weight.extraBold,
    color: colors.headerText,
    letterSpacing: 3,
  },

  // Scroll
  scrollArea: {flex: 1},
  scrollContent: {paddingBottom: 40},

  // Loading
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  loadingText: {fontSize: 13, color: colors.textSecondary},

  // Section
  section: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sectionLabel: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    flex: 1,
  },

  // Section Items
  sectionItems: {
    backgroundColor: colors.cardPrimary,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.primarySoft,
  },
  menuItemImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: colors.cardSecondary,
  },
  menuItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: fonts.weight.medium,
    color: colors.text,
  },

  // Quick links
  quickLinks: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: colors.cardPrimary,
    borderRadius: radius.md,
    paddingVertical: 6,
  },
  quickLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 14,
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: fonts.weight.semiBold,
    color: colors.text,
  },
});
