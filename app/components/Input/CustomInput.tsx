import React, { useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS, SIZES } from '../../constants/theme';


const CustomInput = (props) => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    const [passwordShow, setPasswordShow] = useState(true);

    const handndleShowPassword = () => {
        setPasswordShow(!passwordShow);
    }

    return (
        <>
            <View
                style={[{
                    shadowColor: "rgba(195,135,95,0.30)",
                    shadowOffset: {
                        width: 2,
                        height:props.background ? 20 : 2,
                    },
                    shadowOpacity: .1,
                    shadowRadius: 5,
                }, Platform.OS === "ios" && {
                    backgroundColor: colors.card,
                    borderRadius:10
                }]}
            >
                <View style={{ position: 'relative', justifyContent: 'center' }}>
                    <View style={{
                        position: 'absolute',
                        height: 48,
                        width: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,

                        //top:16,
                    }}>
                        {props.icon && props.icon}
                    </View>
                    <TextInput
                        secureTextEntry={props.type === "password" ? passwordShow : false}
                        style={[{
                            ...FONTS.font,
                            fontSize: 14,
                            height: 53,
                            borderWidth: 1,
                            color: colors.title,
                            borderColor:props.background ? COLORS.primary: colors.background,
                            paddingVertical: 12,
                            backgroundColor:props.background ? colors.card : colors.background,
                            paddingHorizontal: 15,
                            borderRadius: 10,
                        }, props.icon && {
                            paddingLeft: 50,
                        }, props.inputLg && {
                            height: 98,
                            // paddingVertical: 18,
                        }, props.inputSm && {
                            paddingVertical: 7,
                            height: 45,
                        }, props.inputRounded && {
                            borderRadius: 30,
                        }, props.inputBorder && {
                            borderWidth: 0,
                            borderBottomWidth: 1,
                            borderRadius: 0,
                            backgroundColor: colors.card,
                        }]}
                        placeholderTextColor={colors.textLight}
                        placeholder={props.placeholder}
                        onChangeText={props.onChangeText}
                        value={props.value}
                        defaultValue={props.defaultValue}
                        multiline={props.inputLg}
                        keyboardType={props.keyboardType}
                    />
                    {props.type === "password" &&
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel="Password"
                            accessibilityHint="Password show and hidden"
                            onPress={() => handndleShowPassword()}
                            style={styles.eyeIcon}>
                            <FeatherIcon color={theme.dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} size={18} name={passwordShow ? 'eye-off' : 'eye'} />
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({

    eyeIcon: {
        position: 'absolute',
        height: 50,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        right: 0,
        zIndex: 1,
        top: 0,
    }
})

export default CustomInput;