import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Button from '../../components/Button/Button';
import { Feather } from '@expo/vector-icons';
import Customotp from '../../components/Input/Customotp';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { resendOtp } from '../../api/services/authService';
import { verifyOtpThunk } from '../../redux/reducer/authReducer';
import { useDispatch } from 'react-redux';
import { useToast } from '../../components/commoncomponents/Toast';

type Props = StackScreenProps<RootStackParamList, 'SignUpVerifyOTP'>;

const SignUpVerifyOTP = ({ navigation, route }: Props) => {
    const { contactNumber } = route.params;
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const toast = useToast();
    const dispatch = useDispatch<any>();

    const [otpCode, setOTPCode] = useState('');
    const [isPinReady, setIsPinReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);
    const maximumCodeLength = 6;

    const handleVerify = async () => {
        if (!isPinReady) {
            toast.warning('Please enter the 6-digit OTP', { position: 'top' });
            return;
        }
        try {
            setLoading(true);
            const result = await dispatch(verifyOtpThunk({ contactNumber, otp: otpCode }));
            if (verifyOtpThunk.rejected.match(result)) {
                toast.error(result.payload as string, { position: 'top', duration: 4000 });
                return;
            }
            toast.success('OTP verified successfully', { position: 'top' });
            navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigation' }] });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        try {
            setResendLoading(true);
            const res = await resendOtp({ contactNumber });
            toast.success(res.message ?? res.errorMessage ?? 'OTP resent successfully', { position: 'top' });
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
                                An Authentication Code Has{"\n"}Been Sent To{' '}
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
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 55, marginTop: -30 }}>
                        <Button
                            title={loading ? 'Verifying...' : 'Verify'}
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

export default SignUpVerifyOTP;
