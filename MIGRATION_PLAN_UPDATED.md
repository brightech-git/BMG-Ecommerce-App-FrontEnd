# BMG Jewels — Mobile App Migration Plan (Updated)
**Date:** 2026-06-19  
**Mobile App:** React Native 0.81 / Expo 54 / TypeScript (`BMG-Ecommerce-App-FrontEnd`)  
**Website Reference:** React 19 + Vite (`BMG_Websites`) — shared backend at `https://app.bmgjewellers.com/api/v1`

---

## 1. Executive Summary

The mobile app has made **massive progress** since the initial plan. The entire core shopping funnel (Home → Categories → Products → Product Details → Cart → Wishlist → Checkout → Payment → Orders) is **fully implemented with real API calls**. The authentication flow was complete before; Phase 1 and Phase 2 from the prior plan are largely done.

**What remains:**
- 4 old-template screens need to be replaced with real implementations
- ~9 completely missing screens need to be built from scratch
- Navigation type definitions need updating for new screens

---

## 2. Current Mobile App State

### 2.1 Architecture (unchanged, healthy)
- **Framework:** Expo 54, React Native 0.81, React 19, TypeScript
- **Navigation:** `StackNavigator` → `DrawerNavigation` → `BottomNavigation` (Home, Wishlist, Cart, Category, Profile)
- **State:** Redux Toolkit (auth, drawer) + React Query (all server state)
- **API layer:** `axiosInstance` → `callApi<T,R>` → `services/*` → `hooks/*` — all endpoints defined in `endpoints.ts`
- **QueryClientProvider** is wired at app root in `App.tsx` ✅
- **Theme:** Jost + Marcellus fonts, BMG branding, `COLORS/FONTS/SIZES`, light/dark via `themeContext`

### 2.2 API Layer (already extended)
All endpoint groups are defined in `endpoints.ts`:
`AUTH`, `SEARCH`, `PRODUCT`, `CART`, `WISHLIST`, `HOME`, `ORDER`, `ADDRESS`, `PAYMENT`, `SHIPPING`, `PROFILE`, `MISC`

Services defined: `authService`, `searchService`, `homeService`, `productService`, `cartService`, `wishlistService`, `orderService`, `addressService`, `paymentService`, `profileService`, `notificationService`

Hooks defined: `useLogin`, `useRegister`, `useSearch`, `useGoogleLogin`, `useHome`, `useRate`, `useProducts`, `useProductDetail`, `useCart`, `useWishlist`, `useOrders`, `useAddresses`, `usePayment`, `useProfile`, `useNotifications`, `useCatalog`, `useAuthToken`

---

## 3. Screen-by-Screen Status

### ✅ DONE — Fully Implemented (Real API)

