import React, { useEffect, useState } from "react";
import { Platform } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import * as Application from 'expo-application';
import { useDispatch } from 'react-redux';
import { resolveInitialRoute } from './resolveInitialRoute';
import { getAppMaintenanceConfig } from '../api/services/appConfigService';
import { isVersionOlder } from '../utils/version';
import Onbording from "../Screens/onbording/Onbording";
import Maintenance from "../Screens/Maintenance/Maintenance";
import UpdateRequired from "../Screens/Maintenance/UpdateRequired";
import { RootStackParamList } from "./RootStackParamList";
import SignIn from "../Screens/Auth/SignIn";
import SignUp from "../Screens/Auth/SignUp";
import ForgotPassword from "../Screens/Auth/ForgotPassword";
import EnterCode from "../Screens/Auth/EnterCode";
import SignUpVerifyOTP from "../Screens/Auth/SignUpVerifyOTP";
import GoogleContactUpload from "../Screens/Auth/GoogleContactUpload";
import GoogleContactVerify from "../Screens/Auth/GoogleContactVerify";
import NewPassword from "../Screens/Auth/NewPassword";
import DrawerNavigation from "./DrawerNavigation";
import Notification from "../Screens/Notification/Notification";
import Search from "../Screens/search/Search";
import ProductDetails from "../Screens/Product/ProductDetails";
import Home from "../Screens/Home/Home";
import RecentlyViewed from "../Screens/Home/RecentlyViewed";
import Wishlist from "../Screens/Wishlist/Wishlist";
import MyCart from "../Screens/MyCart/MyCart";
import Category from "../Screens/Category/Category";
import EditProfile from "../Screens/profile/EditProfile";
import Profile from "../Screens/profile/Profile";
import Myorder from "../Screens/profile/Myorder";
import WriteReview from "../Screens/profile/WriteReview";
import Trackorder from "../Screens/profile/Trackorder";
import SavedAddresses from "../Screens/profile/SavedAddresses";
import SaveAddress from "../Screens/profile/SaveAddress";
import Checkout from "../Screens/profile/Checkout";
import Payment from "../Screens/profile/Payment";
import PaymentStatus from "../Screens/profile/PaymentStatus";
import Language from "../Screens/language/Language";
import Questions from "../Screens/profile/Questions";
import Coupons from "../Screens/profile/Coupons";
import Products from "../Screens/Category/Products";
import Offers from "../Screens/Offers/Offers";
import OrderReturn from "../Screens/profile/OrderReturn";
import AboutUs from "../Screens/AboutUs/AboutUs";
import ContactUs from "../Screens/ContactUs/ContactUs";
import PolicyScreen from "../Screens/Policy/PolicyScreen";
import ChangePassword from "../Screens/profile/ChangePassword";
import HelpCenter from "../Screens/profile/HelpCenter";
import DeleteAccount from "../Screens/profile/DeleteAccount";

import AsyncStorage from '@react-native-async-storage/async-storage';





const Stack = createStackNavigator<RootStackParamList>();

/** Returns update info when the installed version is older than what the API requires for this platform. */
function checkForUpdate(cfg: { androidVersion: string; androidStoreUrl: string; iosVersion: string; iosStoreUrl: string }) {
  try {
    const currentVersion = Application.nativeApplicationVersion ?? '0.0.0';
    const latestVersion = Platform.OS === 'ios' ? cfg.iosVersion : cfg.androidVersion;
    const storeUrl       = Platform.OS === 'ios' ? cfg.iosStoreUrl : cfg.androidStoreUrl;
    console.log('[StackNavigator] Installed version:', currentVersion, '| Latest version:', latestVersion);
    if (!latestVersion || !isVersionOlder(currentVersion, latestVersion)) return null;
    return { version: latestVersion, storeUrl };
  } catch {
    return null; // never block app startup over a broken version check
  }
}

