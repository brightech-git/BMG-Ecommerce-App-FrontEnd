import React from 'react';
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { FontAwesome  } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS} from '../../constants/theme';
import Header from '../../layout/Header';
import SocialBtn from '../../components/Socials/SocialBtn';
import SocialIcon from '../../components/Socials/SocialIcon';

import { IMAGES } from '../../constants/Images';

const Socials = () => {

      const { colors }:{colors :any} = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                
                    <Header title={'Socials'}  leftIcon={'back'} />
                
                <ScrollView>
                    <View style={{ ...GlobalStyleSheet.container }}>
                        <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                            <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                <Text style={{ ...FONTS.h6, color: colors.title }}>Social Button</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <View style={{ gap: 8,flexDirection:'row',alignItems:'center',justifyContent:'center' }}>
                                    <SocialBtn
                                        gap
                                        icon={<Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={IMAGES.google2} />}
                                        color={'#F0F0F0'}
                                    />
                                    <SocialBtn
                                        gap
                                        icon={<FontAwesome name='apple' size={20} color={COLORS.title} />}
                                        color={'#F0F0F0'}
                                    />
                                    <SocialBtn
                                        gap
                                        icon={<Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={IMAGES.facebook} />}
                                        color={'#F0F0F0'}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                            <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                <Text style={{ ...FONTS.h6, color: colors.title }}>Social Button Rounded</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <View style={{ gap: 8,flexDirection:'row',alignItems:'center',justifyContent:'center' }}>
                                    <SocialBtn
                                        icon={<Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={IMAGES.google2} />}
                                        color={'#F0F0F0'}
                                        rounded
                                        gap
                                    />
                                    <SocialBtn
                                        icon={<FontAwesome name='apple' size={20} color={COLORS.title} />}
                                        color={'#F0F0F0'}
                                        rounded
                                        gap
                                    />
                                    <SocialBtn
                                        icon={<Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={IMAGES.facebook} />}
                                        rounded
                                        color={'#F0F0F0'}
                                        gap
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};


export default Socials;