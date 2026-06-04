import React from 'react';
import { useNavigation, useTheme } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import LikeBtn from '../LikeBtn';
import { IMAGES } from '../../constants/Images';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromwishList } from '../../redux/reducer/wishListReducer';

type Props = {
    id : string,
    title : string;
    color ?: any;
    price : string;
    image ?: any;
    offer ?: string;
    btntitel?:any;
    CardStyle4?:any;
    removebtn?:any;
    discount?:any;
    grid?:any;
    review?:any;
    likeBtn?:any;
    onPress ?:any,
    CardStyle5 ?:any,
    success ?:any,
    onPress1 ?: (e : any) => void,
    onPress2 ?: (e : any) => void,
}

const CardStyle3 = ({onPress1,onPress2, id,title, CardStyle4, price, discount, image, btntitel, onPress, removebtn, grid, review ,likeBtn,offer,CardStyle5,success} : Props) => {

    const theme = useTheme();
    const { colors }:{colors : any} = theme;

    const navigation = useNavigation<any>();

    const dispatch = useDispatch();

    const wishList = useSelector((state:any) => state.wishList.wishList);

    const inWishlist = () => {
        var temp = [] as any;
        wishList.forEach((data:any) => {
            temp.push(data.id);
        });
        return temp;
    }

    const removeItemFromWishList = () => {
        dispatch(removeFromwishList(id as any));
    }

    return (
        <View
            style={[{
                shadowColor: "rgba(195, 123, 95, 0.25)",
                shadowOffset: {
                    width: 2,
                    height: 20,
                },
                shadowOpacity: .1,
                shadowRadius: 5,
                marginTop: 15,
            }, Platform.OS === "ios" && {
                backgroundColor: colors.card,
                borderRadius:20,
            }]}
        >
            <TouchableOpacity
                activeOpacity={.9}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor:colors.card,
                    borderRadius:20,
                    
                }}
                onPress={() => navigation.navigate('ProductDetails')}
            >
                <View>
                    <Image
                        style={{ height: null, width:150,aspectRatio:1/1,resizeMode:'contain' }}
                        source={image}
                    />
                </View>
                <View style={{flex:1,}}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ProductDetails')}
                    >
                        <Text numberOfLines={1} style={{ ...FONTS.Marcellus, fontSize: 18, color: colors.title ,flex:1}}>{title}</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 }}>
                        <Text style={{ ...FONTS.Marcellus, fontSize: 18, color: colors.title, }}>{price}</Text>
                        <Text
                            style={{
                                ...FONTS.Marcellus,
                                fontSize: 14,
                                textDecorationLine: 'line-through',
                                textDecorationColor: 'rgba(0, 0, 0, 0.70)',
                                color: theme.dark ? 'rgba(255,255,255,.7)' : 'rgba(0, 0, 0, 0.70)',
                                marginRight: 5
                            }}>{discount}
                        </Text>
                        {grid
                            ?
                            <Image
                                style={{ height: 12, width: 12, resizeMode: 'contain', }}
                                source={IMAGES.star4}
                            />
                            :
                            CardStyle4 ?
                            <Image
                                style={{ height: 12, width: 12, resizeMode: 'contain', }}
                                source={IMAGES.star4}
                            />
                            :
                            null
                        }
                        {grid
                            ?
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: theme.dark ? 'rgba(255,255,255,.5)' : 'rgba(0, 0, 0, 0.50)' }}>(2K Review)</Text>
                            :
                            CardStyle4 ?
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: theme.dark ? 'rgba(255,255,255,.5)' : 'rgba(0, 0, 0, 0.50)' }}>(2K Review)</Text>
                            :
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: colors.title }}>Qty:<Text style={{ ...FONTS.fontRegular, fontSize: 14 }}>2</Text></Text>
                        }
                    </View>
                    {grid ? 
                        <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: COLORS.success, marginTop: 5 }}>In Delivery</Text>
                        :
                        null
                    }
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',}}>
                        {grid ?
                            <Text style={{ ...FONTS.fontMedium, fontSize: 14, color:COLORS.danger, marginTop: 5 }}>{offer}</Text>
                        :
                        CardStyle5 ?
                            <Text style={{ ...FONTS.fontMedium, fontSize: 14, color:success == true ? COLORS.success : COLORS.danger, marginTop: 5 }}>{offer}</Text>
                        :
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={onPress1}
                            >
                                <Text style={{ ...FONTS.fontMedium, fontSize: 14, color:'#B75151', marginTop: 5 }}>Remove To Wishlist</Text>
                            </TouchableOpacity>
                        }
                        <View>
                            {removebtn ?
                                null
                                :
                                grid ? 
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        backgroundColor: COLORS.primary,
                                        borderRadius: 10,
                                        height:  32,
                                        width: 100,
                                        justifyContent: 'center',
                                        position:'absolute',
                                        bottom:-10,
                                        right:10
                                    }}
                                    onPress={() => onPress && onPress()}
                                >     
                                    <Text style={{ ...FONTS.fontMedium, fontSize: 13, color: colors.card }}>{btntitel}</Text>

                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 2,
                                        position: 'absolute',
                                        right: 0,
                                        bottom:Platform.OS === 'web' ? -49 : -49,
                                        backgroundColor:COLORS.primary,
                                        borderBottomRightRadius:20 ,
                                        borderTopLeftRadius:20 ,
                                        height:45,
                                        width:45,
                                        justifyContent: 'center'
                                    }}
                                    onPress={onPress2}
                                >
                                    <Image
                                        style={{ height: 24, width: 24, resizeMode: 'contain', tintColor: colors.card }}
                                        source={IMAGES.shopping}
                                    />
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </View>
                {likeBtn ?
                    <TouchableOpacity style={[ { position: 'absolute', top: 0, left: 0}]}>
                        <LikeBtn
                            onPress={inWishlist().includes(id) ? removeItemFromWishList : onPress1}
                            id={id}
                            inWishlist={inWishlist}
                        />
                    </TouchableOpacity>
                    :
                    null
                }
            </TouchableOpacity>
        </View>
    )
}

export default CardStyle3