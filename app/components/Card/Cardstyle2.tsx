import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { FONTS, COLORS } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';

import LikeBtn from '../LikeBtn';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromwishList } from '../../redux/reducer/wishListReducer';

type Props = {
    id : string,
    title : string;
    color ?: any;
    price : string;
    image ?: any;
    offer ?: string;
    delivery?:any;
    mindiscount?:any;
    marginTop?:any;
    discount?:any;
    wishlist?:any;
    card3?:any;
    likebtn?:any;
    onPress ?:any,
    onPress1 ?: (e : any) => void,
}

const Cardstyle2 = ({id,onPress1, image, price, discount, delivery, title, mindiscount, onPress,marginTop,likebtn } : Props) => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;

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
                    width: 5,
                    height: 20,
                },
                shadowOpacity: .1,
                shadowRadius: 5,
                marginTop:marginTop ? 15 : 0,
            }, Platform.OS === "ios" && {
                backgroundColor: colors.card,
                borderRadius:20
            }]}
        >
            <TouchableOpacity
                activeOpacity={.9}
                style={{ backgroundColor: colors.card, borderRadius: 20, }}
                onPress={() => onPress && onPress()} 
            >
                <View style={{paddingHorizontal:15,paddingTop:15,paddingRight:0}}>
                    <Text style={{ ...FONTS.Marcellus, fontSize:16, color: colors.title,}}>{title}</Text>
                </View>
                <Image
                    style={{ width: '100%', height: undefined, aspectRatio:1 /.8 }}
                    source={image}
                />
                <View style={{ padding: 15,paddingTop:0, alignItems:mindiscount ? 'center' : null,  }}>
                    {mindiscount
                        ?
                        <View>
                            <Text style={{ ...FONTS.fontSemiBold, fontSize: 15, color: COLORS.success }}>{discount}</Text>
                        </View>
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Text style={{ ...FONTS.fontSemiBold, fontSize: 14, color: colors.title, marginTop: 2 }}>{price}</Text>
                            <Text
                                style={{
                                    ...FONTS.fontRegular,
                                    fontSize: 12,
                                    textDecorationLine: 'line-through',
                                    textDecorationColor: 'rgba(0, 0, 0, 0.70)',
                                    color: theme.dark ? 'rgba(255,255,255, .7)' : 'rgba(0, 0, 0, 0.70)',
                                    marginRight: 5
                                }}>{discount}
                            </Text>
                            <Text numberOfLines={1} style={{ ...FONTS.fontMedium, fontSize: 13, color: COLORS.success ,paddingRight:40}}>{delivery}</Text>
                        </View>
                    }
                </View>
                {likebtn
                    ?
                    <View style={{ position: 'absolute', right: 5, top: 5 }}>
                        <TouchableOpacity
                            style={{
                                height: 38,
                                width: 38,
                                borderRadius: 38,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <LikeBtn
                                onPress={inWishlist().includes(id) ? removeItemFromWishList : onPress1}
                                id={id}
                                inWishlist={inWishlist}
                            />
                        </TouchableOpacity>
                    </View>
                    :
                    null
                }
            </TouchableOpacity>
        </View>
    )
}

export default Cardstyle2