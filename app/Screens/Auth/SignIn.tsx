import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomInput from '../../components/Input/CustomInput';
import Button from '../../components/Button/Button';
import SocialBtn from '../../components/Socials/SocialBtn';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useLogin } from '../../api/hooks/useLogin';
import { useGoogleLogin } from '../../api/hooks/useGoogleLogin';
import { useToast } from '../../components/commoncomponents/Toast';

type SignInScreenProps = StackScreenProps<RootStackParamList, 'SignIn'>;

const SignIn = ({ navigation }: SignInScreenProps) => {

    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    const [form, setForm] = useState({ contactOrEmailOrUsername: '', password: '' });
    const { login, loginLoading, error, token, clearError } = useLogin();
    const { signInWithGoogle, googleLoading, error: googleError, clearError: clearGoogleError } = useGoogleLogin();
    const toast = useToast();

    useEffect(() => {
        if (token) navigation.navigate('DrawerNavigation', { screen: 'Home' });
    }, [token]);

    useEffect(() => {
        if (error) { toast.error(error, { position: 'top', duration: 4000 }); clearError(); }
    }, [error]);

    useEffect(() => {
        if (googleError) { toast.error(googleError, { position: 'top', duration: 4000 }); clearGoogleError(); }
    }, [googleError]);

    const handleLogin = () => {
        if (!form.contactOrEmailOrUsername || !form.password) {
            toast.warning('Please fill all fields', { position: 'top' });
            return;
        }
        login(form);
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
                <View>
                    <View style={{width:600,height:500,backgroundColor:COLORS.primary,borderRadius:250,marginLeft:-95,marginTop:-220,overflow:'hidden'}}>
                        <Image
                            style={{ height: undefined, aspectRatio: 2.3 / 1.5, resizeMode: 'contain', width: '100%', marginTop: 150 }}
                            source={IMAGES.item4}
                        />
                        <View style={{width:600,height:500,backgroundColor:'#360F00',borderRadius:250,position:'absolute',opacity:.8}}/>
                    </View>
                    <View style={{position:'absolute',top:30,left:20}}>
                        <Text style={{...FONTS.Marcellus,fontSize:28,color:COLORS.white}}>Sign In To{"\n"}Your Account</Text>
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container,{paddingTop:0,marginTop:-150}]}>
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
                        <View style={{backgroundColor:colors.card,padding:30,borderRadius:40,paddingBottom:80}}>
                            <Text style={{...FONTS.Marcellus,fontSize:20,color:colors.title,lineHeight:28}}>Welcome Back You've{"\n"}Been Missed!</Text>
                            <View style={{ marginBottom: 15, marginTop: 20 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>
                                    Email / Phone / Username<Text style={{ color: '#FF0000' }}>*</Text>
                                </Text>
                                <CustomInput
                                    value={form.contactOrEmailOrUsername}
                                    onChangeText={(value: string) => setForm(f => ({ ...f, contactOrEmailOrUsername: value }))}
                                />
                            </View>
                            <View>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>
                                    Password<Text style={{ color: '#FF0000' }}>*</Text>
                                </Text>
                                <CustomInput
                                    type={'password'}
                                    value={form.password}
                                    onChangeText={(value: string) => setForm(f => ({ ...f, password: value }))}
                                />
                                <TouchableOpacity
                                    style={{ position: 'absolute', bottom: -25, left: 0 }}
                                    onPress={() => navigation.navigate('ForgotPassword')}
                                >
                                    <Text style={{
                                        ...FONTS.fontRegular,
                                        fontSize: 15,
                                        color: colors.title,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.title,
                                    }}>
                                        Forgot Password?
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal:60,marginTop:-30}}>
                        <Button
                            title={loginLoading ? 'Signing In...' : 'Sign In'}
                            btnRounded
                            fullWidth
                            onPress={handleLogin}
                            icon={loginLoading
                                ? <ActivityIndicator size={20} color={COLORS.primary} />
                                : <Feather size={24} color={COLORS.primary} name={'arrow-right'} />}
                            color={COLORS.primary}
                        />
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container,{paddingHorizontal:20,flex:1}]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
                        <View style={{ height: 1, flex: 1, backgroundColor: colors.title }} />
                        <Text style={{ ...FONTS.fontMedium, color: colors.text, marginHorizontal: 15, fontSize: 13 }}>
                            Or continue with
                        </Text>
                        <View style={{ height: 1, flex: 1, backgroundColor: colors.title }} />
                    </View>
                    <View>
                        {Platform.OS === 'android' ? (
                            <SocialBtn
                                icon={<Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={IMAGES.google2} />}
                                rounded
                                color={theme.dark ? '#000' : '#FFFFFF'}
                                text={googleLoading ? 'Signing in...' : 'Sign in with google'}
                                onPress={signInWithGoogle}
                            />
                        ) : (
                            <SocialBtn
                                icon={<FontAwesome name='apple' size={20} color={colors.title} />}
                                rounded
                                color={theme.dark ? '#000' : '#FFFFFF'}
                                text={'Sign in with apple'}
                            />
                        )}
                    </View>
                </View>
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', flex: 1 }}>
                    <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Not a member?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={{
                            ...FONTS.fontMedium,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.title,
                            color: colors.title,
                        }}> Create an account</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ScrollView>
    );
};

export default SignIn;
