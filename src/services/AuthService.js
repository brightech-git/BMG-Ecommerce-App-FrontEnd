import api from '../api/api';

// Register new user
// payload: { username, email, contactNumber, password, roles: ["ROLE_USER"] }
export const registerUser = async userData => {
  const response = await api.post('auth/user/register', userData);
  return response.data;
};

// Login user
// payload: { contactOrEmailOrUsername, password }
export const loginUser = async loginData => {
  const response = await api.post('auth/user/login', loginData);
  const data = response.data;

  if (data.status === 'error' || data.error) {
    throw new Error(data.message || data.error || 'Login failed');
  }
  if (!data.token) {
    throw new Error('No token received. Please try again.');
  }

  return data;
};

// Verify OTP after registration
// payload: { contactNumber, otp }
export const verifyOtpService = async ({contactNumber, otp}) => {
  const response = await api.post('auth/user/verify-otp', {contactNumber, otp});
  const data = response.data;
  if (data.error) throw new Error(data.error);
  return data;
};

// Forgot Password — calls backend to send OTP via SMS
// payload: { contactNumber }
export const forgotPasswordService = async ({contactNumber}) => {
  const response = await api.post('auth/user/forgot-password', {contactNumber});
  const data = response.data;
  if (data.error) throw new Error(data.error);
  return data; // { message: "...", otpSent: true }
};

// Reset Password
// payload: { contactNumber, otp, newPassword }
export const resetPasswordService = async ({contactNumber, otp, newPassword}) => {
  const response = await api.post('auth/user/reset-password', {
    contactNumber,
    otp,
    newPassword,
  });
  const data = response.data;
  if (data.error) throw new Error(data.error);
  return data; // { message: "Password reset successful" }
};

// Change Password (authenticated)
// payload: { oldPassword, newPassword }
export const changePasswordService = async ({oldPassword, newPassword}) => {
  const response = await api.post('/user/change-password', {
    oldPassword,
    newPassword,
  });
  const data = response.data;
  if (data.error) throw new Error(data.error);
  return data;
};
