import React, { useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, SafeAreaView, TouchableOpacity, Platform } from 'react-native'
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { ScrollView } from 'react-native-gesture-handler';
import { COLORS, FONTS } from '../../constants/theme';
import CustomInput from '../../components/Input/CustomInput';
import Button from '../../components/Button/Button';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

type SavedAddressesScreenProps = StackScreenProps<RootStackParamList, 'SavedAddresses'>;

const SavedAddresses = ({ navigation } : SavedAddressesScreenProps) => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    const productSizes = ["Home", "Shop", "Office"];

    const [activeSize, setActiveSize] = useState(productSizes[0]);

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={"Add Delivery Address"}
                leftIcon={"back"}
                // titleLeft
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                <View style={GlobalStyleSheet.container}>
                    <Text style={{ ...FONTS.Marcellus, fontSize: 18, color: colors.title }}>Contact Details</Text>
                    <View style={{ marginBottom: 15, marginTop: 10 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Full Name</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            background
                        />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Mobile No.</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            background
                            keyboardType={'number-pad'}
                        />
                    </View>
                    <Text style={{ ...FONTS.fontSemiBold, fontSize: 16, color: colors.title }}>Address</Text>
                    <View style={{ marginBottom: 15, marginTop: 10 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Pin Code</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            background
                            keyboardType={'number-pad'}
                        />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Address</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            background
                        />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Locality/Town</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            background
                        />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>City/District</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            background
                        />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>State</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            background
                        />
                    </View>
                    <Text style={{ ...FONTS.Marcellus, fontSize: 18, color: colors.title }}>Save Address As</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            paddingTop: 10,
                            paddingBottom: 20
                        }}
                    >
                        {productSizes.map((data, index) => {
                            return (
                                <View
                                    key={index}
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
                                        onPress={() => setActiveSize(data)}
                                        style={[{
                                            height: 40,
                                            // width: 75,
                                            borderRadius: 10,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingHorizontal:20,
                                            // borderWidth: 1,
                                            // borderColor: theme.dark ? COLORS.white : colors.borderColor,
                                            marginHorizontal: 4,
                                            backgroundColor: colors.card
                                        }, activeSize === data && {
                                            backgroundColor:COLORS.primary,
                                            borderColor: COLORS.primary,
                                        }]}
                                    >
                                        <Text style={[{ ...FONTS.fontMedium, fontSize: 13, color: colors.title }, activeSize === data && { color: colors.card }]}>{data}</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
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

export default SavedAddresses