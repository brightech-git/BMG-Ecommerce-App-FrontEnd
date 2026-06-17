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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {useAuth} from '../../context/AuthContext';
import {colors, fonts, shadows, radius} from '../../theme/theme';
import Logo from '../../components/common/Logo';

// ── Password strength helper ──────────────────────────────────────────────────
const getStrength = password => {
  if (!password) return {score: 0, label: '', color: colors.border};
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    {label: 'Weak', color: '#E53935'},
    {label: 'Fair', color: '#FB8C00'},
    {label: 'Good', color: '#FDD835'},
    {label: 'Strong', color: '#43A047'},
    {label: 'Very Strong', color: '#1B5E20'},
  ];
  return {score, ...(map[score - 1] || map[0])};
};

const RegisterScreen = ({navigation}) => {
  const {signup, verifyOtp} = useAuth();

  // Step 1: registration form
  const [form, setForm] = useState({
    username: '',
    email: '',
    contactNumber: '',
    password: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Step 2: OTP verification
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempContact, setTempContact] = useState('');

  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const otpRef = useRef(null);

  const setField = (key, val) => {
    setForm(f => ({...f, [key]: val}));
    if (errors[key]) setErrors(e => ({...e, [key]: undefined}));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim() || form.username.trim().length < 3)
      e.username = 'Minimum 3 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!form.email.endsWith('@gmail.com'))
      e.email = 'Must be a Gmail address';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Invalid email format';
    if (!form.contactNumber.trim()) e.contactNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.contactNumber))
      e.contactNumber = 'Must be exactly 10 digits';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!termsAccepted) e.terms = 'Please accept the terms to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await signup(form);

      if (response?.alreadyExists) {
        Toast.show({
          type: 'info',
          text1: 'Account Exists',
          text2: 'This account already exists. Please log in.',
        });
        navigation.navigate('Login');
        return;
      }

      // Registration OK → move to OTP step
      setTempContact(form.contactNumber);
      setShowOtpStep(true);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: `Verification code sent to ${form.contactNumber}`,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: err.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setErrors({otp: 'Enter a valid 6-digit OTP'});
      return;
    }
    setLoading(true);
    try {
      await verifyOtp({contactNumber: tempContact, otp});
      Toast.show({
        type: 'success',
        text1: 'Welcome to BMG!',
        text2: 'Account verified successfully.',
      });
      // AuthContext sets user → AppNavigator switches to AppStack
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: err.message || 'Invalid OTP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);

  // ── OTP Screen ──────────────────────────────────────────────────────────────
  if (showOtpStep) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Logo />
            </View>

            <View style={styles.card}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setShowOtpStep(false)}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>

              {/* Icon */}
              <View style={styles.otpIconWrap}>
                <Text style={styles.otpIcon}>📱</Text>
              </View>

              <Text style={styles.cardTitle}>Verify Account</Text>
              <Text style={styles.cardSubtitle}>
                We sent a 6-digit code to{'\n'}
                <Text style={styles.contactHighlight}>{tempContact}</Text>
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <View style={[styles.inputWrap, errors.otp && styles.inputError]}>
                  <TextInput
                    ref={otpRef}
                    style={[styles.input, styles.otpInput]}
                    placeholder="• • • • • •"
                    placeholderTextColor={colors.placeholder}
                    value={otp}
                    onChangeText={val => {
                      setOtp(val.replace(/\D/g, ''));
                      if (errors.otp) setErrors({});
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyOtp}
                    autoFocus
                  />
                </View>
                {errors.otp ? (
                  <Text style={styles.errorText}>{errors.otp}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
                activeOpacity={0.85}>
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.btnText}>VERIFY OTP</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                <Text style={styles.bottomPrompt}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleSignup}>
                  <Text style={styles.bottomLink}>Resend</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Registration Form ───────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ── Brand Header ── */}
          <View style={styles.header}>
            <Logo />
            <Text style={styles.tagline}>Since 1985 · Pure Gold · Pure Trust</Text>
          </View>

          {/* ── Form Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>
              Fill in your details to get started.
            </Text>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>👤  Username</Text>
              <View style={[styles.inputWrap, errors.username && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username (min 3 chars)"
                  placeholderTextColor={colors.placeholder}
                  value={form.username}
                  onChangeText={val => setField('username', val)}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
              {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>📧  Email Address</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="Enter your Gmail address"
                  placeholderTextColor={colors.placeholder}
                  value={form.email}
                  onChangeText={val => setField('email', val)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Mobile */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>📱  Mobile Number</Text>
              <View style={[styles.inputWrap, errors.contactNumber && styles.inputError]}>
                <TextInput
                  ref={phoneRef}
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.placeholder}
                  value={form.contactNumber}
                  onChangeText={val =>
                    setField('contactNumber', val.replace(/\D/g, ''))
                  }
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
              {errors.contactNumber ? (
                <Text style={styles.errorText}>{errors.contactNumber}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>🔒  Password</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, {paddingRight: 8}]}
                  placeholder="Create a strong password"
                  placeholderTextColor={colors.placeholder}
                  value={form.password}
                  onChangeText={val => setField('password', val)}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}

              {/* Password strength bar */}
              {form.password.length > 0 && (
                <View style={styles.strengthWrap}>
                  <View style={styles.strengthBarRow}>
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <View
                        key={lvl}
                        style={[
                          styles.strengthSegment,
                          {
                            backgroundColor:
                              lvl <= strength.score
                                ? strength.color
                                : colors.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  {strength.label ? (
                    <Text
                      style={[styles.strengthLabel, {color: strength.color}]}>
                      {strength.label}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => {
                setTermsAccepted(v => !v);
                if (errors.terms) setErrors(e => ({...e, terms: undefined}));
              }}
              activeOpacity={0.7}>
              <View
                style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms ? (
              <Text style={[styles.errorText, {marginTop: -8, marginBottom: 8}]}>
                {errors.terms}
              </Text>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.btnText}>CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login link */}
            <View style={styles.bottomRow}>
              <Text style={styles.bottomPrompt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.bottomLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  flex: {flex: 1},
  safeArea: {flex: 1, backgroundColor: colors.headerBg},
  scrollContent: {flexGrow: 1},

  header: {
    backgroundColor: colors.headerBg,
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
  },
  logoRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  logoText: {
    fontSize: fonts.size.display, fontWeight: fonts.weight.black,
    color: colors.headerText, letterSpacing: 5,
  },
  logoDivider: {
    width: 2, height: 34,
    backgroundColor: colors.white, marginHorizontal: 12, opacity: 0.6,
  },
  logoSub: {
    fontSize: 13, fontWeight: fonts.weight.extraBold,
    color: colors.headerText, letterSpacing: 6,
  },
  tagline: {
    fontSize: 11, color: colors.headerText,
    letterSpacing: 2, opacity: 0.8,
  },

  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 28, paddingTop: 32, paddingBottom: 40,
  },
  backBtn: {marginBottom: 12},
  backText: {fontSize: 14, color: colors.primary, fontWeight: fonts.weight.semiBold},
  cardTitle: {fontSize: 26, fontWeight: fonts.weight.extraBold, color: colors.text, marginBottom: 6},
  cardSubtitle: {fontSize: 13, color: colors.textSecondary, marginBottom: 24},

  fieldGroup: {marginBottom: 14},
  label: {fontSize: 13, fontWeight: fonts.weight.semiBold, color: colors.text, marginBottom: 6},
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14,
  },
  inputError: {borderColor: colors.error},
  input: {flex: 1, height: 50, fontSize: 15, color: colors.text},
  eyeIcon: {fontSize: 18, paddingLeft: 4},
  errorText: {fontSize: 12, color: colors.error, marginTop: 4, marginLeft: 2},

  // Password strength
  strengthWrap: {marginTop: 8},
  strengthBarRow: {flexDirection: 'row', gap: 4},
  strengthSegment: {
    flex: 1, height: 4, borderRadius: 2,
  },
  strengthLabel: {fontSize: 11, marginTop: 4, fontWeight: '600'},

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20, height: 20,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 4, marginRight: 10, marginTop: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  checkmark: {fontSize: 12, color: colors.white, fontWeight: '800'},
  termsText: {flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 20},
  termsLink: {color: colors.primary, fontWeight: '600'},

  // Button
  btn: {
    backgroundColor: colors.primaryMild,
    borderRadius: radius.md, height: 52,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.orange,
  },
  btnDisabled: {opacity: 0.65},
  btnText: {fontSize: 15, fontWeight: fonts.weight.extraBold, color: colors.white, letterSpacing: 2},

  divider: {flexDirection: 'row', alignItems: 'center', marginVertical: 22},
  dividerLine: {flex: 1, height: 1, backgroundColor: colors.border},
  dividerLabel: {
    marginHorizontal: 12, fontSize: 12,
    color: colors.textLight, fontWeight: '600',
  },

  bottomRow: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  resendRow: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20},
  bottomPrompt: {fontSize: 14, color: colors.textSecondary},
  bottomLink: {fontSize: 14, color: colors.primary, fontWeight: '700'},

  // OTP screen
  otpIconWrap: {
    width: 72, height: 72,
    backgroundColor: '#FFF3E0',
    borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  otpIcon: {fontSize: 36},
  contactHighlight: {color: colors.primary, fontWeight: '700'},
  otpInput: {textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: '700'},
});
