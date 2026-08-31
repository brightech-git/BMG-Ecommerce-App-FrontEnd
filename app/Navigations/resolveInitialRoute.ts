// Shared with StackNavigator's mount effect and Maintenance's "Retry" so both
// derive the post-maintenance/post-update landing route the same way.
import { AsyncStorageHelper } from '../utils/AsyncStorageHelper';
import { setAuthToken } from '../api/axiosInstance';
import { hydrateAuth } from '../redux/reducer/authReducer';

export type ResolvedRoute = 'Onbording' | 'DrawerNavigation' | 'SignIn';

export async function resolveInitialRoute(dispatch: any): Promise<ResolvedRoute> {
  const [onboarded, token, user] = await Promise.all([
    AsyncStorageHelper.isOnboarded(),
    AsyncStorageHelper.getToken(),
    AsyncStorageHelper.getUser(),
  ]);
  // A social (Apple/Google) login saves the token as soon as it succeeds,
  // even before the mandatory contact-number step is completed. If the
  // app is closed at that point, don't treat the user as fully signed
  // in on relaunch — otherwise they'd land on Home having skipped it.
  const hasCompletedProfile = !!(user?.contactNumber && String(user.contactNumber).trim() !== '');

  if (token && user && hasCompletedProfile) {
    dispatch(hydrateAuth({ token, user }));
    setAuthToken(token);
  } else if (token && user && !hasCompletedProfile) {
    await AsyncStorageHelper.clearSession();
  }

  if (!onboarded) return 'Onbording';
  // Guests browse Home freely; account-specific actions (cart, wishlist,
  // address, profile) prompt SignIn at the point of use instead.
  return 'DrawerNavigation';
}
