import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerUser, loginUser, googleLoginUser, verifyOtp, resetPassword } from '../../api/services/authService';
import { RegisterPayload, LoginPayload, GoogleLoginPayload, VerifyOtpPayload, ResetPasswordPayload, UserData } from '../../types/auth';
import { AsyncStorageHelper } from '../../utils/AsyncStorageHelper';
import { setAuthToken } from '../../api/axiosInstance';
import { queryClient } from '../../api/queryClient';

const saveSession = async (user: UserData, token: string) => {
  user.token = token;
  await AsyncStorageHelper.saveUserSession(user);
  setAuthToken(token);
};

// ── Register Thunk ────────────────────────────────────────────────
export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await registerUser(payload);
      if (!res.otp) return rejectWithValue(res.message ?? 'Registration failed');
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Registration failed');
    }
  }
);

// ── Login Thunk ───────────────────────────────────────────────────
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await loginUser(payload);
      if (!res.token) return rejectWithValue(res.message ?? 'Login failed');
      const user: UserData = {
        id:            res.id,
        username:      res.username,
        email:         res.email,
        contactNumber: res.contact,
        roles:         res.roles,
        token:         res.token,
      };
      await saveSession(user, res.token);
      // Flush any cached data from a previous session before loading new user data
      queryClient.clear();
      return { user, token: res.token };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Login failed');
    }
  }
);

// ── Google Login Thunk ────────────────────────────────────────────
export const googleLoginThunk = createAsyncThunk(
  'auth/googleLogin',
  async (payload: GoogleLoginPayload, { rejectWithValue }) => {
    try {
      const res = await googleLoginUser(payload);
      if (!res.token) return rejectWithValue(res.message ?? 'Google login failed');
      const user: UserData = {
        id:            res.id,
        username:      res.username,
        email:         res.email,
        contactNumber: res.contactNumber,
        roles:         res.roles,
        token:         res.token,
        picture:       payload.picture,
      };
      await saveSession(user, res.token);
      queryClient.clear();
      return { user, token: res.token };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Google login failed');
    }
  }
);

// ── Verify OTP Thunk (SignUp flow) ────────────────────────────────
export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: VerifyOtpPayload, { rejectWithValue }) => {
    try {
      const res = await verifyOtp(payload);
      if (!res.token && !res.user?.token) return rejectWithValue(res.message ?? 'OTP verification failed');
      const token = (res.token ?? res.user?.token)!;
      const user: UserData = res.user ?? { token };
      await saveSession(user, token);
      queryClient.clear();
      return { user, token };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'OTP verification failed');
    }
  }
);

// ── Reset Password Thunk (ForgotPassword flow) ────────────────────
export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const res = await resetPassword(payload);
      if (res.errorMessage && !res.message) return rejectWithValue(res.errorMessage);
      if (res.token && res.user) {
        const token = res.token;
        const user: UserData = { ...res.user, token };
        await saveSession(user, token);
        return { user, token, message: res.message };
      }
      return { user: null, token: null, message: res.message };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Password reset failed');
    }
  }
);

interface AuthState {
  loading: boolean;
  loginLoading: boolean;
  googleLoading: boolean;
  otpLoading: boolean;
  resetLoading: boolean;
  registerError: string | null;
  loginError: string | null;
  googleError: string | null;
  otpError: string | null;
  resetError: string | null;
  user: UserData | null;
  token: string | null;
  pendingOtpUser: { username: string; email: string; contactNumber: string } | null;
}

const initialState: AuthState = {
  loading: false, loginLoading: false, googleLoading: false, otpLoading: false, resetLoading: false,
  registerError: null, loginError: null, googleError: null, otpError: null, resetError: null,
  user: null, token: null, pendingOtpUser: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.registerError = null; state.loginError = null;
      state.googleError = null; state.otpError = null; state.resetError = null;
    },
    logout: (state) => {
      state.user = null; state.token = null;
      setAuthToken(null);
      AsyncStorageHelper.clearSession();
      // Clear ALL React Query cache so the next user never sees stale data
      queryClient.clear();
    },
    hydrateAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending,   (state) => { state.loading = true; state.registerError = null; })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingOtpUser = {
          username:      action.payload.username      ?? '',
          email:         action.payload.email         ?? '',
          contactNumber: action.payload.contactNumber ?? '',
        };
      })
      .addCase(registerThunk.rejected,  (state, action) => { state.loading = false; state.registerError = action.payload as string; })
      .addCase(loginThunk.pending,   (state) => { state.loginLoading = true; state.loginError = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user  = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginThunk.rejected,  (state, action) => { state.loginLoading = false; state.loginError = action.payload as string; })
      .addCase(googleLoginThunk.pending,   (state) => { state.googleLoading = true; state.googleError = null; })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.googleLoading = false;
        state.user  = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleLoginThunk.rejected,  (state, action) => { state.googleLoading = false; state.googleError = action.payload as string; })
      .addCase(verifyOtpThunk.pending,   (state) => { state.otpLoading = true; state.otpError = null; })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.user  = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(verifyOtpThunk.rejected,  (state, action) => { state.otpLoading = false; state.otpError = action.payload as string; })
      .addCase(resetPasswordThunk.pending,   (state) => { state.resetLoading = true; state.resetError = null; })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.resetLoading = false;
        if (action.payload.token) {
          state.user  = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(resetPasswordThunk.rejected,  (state, action) => { state.resetLoading = false; state.resetError = action.payload as string; });
  },
});

export const { clearAuthError, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
