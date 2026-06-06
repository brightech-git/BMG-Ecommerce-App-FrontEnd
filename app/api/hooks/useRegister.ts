import { useDispatch, useSelector } from 'react-redux';
import { registerThunk, clearAuthError } from '../../redux/reducer/authReducer';
import { RegisterPayload } from '../services/authService';

export const useRegister = () => {
  const dispatch = useDispatch<any>();
  const { loading, registerError, pendingOtpUser } = useSelector((state: any) => state.auth);

  const register = (payload: RegisterPayload) => dispatch(registerThunk(payload));

  return { register, loading, error: registerError, pendingOtpUser, clearError: () => dispatch(clearAuthError()) };
};