| Screen | File | Website Page | API Hooks Used |
|--------|------|--------------|----------------|
| Onboarding | `Screens/onbording/Onbording.tsx` | - | - |
| Sign In | `Screens/Auth/SignIn.tsx` | `/login` | `useLogin` |
| Sign Up | `Screens/Auth/SignUp.tsx` | `/register` | `useRegister` |
| Forgot Password | `Screens/Auth/ForgotPassword.tsx` | `/forgot-password` | auth service |
| OTP Verify (SignUp) | `Screens/Auth/SignUpVerifyOTP.tsx` | - | auth service |
| Enter OTP Code | `Screens/Auth/EnterCode.tsx` | - | auth service |
| New Password | `Screens/Auth/NewPassword.tsx` | - | auth service |
| Google Login | `Screens/Auth/GoogleContactUpload.tsx` | - | `useGoogleLogin` |
| Google Contact Verify | `Screens/Auth/GoogleContactVerify.tsx` | - | auth service |
| **Home** | `Screens/Home/Home.tsx` | `/home` | `useBudgetBanners`, `useNewArrivals`, `useTrending`, `useTodayRate`, `useCart`, `useWishlist` |
| **Search** | `Screens/search/Search.tsx` | - | `useSearch` |
| **Categories** | `Screens/Category/Category.tsx` | - | `useCategoryImages` |
| **Products Listing** | `Screens/Category/Products.tsx` | `/products-page` | `useProductListing` (infinite scroll) |
| **Product Details** | `Screens/Product/ProductDetails.tsx` | `/products-page/:tagKey` | `useProductDetail`, `useRelatedProducts`, `useCart`, `useWishlist`, `useTodayRate` |
| **My Cart** | `Screens/MyCart/MyCart.tsx` | `/cart` | `useCart` |
| **Wishlist** | `Screens/Wishlist/Wishlist.tsx` | `/wishlist` | `useWishlist`, `useCart` |
| **Checkout** | `Screens/profile/Checkout.tsx` | `/checkout` | `useCart`, `useAddresses`, `useProfile`, `createOrder` |
| **Payment** | `Screens/profile/Payment.tsx` | `/payment/:orderId` | `initiatePayment`, `getPaymentRedirectUrl` (WebView) |
| **Payment Status** | `Screens/profile/PaymentStatus.tsx` | `/payment-success` | `getPaymentStatus` |
| **Profile / Account** | `Screens/profile/Profile.tsx` | `/account/dashboard` | `useProfile`, `useAuthToken` |
| **Edit Profile** | `Screens/profile/EditProfile.tsx` | `/account` profile edit | `useProfile`, `useUpdateProfile` |
| **My Orders** | `Screens/profile/Myorder.tsx` | `/account/orders` | `useOrderHistory` |
| **Order Details / Track** | `Screens/profile/Trackorder.tsx` | `/account/orderdetails/:id` | `useOrderTracking` |
| **Saved Addresses** | `Screens/profile/SavedAddresses.tsx` | `/account/address` | `useAddresses` |
| **Add/Edit Address** | `Screens/profile/SaveAddress.tsx` | `/account/address` | `useAddresses`, `getAddressById` |
| Language | `Screens/language/Language.tsx` | - | - |

---

### ❌ OLD TEMPLATE — Needs Replacement (4 screens)

These screens exist but still use hardcoded dummy data from the original UI template. They must be rebuilt to match the website.

| Priority | Screen | File | Issue | Target |
|----------|--------|------|-------|--------|
| P1 | **Notifications** | `Screens/Notification/Notification.tsx` | Hardcoded `SwipeData[]`, old `Header`/`SwipeBox` components, uses `SafeAreaView` pattern | Rebuild with `useNotifications` hook → `MISC.NOTIFICATION_LIST` API |
| P2 | **Write Review** | `Screens/profile/WriteReview.tsx` | Hardcoded product, no star rating API, old template components | Rebuild with `useRate` hook; post to review endpoint (check website) |
| P3 | **FAQ / Questions** | `Screens/profile/Questions.tsx` | Uses `QuestionsAccordion` with hardcoded Q&A | Replace with either static FAQ content matching website `/faq` page OR dynamic API |
| P4 | **Coupons** | `Screens/profile/Coupons.tsx` | Hardcoded coupon + ad data, old template components | Rebuild using offer banners API (`HOME.INSTANT_OFFERS`, `HOME.OFFER_BANNERS`) OR remove if not in website |

---

### 🆕 MISSING — Needs to be Created (9+ screens)

These screens exist on the website but have no mobile equivalent at all.

