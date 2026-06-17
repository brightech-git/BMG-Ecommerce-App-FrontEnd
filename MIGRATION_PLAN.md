# BMG Jewels — Website → Mobile App Migration Plan

**Source of truth:** `BMG_Websites` (React 19 + Vite web frontend)
**Target:** `BMG-Ecommerce-App-FrontEnd` (React Native 0.81 / Expo 54, TypeScript)
**Shared backend:** `https://app.bmgjewellers.com/api/v1` (both apps hit the *same* API)
**Date:** 2026-06-17

---

## 1. Executive Summary

The mobile app is a **branded UI template** (Jost/Marcellus fonts, BMG assets, full component kit) with a **fully working authentication flow** (login, register, OTP, Google, forgot/reset password) wired to the real backend through a clean `axios + Redux thunk` architecture.

Every other e-commerce screen that exists in the mobile app today (`Home`, `Category`, `MyCart`, `Wishlist`, `ProductDetails`, `Profile`, `Checkout`, `Myorder`, etc.) is a **static scaffold using hardcoded dummy arrays** (`CategoriesData`, `Swiper1Data`, …). None of them call the backend, and cart/wishlist are local-only Redux state.

The website, by contrast, is a complete commerce frontend: ~30 routes, ~50 API services, ~45 React-Query hooks, real cart/wishlist/order/address/payment flows, gold-rate display, filters, schemes, policies, and a full account area.

**The migration is therefore: re-skin each website page into a mobile screen, replacing dummy data with the website's exact API calls — reusing the mobile app's existing component library, theme, and API architecture.** Because both apps share one backend, every endpoint, payload, and response shape can be copied verbatim from the website services.

---

## 2. Mobile App Analysis (current state)

### 2.1 Architecture & conventions
- **Framework:** Expo 54, React Native 0.81, React 19, TypeScript (`~5.9`).
- **Navigation:** `@react-navigation` v7 — root `StackNavigator` → `DrawerNavigation` → `BottomNavigation` (Home, Wishlist, MyCart, Category, Profile). Route names + params typed in `app/Navigations/RootStackParamList.tsx`.
- **State:** Redux Toolkit + `redux-persist`. Reducers: `authReducer` (real, thunk-based), `cartReducer`, `wishListReducer`, `drawerReducer` (all local-only today).
- **Server state:** `@tanstack/react-query` is installed but **not yet used** — currently only auth via Redux thunks. (Website uses React Query heavily; we will introduce it on mobile for product/cart/order data.)
- **API layer (clean, reusable):**
  - `app/api/axiosInstance.ts` — axios instance, `baseURL` from `@env`, attaches `@auth_token` from AsyncStorage, global 401 handler.
  - `app/api/apiClient.ts` — `callApi<T,R>()` generic wrapper with unified logging + `ApiError` shape.
  - `app/api/endpoints.ts` — endpoint constants (currently only `AUTH` + `SEARCH`).
  - `app/api/services/*` — typed service functions (`authService`, `searchService`).
  - `app/api/hooks/*` — hooks (`useLogin`, `useRegister`, `useSearch`, `useGoogleLogin`).
- **Theme:** `app/constants/theme.tsx` (COLORS, FONTS, SIZES), `StyleSheet.tsx` (GlobalStyleSheet), `themeContext.tsx` (light/dark), `Images.tsx` (asset registry).
- **Config:** `.env` → `API_BASE_URL`, `IMAGE_BASE_URL=https://app.bmgjewellers.com`.

### 2.2 Reusable component library (already built)
Buttons, Inputs (`AppInput`, `CustomInput`, OTP), `ProductCard`, Cards (style1–3), Headers (`HomeHeader`, Style1–3), Footers, BottomSheets (`FilterSheet`, `SortbySheet`, `LoginSheet`, etc.), Accordions, Badges, Modals, Tables, Tabs, Toggles, Charts, plus an `appcomponents` design-system set: `AppButton`, `AppText`, `AppHeader`, `AppInput`, `AppModal`, `AppLoader`, `AppEmptyState`, `AppSkeletonLoader`, `AppSearchBar`, `AppGoldPriceCard`, `ScreenWrapper`, `KeyboardWrapper`, `AppBottomSheet`, etc. **This set covers loading/empty/error/validation states out of the box and should be the default building blocks.**

