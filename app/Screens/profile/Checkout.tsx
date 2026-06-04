import React from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, Image, TextInput, Platform } from 'react-native'
import { useTheme } from '@react-navigation/native'
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS,FONTS } from '../../constants/theme';
import { ScrollView } from 'react-native-gesture-handler';

import Button from '../../components/Button/Button';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

const checkoutData = [
    {
        image: IMAGES.map,
        title: "Delivery address",
        text: "123 Main Street, Anytown, USA 12345",
        navigate: "SaveAddress"
    },
    {
        image: IMAGES.card2,
        title: "Payment",
        text: "XXXX XXXX XXXX 3456",
        navigate: "Payment"
    },
]

type CheckoutScreenProps = StackScreenProps<RootStackParamList, 'Checkout'>;

const Checkout = ({ navigation } : CheckoutScreenProps) => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={"Checkout"}
                leftIcon={'back'}
                //titleLeft
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                <View style={[GlobalStyleSheet.container, { paddingTop: 10 }]}>
                    {checkoutData.map((data:any, index) => {
                        return (
                            <TouchableOpacity
                                onPress={() => navigation.navigate(data.navigate)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.border,
                                    paddingBottom: 15,
                                    marginTop: 10
                                }}
                                key={index}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10,flex:1 }}>
                                    <View
                                        style={[{
                                            shadowColor: "rgba(195,135,95,0.30)",
                                            shadowOffset: {
                                                width: -5,
                                                height: 15,
                                            },
                                            shadowOpacity: .1,
                                            shadowRadius: 5,
                                        }, Platform.OS === "ios" && {
                                            backgroundColor: colors.card,
                                            borderRadius:10
                                        }]}
                                    >
                                        <View style={{ height: 40, width: 40, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image
                                                style={{ height: 20, width: 20, tintColor: COLORS.primary, resizeMode: 'contain' }}
                                                source={data.image}
                                            />
                                        </View>
                                    </View>
                                    <View style={{flex:1}}>
                                        <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{data.title}</Text>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{data.text}</Text>
                                    </View>
                                </View>
                                <View>
                                    <Image
                                        style={{ height: 16, width: 16, resizeMode: 'contain', tintColor: colors.title }}
                                        source={IMAGES.rightarrow}
                                    />
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                    <View style={{ marginTop: 20, }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Additional Notes:</Text>
                        <View
                            style={[{
                                shadowColor: "rgba(195,135,95,0.30)",
                                shadowOffset: {
                                    width: -5,
                                    height: 15,
                                },
                                shadowOpacity: .1,
                                shadowRadius: 5,
                            }, Platform.OS === "ios" && {
                                backgroundColor: colors.card,
                                borderRadius:10
                            }]}
                        >
                            <View style={{ height: 120, width: '100%', borderWidth: 1, borderColor: theme.dark ? COLORS.white : COLORS.primary, borderRadius: 8, backgroundColor: colors.card, marginTop: 10 }}>
                                <TextInput
                                    style={{
                                        ...FONTS.fontRegular,
                                        fontSize: 15,
                                        color: colors.title,
                                        paddingVertical: 12,
                                        paddingHorizontal: 15,
                                    }}
                                    placeholder='Write Here'
                                    multiline
                                    placeholderTextColor={colors.textLight}
                                />
                            </View>
                        </View>

                    </View>
                    <View style={{ marginTop: 150 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>Bluebell Hand Block Tiered</Text>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>2 x $2000.00</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>Men Black Grey Allover Printed</Text>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>2 x $1699.00</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>Discount</Text>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>-$100.00</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>Shipping</Text>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: COLORS.success }}>FREE Delivery</Text>
                        </View>
                        <View style={{ borderWidth: 1, borderColor: theme.dark ? COLORS.white : colors.border }}></View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                            <Text style={{ ...FONTS.fontSemiBold, fontSize: 18, color: colors.title }}>My Order</Text>
                            <Text style={{ ...FONTS.fontSemiBold, fontSize: 18, color: COLORS.success }}>$3,599.00</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View
                style={[{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    shadowColor:'rgba(195, 123, 95, 0.25)',
                    shadowOffset: {
                        width: 2,
                        height: -20,
                    },
                    shadowOpacity: .1,
                    shadowRadius: 5,
                }, Platform.OS === "ios" && {
                    backgroundColor: colors.card,
                    borderTopLeftRadius:25,borderTopRightRadius:25,
                    bottom:30
                }]}
            >
                <View style={{ height: 88, backgroundColor: colors.card,borderTopLeftRadius:25,borderTopRightRadius:25 }}>
                    <View style={[GlobalStyleSheet.container, { paddingHorizontal: 10, marginTop: 15, paddingTop: 0 }]}>
                        <Button
                            title={"Submit Order"}
                            onPress={() => navigation.navigate('Myorder')}
                            color={COLORS.primary}
                            btnRounded
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Checkout;