| Priority | Screen Name | Website Route | API/Data | Notes |
|----------|-------------|---------------|----------|-------|
| P1 | **About Us** | `/about` | `HOME.COMPANY` → `/company/all` | Shows company info, mission, team |
| P1 | **Contact Us** | `/contact` | `MISC.CONTACT_SUBMIT` → `/contact/submit` | Form: name, email, phone, message; validation required |
| P1 | **Change Password** | `/account/change-password` | auth reset endpoint | Form: current pwd + new pwd + confirm; in account flow |
| P2 | **Offers / Deals** | Offer banners section | `HOME.OFFER_BANNERS`, `HOME.INSTANT_OFFERS` | Grid of offer banners; tap → Products |
| P2 | **Privacy Policy** | `/privacypolicy` | Static content (match website text) | Use generic `PolicyScreen` component |
| P2 | **Terms & Conditions** | `/terms-conditions` | Static content | Use generic `PolicyScreen` component |
| P2 | **Refund Policy** | `/refund-policy` | Static content | Use generic `PolicyScreen` component |
| P3 | **Shipping & Delivery Policy** | `/delivery&shipping` | Static content | Use generic `PolicyScreen` component |
| P3 | **Cancellation & Return Policy** | `/cancellation-return-policy` | Static content | Use generic `PolicyScreen` component |
| P3 | **Why Choose Us** | `/why-choose-us` | Static content | Use generic `PolicyScreen` component |
| P3 | **Order Return / Refund** | `/return` | `MISC.REFUND_SUBMIT` → `/refunds/submit` | Form: order ID, reason, upload evidence |
| P4 | **Ring Size Guide** | `/ring-size-guide` | Static chart/image | Size chart |
| P4 | **Bangle Size Guide** | `/bangle-size-guide` | Static chart/image | Size chart |
| P4 | **Scheme** | `/scheme` | scheme detail API | Lower priority |
| P4 | **Virtual Appointment** | `/appointment` | `MISC.VIDEO_APPOINTMENT` | Lower priority |

---

## 4. Navigation Gaps

The following are typed in `RootStackParamList.tsx` but **NOT registered** in `StackNavigator.tsx`:
- `Offers` — needs screen + registration
- `OrderReturn` — needs screen + registration

The following are typed but the screen is an old template:
- `Notification` — screen exists but is a template; must be rebuilt

New screens to add to both `RootStackParamList.tsx` and `StackNavigator.tsx`:
- `About`
- `ContactUs`
- `ChangePassword`
- `Offers` (already typed)
- `OrderReturn` (already typed)
- `PolicyScreen` (generic, with params for which policy)
- `RingSizeGuide`
- `BangleSizeGuide`

---

## 5. Profile Screen — Missing Menu Items

`Profile.tsx` currently links to: Orders, Addresses, Wishlist, Notifications, Edit Profile, Language, Log Out.

Need to add links to:
- About Us
- Contact Us
- Change Password
- FAQ / Help
- Offers / Deals
- Privacy Policy (and other policies via sub-menu or settings page)

---

## 6. Implementation Roadmap

### Phase 1 — Replace old-template screens (Immediate)
These are blocking quality — the app has old UI in these 4 screens.

1. **Notifications** — Rebuild using `useNotifications` / `MISC.NOTIFICATION_LIST`. Use `FlatList`, pull-to-refresh, swipe-to-delete (Reanimated), `AppEmptyState`. Style consistently with other rebuilt screens (no old `Header` component).

2. **WriteReview** — Rebuild with real product context (passed via route params `tagKey`), star rating (react-native-ratings already installed), review text, submit to API. Gate behind auth.

3. **FAQ** — Replace `QuestionsAccordion` with static FAQ matching website `/faq` page. Use `Accordion` pattern with expand/collapse.

4. **Coupons** — If website doesn't have a dedicated coupons page, repurpose this screen as **Offers** (redirect from Profile → Offers), showing `offer_banner` + `instant_offers` data.

### Phase 2 — Missing account screens (High priority)
5. **Change Password** — New screen under account. Form: current password (if required) + new password + confirm password. Navigate from Profile.

6. **About Us** — Fetch from `/company/all`. Display company name, description, mission statement. Navigate from Profile.

7. **Contact Us** — Form screen: name, email, subject, message. POST to `/contact/submit`. Show success state. Navigate from Profile.