### 2.3 What's real vs. scaffold
| Area | Status |
|---|---|
| Auth (login/register/OTP/Google/forgot/reset) | ✅ Real, backend-wired |
| Search | ✅ Real (`/product/items/filter`) |
| Home, Category, Products, ProductDetails | ⚠️ Scaffold (dummy data) |
| MyCart, Wishlist | ⚠️ Scaffold (local Redux only) |
| Profile, EditProfile, Myorder, Trackorder, Checkout, Payment, SavedAddresses, SaveAddress, Coupons | ⚠️ Scaffold |
| Notification | ⚠️ Scaffold |
| Chat/Call, Shortcode/* demo screens | 🗑️ Template leftovers (not in website; can be ignored/removed) |

---

## 3. Website Analysis (source of truth)

### 3.1 Routes → Pages (`src/App.jsx`)
**Public:** `/` & `/home` (Home), `/about` (About), `/scheme` (SchemePage), `/login`, `/register`, `/forgot-password`, `/products-page` (ProductsPage / listing), `/products-page/:tagKey` (ProductDetail), `/contact`, `/contactstore` (+ `/success`), `/faq`.
**Policies:** `/privacypolicy`, `/cancellation-return-policy`, `/risk-compliance-policy`, `/delivery&shipping`, `/refund-policy`, `/terms-conditions`, `/why-choose-us`, `/scheme-privacy`, `/scheme-support`.
**Size guides:** `/bangle-size-guide`, `/ring-size-guide`. **Appointment:** `/appointment` (virtual shop).
**Protected (`PrivateRoute`):** `/cart`, `/checkout`, `/wishlist`, `/payment/:orderId`, `/payment-success`, `/return`, and nested `/account` → `dashboard`, `orders`, `orderdetails/:id`, `address`, `change-password`.

### 3.2 API services (`src/service/*`, `src/api/*`) — endpoint map
**Auth:** `auth/user/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password`, `/getUserMasterDataById/:id`, `/update/:id`, `/user/profile`.
**Products & catalog:** `/product/items/filter`, `/product/getTagkeyFilter/:tagKey`, `/product/related`, `/product/itemnameAndSubItemname`, `/product/items/MainCategory`, `/item-sizes/combined`, `/ecom/filters/grouped`, `/menu/list`, `/menu/filter/list`, `/product/whatsapp-link`.
**Rates:** `/product/todayrate` (gold/silver live rate).
**Cart:** `/cart/summary`, `/cart/product` (add), `/cart/item/:tagKey` (delete), `/cart/clear`.
**Wishlist:** `/wishlist` (get/add), `/wishlist/:tagKey` (delete).
**Orders:** `/order/create`, `/order/history`, `/order/all-ordersCount`, `/order/tracking/:orderId`, `/order/track/user`, `/order/status-master`, `/order/update-status`, `/order/reorder`, `/order/invoice/:orderId`.
**Addresses:** `/addresses/customer/:customerId`, `/addresses/create`, `/addresses/update/:id`, `/addresses/delete/:id`, `/addresses/:id`, `/addresses/geocode`.
**Payments:** `/payment/create-payment-link`, `/payment/initiate-sale`, `/payment/verify-payment`, `/payment/status`, `/payment/redirect-url`.
**Pincode/shipping:** `/dtdc/pincode-serviceability`, `/shipping/calculate`, `/origin-address/list`, external `api.postalpincode.in`.
**Banners/home content:** `banner/list`, `category_banner/list`, `category_image/get`, `mainCategory_images/list`, `gender_images/list`, `occasion_banner/list`, `offer_banner/list`, `festival_banner/list`, `feature_product/list`, `best_design/list`, `latest_collection/list`, `instant_offers/list`, `budget-categories/getOnlyVisible`, `new-arrivals`, `trending/top10`, `recently-viewed/list`, `videos/list`, `footer-container/all`, `company/all`.
**Contact / appointment / refund / notifications:** `/contact/submit`, `/video-appointments/upload`, `/refunds/submit`, `/device/register`, `/notification` (via NotificationService).

### 3.3 Hooks (React Query) — `src/hook/*`
One folder per domain: `auth`, `address`, `cart`, `category`, `product`, `order`, `payment`, `rate`, `search`, `favorites`, `notification`, `userProfile`, `pincode`, plus banner hooks (`banner`, `featuredBanner`, `genderBanner`, `budgetBanner`, `newArrivals`, `trending`, `recentlyViewed`, `lastestCollectionBanner`, `BestDesignedBanner`), `footer`, `header/useNavData`, `contactForm`, `video`, `virtualVideo`, `schemeDetails`, `animation`. These map 1:1 to mobile hooks we'll add under `app/api/hooks/`.

### 3.4 Key business logic to preserve
- **Auth token:** website stores `user_token` in localStorage; mobile already uses `@auth_token` in AsyncStorage. Keep mobile convention.
- **Cart/Wishlist are server-backed and auth-gated** (PrivateRoute). Mobile must switch from local Redux to API-backed (with optimistic UI) and gate behind login (reuse `LoginSheet`).
- **Gold rate** drives product pricing display — show via existing `AppGoldPriceCard`.
- **Product identity** = `tagKey` / `TAGKEY` (+ `SNO`, `ITEMID`). Filter endpoint returns the `SearchProduct` shape already typed in `searchService.ts`.
- **Pincode serviceability** gates checkout delivery.
- **Payment** is a hosted payment-link / redirect flow → handle via in-app `WebViewComponent` + deep-link return to `payment-success`.

---

## 4. Comparison Report: Existing vs Missing (Mobile)

| Website page | Mobile screen | Status | Action |
|---|---|---|---|
| Home | `Home/Home.tsx` | Scaffold | Rebuild with banners/rate/categories/new-arrivals/trending APIs |
| Products listing (`/products-page`) | `Category/Products.tsx` | Scaffold | Rebuild w/ `/product/items/filter` + filters + pagination |
| Product detail (`/products-page/:tagKey`) | `Product/ProductDetails.tsx` | Scaffold | Rebuild w/ `getProductByTagKey`, related, sizes, add-to-cart/wishlist |
| Categories / MainCategory | `Category/Category.tsx` | Scaffold | Rebuild w/ `/product/items/MainCategory` + `mainCategory_images` |
| Sub-categories | — (within Category) | Missing | Add via `itemnameAndSubItemname` |
| Search | `search/Search.tsx` | ✅ Real | Keep; link results to new ProductDetails |
| Wishlist | `Wishlist/Wishlist.tsx` | Scaffold | Rebuild w/ `/wishlist` API |
| Cart | `MyCart/MyCart.tsx` | Scaffold | Rebuild w/ `/cart/*` API |
| Checkout | `profile/Checkout.tsx` | Scaffold | Rebuild w/ address + pincode + `/order/create` |
| Payment (`/payment/:orderId`) | `profile/Payment.tsx` | Scaffold | Rebuild w/ payment-link + WebView + verify |
| Payment status | — | Missing | Add `PaymentStatus` screen |
| Address manager | `profile/SavedAddresses` + `SaveAddress` | Scaffold | Rebuild w/ `/addresses/*` API |
| Account dashboard | `profile/Profile.tsx` | Scaffold | Rebuild w/ profile API |
| Edit profile | `profile/EditProfile.tsx` | Scaffold | Rebuild w/ `/auth/user/update/:id` |
| Change password | — | Missing | Add screen |
| Orders | `profile/Myorder.tsx` | Scaffold | Rebuild w/ `/order/history` |
| Order details | — (`Trackorder` partial) | Missing | Add `OrderDetails` w/ `/order/tracking/:id` |
| Order return/replace | — | Missing | Add `Return` flow w/ `/refunds/submit` |
| Notifications | `Notification/Notification.tsx` | Scaffold | Rebuild w/ NotificationService |
| Offers | — | Missing | Add via `offer_banner`/`instant_offers` |
| About | — | Missing | Add static/`company/all` |
| Contact | — | Missing | Add w/ `/contact/submit` |
| Contact store | — | Missing | Add (store locator + map) |
| FAQ | `profile/Questions.tsx` | Scaffold | Repurpose into FAQ |
| Privacy / Terms / Refund / Shipping / Cancellation / Why-Choose-Us / Risk | — | Missing | Add policy screens (static content via `WebViewComponent` or RN text) |
| Size guides (Ring/Bangle) | — | Missing | Add 2 guide screens |
| Scheme + Scheme privacy/support | — | Missing | Add (lower priority) |
| Appointment / Virtual shop | — | Missing | Add (lower priority) |
| Settings / Language | `language/Language.tsx` | Partial | Keep/extend |

### Required NEW APIs to add to mobile (`endpoints.ts` + `services/` + `hooks/`)
`PRODUCT` (filter, byTagKey, related, mainCategory, itemNames, sizes, todayrate, whatsapp), `CART`, `WISHLIST`, `ORDER`, `ADDRESS`, `PAYMENT`, `PINCODE/SHIPPING`, `BANNER/HOME` (banners, gender, offer, featured, best-design, latest, budget, new-arrivals, trending, recently-viewed), `PROFILE`, `NOTIFICATION`, `CONTACT`, `COMPANY/FOOTER`. Each mirrors the website service file of the same name.

### Required NEW reusable components (mobile)
Most exist. Net-new/extend: `HomeBannerCarousel`, `CategoryGrid`, `ProductGrid` (FlatList wrapper), `PriceBreakup`, `ImageGallery` (pinch-zoom), `QtyStepper`, `AddressCard`, `OrderCard`, `OrderStatusTimeline`, `PincodeChecker`, `PaymentWebView` (reuse `WebViewComponent`), `PolicyScreen` (generic static-content wrapper), `EmptyState`/`Skeleton` (already exist — reuse).

---

## 5. Implementation Roadmap (priority order)

**Phase 0 — API foundation (do first, unblocks everything):**
Extend `endpoints.ts`; create services + React-Query hooks for product, rate, cart, wishlist, order, address, payment, profile, home-banners, notification, contact. Add a `QueryClientProvider` at app root. No UI yet.

**Phase 1 — Core shopping funnel (highest value):**
1. Home → 2. Category/Sub-category → 3. Product Listing (+filters/sort) → 4. Product Details → 5. Cart → 6. Wishlist.

**Phase 2 — Checkout & account:**
7. Address management → 8. Checkout (+pincode) → 9. Payment + status → 10. Profile → 11. Edit profile → 12. Orders → 13. Order details/tracking → 14. Change password.

**Phase 3 — Secondary:**
15. Notifications → 16. Offers → 17. Search polish/link-through → 18. Order return/replace.

**Phase 4 — Static & informational:**
19. About → 20. Contact / Contact store → 21. FAQ → 22. Policies (Privacy, Terms, Refund, Shipping, Cancellation, Why-Choose-Us, Risk) → 23. Size guides → 24. Settings/Language.

**Phase 5 — Optional/advanced:**
25. Scheme + scheme privacy/support → 26. Virtual shop / appointment.

### Per-screen delivery format (for every screen)
Each implemented screen will report: **(a)** website page converted, **(b)** files created, **(c)** files modified (navigation/types/endpoints), **(d)** navigation changes, **(e)** API integrations (endpoint + payload + response), **(f)** loading/empty/error/validation states wired.

---

## 6. Conventions & Guardrails
- Reuse `callApi`/`axiosInstance`; add endpoints to `endpoints.ts` — never hardcode URLs in screens.
- Use existing `appcomponents` (AppText/AppButton/AppLoader/AppEmptyState/AppSkeletonLoader/ScreenWrapper) for states & layout.
- Keep theme tokens (`COLORS/FONTS/SIZES`), Jost/Marcellus fonts, and BMG assets — match website branding.
- TypeScript: type every service payload/response (extend `app/types/`), reuse `SearchProduct`.
- Introduce React Query for server state; keep Redux for auth + UI/local state.
- Convert desktop grids/sidebars → mobile: bottom sheets for filters/sort, FlatList grids, sticky bottom CTAs, pull-to-refresh, infinite scroll.
- Gate cart/wishlist/checkout/account behind auth using existing `LoginSheet`.

## 7. Open Questions (to confirm before Phase 1)
1. Priority confirmation: start with the Phase 1 shopping funnel (Home → Product → Cart)?
2. Payment: confirm the live gateway flow is hosted-link + redirect (WebView) — OK to integrate via `WebViewComponent`?
3. Scope of static/policy pages: native RN text vs. rendering the website's HTML in a WebView?
4. Remove leftover template screens (Chat/Call, Shortcode/*) from navigation, or leave them?
