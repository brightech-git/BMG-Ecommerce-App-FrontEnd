import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import Header from '../../layout/Header';
import CustomInput from '../../components/Input/CustomInput';
import { FontAwesome,MaterialIcons } from '@expo/vector-icons';


const Inputs = () => {

      const { colors }:{colors :any} = useTheme();

    const [value, setValue] = useState({ values: [0, 37], })
    const multiSliderValuesChange = (values: any) => {
        setValue({
            values,
        });
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                }}
            >
                
                    <Header
                        
                        title={'Inputs'}
                        leftIcon={'back'}
                    />
                
                <ScrollView>
                    <View style={GlobalStyleSheet.container}>
                        <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>

                            <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                <Text style={{ ...FONTS.h6, color: colors.title }}>Classic Input</Text>
                            </View>

                            <View style={GlobalStyleSheet.cardBody}>
                                <View style={{ marginBottom: 10 }}>
                                    <CustomInput
                                        placeholder="Enter Username"
                                        onChangeText={(value : any) =>
};


export default Inputs;