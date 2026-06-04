import React from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, Platform } from 'react-native';
import {  FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomInput from '../../components/Input/CustomInput';
import FeatherIcon from "react-native-vector-icons/Feather";
import Button from '../../components/Button/Button';

import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

type NewPasswordScreenProps = StackScreenProps<RootStackParamList, 'NewPassword'>;

const NewPassword = ({ navigation } : NewPasswordScreenProps) => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View>
                    <View style={{width:600,height:500,backgroundColor:COLORS.primary,borderRadius:250,marginLeft:-95,marginTop:-220,overflow:'hidden'}}>
                        <Image
                            style={{ height: undefined, aspectRatio: 2.3 / 1.2,resizeMode:'contain', width:'100%', marginTop:220,}}
                            source={IMAGES.item5}
                        />
                        <View style={{width:600,height:500,backgroundColor:'#360F00',borderRadius:250,position:'absolute',opacity:.8}}/>
                    </View>
                    <View style={{position:'absolute',top:30,left:20}}> 
                        <Text style={{...FONTS.Marcellus,fontSize:28,color:COLORS.white}}>Enter New{"\n"}Password</Text>
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container,{paddingTop:0,marginTop:-150,flex:1}]}>
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
                        <View style={{backgroundColor:colors.card,padding:30,borderRadius:40,paddingBottom:50}}>
                            <Text style={{...FONTS.Marcellus,fontSize:20,color:colors.title,lineHeight:28}}>Your New Password Must Be Different From Previously Used password.</Text>
                            <View style={{ marginBottom: 10, marginTop: 20 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Password<Text style={{ color: '#FF0000' }}>*</Text></Text>
                                <CustomInput
                                    type={'password'}
                                    onChangeText={(value:any) => console.log(value)}
                                />
                            </View>
                            <View style={{ marginBottom: 10, }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Confirm Password<Text style={{ color: '#FF0000' }}>*</Text></Text>
                                <CustomInput
                                    type={'password'}
                                    onChangeText={(value:any) => console.log(value)}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal:60,marginTop:-30}}>
                        <Button
                            title={'Continue'}
                            btnRounded
                            fullWidth
                            onPress={() => navigation.navigate('SignIn')}
                            icon={<FeatherIcon size={24} color={COLORS.primary} name={'arrow-right'} />}
                            color={COLORS.primary}
                        />
                    </View>
                </View>
                <View style={{paddingBottom:15}}>
                    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Back To </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SignIn')}
                        >
                            <Text style={{
                                ...FONTS.fontMedium,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.title,
                                color: colors.title
                            }}>
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default NewPassword;