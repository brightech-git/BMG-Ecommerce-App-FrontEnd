import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import LikeBtn from '../LikeBtn';
import { FONTS, COLORS } from '../../constants/theme';
import { useNavigation, useTheme } from '@react-navigation/native';

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
    closebtn?:any;
    Cardstyle4?:any;
    removelikebtn?:any;
    discount?:any;
    wishlist?:any;
    card3?:any;
    likebtn?:any;
    onPress ?:any,
    onPress1 ?: (e : any) => void,
    onPress2 ?: (e : any) => void,
}

const CardStyle1 = ({id, image, title, price, discount,onPress1,onPress2, closebtn,removelikebtn, onPress, likebtn,card3,Cardstyle4,offer } : Props) => {

    const theme = useTheme();
    const { colors } : {colors : any}= theme;

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
            }, Platform.OS === "ios" && {
                backgroundColor:card3 ? null : colors.card,
                borderRadius:20
            }]}
        >
            <TouchableOpacity
                activeOpacity={.9}
                style={{borderRadius:20,borderColor:colors.title,backgroundColor:card3 ? null :colors.card,alignItems:card3 ? 'center' : null}}
                onPress={() => onPress && onPress()}
            >
                <View style={{backgroundColor:card3 ? colors.card : null ,width:card3 ? 127: null,height:card3 ? 127:Cardstyle4 ? null : 170,alignItems:'center',justifyContent:'center',borderRadius:card3 ? 40: null}}>
                    <Image
                        style={{ height: undefined, width: '100%', aspectRatio:1/1, borderRadius: 10,borderBottomLeftRadius:0,borderBottomRightRadius:0,resizeMode:'contain' }}
                        source={image}
                    />
                </View>
                <View style={{ padding:Cardstyle4 ? 20 :10,paddingTop:Cardstyle4 ? 0 : null,backgroundColor:card3 ? null :colors.card,borderBottomLeftRadius:20,borderBottomRightRadius:20,alignItems:card3 ?'center':null }}>
                    {Cardstyle4 ?
                        <Text style={{...FONTS.fontMedium,fontSize:13,color:COLORS.success,marginBottom:5}}>{offer}</Text> 
                        :
                        null
                    }
                    <Text style={{ ...FONTS.Marcellus, fontSize:card3 ?  16 : 18, color: colors.title,textAlign:card3 ? 'center' : 'left',paddingRight:card3 ? 0 : 20 }}>{title}</Text>
                    <View style={{ position:Cardstyle4 ? 'absolute' : null,bottom:Cardstyle4 ? 20 : null,right:Cardstyle4 ? 20 : null,flexDirection:Cardstyle4 ? 'column' : 'row', alignItems: 'center', gap: 5, marginTop: 5 }}>
                        {Cardstyle4 ?

                            <Text style={{ ...FONTS.fontSemiBold, fontSize:card3 ?  16 : 18, color: colors.title, }}>{price}</Text>
                            :
                            <Text style={{ ...FONTS.Marcellus, fontSize:card3 ?  16 : 18, color: colors.title, }}>{price}</Text>
                        }
                        {Cardstyle4 ?

                            <Text
                            style={{
                                ...FONTS.fontRegular,
                                fontSize:card3 ?  13 : 14,
                                textDecorationLine: 'line-through',
                                color: theme.dark ? 'rgba(255,255,255, .4)' : 'rgba(0, 0, 0, 0.40)',
                            }}>{discount}
                            </Text>
                            :
                            <Text
                                style={{
                                    ...FONTS.Marcellus,
                                    fontSize:card3 ?  13 : 14,
                                    textDecorationLine: 'line-through',
                                    color: theme.dark ? 'rgba(255,255,255, .4)' : 'rgba(0, 0, 0, 0.40)',
                                    marginRight: 5
                                }}>{discount}
                            </Text>
                        }
                    </View>
                </View>
                {likebtn
                    ?
                    <View style={{ position: 'absolute', right: 15, top: 10 }}>
                        <TouchableOpacity
                            style={{
                                height: 38,
                                width: 38,
                                borderRadius: 38,
                                backgroundColor: 'rgba(0,0,0,.2)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                style={{ height: 18, width: 18, resizeMode: 'contain', tintColor: COLORS.white }}
                                source={IMAGES.close}
                            />
                        </TouchableOpacity>
                    </View>
                    :
                    removelikebtn
                    ?
                        null
                    :

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
                }
                {closebtn ?
                    <TouchableOpacity
                        activeOpacity={.9}
                        style={{ position: 'absolute', bottom: 0,right:0 }}
                        onPress={onPress2}
                    >
                        <View style={{height:45,width:45,backgroundColor:COLORS.primary,alignItems:'center',justifyContent:'center',borderBottomRightRadius:20,borderTopLeftRadius:20}}>
                            <Image
                                style={{height:24,width:24,resizeMode:'contain',tintColor:colors.card}}
                                source={IMAGES.shopping}
                            />
                        </View>
                    </TouchableOpacity>
                    :
                    null
                }
            </TouchableOpacity>
        </View>
    )
}

export default CardStyle1;