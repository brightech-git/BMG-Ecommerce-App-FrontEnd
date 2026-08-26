import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { googleLoginThunk, clearAuthError } from '../../redux/reducer/authReducer';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { configureGoogleSignIn } from '../../utils/googleConfig';

type NavProp = StackNavigationProp<RootStackParamList>;

export const useGoogleLogin = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<NavProp>();
  const { googleLoading, googleError, user, token } = useSelector((state: any) => state.auth);

  const signInWithGoogle = async () => {
    try {
      configureGoogleSignIn();
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('Google SignIn Raw Response:', JSON.stringify(userInfo, null, 2));
      const idToken = userInfo?.data?.idToken ?? (userInfo as any)?.idToken;
      const picture = userInfo?.data?.user?.photo ?? (userInfo as any)?.user?.photo ?? undefined;
      console.log('Extracted idToken:', idToken);
      console.log('Extracted picture:', picture);
      if (!idToken) throw new Error('No idToken received from Google');
      const result = await dispatch(googleLoginThunk({ idToken, picture }));
      console.log('Google Login Dispatch Result:', JSON.stringify(result, null, 2));
      if (googleLoginThunk.fulfilled.match(result)) {
        const { user: loggedUser, token: authToken } = result.payload;
        console.log('Logged User:', JSON.stringify(loggedUser, null, 2));
        console.log('Auth Token:', authToken);
        if (loggedUser?.contactNumber && loggedUser.contactNumber.trim() !== '') {
          navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigation' }] });
        } else {
          navigation.navigate('GoogleContactUpload', { userId: loggedUser.id, token: authToken });
        }
      }
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (err.code === statusCodes.IN_PROGRESS) return;
      dispatch({ type: 'auth/googleLogin/rejected', payload: err.message ?? 'Google sign-in failed' });
    }
  };

  return { signInWithGoogle, googleLoading, error: googleError, user, token, clearError: () => dispatch(clearAuthError()) };
};
