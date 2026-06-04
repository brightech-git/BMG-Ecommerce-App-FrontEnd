import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, Image, SafeAreaView, Platform } from 'react-native'
import Header from '../../layout/Header';
import { FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CardStyle3 from '../../components/Card/CardStyle3';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';


const TrackorderData = [
    {
        image: IMAGES.item11,
        title: "Sterling Silver Ring",
        price: "$80",
        discount: "$95",
        review:"(2k Review)",
        offer:"40% Off"
    },

]

const Trackorder = () => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={"Track Order"}
                leftIcon={"back"}
            />
            <ScrollView contentContainerStyle={{paddingBottom:100}}>
                <View style={GlobalStyleSheet.container}>
                    <View style={{
                        // marginHorizontal: -15
                    }}>
                        {TrackorderData.map((data, index) => {
                            return (
                                <View key={index}>
                                    <CardStyle3
                                        id=''
                                        title={data.title}
                                        price={data.price}
                                        image={data.image}
                                        discount={data.discount} 
                                        removebtn
                                        review={data.review}
                                        grid
                                        offer={data.offer}
                                    />
                                </View>
                            )
                        })}
                    </View>
                    <View style={{ marginTop: 20, marginBottom: 10 }}>
                        <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title }}>Track Order</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                        <Image
                            style={{ height: 24, width: 24, resizeMode: 'contain' }}
                            source={IMAGES.check}
                        />
                        <View
                            style={[{
                                shadowColor: "rgba(195,135,95,0.25)",
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
                            <View style={{backgroundColor:colors.card,padding:10,borderRadius:12}}>
                                <Text style={{ ...FONTS.Marcellus, fontSize: 16, color: COLORS.primary }}>Order Placed<Text style={{ ...FONTS.fontRegular, fontSize: 14, color:theme.dark ? 'rgba(255,255,255,0.50)': 'rgba(0, 0, 0, 0.50)' }}>  27 Dec 2024</Text></Text>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>We have received your order</Text>
                            </View>
                        </View>
                        <View style={{ height: 60, width: 2, backgroundColor: COLORS.primary, position: 'absolute', left: 11, top: 40 }}></View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20 }}>
                        <Image
                            style={{ height: 24, width: 24, resizeMode: 'contain' }}
                            source={IMAGES.check}
                        />
                        <View
                            style={[{
                                shadowColor: "rgba(195,135,95,0.25)",
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
                            <View style={{backgroundColor:colors.card,padding:10,borderRadius:12}}>
                                <Text style={{ ...FONTS.Marcellus, fontSize: 16, color: COLORS.primary }}>Order Confirm<Text style={{ ...FONTS.fontRegular, fontSize: 14, color:theme.dark ? 'rgba(255,255,255,0.50)': 'rgba(0, 0, 0, 0.50)' }}>  27 Dec 2024</Text></Text>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>We has been confirmed</Text>
                            </View>
                        </View>
                        <View style={{ height: 60, width: 2, backgroundColor: COLORS.primary, position: 'absolute', left: 11, top: 40 }}></View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20 }}>
                        <View style={{ height: 24, width: 24, borderWidth: 2, borderColor: colors.card, borderRadius: 24,backgroundColor:theme.dark ? '#0C101C':'#F9F5F3' }}>
                        </View>
                        <View style={{backgroundColor:colors.card,padding:10,borderRadius:12,opacity:.4}}>
                            <Text style={{ ...FONTS.Marcellus, fontSize: 16, color: colors.title }}>Order Processed<Text style={{ ...FONTS.fontRegular, fontSize: 14, color:theme.dark ? 'rgba(255,255,255,0.50)': 'rgba(0, 0, 0, 0.50)' }}>  28 Dec 2024</Text></Text>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>We are preparing your order</Text>
                        </View>
                        <View style={{ height: 60, width: 2, backgroundColor: colors.card, position: 'absolute', left: 11, top: 40 }}></View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20 }}>
                        <View style={{ height: 24, width: 24, borderWidth: 2, borderColor: colors.card, borderRadius: 24,backgroundColor:theme.dark ? '#0C101C':'#F9F5F3' }}>
                        </View>
                        <View style={{backgroundColor:colors.card,padding:10,borderRadius:12,opacity:.4}}>
                            <Text style={{ ...FONTS.Marcellus, fontSize: 16, color: colors.title }}>Ready To Ship<Text style={{ ...FONTS.fontRegular, fontSize: 14,color:theme.dark ? 'rgba(255,255,255,0.50)': 'rgba(0, 0, 0, 0.50)'}}>  29 Dec 2024</Text></Text>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>Your order is ready for shipping </Text>
                        </View>
                        <View style={{ height: 60, width: 2, backgroundColor: colors.card, position: 'absolute', left: 11, top: 40 }}></View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20 }}>
                        <View style={{ height: 24, width: 24, borderWidth: 2, borderColor: colors.card, borderRadius: 24,backgroundColor:theme.dark ? '#0C101C':'#F9F5F3' }}>
                        </View>
                        <View style={{backgroundColor:colors.card,padding:10,borderRadius:12,opacity:.4}}>
                            <Text style={{ ...FONTS.Marcellus, fontSize: 16, color: colors.title }}>Out For Delivery<Text style={{ ...FONTS.fontRegular, fontSize: 14, color:theme.dark ? 'rgba(255,255,255,0.50)': 'rgba(0, 0, 0, 0.50)' }}>  31 Dec 2024</Text></Text>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>Your order is out for delivery</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Trackorder