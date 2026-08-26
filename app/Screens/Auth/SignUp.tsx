import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomInput from '../../components/Input/CustomInput';
import Button from '../../components/Button/Button';
import { Feather, FontAwesome } from '@expo/vector-icons';
import SocialBtn from '../../components/Socials/SocialBtn';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useRegister } from '../../api/hooks/useRegister';
import { useGoogleLogin } from '../../api/hooks/useGoogleLogin';
import { useToast } from '../../components/commoncomponents/Toast';
import { getHash } from '../../utils/otpVerify';
import MobileInput from '../../components/Input/MobileInput';
type SignUpScreenProps = StackScreenProps<RootStackParamList, 'SignUp'>;

const SignUp = ({ navigation } : SignUpScreenProps) => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;

    const [isChecked, setisChecked] = useState(false);
    const [form, setForm] = useState({ username: '', email: '', password: '', contactNumber: '' });
    const [hashKey, setHashKey] = useState<string | undefined>(undefined);
    const { register, loading, error, pendingOtpUser, clearError } = useRegister();
    const { signInWithGoogle, googleLoading, error: googleError, clearError: clearGoogleError } = useGoogleLogin();
    const toast = useToast();

    const initializeAppHash = useCallback(async () => {
        try {
            if (Platform.OS === 'android') {
                const hash = await getHash();
                if (hash?.[0]) setHashKey(hash[0]);
            }
        } catch { }
    }, []);

    useEffect(() => {
        initializeAppHash();
    }, []);

    useEffect(() => {
        if (pendingOtpUser) navigation.navigate('SignUpVerifyOTP', { contactNumber: pendingOtpUser.contactNumber });
    }, [pendingOtpUser]);

    useEffect(() => {
        if (error) { toast.error(error, { position: 'top', duration: 4000 }); clearError(); }
    }, [error]);

    useEffect(() => {
        if (googleError) { toast.error(googleError, { position: 'top', duration: 4000 }); clearGoogleError(); }
    }, [googleError]);

    const handleRegister = () => {
        if (!form.username || !form.email || !form.password || !form.contactNumber) {
            toast.warning('Please fill all fields', { position: 'top' });
            return;
        }
        if (!isChecked) {
            toast.warning('Please accept the terms', { position: 'top' });
            return;
        }
        register({ ...form, hashKey });
    };

    useEffect(() => {
        if (!error) return;
        const msg = error.toLowerCase();
        // Backend already created the user but OTP wasn't verified — send them to OTP page
        if (
            msg.includes('already') ||
            msg.includes('otp') ||
            msg.includes('pending') ||
            msg.includes('registered')
        ) {
            toast.warning('OTP already sent. Please verify your number.', { position: 'top' });
            clearError();
            navigation.navigate('SignUpVerifyOTP', { contactNumber: form.contactNumber.trim() });
            return;
        }
        toast.error(error, { position: 'top', duration: 4000 });
        clearError();
    }, [error]);

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View>
                    <View style={{width:600,height:500,backgroundColor:COLORS.primary,borderRadius:250,marginLeft:-95,marginTop:-220,overflow:'hidden'}}>
                        <Image
                            style={{ height: undefined, aspectRatio: 2.3 / 1.2,resizeMode:'contain', width:'100%', marginTop:220,}}
                            source={IMAGES.item5}
                        />
                        <View style={{width:600,height:500,backgroundColor:'#360F00',borderRadius:250,position:'absolute',opacity:.8}}/>
                    </View>
                    <View style={{position:'absolute',top:30,left:20}}> 
                        <Text style={{...FONTS.Marcellus,fontSize:28,color:COLORS.card}}>Create your{"\n"}Account</Text>
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container,{paddingTop:0,marginTop:-150}]}>
                    <View
                        style={[{
                            shadowColor: 'rgba(195, 123, 95, 0.20)',
                             shadowOffset: {
                                width: 2,
                                height: 20,
                            },
                            shadowOpacity: .1,
                            shadowRadius: 5,
                        }, Platform.OS === "ios" && {
                            backgroundColor: colors.card,
                            borderRadius:35
                        }]}
                    >
                        <View style={{backgroundColor:colors.card,padding:30,borderRadius:40,paddingBottom:40}}>
                            <Text style={{...FONTS.Marcellus,fontSize:20,color:colors.title,lineHeight:28}}>Welcome Back! Please Enter{"\n"}Your Deails</Text>
                            <View style={{ marginBottom: 15, marginTop: 20 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Username<Text style={{ color: '#FF0000' }}>*</Text></Text>
                                <CustomInput
                                    inputxs
                                    
                                    value={form.username}
                                    onChangeText={(value: string) => setForm(f => ({ ...f, username: value }))}
                                />
                            </View>
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Contact Number<Text style={{ color: '#FF0000' }}>*</Text></Text>
                                <MobileInput
                                    value={form.contactNumber}
                                    onChangeText={(value: string) => setForm(f => ({ ...f, contactNumber: value }))}
                                />
                            </View>
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Email Address<Text style={{ color: '#FF0000' }}>*</Text></Text>
                                <CustomInput
                                    inputxs
                                    value={form.email}
                                    onChangeText={(value: string) => setForm(f => ({ ...f, email: value }))}
                                />
                            </View>
                            <View>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Password<Text style={{ color: '#FF0000' }}>*</Text></Text>
                                <CustomInput
                                    inputxs
                                    type={'password'}
                                    value={form.password}
                                    onChangeText={(value: string) => setForm(f => ({ ...f, password: value }))}
                                />
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}
                                    onPress={() => setisChecked(!isChecked)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{
                                        width: 20, height: 20, borderRadius: 4, borderWidth: 1.5,
                                        alignItems: 'center', justifyContent: 'center',
                                        borderColor: isChecked ? COLORS.primary : colors.textLight,
                                        backgroundColor: isChecked ? COLORS.primary : 'transparent',
                                    }}>
                                        {isChecked && <Feather name="check" size={12} color={COLORS.white} />}
                                    </View>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, flex: 1 }}>
                                        I agree to all Term, Privacy and Fees
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal:60,marginTop:-30}}>
                        <Button
                            title={loading ? 'Signing Up...' : 'Sign Up'}
                            btnRounded
                            fullWidth
                            onPress={handleRegister}
                            icon={loading
                                ? <ActivityIndicator size={20} color={COLORS.primary} />
                                : <Feather size={24} color={COLORS.primary} name={'arrow-right'} />}
                            color={COLORS.primary}
                        />
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container,{paddingHorizontal:20,flex:1,paddingTop:5}]}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom:20
                        }}
                    >
                        <View
                            style={{
                                height: 1,
                                flex: 1,
                                backgroundColor: colors.title,
                            }}
                        />
                        <Text style={{
                            ...FONTS.fontMedium,
                            color: colors.text,
                            marginHorizontal: 15,
                            fontSize: 13
                        }}>Or continue with</Text>
                        <View
                            style={{
                                height: 1,
                                flex: 1,
                                backgroundColor: colors.title,
                            }}
                        />
                    </View>
                    <View>
                        {Platform.OS === 'android' ? (
                            <SocialBtn
                                icon={<Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={IMAGES.google2} />}
                                rounded
                                color={theme.dark ? '#000':'#FFFFFF'}
                                text={googleLoading ? 'Signing in...' : 'Sign in with google'}
                                onPress={signInWithGoogle}
                            />
                        ) : (
                            <SocialBtn
                                icon={<FontAwesome name='apple' size={20} color={colors.title} />}
                                rounded
                                color={theme.dark ? '#000':'#FFFFFF'}
                                text={'Sign in with apple'}
                            />
                        )}
                    </View>
                </View>
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center',flex:1,paddingBottom:10 }}>
                    <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Already have and account?</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SignIn')}
                    >
                        <Text style={{
                            ...FONTS.fontMedium,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.title,
                            color: colors.title
                        }}>  Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default SignUp;