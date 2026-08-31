// Lets a guest tap a gated action (add to cart, favourite, address, etc.),
// get sent to SignIn, and land back on the screen they came from once
// they're authenticated — instead of always resetting to Home.
import type { RootStackParamList } from '../Navigations/RootStackParamList';

type RedirectTarget = { screen: keyof RootStackParamList; params?: any };

let pendingRedirect: RedirectTarget | null = null;

export function setPendingAuthRedirect(target: RedirectTarget) {
  pendingRedirect = target;
}

function consumePendingAuthRedirect(): RedirectTarget | null {
  const target = pendingRedirect;
  pendingRedirect = null;
  return target;
}

/** Call after a successful sign-in/sign-up instead of resetting straight to
 *  Home — resumes whatever screen prompted the login, if any. */
export function finishAuthFlow(navigation: { reset: (state: any) => void }) {
  const redirect = consumePendingAuthRedirect();
  if (redirect) {
    navigation.reset({
      index: 1,
      routes: [{ name: 'DrawerNavigation' }, { name: redirect.screen, params: redirect.params }],
    });
  } else {
    navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigation' }] });
  }
}
