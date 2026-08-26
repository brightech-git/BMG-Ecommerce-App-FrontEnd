import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { appleLoginThunk, clearAuthError } from '../../redux/reducer/authReducer';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

type NavProp = StackNavigationProp<RootStackParamList>;

export const useAppleLogin = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<NavProp>();
  const { appleLoading, appleError, user, token } = useSelector((state: any) => state.auth);

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const idToken = credential.identityToken;
      if (!idToken) throw new Error('No identity token received from Apple');
      const result = await dispatch(appleLoginThunk({ idToken }));
      if (appleLoginThunk.fulfilled.match(result)) {
        const { user: loggedUser, token: authToken } = result.payload;
        if (loggedUser?.contactNumber && loggedUser.contactNumber.trim() !== '') {
          navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigation' }] });
        } else {
          navigation.navigate('GoogleContactUpload', { userId: loggedUser.id!, token: authToken });
        }
      }
    } catch (err: any) {
      if (err.code === 'ERR_REQUEST_CANCELED') return;
      dispatch({ type: 'auth/appleLogin/rejected', payload: err.message ?? 'Apple sign-in failed' });
    }
  };

  return { signInWithApple, appleLoading, error: appleError, user, token, clearError: () => dispatch(clearAuthError()) };
};
