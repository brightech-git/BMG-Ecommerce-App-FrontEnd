export const AUTH = {
  //Registration
  REGISTER:                  '/auth/user/register',
  REGISTER_RESEND_OTP:       '/auth/user/resend-otp',
  VERIFY_OTP:                '/auth/user/verify-otp',

  // Login
  LOGIN:                     '/auth/user/login',
  FORGOT_PASSWORD:           '/auth/user/forgot-password',
  RESET_PASSWORD:            '/auth/user/reset-password',

  // Google / Apple Auth
  GOOGLE_LOGIN:              '/auth/google-login',
  APPLE_LOGIN:               '/auth/apple-login',
  GOOGLE_CONTACT_UPDATE:     '/auth/user/update-contact-number',

  // User
  PROFILE_BY_ID:             '/auth/user/getUserMasterDataById/:id',
  GET_ALL_USERS:             '/auth/user/getAllUserMasterData',
  USER_COUNT:                '/auth/user/count',
  DELETE_USER:               '/auth/user/deleteUserById/:id',
};

export const SEARCH = {
  SEARCH:                    '/product/items/filter',
};

// Catalog / Products  (mirrors website ProductService + CategoryItemsService + RateService)
export const PRODUCT = {
  FILTER:             '/product/items/filter',
  BY_TAGKEY:          '/product/getTagkeyFilter/:tagKey',
  RELATED:            '/product/related',
  ITEM_SUBITEM_NAMES: '/product/itemnameAndSubItemname',
  MAIN_CATEGORY:      '/product/items/MainCategory',
  ITEM_SIZES:         '/item-sizes/combined',
  TODAY_RATE:         '/product/todayrate',
  WHATSAPP_LINK:      '/product/whatsapp-link',
  GROUPED_FILTERS:    '/ecom/filters/grouped',
  MENU_LIST:          '/menu/list',
  MENU_FILTER_LIST:   '/menu/filter/list',
};

// Cart
export const CART = {
  SUMMARY:  '/cart/summary',
  ADD:      '/cart/product',
  DELETE:   '/cart/item/:tagKey',
  CLEAR:    '/cart/clear',
};

// Wishlist
export const WISHLIST = {
  LIST:    '/wishlist',
  ADD:     '/wishlist',
  DELETE:  '/wishlist/:tagKey',
};

// Onboarding app banners
export const ONBOARD = {
  BANNER_LIST: '/App_banner/list',
};

// Home / Banners content
export const HOME = {
  // ── Active ──────────────────────────────────────────────────────
  BUDGET_CATEGORIES:   '/budget-categories/getOnlyVisible',
  NEW_ARRIVALS:        '/new-arrivals',
  TRENDING:            '/trending/top10',
  RECENTLY_VIEWED:     '/recently-viewed/list',   // GET  — requires auth token
  RECENTLY_VIEWED_ADD: '/recently-viewed/add',    // POST { tagKey } — records a view

  // ── Unused — commented out for later use ────────────────────────
  // BANNER_LIST:       '/banner/list',
  // CATEGORY_IMAGES:   '/mainCategory_images/list',
  // GENDER_IMAGES:     '/gender_images/list',
  OFFER_BANNERS:     '/offer_banner/list',
  INSTANT_OFFERS:    '/instant_offers/list',
  // FEATURED_PRODUCTS: '/feature_product/list',
  // BEST_DESIGN:       '/best_design/list',
  // LATEST_COLLECTION: '/latest_collection/list',
  // COMPANY:           '/company/all',
};

// Orders
export const ORDER = {
  CREATE:        '/order/create',
  GET_ORDER:     '/order/getOrder',
  DTDC_TRACK:    '/dtdc/track',
  HISTORY:       '/order/history',
  COUNT:         '/order/all-ordersCount',
  TRACK_BY_ID:   '/order/tracking/:orderId',
  TRACK_USER:    '/order/track/user',
  STATUS_MASTER: '/order/status-master',
  UPDATE_STATUS: '/order/update-status',
  REORDER:       '/order/reorder',
  INVOICE:       '/order/invoice/:orderId',
};

// Addresses
export const ADDRESS = {
  BY_CUSTOMER: '/addresses/customer/:customerId',
  CREATE:      '/addresses/create',
  UPDATE:      '/addresses/update/:id',
  DELETE:      '/addresses/delete/:id',
  BY_ID:       '/addresses/:id',
  GEOCODE:     '/addresses/geocode',
};

// Payments
export const PAYMENT = {
  CREATE_LINK:   '/payment/create-payment-link',
  INITIATE_SALE: '/payment/initiate-sale',
  VERIFY:        '/payment/verify-payment',
  STATUS:        '/payment/status',
  REDIRECT_URL:  '/payment/redirect-url',
};

// Pincode / Shipping
export const SHIPPING = {
  PINCODE_SERVICEABILITY: '/dtdc/pincode-serviceability',
  CALCULATE:              '/shipping/calculate',
  ORIGIN_ADDRESS:         '/origin-address/list',
};

// Profile
export const PROFILE = {
  ME:              '/user/profile',
  BY_ID:           '/auth/user/getUserMasterDataById/:id',
  UPDATE:          '/auth/user/update/:id',
  CHANGE_PASSWORD: '/user/change-password',
};

// Company info
export const COMPANY = {
  ALL: '/company/all',
};

// Notification / Contact
export const MISC = {
  CONTACT_SUBMIT:    '/contact/submit',
  DEVICE_REGISTER:   '/device/register',
  NOTIFICATION_LIST: '/notification/list',
};

export const NOTIF = {
  GET_USER:       (userId: number) => `/notifications/user/${userId}`,
  UNREAD_COUNT:   (userId: number) => `/notifications/user/${userId}/unread-count`,
  MARK_READ:      (notifId: number, userId: number) => `/notifications/read/${notifId}/user/${userId}`,
  MARK_ALL_READ:  (userId: number) => `/notifications/read/all/${userId}`,
  DELETE_ONE:     (id: number) => `/notifications/notification/${id}`,
  DELETE_BY_USER: (userId: number) => `/notifications/user/${userId}`,
};
