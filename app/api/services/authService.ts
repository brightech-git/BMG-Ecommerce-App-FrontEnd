import { callApi } from '../apiClient';
import { AUTH } from '../endpoints';
import {
  RegisterPayload, RegisterResponse,
  VerifyOtpPayload, ResendOtpPayload, OtpResponse,
  LoginPayload, LoginResponse,
  GoogleLoginPayload, GoogleLoginResponse,
  GoogleContactUpdatePayload, GoogleContactUpdateResponse,
  GoogleContactVerifyPayload,
  ForgotPasswordPayload, ForgotPasswordResponse,
  ResetPasswordPayload, ResetPasswordResponse,
} from '../../types/auth';

export type {
  RegisterPayload, RegisterResponse,
  VerifyOtpPayload, ResendOtpPayload, OtpResponse,
  LoginPayload, LoginResponse,
  GoogleLoginPayload, GoogleLoginResponse,
  GoogleContactUpdatePayload, GoogleContactUpdateResponse,
  GoogleContactVerifyPayload,
  ForgotPasswordPayload, ForgotPasswordResponse,
  ResetPasswordPayload, ResetPasswordResponse,
};

export const registerUser = (payload: RegisterPayload) =>
  callApi<RegisterPayload, RegisterResponse>({ method: 'post', url: AUTH.REGISTER, data: payload });

export const verifyOtp = (payload: VerifyOtpPayload) =>
  callApi<VerifyOtpPayload, OtpResponse>({ method: 'post', url: AUTH.VERIFY_OTP, data: payload });

export const resendOtp = (payload: ResendOtpPayload) =>
  callApi<ResendOtpPayload, OtpResponse>({ method: 'post', url: AUTH.REGISTER_RESEND_OTP, data: payload });

export const loginUser = (payload: LoginPayload) =>
  callApi<LoginPayload, LoginResponse>({ method: 'post', url: AUTH.LOGIN, data: payload });

export const googleLoginUser = (payload: GoogleLoginPayload) =>
  callApi<GoogleLoginPayload, GoogleLoginResponse>({ method: 'post', url: AUTH.GOOGLE_LOGIN, data: payload });


export const updateGoogleContact = (payload: GoogleContactUpdatePayload) =>
  callApi<GoogleContactUpdatePayload, GoogleContactUpdateResponse>({
    method: 'post',
    url: AUTH.GOOGLE_CONTACT_UPDATE,
    params: { userId: payload.userId, contactNumber: payload.contactNumber },
  });

export const verifyGoogleContact = (body: GoogleContactVerifyPayload) =>
  callApi<GoogleContactVerifyPayload, OtpResponse>({ method: 'post', url: AUTH.VERIFY_OTP, data: body });

export const forgotPassword = (payload: ForgotPasswordPayload) =>
  callApi<ForgotPasswordPayload, ForgotPasswordResponse>({ method: 'post', url: AUTH.FORGOT_PASSWORD, data: payload });

export const resetPassword = (payload: ResetPasswordPayload) =>
  callApi<ResetPasswordPayload, ResetPasswordResponse>({ method: 'post', url: AUTH.VERIFY_OTP, data: payload });
