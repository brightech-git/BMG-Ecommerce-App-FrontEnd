import React from 'react';
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, } from '../constants/theme';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation, useTheme } from '@react-navigation/native';
import ThemeBtn from '../components/ThemeBtn';

import { IMAGES } from '../constants/Images';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '../redux/actions/drawerAction';

const Sidebar = ({navigation} : any) => {

    const theme = useTheme();
    const { colors }: {colors : any} = theme;

    const dispatch = useDispatch();

   // const navigation = useNavigation<any>();

    const navItem = [
        {
            icon: IMAGES.home,
            name: "Home",
            navigate: "BottomNavigation",
        },
        {
            icon: IMAGES.producta,
            name: "Products",
            navigate: "Products",
        },
        {
            icon: IMAGES.components,
            name: "Components",
            navigate: "Components",
        },
        {
            icon: IMAGES.star,
            name: "Review",
            navigate: "WriteReview",
        },
        {
            icon: IMAGES.heart2,
            name: "Wishlist",
            navigate: "Wishlist",
        },
        {
            icon: IMAGES.order,
            name: "My Orders",
            navigate: 'Myorder',
        },
        {
            icon: IMAGES.shopping2,
            name: "My Cart",
            navigate: 'MyCart',
        },
        {
            icon: IMAGES.chat,
            name: "Chat List",
            navigate: 'Chat',
        },
        {
            icon: IMAGES.user2,
            name: "Profile",
            navigate: "Profile",
        },
        {
            icon: IMAGES.logout,
            name: "Logout",
            navigate: 'SignIn',
        },
    ]

    return (
        <>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View
                        style={{
                            paddingTop: 30,
                            paddingHorizontal: 20,
                            borderBottomWidth: 1,
                            borderColor: colors.border,
                            paddingBottom: 20,
                            marginBottom: 15,
                            alignItems: 'flex-start',
                        }}
                    >
                        <View style={{
                            flexDirection: 'row',
                        }}>
                            <View style={{
                                alignItems: 'flex-start',
                                flex: 1,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Image
                                        style={{ height: 60, width: 60, resizeMode: 'contain', borderRadius: 20 }}
                                        source={IMAGES.small1}
                                    />
                                    <View>
                                        <Text style={{ ...FONTS.fontSemiBold, fontSize: 18, color: colors.title }}>Roopa</Text>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>example@gmail.com</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ position: 'absolute', right: 0, top: -10 }}>
                                <ThemeBtn />
                            </View>
                        </View>
                    </View>

                    <View style={{ flex: 1 }}>
                        {navItem.map((data, index) => {
                            return (
                                <TouchableOpacity
                                    //onPress={() => {data.navigate && navigation.navigate(data.navigate); navigation.closeDrawer()}}
                                    onPress={() => { data.navigate === "DrawerNavigation" ? dispatch(closeDrawer()) : dispatch(closeDrawer());  navigation.navigate(data.navigate)}}
                                    //onPress={() => {data.navigate === "DrawerNavigation" ? dispatch(closeDrawer()) : dispatch(closeDrawer()); navigation.navigate(data.navigate)}}
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 20,
                                        paddingVertical: 5,
                                    }}
                                >
                                    <View
                                        style={[{
                                            shadowColor:theme.dark ? "#000": "rgba(195, 123, 95, 0.20)",
                                            shadowOffset: {
                                                width: 3,
                                                height: 10,
                                            },
                                            shadowOpacity: .2,
                                            shadowRadius: 5,
                                            marginRight: 15,
                                        }, Platform.OS === "ios" && {
                                            backgroundColor: colors.card,
                                            borderRadius:10
                                        }]}
                                    >
                                        <View style={{ height:40,width:40,alignItems:'center',justifyContent:'center',backgroundColor:colors.card,borderRadius:10 }}>
                                            <Image
                                                style={{ height: 20, width: 20, resizeMode: 'contain', tintColor:COLORS.primary }}
                                                source={data.icon}
                                            />
                                        </View>
                                    </View>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 18, color: colors.title, flex: 1 }}>{data.name}</Text>
                                    <FeatherIcon size={16} color={colors.title} name='chevron-right' />
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <View
                        style={{
                            paddingHorizontal: 20,
                            paddingVertical: 20,
                            marginTop: 10,
                            borderTopWidth: 1,
                            borderTopColor: colors.border
                        }}
                    >
                        <Text style={{ ...FONTS.fontSemiBold, fontSize: 13, color: colors.title, marginBottom: 4 }}>jewelia<Text style={{ ...FONTS.fontRegular, fontSize: 13 }}> Cosmetic Store</Text></Text>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 13, color: colors.title }}>App Version 1.0</Text>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default Sidebar;