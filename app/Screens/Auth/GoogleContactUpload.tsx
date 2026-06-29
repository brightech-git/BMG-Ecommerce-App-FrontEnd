import React, { useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, SafeAreaView, Image, Platform, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Button from '../../components/Button/Button';
import CustomInput from '../../components/Input/CustomInput';
import { IMAGES } from '../../constants/Images';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { updateGoogleContact } from '../../api/services/authService';
import { useToast } from '../../components/commoncomponents/Toast';

type Props = StackScreenProps<RootStackParamList, 'GoogleContactUpload'>;

const GoogleContactUpload = ({ navigation, route }: Props) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const toast = useToast();

    const { userId, token } = route.params;
    const [contactNumber, setContactNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!contactNumber || contactNumber.trim().length < 10) {
            toast.warning('Please enter a valid contact number', { position: 'top' });
            return;
        }
        try {
            setLoading(true);
            console.log('[GoogleContactUpload] userId from params:', userId);
            console.log('[GoogleContactUpload] token from params:', token);
            console.log('[GoogleContactUpload] contactNumber:', contactNumber.trim());
            if (!userId) throw new Error('Session expired, please login again');
            const res = await updateGoogleContact({ userId, contactNumber: contactNumber.trim() });
            console.log('[GoogleContactUpload] API response:', JSON.stringify(res));
            if (!res.otp && res.errorMessage) throw new Error(res.errorMessage);
            toast.success(res.message ?? 'OTP sent successfully', { position: 'top' });
            navigation.navigate('GoogleContactVerify', { contactNumber: contactNumber.trim(), userId });
        } catch (err: any) {
            console.log('[GoogleContactUpload] Error:', JSON.stringify(err));
            toast.error(err.message ?? 'Failed to send OTP', { position: 'top', duration: 4000 });
        } finally {
            setLoading(false);
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
                        <Text style={{ ...FONTS.Marcellus, fontSize: 28, color: COLORS.white }}>Add Contact{"\n"}Number</Text>
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
                                Please Add Your{"\n"}Contact Number To Continue
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
                    <View style={{ paddingHorizontal: 55, marginTop: -30 }}>
                        <Button
                            title={loading ? 'Sending OTP...' : 'Send OTP'}
                            btnRounded
                            fullWidth
                            onPress={handleSubmit}
                            icon={loading
                                ? <ActivityIndicator size={20} color={COLORS.primary} />
                                : <Feather size={24} color={COLORS.primary} name={'arrow-right'} />}
                            color={COLORS.primary}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default GoogleContactUpload;
