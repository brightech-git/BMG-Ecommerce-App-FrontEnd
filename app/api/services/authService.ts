import { callApi } from '../apiClient';
import { AUTH } from '../endpoints';
import {
  RegisterPayload, RegisterResponse,
  VerifyOtpPayload, ResendOtpPayload, OtpResponse,
  LoginPayload, LoginResponse,
  GoogleLoginPayload, GoogleLoginResponse,
  GoogleContactUpdatePayload, GoogleContactUpdateResponse,
  GoogleContactVerifyPayload,
} from '../../types/auth';

export type {
  RegisterPayload, RegisterResponse,
  VerifyOtpPayload, ResendOtpPayload, OtpResponse,
  LoginPayload, LoginResponse,
  GoogleLoginPayload, GoogleLoginResponse,
  GoogleContactUpdatePayload, GoogleContactUpdateResponse,
  GoogleContactVerifyPayload,
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
