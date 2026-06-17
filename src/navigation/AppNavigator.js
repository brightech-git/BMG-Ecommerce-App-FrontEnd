import React from 'react';
import {ActivityIndicator, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../context/AuthContext';
import {colors, fonts, radius} from '../theme/theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProductsScreen from '../screens/main/ProductsScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import CartScreen from '../screens/main/CartScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import SearchScreen from '../screens/main/SearchScreen';
import AccountScreen from '../screens/main/AccountScreen';
import CategoryScreen from '../screens/main/CategoryScreen';
import OrderHistoryScreen from '../screens/main/OrderHistoryScreen';
import OrderDetailScreen from '../screens/main/OrderDetailScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import AddressScreen from '../screens/main/AddressScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Auth Stack ────────────────────────────────────────────────────────────────
const AuthStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// ── Home Stack (screens accessible from Home tab) ────────────────────────────
const HomeStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Products" component={ProductsScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="Address" component={AddressScreen} />
  </Stack.Navigator>
);

// ── Category Stack (Category tab can also push Products) ─────────────────────
const CategoryStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="CategoryMain" component={CategoryScreen} />
    <Stack.Screen name="Products" component={ProductsScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

// ── Account Stack ────────────────────────────────────────────────────────────
const AccountStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="AccountMain" component={AccountScreen} />
    <Stack.Screen name="Address" component={AddressScreen} />
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
  </Stack.Navigator>
);

// ── Bottom Tab Navigator ─────────────────────────────────────────────────────
const TAB_ICONS = {
  Home: {active: 'home', inactive: 'home-outline'},
  Category: {active: 'grid', inactive: 'grid-outline'},
  Search: {active: 'search', inactive: 'search-outline'},
  Cart: {active: 'cart', inactive: 'cart-outline'},
  Account: {active: 'person', inactive: 'person-outline'},
};

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarIcon: ({focused, color}) => {
        const iconSet = TAB_ICONS[route.name] || TAB_ICONS.Home;
        const iconName = focused ? iconSet.active : iconSet.inactive;
        return <Ionicons name={iconName} size={22} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textLight,
      tabBarStyle: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        height: 58,
        paddingBottom: 6,
        paddingTop: 4,
        elevation: 8,
        shadowColor: colors.shadow,
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: fonts.weight.semiBold,
        letterSpacing: 0.3,
      },
    })}>
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Category" component={CategoryStack} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    <Tab.Screen name="Account" component={AccountStack} />
  </Tab.Navigator>
);

// ── Root Navigator ────────────────────────────────────────────────────────────
const AppNavigator = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.headerBg}}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return user ? <AppTabs /> : <AuthStack />;
};

export default AppNavigator;
