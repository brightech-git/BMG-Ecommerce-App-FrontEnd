import React, { useState } from 'react'
import { useTheme } from '@react-navigation/native'
import { View, Text, SafeAreaView, Image, TouchableOpacity, Platform } from 'react-native'
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';

import Button from '../../components/Button/Button';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

const saveData = [
    {
        image: IMAGES.home,
        title: "Home Address",
        text: "123 Main Street, Anytown, USA 12345",
    },
    {
        image: IMAGES.map,
        title: "Office Address",
        text: "456 Elm Avenue, Smallville, CA 98765",
    },
    {
        image: IMAGES.home,
        title: "Home Address",
        text: "789 Maple Lane, Suburbia, NY 54321",
    },
    {
        image: IMAGES.shop,
        title: "Shop Address",
        text: "654 Pine Road, Countryside, FL 34567",
    },
]

type SaveAddressScreenProps = StackScreenProps<RootStackParamList, 'SaveAddress'>;

const SaveAddress = ({ navigation } : SaveAddressScreenProps) => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    const [isChecked, setIsChecked] = useState(saveData[0]);

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={"Delivery Address"}
                leftIcon={'back'}
                // titleLeft
            />
            <ScrollView contentContainerStyle={{paddingBottom:150}}>
                <View style={[GlobalStyleSheet.container, { paddingTop: 10 }]}>
                    {saveData.map((data, index) => {
                        return (
                            <TouchableOpacity
                                onPress={() => setIsChecked(data)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.border,
                                    paddingBottom: 15,
                                    marginTop: 10
                                }}
                                key={index}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 ,flex:1}}>
                                    <View
                                        style={[{
                                            shadowColor: "rgba(195,135,95,0.30)",
                                            shadowOffset: {
                                                width: -5,
                                                height: 15,
                                            },
                                            shadowOpacity: .1,
                                            shadowRadius: 5,
                                        }, Platform.OS === "ios" && {
                                            backgroundColor: colors.card,
                                            borderRadius:10
                                        }]}
                                    >
                                        <View style={{ height: 40, width: 40, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image
                                                style={{ height: 20, width: 20, tintColor: COLORS.primary, resizeMode: 'contain' }}
                                                source={data.image}
                                            />
                                        </View>
                                    </View>
                                    <View style={{flex:1}}> 
                                        <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{data.title}</Text>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{data.text}</Text>
                                    </View>
                                </View>
                                <View
                                    style={[{
                                        shadowColor: "rgba(195, 123, 95, 0.20)",
                                        shadowOffset: {
                                            width: 2,
                                            height: 15,
                                        },
                                        shadowOpacity: .1,
                                        shadowRadius: 5,
                                    }, Platform.OS === "ios" && {
                                        backgroundColor: colors.card,
                                        borderRadius: 50,
                                    }]}
                                >
                                    <View
                                        style={[{
                                            borderWidth: 1,
                                            width: 24,
                                            height: 24,
                                            borderRadius: 50,
                                            borderColor: theme.colors.card,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor:theme.colors.card
                                            },isChecked === data && {
                                                backgroundColor:COLORS.primary,
                                                borderColor:COLORS.primary
                                            }]}
                                    >
                                        <View style={[{
                                            width: 14,
                                            height: 14,
                                            backgroundColor: theme.colors.background,
                                            borderRadius: 50
                                        }, isChecked === data && {
                                            backgroundColor: theme.colors.card
                                        }]}></View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                    <View
                        style={[{
                            shadowColor: "rgba(195,135,95,0.30)",
                            shadowOffset: {
                                width: -5,
                                height: 15,
                            },
                            shadowOpacity: .1,
                            shadowRadius: 5,
                        }, Platform.OS === "ios" && {
                            backgroundColor: colors.card,
                            borderRadius:10
                        }]}
                    >
                        <TouchableOpacity
                            style={{
                                height: 48,
                                width: '100%',
                                borderWidth: 1,
                                borderColor: theme.dark ? COLORS.white : colors.border,
                                borderRadius: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingHorizontal: 10,
                                backgroundColor:colors.card,
                                marginTop: 30
                            }}
                            onPress={() => navigation.navigate('SavedAddresses')}
                        >
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <Image
                                    style={{ height: 20, width: 20, resizeMode: 'contain', tintColor: colors.title }}
                                    source={IMAGES.plus}
                                />
                                <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>Add Address</Text>
                            </View>
                            <Image
                                style={{ height: 16, width: 16, resizeMode: 'contain', tintColor: colors.title }}
                                source={IMAGES.rightarrow}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <View
                 style={[{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    shadowColor:'rgba(195, 123, 95, 0.25)',
                    shadowOffset: {
                        width: 2,
                        height: -20,
                    },
                    shadowOpacity: .1,
                    shadowRadius: 5,
                }, Platform.OS === "ios" && {
                    backgroundColor: colors.card,
                    borderTopLeftRadius:25,borderTopRightRadius:25,
                    bottom:30
                }]}
            >
                <View style={{ height: 88, backgroundColor: colors.card,borderTopLeftRadius:25,borderTopRightRadius:25 }}>
                    <View style={[GlobalStyleSheet.container, { paddingHorizontal: 10, marginTop: 15, paddingTop: 0 }]}>
                        <Button
                            title={"Save Address"}
                            btnRounded
                            onPress={() => navigation.navigate('Checkout')}
                            color={COLORS.primary}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default SaveAddress