import React, { useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, SafeAreaView, Image, TouchableOpacity, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomInput from '../../components/Input/CustomInput';
import Button from '../../components/Button/Button';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { forgotPassword } from '../../api/services/authService';
import { useToast } from '../../components/commoncomponents/Toast';

type Props = StackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPassword = ({ navigation }: Props) => {

    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const toast = useToast();

    const [contactNumber, setContactNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!contactNumber.trim()) {
            toast.warning('Please enter your contact number', { position: 'top' });
            return;
        }
        try {
            setLoading(true);
            const res = await forgotPassword({ contactNumber: contactNumber.trim(), hashKey: '' });
            if (res.errorMessage && !res.message) throw new Error(res.errorMessage);
            toast.success(res.message ?? 'OTP sent successfully', { position: 'top' });
            navigation.navigate('EnterCode', { contactNumber: contactNumber.trim() });
        } catch (err: any) {
            toast.error(err.message ?? 'Failed to send OTP', { position: 'top', duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View>
                    <View style={{ width: 600, height: 500, backgroundColor: COLORS.primary, borderRadius: 250, marginLeft: -95, marginTop: -220, overflow: 'hidden' }}>
                        <Image
                            style={{ height: undefined, aspectRatio: 2.3 / 1.2, resizeMode: 'contain', width: '100%', marginTop: 220 }}
                            source={IMAGES.item6}
                        />
                        <View style={{ width: 600, height: 500, backgroundColor: '#360F00', borderRadius: 250, position: 'absolute', opacity: .8 }} />
                    </View>
                    <View style={{ position: 'absolute', top: 30, left: 20 }}>
                        <Text style={{ ...FONTS.Marcellus, fontSize: 28, color: COLORS.white }}>Forgot{"\n"}Password</Text>
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
                                Enter Your Registered{"\n"}Contact Number To{"\n"}Receive An OTP
                            </Text>
                            <View style={{ marginBottom: 10, marginTop: 20 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>
                                    Contact Number<Text style={{ color: '#FF0000' }}>*</Text>
                                </Text>
                                <CustomInput
                                    value={contactNumber}
                                    onChangeText={setContactNumber}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 60, marginTop: -30 }}>
                        <Button
                            title={loading ? 'Sending...' : 'Send OTP'}
                            btnRounded
                            fullWidth
                            onPress={handleSendOtp}
                            icon={loading
                                ? <ActivityIndicator size={20} color={COLORS.primary} />
                                : <FeatherIcon size={24} color={COLORS.primary} name={'arrow-right'} />}
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPassword;