### Phase 3 — Policy screens (Medium priority)
8. **Generic PolicyScreen** — Create one reusable `PolicyScreen.tsx` component that accepts `title` and either `content` (rich text) or `webUrl` params. Register once in navigation with typed params.

9. Add all policy routes: Privacy, Terms, Refund, Shipping, Cancellation, Why Choose Us.

10. Update Profile screen to expose a "Legal & Policies" section.

### Phase 4 — Missing commerce screens (Medium priority)
11. **Offers screen** — Grid layout showing offer banners + instant offers. Tap → Products with filter params. Register `Offers` route in StackNavigator.

12. **Order Return** — Form screen: order ID (pre-filled from route params), reason dropdown, description, submit. Register `OrderReturn` route.

### Phase 5 — Informational / lower priority
13. Ring Size Guide & Bangle Size Guide — static size chart screens.
14. Scheme page — if required.
15. Virtual Appointment — video upload form.

---

## 7. Per-Screen Implementation Format

For every screen implemented, the report will include:

**a) Website page being converted**  
**b) Files created**  
**c) Files modified** (StackNavigator, RootStackParamList, Profile/linking screen)  
**d) Navigation changes** (new route + how to reach it)  
**e) API integrations** (endpoint, payload shape, response shape)  
**f) States wired** (loading, empty, error, success, validation)  

---

## 8. Conventions & Guardrails (unchanged)

- Use `callApi` / `axiosInstance`; add endpoints to `endpoints.ts` — no hardcoded URLs in screens
- Use `appcomponents` primitives: `AppText`, `AppButton`, `AppLoader`, `AppEmptyState`, `AppSkeletonLoader`, `ScreenWrapper`
- Do NOT use the old `Header` layout component or old `Button`/`CustomInput` template components in new screens — use the `appcomponents` design system or inline styles matching rebuilt screens
- Keep theme tokens (`COLORS/FONTS/SIZES`), Jost/Marcellus fonts, BMG palette (`#F9F6F1` background, `COLORS.primary`, `COLORS.secondary`)
- TypeScript: type every service payload/response; extend `app/types/` as needed
- React Query for all server state; Redux only for auth + UI
- Gate auth-required screens using `useAuthToken()` + navigate to `SignIn` if null
- Pull-to-refresh on all listing screens
- Proper loading (skeleton or spinner), empty state, error state, and validation messages on every screen

---

## 9. Open Questions (Confirmed / Still Open)

| # | Question | Status |
|---|----------|--------|
| 1 | Start with Phase 1 replacements (Notification, FAQ) or Phase 2 missing (About, Contact)? | **Awaiting direction** |
| 2 | Payment WebView flow confirmed working? | ✅ Implemented |
| 3 | Policy pages — native text or website HTML in WebView? | **Awaiting direction** — recommend native text for speed |
| 4 | Remove leftover Chat/Call, Shortcode screens from navigator? | **Awaiting direction** |
| 5 | Change Password — does backend require current password, or is it token-only? | Check API |
| 6 | WriteReview — what is the exact review submission endpoint on the backend? | Check website `rateService` |
| 7 | Coupons — does the website have a standalone coupons/offers page? | Not found — recommend repurposing as Offers |

---

## 10. Recommended Next Step

**Ready to implement. Suggested priority order:**

1. `Notification.tsx` — rebuild with real API (P1, quick win)
2. `About.tsx` + `ContactUs.tsx` — new screens, link from Profile (P1)
3. `ChangePassword.tsx` — new screen, link from Profile (P1)
4. `PolicyScreen.tsx` (generic) + register all 5 policy routes (P2, all share one component)
5. `Offers.tsx` — repurpose/replace Coupons.tsx (P2)
6. `FAQ.tsx` — replace Questions.tsx static content (P3)
7. `OrderReturn.tsx` — new screen (P3)
8. `WriteReview.tsx` — rebuild with real product + API (P3)

**Say "implement [screen name]" to start coding any screen.**
