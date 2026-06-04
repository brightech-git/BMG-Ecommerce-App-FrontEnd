import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';


const SocialBtn = (props: { color?: any; gap?: any; rounded?: any; icon?: any; textcolor?: any; text?: any; onPress?: any; }) => {

    const { onPress } = props;

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    return (
        <View
            style={[{
                shadowColor: 'rgba(195, 123, 95, 0.20)',
                shadowOffset: {
                    width: 0,
                    height: 20,
                },
                shadowOpacity: .1,
                shadowRadius: 5,
            }, Platform.OS === "ios" && {
                backgroundColor: colors.card,
                borderRadius:35
            }]}
        >
            <TouchableOpacity
                style={[{
                    backgroundColor: props.color ? props.color : COLORS.primary,
                    // paddingVertical: 12,
                    overflow: 'hidden',
                    paddingLeft: 20,
                    paddingRight: 20,
                    height: 55,
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap:props.gap ? 0: 20,
                    justifyContent: 'center'
                }, props.rounded && {
                    borderRadius: 30,
                }]}
                onPress={onPress}
            >
                <View
                    style={[{

                        // width: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }, props.rounded && {
                        borderRadius: 30,
                    }]}
                >
                    {props.icon}
                </View>
                <Text style={{ ...FONTS.font, ...FONTS.fontLg, color: props.textcolor ? colors.card : theme.dark ? COLORS.white : COLORS.title }}>{props.text}</Text>
            </TouchableOpacity>
        </View>
    );
};



export default SocialBtn;