const StackNavigator = () => {
  const dispatch = useDispatch<any>();
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [maintenanceMsg, setMaintenanceMsg] = useState<string | undefined>(undefined);
  const [updateInfo, setUpdateInfo] = useState<{ version?: string; storeUrl?: string } | undefined>(undefined);

//  AsyncStorage.clear()
  useEffect(() => {
    (async () => {
      // if (__DEV__) {
      //   // Skip maintenance/update gating entirely in development builds.
      //   setInitialRoute(await resolveInitialRoute(dispatch));
      //   return;
      // }

      const [route, maintenance] = await Promise.all([
        resolveInitialRoute(dispatch),
        getAppMaintenanceConfig().catch(() => null),
      ]);

      if (maintenance?.isMaintenance) {
        setMaintenanceMsg(maintenance.maintenanceMsg || undefined);
        setInitialRoute('Maintenance');
        return;
      }

      const update = maintenance ? checkForUpdate(maintenance) : null;
      if (update) {
        setUpdateInfo(update);
        setInitialRoute('UpdateRequired');
        return;
      }

      setInitialRoute(route);
    })();
  }, []);

  if (!initialRoute) return null;

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="Onbording" component={Onbording} />
      <Stack.Screen name="Maintenance" component={Maintenance} initialParams={{ message: maintenanceMsg }} />
      <Stack.Screen name="UpdateRequired" component={UpdateRequired} initialParams={updateInfo} />
      <Stack.Screen name={"SignIn"} component={SignIn} />
      <Stack.Screen name={"SignUp"} component={SignUp} />
      <Stack.Screen name={"ForgotPassword"} component={ForgotPassword} />
      <Stack.Screen name={"EnterCode"} component={EnterCode} />
      <Stack.Screen name={"SignUpVerifyOTP"} component={SignUpVerifyOTP} />
      <Stack.Screen name={"GoogleContactUpload"} component={GoogleContactUpload} />
      <Stack.Screen name={"GoogleContactVerify"} component={GoogleContactVerify} />
      <Stack.Screen name={"NewPassword"} component={NewPassword} />
      <Stack.Screen name={"DrawerNavigation"} component={DrawerNavigation} />
      <Stack.Screen name={"Notification"} component={Notification} />
      <Stack.Screen name={"Search"} component={Search} />
      <Stack.Screen name={"ProductDetails"} component={ProductDetails} />
      <Stack.Screen name={"Home"} component={Home} />
      <Stack.Screen name={"RecentlyViewed"} component={RecentlyViewed} />
      <Stack.Screen name={"Wishlist"} component={Wishlist} />
      <Stack.Screen name={"MyCart"} component={MyCart} />
      <Stack.Screen name={"Category"} component={Category} />
      <Stack.Screen name={"Profile"} component={Profile} />
      <Stack.Screen name={"EditProfile"} component={EditProfile} />
      <Stack.Screen name={"Myorder"} component={Myorder} />
      <Stack.Screen name={"WriteReview"} component={WriteReview} />
      <Stack.Screen name={"Trackorder"} component={Trackorder} />
      <Stack.Screen name={"SavedAddresses"} component={SavedAddresses} />
      <Stack.Screen name={"SaveAddress"} component={SaveAddress} />
      <Stack.Screen name={"Checkout"} component={Checkout} />
      <Stack.Screen name={"Payment"} component={Payment} />
      <Stack.Screen name={"PaymentStatus"} component={PaymentStatus} />
      <Stack.Screen name={"Language"} component={Language} />
      <Stack.Screen name={"Questions"} component={Questions} />
      <Stack.Screen name={"Coupons"} component={Coupons} />
      <Stack.Screen name={"Products"} component={Products} />
      <Stack.Screen name={"Offers"} component={Offers} />
      <Stack.Screen name={"OrderReturn"} component={OrderReturn} />
      <Stack.Screen name={"AboutUs"} component={AboutUs} />
            <Stack.Screen name={"ContactUs"} component={ContactUs} />
      <Stack.Screen name={"PolicyScreen"} component={PolicyScreen} />
      <Stack.Screen name={"ChangePassword"} component={ChangePassword} />
      <Stack.Screen name={"HelpCenter"} component={HelpCenter} />
      <Stack.Screen name={"DeleteAccount"} component={DeleteAccount} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
