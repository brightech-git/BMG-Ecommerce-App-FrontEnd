import React, { useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { View, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS } from '../constants/theme';

const CheckoutItems = ({style2} :any ) => {

    const theme = useTheme();
    const { colors }:{colors :any} = theme;

    const [itemQuantity, setItemQuantity] = useState(14);

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor:style2 ? theme.dark ? '#000': '#FAECE5' : null,
                borderRadius:style2 ? 30 : 0,
                justifyContent:style2 ? 'space-between': null,
                paddingVertical:style2 ? 5 :0,
                paddingHorizontal:style2 ? 5 :0
            }}
        >
            <TouchableOpacity
                onPress={() => itemQuantity > 1 && setItemQuantity(itemQuantity - 1)}
                style={{
                    height:style2 ? 45 : 30,
                    width: style2 ? 45 : 30,
                    backgroundColor:style2 ? colors.card : null,
                    borderRadius: style2 ? 50 : 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: style2 ? 0:1,
                    borderColor:colors.title,
                }}
            >
                <FeatherIcon size={style2 ? 18 :14} color={colors.title} name='minus' />
            </TouchableOpacity>
            <Text style={{ ...FONTS.fontMedium, fontSize:style2 ? 18 : 14, color: colors.title, width:style2 ?  40 : 30, textAlign: 'center' }}>{itemQuantity}</Text>
            <TouchableOpacity
                onPress={() => setItemQuantity(itemQuantity + 1)}
                style={{
                    height:style2 ? 45 : 30,
                    width: style2 ? 45 : 30,
                    backgroundColor:style2 ? colors.card : null,
                    borderRadius: style2 ? 50 : 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: style2 ? 0:1,
                    borderColor:colors.title
                }}
            >
                <FeatherIcon size={style2 ? 18 :14} color={colors.title} name='plus' />
            </TouchableOpacity>
        </View>
    )
}

export default CheckoutItems