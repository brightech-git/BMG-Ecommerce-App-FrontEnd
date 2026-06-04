import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, SafeAreaView, Platform } from 'react-native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CreditCard from '../../components/Card/CreditCard';
import CustomInput from '../../components/Input/CustomInput';
import { COLORS, FONTS } from '../../constants/theme';

import Button from '../../components/Button/Button';
import { ScrollView } from 'react-native-gesture-handler';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

type AddCardScreenProps = StackScreenProps<RootStackParamList, 'AddCard'>;

const AddCard = ({ navigation } : AddCardScreenProps) => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={"Add Card"}
                leftIcon={'back'}
                // titleLeft
            />
            <ScrollView
                contentContainerStyle={{ paddingBottom: 70 }}
            >
                <View style={GlobalStyleSheet.container}>
                    <CreditCard
                        creditCard
                    />
                    <View style={{ marginBottom: 15, marginTop: 20 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Card Name</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            background
                        />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Card Number</Text>
                        <CustomInput
                            onChangeText={(value:any) => console.log(value)}
                            background
                            keyboardType={'number-pad'}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20, paddingRight: 20 }}>
                        <View style={{ marginBottom: 15, width: '50%' }}>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Expiry Date</Text>
                            <CustomInput
                                onChangeText={(value:any) => console.log(value)}
                                background
                                keyboardType={'number-pad'}
                            />
                        </View>
                        <View style={{ marginBottom: 15, width: '50%' }}>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>CVV</Text>
                            <CustomInput
                                onChangeText={(value:any) => console.log(value)}
                                background
                                keyboardType={'number-pad'}
                            />
                        </View>
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
                            title={"Add Card"}
                            onPress={() => navigation.navigate('Payment')}
                            color={COLORS.primary}
                            btnRounded
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default AddCard