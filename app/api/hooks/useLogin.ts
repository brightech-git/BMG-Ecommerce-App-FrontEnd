import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, clearAuthError } from '../../redux/reducer/authReducer';
import { LoginPayload } from '../services/authService';

export const useLogin = () => {
  const dispatch = useDispatch<any>();
  const { loginLoading, loginError, user, token } = useSelector((state: any) => state.auth);

  const login = (payload: LoginPayload) => dispatch(loginThunk(payload));

  return { login, loginLoading, error: loginError, user, token, clearError: () => dispatch(clearAuthError()) };
};
