import React from 'react';
import { Text } from 'react-native';
import CustomInput from './CustomInput';
import { COLORS } from '../../constants/theme';

const MOBILE_REGEX = /^[6-9]\d{9}$/;

export const validateMobileField = (value: string): { isValid: boolean; message: string } => {
    const v = value.trim();
    if (!v) return { isValid: false, message: 'Mobile number is required.' };
    if (!/^\d+$/.test(v)) return { isValid: false, message: 'Mobile number must contain digits only.' };
    if (v.length !== 10) return { isValid: false, message: 'Mobile number must be exactly 10 digits.' };
    if (!MOBILE_REGEX.test(v)) return { isValid: false, message: 'Mobile number must start with 6, 7, 8, or 9.' };
    return { isValid: true, message: 'Valid' };
};

interface MobileInputProps {
    value: string;
    onChangeText: (value: string) => void;
    error?: string;
    background?: boolean;
    inputSm?: boolean;
    inputRounded?: boolean;
    inputBorder?: boolean;
}

const MobileInput = ({ value, onChangeText, error, ...rest }: MobileInputProps) => {

    const handleChange = (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, 10);
        onChangeText(digits);
    };

    return (
        <>
            <CustomInput
                value={value}
                onChangeText={handleChange}
                keyboardType="phone-pad"
                placeholder="Enter 10-digit mobile number"
                {...rest}
            />
            {!!error && (
                <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 3 }}>
                    {error}
                </Text>
            )}
        </>
    );
};

export default MobileInput;
