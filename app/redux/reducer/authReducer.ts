import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerUser, loginUser, googleLoginUser } from '../../api/services/authService';
import { RegisterPayload, LoginPayload, GoogleLoginPayload, UserData } from '../../types/auth';
import { AsyncStorageHelper } from '../../utils/AsyncStorageHelper';

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
      if (!res.data?.token) return rejectWithValue(res.message ?? 'Login failed');
      await AsyncStorageHelper.saveUserSession(res.data.user);
      return res;
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
      await AsyncStorageHelper.saveUserSession(user);
      return { user, token: res.token };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Google login failed');
    }
  }
);

interface AuthState {
  loading: boolean;
  loginLoading: boolean;
  googleLoading: boolean;
  registerError: string | null;
  loginError: string | null;
  googleError: string | null;
  user: UserData | null;
  token: string | null;
  pendingOtpUser: { username: string; email: string; contactNumber: string } | null;
}

const initialState: AuthState = {
  loading: false, loginLoading: false, googleLoading: false,
  registerError: null, loginError: null, googleError: null,
  user: null, token: null, pendingOtpUser: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => { state.registerError = null; state.loginError = null; state.googleError = null; },
    logout:         (state) => { state.user = null; state.token = null; },
  },
  extraReducers: (builder) => {
    builder
      // Register
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
      // Login
      .addCase(loginThunk.pending,   (state) => { state.loginLoading = true; state.loginError = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user  = action.payload.data?.user  ?? null;
        state.token = action.payload.data?.token ?? null;
      })
      .addCase(loginThunk.rejected,  (state, action) => { state.loginLoading = false; state.loginError = action.payload as string; })
      // Google Login
      .addCase(googleLoginThunk.pending,   (state) => { state.googleLoading = true; state.googleError = null; })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.googleLoading = false;
        state.user  = action.payload.user  ?? null;
        state.token = action.payload.token ?? null;
      })
      .addCase(googleLoginThunk.rejected,  (state, action) => { state.googleLoading = false; state.googleError = action.payload as string; });
  },
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
