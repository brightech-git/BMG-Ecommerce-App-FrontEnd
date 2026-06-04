import React,{useState} from 'react'
import { View, Text, SafeAreaView,LayoutAnimation, Platform } from 'react-native'
import { useNavigation, useTheme } from '@react-navigation/native'

import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import Button from '../../components/Button/Button';
import Header from '../../layout/Header';
import SwiperBox2 from '../../components/SwiperBox2';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart } from '../../redux/reducer/cartReducer';
import {Feather} from "@expo/vector-icons";

const CardStyleData = [
    {
        image: IMAGES.item11,
        title: "Skin Care Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
    },
    {
        image: IMAGES.item12,
        title: "Skin Care Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item32,
        title: "Skin Care Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item34,
        title: "Skin Care Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item38,
        title: "Skin Care Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item11,
        title: "Skin Care Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
    },
    {
        image: IMAGES.item12,
        title: "Skin Care Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item32,
        title: "Skin Care Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item34,
        title: "Skin Care Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item38,
        title: "Skin Care Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
]

type ShoppingScreenProps = StackScreenProps<RootStackParamList, 'MyCart'>;

const Shopping = ({navigation} : ShoppingScreenProps) => {

    const theme = useTheme();
    const { colors }:{colors : any} = theme;

    const cart = useSelector((state:any) => state.cart.cart);

    const dispatch = useDispatch();

    const removeItemFromCart = (data: any) => {
        dispatch(removeFromCart(data));
    }

   // const navigation = useNavigation();

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={'My Cart'}
                rightIcon2={'search'}
                leftIcon={'back'}
            />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ScrollView 
                    contentContainerStyle={{paddingBottom:150}}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ paddingTop: 20, paddingBottom: 5 }}>
                        {cart.map((data:any, index:any) => {
                            return (
                                <View
                                    key={index}
                                >
                                    <SwiperBox2 
                                        data={data} 
                                        navigation={navigation} 
                                        theme={theme} 
                                        colors={colors} 
                                        handleDelete={() => removeItemFromCart(data)} 
                                    />
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            </GestureHandlerRootView>
            {cart.length > 0 ?
                (
                    <View
                        style={[{
                            shadowColor:'rgba(195, 123, 95, 0.25)',
                            shadowOffset: {
                                width: 2,
                                height: -20,
                            },
                            shadowOpacity: .1,
                            shadowRadius: 5,
                            //position: 'absolute',
                            left: 0,
                            bottom: 0,
                            right: 0,
                        }, Platform.OS === 'ios' && {
                            backgroundColor: colors.card,
                        }]}
                    >
                        <View style={{ height:200, width: '100%', backgroundColor: colors.card, flex: 1, paddingHorizontal: 15, position: 'absolute', bottom: 0,paddingTop:10 ,borderTopLeftRadius:25,borderTopRightRadius:25}}>
                            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 18, color: colors.title }}>Subtotal</Text>
                                <Text style={{ ...FONTS.fontBold, fontSize: 18,color:colors.title}}> $3,599</Text>
                            </View>
                            <View style={[GlobalStyleSheet.container, { paddingHorizontal: 10, marginTop:10, paddingTop: 0 }]}>
                                <Button
                                    title={'Proceed to Buy (8 items)'}
                                    btnRounded
                                    color={COLORS.primary}
                                    onPress={() => navigation.navigate('Checkout')}
                                />
                            </View>
                        </View>
                    
                    </View>
                )
                :
                (
                    <View style={[GlobalStyleSheet.container,{padding:0,position:'absolute',left:0,right:0,bottom:0,top:20}]}>
                        <View
                            style={{
                                flex:1,
                                alignItems:'center',
                                justifyContent:'center',
                            }}
                        >
                            <View
                                style={{
                                    height:60,
                                    width:60,
                                    borderRadius:60,
                                    alignItems:'center',
                                    justifyContent:'center',
                                    backgroundColor:COLORS.primaryLight,
                                    marginBottom:20,
                                }}
                            >
                                <Feather color={COLORS.primary} size={24} name='shopping-cart'/>
                            </View>
                            <Text style={{...FONTS.h5,color:colors.title,marginBottom:8}}>Your shopping-cart is Empty!</Text>    
                            <Text
                                style={{
                                    ...FONTS.fontSm,
                                    color:colors.text,
                                    textAlign:'center',
                                    paddingHorizontal:40,
                                    //marginBottom:30,
                                }}
                            >Add Product to you favourite and shop now.</Text>
                        </View>
                    </View>
                )
            }
        </SafeAreaView>
    )
}

export default Shopping