import React, { useState } from 'react';
import { useNavigation, useTheme } from '@react-navigation/native';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native'
import Header from '../../layout/Header';
import { FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CardStyle3 from '../../components/Card/CardStyle3';
import { Rating } from 'react-native-ratings';
import CustomInput from '../../components/Input/CustomInput';
import Button from '../../components/Button/Button';

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

const btnData = [
    {
        name:"Yes"
    },
    {
        name:"No"
    }
]

const WriteReview = () => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    const [isChecked, setIsChecked] = useState(btnData[0]);

    const [Checked, setChecked] = useState(false);

    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={"Write Review"}
                leftIcon={"back"}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
                    <View style={{  }}>
                        {TrackorderData.map((data, index) => {
                            return (
                                <CardStyle3
                                    id=''
                                    key={index}
                                    title={data.title}
                                    price={data.price}
                                    image={data.image}
                                    discount={data.discount} 
                                    removebtn
                                    review={data.review}
                                    grid
                                    offer={data.offer}
                                />
                            )
                        })}
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                        <Text style={{ ...FONTS.Marcellus, fontSize: 24, color: colors.title }}>Overall Rating</Text>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 16, color: 'rgba(0, 0, 0, 0.50)', marginTop: 5 }}>Your Average Rating Is 4.0</Text>
                    </View>
                    <Rating
                        ratingCount={5}
                        imageSize={50}
                        style={{ paddingTop: 20 }}

                    />

                    <View style={{ marginBottom: 15, marginTop: 30 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Full Name</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            background
                        />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Product Review</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            inputLg
                            background
                        />
                    </View>
                    <View>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Would you recommend this product to a friend?</Text>
                        <View style={{
                            flexDirection:'row',
                            alignItems:'center',
                            gap:15,
                            marginTop:10
                        }}>
                            {btnData.map((data,index) => {
                                return(
                                    <View key={index} style={{flexDirection:'row',alignItems:'center',gap:5}}>
                                        <TouchableOpacity
                                            style={[{
                                                borderWidth: 1,
                                                width: 24,
                                                height: 24,
                                                borderRadius: 50,
                                                borderColor: theme.colors.card,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor:theme.colors.card
                                            },isChecked === data && {
                                                backgroundColor:COLORS.primary,
                                                borderColor:COLORS.primary
                                            }]}
                                            onPress={() => setIsChecked(data)}
                                        >
                                            <View style={[{
                                                width: 14,
                                                height: 14,
                                                backgroundColor: theme.colors.background,
                                                borderRadius: 50
                                            }, isChecked === data && {
                                                backgroundColor: theme.colors.card
                                            }]}></View>
                                        </TouchableOpacity>
                                        <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{data.name}</Text>
                                    </View>
                                )
                            })}
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
                <View style={[{ height: 88, backgroundColor: colors.card,borderTopLeftRadius:25,borderTopRightRadius:25 }]}>
                    <View style={[GlobalStyleSheet.container, { paddingHorizontal: 10, marginTop: 20, paddingTop: 0 }]}>
                        <Button
                            onPress={() => navigation.goBack()}
                            title={"Submit Review"}
                            btnRounded
                            color={COLORS.primary}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default WriteReview