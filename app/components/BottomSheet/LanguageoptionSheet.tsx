import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import {  FONTS, COLORS } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import { IMAGES } from '../../constants/Images';

const LanguageData = [
    {
        id: "1",
        text: "Indian",
    },
    {
        id: "2",
        text: "English",
    },
    {
        id: "3",
        text: "German",
    },
    {
        id: "4",
        text: "Italian",
    },
    {
        id: "5",
        text: "Spanish"
    },
]

type Props = {
    moresheet ?: any;
    setLanguage? :any;
    sheetRef :any
}

const LanguageoptionSheet = ({moresheet,setLanguage,sheetRef} : Props) => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;

    return (
        <View style={[GlobalStyleSheet.container, { marginTop: 10,backgroundColor:colors.background }]}>
            {LanguageData.map((data:any, index) => {
                return (
                    <View key={index} style={{ marginHorizontal: -15 }}>
                        <TouchableOpacity
                            //onPress={() => { setLanguage(data.text);}}
                            onPress={() => { setLanguage(data.text); {sheetRef.current.close()} }}
                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: 15 }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ ...FONTS.fontSm, ...FONTS.fontMedium, color: colors.title, fontSize: 15, marginLeft: 10, }}>{data.text}</Text>
                            </View>
                            <Image
                                style={{ height: 12, width: 12, resizeMode: 'contain', tintColor: colors.title }}
                                source={IMAGES.rightarrow}
                            />
                        </TouchableOpacity>
                    </View>
                )
            })}
        </View>
  )
}


export default LanguageoptionSheet;