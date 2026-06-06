export interface UserData {
  id?: number;
  username?: string;
  name?: string;
  email?: string;
  contactNumber?: string;
  hash_key?: string;
  roles?: string[];
  token?: string;
  errorMessage?: string;
  appRequest?: boolean;
  referralCode?: string;
  referralLink?: string;
  playStoreLink?: string;
  whatsappLink?: string;
  used_referral_code?: string;
  picture?: string;
  socialMedia?: string;
}

// ── Signup ────────────────────────────────────────────────────────
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  contactNumber: string;
  hashKey?: string;
}

export interface RegisterResponse {
  username?: string;
  email?: string;
  contactNumber?: string;
  hash_key?: string;
  roles?: string[];
  otp?: string;
  errorMessage?: string;
  appRequest?: boolean;
  message?: string;
}

// ── Verify OTP ────────────────────────────────────────────────────
export interface VerifyOtpPayload {
  contactNumber: string;
  otp: string;
}

export interface ResendOtpPayload {
  contactNumber: string;
}

export interface OtpResponse {
  message?: string;
  token?: string;
  errorMessage?: string;
  user?: UserData;
}

// ── Login ─────────────────────────────────────────────────────────
export interface LoginPayload {
  contactOrEmailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  status?: string;
  message: string;
  data?: {
    token: string;
    user: UserData;
  };
}

// ── Google Login ──────────────────────────────────────────────────
export interface GoogleLoginPayload {
  idToken: string;
  picture?: string;
}

export interface GoogleLoginResponse {
  id?: number;
  username?: string;
  email?: string;
  contactNumber?: string;
  roles?: string[];
  token?: string;
  status?: string;
  message?: string;
}

// ── Google Contact Update ─────────────────────────────────────────
export interface GoogleContactUpdatePayload {
  userId: number;
  contactNumber: string;
}

export interface GoogleContactUpdateResponse {
  message?: string;
  otp?: string;
  errorMessage?: string;
}

export interface GoogleContactVerifyPayload {
  contactNumber: string;
  otp: string;
}
