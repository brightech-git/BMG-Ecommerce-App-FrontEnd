import React from 'react';
import { View, TextInput, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { IMAGES } from '../constants/Images';

interface SearchBarProps {
    placeholder?: string;
    onChangeText?: (text: string) => void;
    value?: string;
    onBack?: () => void;
}

const SearchBar = ({ placeholder = 'Search', onChangeText, value, onBack }: SearchBarProps) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {onBack && (
                <TouchableOpacity
                    onPress={onBack}
                    style={{ height: 48, width: 48, backgroundColor: colors.card, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Image
                        style={{ height: 18, width: 18, resizeMode: 'contain', tintColor: colors.title }}
                        source={IMAGES.arrowleft}
                    />
                </TouchableOpacity>
            )}
            <View style={{ flex: 1, height: 52, backgroundColor: colors.card, borderRadius: 15, justifyContent: 'center' }}>
                <TextInput
                    style={{ ...FONTS.fontRegular, fontSize: 16, paddingLeft: 20, paddingRight: 45, color: colors.title }}
                    placeholder={placeholder}
                    placeholderTextColor={theme.dark ? 'rgba(255,255,255,0.8)' : '#666666'}
                    onChangeText={onChangeText}
                    value={value}
                />
                <View style={{ position: 'absolute', right: 15 }}>
                    <Image
                        style={{ height: 20, width: 20, tintColor: COLORS.primary }}
                        source={IMAGES.search}
                    />
                </View>
            </View>
        </View>
    );
};

export default SearchBar;
