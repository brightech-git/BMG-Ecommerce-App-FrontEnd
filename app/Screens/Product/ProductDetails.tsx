import React, { useState } from 'react'
import { View, Text, SafeAreaView, Image, TouchableOpacity, Platform } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Header from '../../layout/Header';
import { FONTS, COLORS } from '../../constants/theme';
import CheckoutItems from '../../components/CheckoutItems';
import { ScrollView } from 'react-native-gesture-handler';
import Button from '../../components/Button/Button';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/reducer/cartReducer';


const swiperimageData = [
    {
        image: IMAGES.itemDetails1,
    },
]

type ProductDetailsScreenProps = StackScreenProps<RootStackParamList, 'ProductDetails'>;

const ProductDetails = ({ navigation } : ProductDetailsScreenProps) => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    const productSizes = ["S", "M", "L"];

    const [activeSize, setActiveSize] = useState(productSizes[0]);

    const dispatch = useDispatch();

    const addItemToCart = () => {
        dispatch(addToCart({
            id:"05",
            image:IMAGES.itemDetails1,
            title: "Elegant Gold Earrings",
            price: "$80",
            discount: "$95",
            review: "(2k Review)",
        } as any ));
    }

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <View style={[{position:'absolute',left:0,top:0,width:'100%',zIndex:99},
            Platform.OS === 'ios' && {
                top:47,
                zIndex:20
            }
        ]}>
                <Header
                    title="Product Details"
                    leftIcon={'back'}
                    rightIcon={'cart'}
                    color
                    onPress={() => {addItemToCart(); navigation.navigate('MyCart')}}
                />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <View style={{}}>
                        {swiperimageData.map((data, index) => {
                            return (
                                <Image
                                    key={index}
                                    style={{ width: '100%', height: undefined, aspectRatio: 1 / 1.2, borderBottomRightRadius: 30, borderBottomLeftRadius: 30 }}
                                    source={data.image}
                                />
                            )
                        })}
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container, { marginTop: 5 }]}>
                    <View style={{marginBottom:20}}>
                        <Text style={{ ...FONTS.Marcellus, fontSize: 24, color: colors.title }}>Elegant Gold Earrings</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5,marginTop:5 }}>
                            <Image
                                style={{ height: 14, width: 14, resizeMode: 'contain' }}
                                source={IMAGES.star4}
                            />
                            <Text style={{ ...FONTS.fontSemiBold, fontSize: 14, color: colors.title }}>4.5<Text style={{ ...FONTS.fontRegular, fontSize: 14, color: theme.dark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.5)' }}> (490)</Text></Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 60, }}>
                        <View>
                            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>Price:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }}>
                                <Text style={{ ...FONTS.fontMedium, fontSize: 20, color: colors.title }}>$270</Text>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, textDecorationLine: 'line-through' }}>$310</Text>
                            </View>
                        </View>
                        <View style={{  }}>
                            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>Items Size:</Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    marginTop: 10
                                }}
                            >
                                {productSizes.map((data:any, index:any) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => setActiveSize(data)}
                                            key={index}
                                            style={[{
                                                height: 40,
                                                width: 40,
                                                borderRadius: 10,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginHorizontal: 4,
                                                backgroundColor: colors.card
                                            }, activeSize === data && {
                                                backgroundColor: COLORS.primary,
                                                borderColor: COLORS.primary,
                                            }]}
                                        >
                                            <Text style={[{ ...FONTS.fontSemiBold, fontSize: 12, color: colors.title }, activeSize === data && { color: COLORS.white }]}>{data}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </View>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ ...FONTS.fontSemiBold, fontSize: 16, color: colors.title }}>Description:</Text>
                        <View>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, opacity: 0.7, marginTop: 10 }}>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humor.</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
                <View style={{ height: 88, width: '100%', backgroundColor: colors.card,borderTopLeftRadius:25,borderTopRightRadius:25 }}>
                    <View style={[GlobalStyleSheet.container, { paddingHorizontal: 10, marginTop: 20, padding: 0 }]}>
                        <View style={GlobalStyleSheet.row}>
                            <View style={GlobalStyleSheet.col40}>
                                <View style={{ }}>
                                    <CheckoutItems
                                        style2
                                    />
                                </View>
                            </View>
                            <View style={GlobalStyleSheet.col60}>
                                <Button
                                    title={'Add To Cart'}
                                    fullWidth
                                    onPress={() => {addItemToCart(); navigation.navigate('MyCart')}}
                                    color={COLORS.primary}
                                    btnRounded
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default ProductDetails