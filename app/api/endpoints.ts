export const AUTH = {
  //Registration
  REGISTER:                  '/auth/user/register',
  REGISTER_RESEND_OTP:       '/auth/user/resend-otp',
  VERIFY_OTP:                '/auth/user/verify-otp',

  // Login
  LOGIN:                     '/auth/user/login',
  FORGOT_PASSWORD:           '/auth/user/forgot-password',
  RESET_PASSWORD:            '/auth/user/reset-password',

  // Google Auth
  GOOGLE_LOGIN:              '/auth/google-login',
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