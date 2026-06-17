import React, { useState, useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, SafeAreaView, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Button from '../../components/Button/Button';
import CustomInput from '../../components/Input/CustomInput';
import { Feather } from '@expo/vector-icons';
import Customotp from '../../components/Input/Customotp';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { resetPassword, forgotPassword } from '../../api/services/authService';
import { AsyncStorageHelper } from '../../utils/AsyncStorageHelper';
import { useToast } from '../../components/commoncomponents/Toast';

type Props = StackScreenProps<RootStackParamList, 'EnterCode'>;

const EnterCode = ({ navigation, route }: Props) => {

    const { contactNumber } = route.params;
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const toast = useToast();

    const [otpCode, setOTPCode] = useState('');
    const [isPinReady, setIsPinReady] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const maximumCodeLength = 6;

    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        if (!isPinReady) {
            toast.warning('Please enter the 6-digit OTP', { position: 'top' });
            return;
        }
        if (!newPassword.trim()) {
            toast.warning('Please enter a new password', { position: 'top' });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.warning('Passwords do not match', { position: 'top' });
            return;
        }
        try {
            setLoading(true);
            const res = await resetPassword({ contactNumber, otp: otpCode, newPassword });
            if (res.errorMessage && !res.message) throw new Error(res.errorMessage);
            if (res.user) await AsyncStorageHelper.saveUserSession(res.user);
            toast.success(res.message ?? 'Password reset successfully', { position: 'top' });
            navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
        } catch (err: any) {
            toast.error(err.message ?? 'Verification failed', { position: 'top', duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        try {
            setResendLoading(true);
            await forgotPassword({ contactNumber, hashKey: '' });
            toast.success('OTP resent successfully', { position: 'top' });
            setTimer(60);
        } catch (err: any) {
            toast.error(err.message ?? 'Failed to resend OTP', { position: 'top', duration: 4000 });
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View>
                    <View style={{ width: 600, height: 500, backgroundColor: COLORS.primary, borderRadius: 250, marginLeft: -95, marginTop: -220, overflow: 'hidden' }}>
                        <Image
                            style={{ height: undefined, aspectRatio: 2.3 / 1.2, resizeMode: 'contain', width: '100%', marginTop: 220 }}
                            source={IMAGES.item7}
                        />
                        <View style={{ width: 600, height: 500, backgroundColor: '#360F00', borderRadius: 250, position: 'absolute', opacity: .8 }} />
                    </View>
                    <View style={{ position: 'absolute', top: 30, left: 20 }}>
                        <Text style={{ ...FONTS.Marcellus, fontSize: 28, color: COLORS.white }}>Enter One Time{"\n"}Password (OTP)</Text>
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container, { paddingTop: 0, marginTop: -150, flex: 1 }]}>
                    <View
                        style={[{
                            shadowColor: 'rgba(195, 123, 95, 0.20)',
                            shadowOffset: { width: 2, height: 20 },
                            shadowOpacity: .1,
                            shadowRadius: 5,
                        }, Platform.OS === 'ios' && {
                            backgroundColor: colors.card,
                            borderRadius: 35,
                        }]}
                    >
                        <View style={{ backgroundColor: colors.card, padding: 30, borderRadius: 40, paddingBottom: 50 }}>
                            <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title, lineHeight: 28 }}>
                                OTP Sent To{' '}
                                <Text style={{ color: '#C37B5F' }}>{contactNumber}</Text>
                            </Text>
                            <View style={{ marginBottom: 10, marginTop: 20 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, paddingLeft: 10 }}>
                                    OTP<Text style={{ color: '#FF0000' }}>*</Text>
                                </Text>
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Customotp
                                        code={otpCode}
                                        setCode={setOTPCode}
                                        maximumLength={maximumCodeLength}
                                        setIsPinReady={setIsPinReady}
                                    />
                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>If you don't receive code! </Text>
                                        <TouchableOpacity onPress={handleResend} disabled={resendLoading || timer > 0}>
                                            {resendLoading
                                                ? <ActivityIndicator size={16} color={COLORS.danger} />
                                                : <Text style={{ ...FONTS.fontMedium, borderBottomWidth: 1, borderBottomColor: timer > 0 ? colors.textLight : COLORS.danger, color: timer > 0 ? colors.textLight : COLORS.danger }}>
                                                    {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
                                                  </Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={{ marginBottom: 10, marginTop: 10 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>
                                    New Password<Text style={{ color: '#FF0000' }}>*</Text>
                                </Text>
                                <CustomInput
                                    type="password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>
                                    Confirm Password<Text style={{ color: '#FF0000' }}>*</Text>
                                </Text>
                                <CustomInput
                                    type="password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 55, marginTop: -30 }}>
                        <Button
                            title={loading ? 'Verifying...' : 'Verify & Reset'}
                            btnRounded
                            fullWidth
                            onPress={handleVerify}
                            icon={loading
                                ? <ActivityIndicator size={20} color={COLORS.primary} />
                                : <Feather size={24} color={COLORS.primary} name={'arrow-right'} />}
                            color={COLORS.primary}
                        />
                    </View>
                </View>
                <View style={{ paddingBottom: 15 }}>
                    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Back To </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                            <Text style={{ ...FONTS.fontMedium, borderBottomWidth: 1, borderBottomColor: colors.title, color: colors.title }}>
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EnterCode;
