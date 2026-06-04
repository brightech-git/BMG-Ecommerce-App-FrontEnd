import React from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native'
import { useTheme } from '@react-navigation/native'
import {  COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { ScrollView } from 'react-native-gesture-handler';
import Header from '../../layout/Header';
import CardStyle3 from '../../components/Card/CardStyle3';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { IMAGES } from '../../constants/Images';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/reducer/cartReducer';
import { removeFromwishList } from '../../redux/reducer/wishListReducer';
import { Feather } from "@expo/vector-icons";

const sliderData = [
    {
        title: "All",
    },
    {
        title: "Child",
    },
    {
        title: "Man",
    },
    {
        title: "Woman",
    },
    {
        title: "unisex",
    },
    {
        title: "Boys",
    },
    {
        title: "Girls",
    },
]

const gridData = [
    {
        image: IMAGES.item11,
        title: "Earring Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
    },
    {
        image: IMAGES.item12,
        title: "Dog Cloths",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item32,
        title: "Pet Bed For Dog",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item34,
        title: "Pet Bed For Dog",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item38,
        title: "Pet Bed For Dog",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item11,
        title: "Earring Body Product",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
    },
    {
        image: IMAGES.item12,
        title: "Dog Cloths",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item32,
        title: "Pet Bed For Dog",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item34,
        title: "Pet Bed For Dog",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
    {
        image: IMAGES.item38,
        title: "Pet Bed For Dog",
        price: "$80",
        discount: "$95",
        review: "(2k Review)",
        text: "FREE"
    },
]

type WishlistScreenProps = StackScreenProps<RootStackParamList, 'Wishlist'>;

const Wishlist = ({ navigation } : WishlistScreenProps ) => {

    const wishList = useSelector((state:any) => state.wishList.wishList);
    const dispatch = useDispatch();

    const theme = useTheme();
    const { colors } : {colors : any} = theme;

    const addItemToCart = (data: any) => {
        dispatch(addToCart(data));
    }

    const removeItemFromWishList = (data: any) => {
        dispatch(removeFromwishList(data));
    }
    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                 title={"Wishlist"}
                 rightIcon2={'search'}
                 leftIcon={'back'}
            />
            <View style={[GlobalStyleSheet.container,{flex:1}]}>
                <View style={{ marginHorizontal: -15, marginBottom: 10,marginTop:5 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 15 }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                            {sliderData.map((data, index) => {
                                return (
                                    <View
                                        key={index}
                                        style={[{
                                            shadowColor: 'rgba(195, 123, 95, 0.20)',
                                            shadowOffset: {
                                                width: 2,
                                                height: 10,
                                            },
                                            shadowOpacity: .1,
                                            shadowRadius: 5,
                                            marginBottom:5
                                        }, Platform.OS === "ios" && {
                                            backgroundColor: 'rgba(255, 255, 255, 0.70)',
                                            borderRadius: 12,
                                        }]}
                                    >
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor:colors.card,
                                                height: 40,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 12,
                                                paddingHorizontal: 20,
                                                paddingVertical: 5,
                                                
                                            }}>
                                            <Text style={{ ...FONTS.fontMedium, fontSize: 13, color:colors.title }}>{data.title}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                        </View>
                    </ScrollView>
                </View>
                <View style={{ marginHorizontal: -15,flex:1}}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal:15,paddingBottom:190,flexGrow:1}}
                    >
                        <View style={{ marginTop: -10}}>
                            {wishList.map((data:any, index:any) => {
                                return (
                                    <CardStyle3
                                        id={data.id}
                                        key={index}
                                        title={data.title}
                                        price={data.price}
                                        image={data.image}
                                        discount={data.discount}
                                        onPress1={() => removeItemFromWishList(data.id)}
                                        onPress2={() =>{addItemToCart(data) ; navigation.navigate('MyCart')}}
                                        review={data.review}
                                        CardStyle4
                                    />
                                )
                            })}
                            {wishList.length === 0 && 
                                <View
                                    style={{
                                        position:'absolute',
                                        left:0,
                                        right:0,
                                        //bottom:0,
                                        top:220,
                                        // flex:1,
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
                                        <Feather color={COLORS.primary} size={24} name='heart'/>
                                    </View>
                                    <Text style={{...FONTS.h5,color:colors.title,marginBottom:8}}>Your Wishlist is Empty!</Text>    
                                    <Text
                                        style={{
                                            ...FONTS.fontSm,
                                            color:colors.text,
                                            textAlign:'center',
                                            paddingHorizontal:40,
                                            marginBottom:30,
                                        }}
                                    >Add Product to you favourite and shop now.</Text>
                                </View>
                            }
                        </View>
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Wishlist;