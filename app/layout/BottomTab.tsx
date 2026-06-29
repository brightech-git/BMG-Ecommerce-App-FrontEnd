import { useEffect, useRef, useState } from 'react';
import { Image, Platform, TouchableOpacity, View, Animated, Text, Dimensions, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import {
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { IMAGES } from '../constants/Images';
import { useCart } from '../api/hooks/useCart';

const TAB_COUNT = 4;

type Props = {
    state: any;
    navigation: any;
    descriptors: any;
}

const BottomTab = ({ state, descriptors, navigation }: Props) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const { cartCount } = useCart();

    const [tabWidth, setWidth] = useState(wp('100%'));
    const tabWD = tabWidth < SIZES.container
        ? (tabWidth - 20) / TAB_COUNT
        : SIZES.container / TAB_COUNT;

    const circlePosition = useRef(new Animated.Value(0)).current;

    Dimensions.addEventListener('change', val => {
        setWidth(val.window.width);
    });

    useEffect(() => {
        Animated.spring(circlePosition, {
            toValue: state.index * tabWD,
            useNativeDriver: true,
        }).start();
    }, [state.index, tabWidth]);

    const onTabPress = (index: number) => {
        const tabW = tabWidth < SIZES.container
            ? (tabWidth - 20) / TAB_COUNT
            : SIZES.container / TAB_COUNT;
        Animated.spring(circlePosition, {
            toValue: index * tabW,
            useNativeDriver: true,
        }).start();
    };

    const iconFor = (label: string) => {
        if (label === 'Home')     return IMAGES.home;
        if (label === 'MyCart')   return IMAGES.shopping2;
        if (label === 'Category') return IMAGES.document;
        if (label === 'Profile')  return IMAGES.profile;
        return IMAGES.home;
    };

    return (
        <View
            style={[GlobalStyleSheet.container, {
                padding: 0,
                backgroundColor: colors.background,
                shadowColor: theme.dark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
                position: 'absolute',
                width: 'auto',
                left: 10,
                right: 10,
                bottom: 10,
                borderRadius: 15,
            }, Platform.OS === 'ios' && {
                backgroundColor: colors.card,
                borderRadius: 15,
            }]}
        >
            <View style={{ height: 65, backgroundColor: colors.card, borderRadius: 15 }}>
                <View style={[GlobalStyleSheet.container, {
                    padding: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 0,
                    paddingBottom: 0,
                }]}>
                    {/* Sliding circle */}
                    <Animated.View style={{
                        width: tabWD,
                        position: 'absolute',
                        transform: [{ translateX: circlePosition }],
                        zIndex: 1,
                        top: -40, bottom: 0, left: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <View style={{
                            height: 50, width: 50, borderRadius: 40,
                            backgroundColor: COLORS.primary, marginTop: 5,
                        }} />
                    </Animated.View>

                    {/* Circle shadow image */}
                    <Animated.View style={{
                        position: 'absolute',
                        height: '100%',
                        width: tabWD,
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: [{ translateX: circlePosition }],
                    }}>
                        <Image
                            style={{ tintColor: colors.card, resizeMode: 'contain', marginTop: Platform.OS === 'web' ? -70 : -80 }}
                            source={IMAGES.cricle}
                        />
                    </Animated.View>

                    {state.routes.map((route: any, index: any) => {
                        const { options } = descriptors[route.key];
                        const label = options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                        const isFocused = state.index === index;
                        const isCart = label === 'MyCart';

                        const iconTranslateY = useRef(new Animated.Value(0)).current;
                        Animated.timing(iconTranslateY, {
                            toValue: isFocused ? -18 : 0,
                            duration: 200,
                            useNativeDriver: true,
                        }).start();

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate({ name: route.name, merge: true });
                                onTabPress(index);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={options.tabBarTestID}
                                onPress={onPress}
                                style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'center', marginTop: isFocused ? 15 : 0, zIndex: 12 }}
                            >
                                <Animated.View style={{ transform: [{ translateY: iconTranslateY }] }}>
                                    <View>
                                        <Image
                                            style={{ width: 21, height: 21, tintColor: isFocused ? COLORS.white : colors.title, resizeMode: 'contain' }}
                                            source={iconFor(label)}
                                        />
                                        {/* Cart badge */}
                                        {isCart && cartCount > 0 && (
                                            <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                                                <Text style={styles.badgeTxt}>{cartCount > 99 ? '99+' : cartCount}</Text>
                                            </View>
                                        )}
                                    </View>
                                </Animated.View>
                                {isFocused && (
                                    <Text style={{ ...FONTS.fontMedium, color: colors.title, fontSize: 11, zIndex: 15 }}>
                                        {label === 'MyCart' ? 'Cart' : label}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -5, right: -7,
        minWidth: 16, height: 16, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 3,
    },
    badgeTxt: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '700',
        lineHeight: 12,
    },
});

export default BottomTab;
