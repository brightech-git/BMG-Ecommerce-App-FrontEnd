import React, { useEffect, useState } from "react";
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { AsyncStorageHelper } from '../utils/AsyncStorageHelper';
import { useDispatch } from 'react-redux';
import { hydrateAuth } from '../redux/reducer/authReducer';
import { setAuthToken } from '../api/axiosInstance';
import Onbording from "../Screens/onbording/Onbording";
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


const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  const dispatch = useDispatch<any>();
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    (async () => {
      const [onboarded, token, user] = await Promise.all([
        AsyncStorageHelper.isOnboarded(),
        AsyncStorageHelper.getToken(),
        AsyncStorageHelper.getUser(),
      ]);
      if (token && user) {
        dispatch(hydrateAuth({ token, user }));
        setAuthToken(token);
      }
      if (!onboarded) setInitialRoute('Onbording');
      else if (token)  setInitialRoute('DrawerNavigation');
      else             setInitialRoute('SignIn');
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
    </Stack.Navigator>
  );
};
export default StackNavigator;
