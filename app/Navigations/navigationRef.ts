// app/Navigations/navigationRef.ts
// Module-level navigation ref so code outside a navigator screen (e.g.
// PersistentBottomTab rendered as a sibling of StackNavigator) can
// call navigate / dispatch without needing useNavigation().

import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from './RootStackParamList';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Navigate to a tab inside DrawerNavigation → BottomNavigation. */
export function navigateToTab(tabRoute: string) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'DrawerNavigation',
        params: {
          screen: 'BottomNavigation',
          params: { screen: tabRoute },
        },
      })
    );
  }
}
