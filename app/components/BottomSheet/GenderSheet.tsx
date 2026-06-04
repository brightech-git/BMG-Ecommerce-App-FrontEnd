import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import { IMAGES } from '../../constants/Images';


type Props = {
    genderRef :any
  }
  

const GenderSheet2 = ({genderRef} : Props) => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;

    const GenderData = ["Men", "Women",];

    const [activeSize, setActiveSize] = useState(GenderData[0]);

    return (
        <View style={[GlobalStyleSheet.container, { paddingTop: 0 }]}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    paddingBottom: 15,
                    marginHorizontal: -15,
                    paddingHorizontal: 15
                }}
            >
                <Text style={[FONTS.Marcellus, { color: colors.title, fontSize: 20 }]}>Gender</Text>
                <View
                    style={[{
                        shadowColor:theme.dark ? "#000": "rgba(195, 123, 95, 0.20)",
                        shadowOffset: {
                            width: 3,
                            height: 10,
                        },
                        shadowOpacity: .2,
                        shadowRadius: 5,
                    }, Platform.OS === "ios" && {
                        backgroundColor: colors.card,
                        borderRadius:10
                    }]}
                >
                    <TouchableOpacity
                        style={{ height: 38, width: 38, backgroundColor: colors.card, borderRadius: 38, alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => genderRef.current.close()}
                    >
                        <Image
                            style={{ width: 18, height: 18, resizeMode: 'contain', tintColor: colors.title }}
                            source={IMAGES.close}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 20 }}>
                {GenderData.map((data, index) => {
                    return (
                        <View
                            key={index}
                            style={[{
                                shadowColor:theme.dark ? "#000": "rgba(195, 123, 95, 0.20)",
                                shadowOffset: {
                                    width: 3,
                                    height: 10,
                                },
                                shadowOpacity: .2,
                                shadowRadius: 5,
                            }, Platform.OS === "ios" && {
                                backgroundColor: colors.card,
                                borderRadius:10
                            }]}
                        >
                            <TouchableOpacity
                                onPress={() => setActiveSize(data)}
                                style={[{
                                    backgroundColor: colors.card,
                                    height: 40,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 10,
                                    paddingHorizontal: 20,
                                    paddingVertical: 5,
                                    marginBottom: 5
                                }, activeSize === data && {
                                    backgroundColor: COLORS.primary,
                                    borderColor: COLORS.primary,
                                }]}
                            >
                                <Text style={[{ ...FONTS.fontMedium, fontSize: 13, color: colors.title }, activeSize === data && { color: COLORS.white }]}>{data}</Text>
                            </TouchableOpacity>
                        </View>
                    )
                })}
            </View>
        </View>
        
    )
}

export default GenderSheet2;