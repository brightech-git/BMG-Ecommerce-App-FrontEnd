import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import {useAuth} from '../../context/AuthContext';
import {colors, fonts, shadows, radius} from '../../theme/theme';
import Logo from '../../components/common/Logo';

const LoginScreen = ({navigation}) => {
  const {login} = useAuth();

  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    if (!contact.trim()) {
      newErrors.contact = 'Mobile number / Email / Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleLogin = async () => {
    try {
      // Google OAuth entry point. Wire up expo-auth-session / Google
      // Sign-In here and exchange the returned id_token with the backend
      // (e.g. POST auth/user/google) to obtain the app session token.
      Toast.show({
        type: 'info',
        text1: 'Google Sign-In',
        text2: 'Google login will be available shortly.',
        visibilityTime: 2500,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In Failed',
        text2: err.message || 'Please try again.',
        visibilityTime: 3000,
      });
    }
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({
        contactOrEmailOrUsername: contact.trim(),
        password,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: err.message || 'Invalid credentials. Please try again.',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <Logo width={170} height={64} />
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Welcome back! Please enter your details.
            </Text>

            {/* Mobile / Email / Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mobile Number / Email / Username</Text>
              <View style={[styles.inputWrap, errors.contact && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter mobile, email or username"
                  placeholderTextColor={colors.placeholder}
                  value={contact}
                  onChangeText={val => {
                    setContact(val);
                    if (errors.contact) setErrors(e => ({...e, contact: undefined}));
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
              {errors.contact ? (
                <Text style={styles.errorText}>{errors.contact}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, {paddingRight: 8}]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={val => {
                    setPassword(val);
                    if (errors.password) setErrors(e => ({...e, password: undefined}));
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.eyeIcon}>{showPassword ? '\u{1F648}' : '\u{1F441}️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.btnText}>SIGN IN</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Continue with Google */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              activeOpacity={0.85}>
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Register */}
            <View style={styles.bottomRow}>
              <Text style={styles.bottomPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.bottomLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  flex: {flex: 1},
  safeArea: {flex: 1, backgroundColor: colors.headerBg},
  scrollContent: {flexGrow: 1},

  brandHeader: {alignItems: 'center', justifyContent: 'center', paddingVertical: 28},
  logo: {width: 150, height: 110, resizeMode: 'contain'},

  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  cardTitle: {
    fontSize: fonts.size.xxl + 2,
    fontWeight: fonts.weight.extraBold,
    color: colors.text,
    marginBottom: 6,
  },
  cardSubtitle: {fontSize: 13, color: colors.textSecondary, marginBottom: 28},

  fieldGroup: {marginBottom: 16},
  label: {
    fontSize: 13,
    fontWeight: fonts.weight.semiBold,
    color: colors.text,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  inputError: {borderColor: colors.error},
  input: {flex: 1, height: 50, fontSize: 15, color: colors.text},
  eyeIcon: {fontSize: 18, paddingLeft: 4},
  errorText: {fontSize: 12, color: colors.error, marginTop: 4, marginLeft: 2},

  forgotBtn: {alignSelf: 'flex-end', marginTop: 2, marginBottom: 24},
  forgotText: {fontSize: 13, color: colors.primary, fontWeight: fonts.weight.semiBold},

  btn: {
    backgroundColor: colors.primaryMild,
    borderRadius: radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.orange,
  },
  btnDisabled: {opacity: 0.65},
  btnText: {
    fontSize: 15,
    fontWeight: fonts.weight.extraBold,
    color: colors.white,
    letterSpacing: 2,
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 24,
  },
  googleBtnText: {fontSize: 14, fontWeight: fonts.weight.bold, color: colors.text},

  divider: {flexDirection: 'row', alignItems: 'center', marginVertical: 24},
  dividerLine: {flex: 1, height: 1, backgroundColor: colors.border},
  dividerLabel: {
    marginHorizontal: 12,
    fontSize: 12,
    color: colors.textLight,
    fontWeight: fonts.weight.semiBold,
  },

  bottomRow: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  bottomPrompt: {fontSize: 14, color: colors.textSecondary},
  bottomLink: {fontSize: 14, color: colors.primary, fontWeight: fonts.weight.bold},
});
