import React from 'react';
import { Text, View } from 'react-native';
import {Feather} from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS } from '../../constants/theme';
import Button from '../Button/Button';

const PricingStyle1 = () => {

      const { colors }:{colors :any} = useTheme();

    const Data = [
        'Access to all basic features',
        'Basic reporting and analytics',
        'Up to 10 individual users',
        '20 GB individual data each user',
        'Basic chat and emails support',
    ]

    return (
        <>
            <View
                style={{
                    padding: 30,
                    borderWidth: 1,
                    borderColor: COLORS.primary,
                    backgroundColor: colors.card,
                    maxWidth: 320,
                    width: '100%',
                }}
            >
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ ...FONTS.h3, color: colors.title }}>$10/Month</Text>
                    <Text style={{ ...FONTS.font, ...FONTS.fontTitle, marginBottom: 10, color: colors.title }}>Basic plan</Text>
                    <Text style={{ ...FONTS.font, color: colors.text }}>Billed annually</Text>
                </View>
                <View style={{ marginBottom: 25 }}>
                    {Data.map((data, index) => {
                        return (
                            <View
                                key={index}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 5,
                                }}
                            >
                                <Feather
                                    style={{ marginRight: 8 }}
                                    color={colors.title}
                                    name="check-circle"
                                    size={18}
                                />
                                <Text style={{ ...FONTS.font, color: colors.text }}>{data}</Text>
                            </View>
                        )
                    })}
                </View>
                <Button
                    title={'Get started'}
                    color={colors.title}
                />
            </View>
        </>
    );
};



export default PricingStyle1;