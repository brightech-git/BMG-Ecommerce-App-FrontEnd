import React, { useRef, useState } from "react";
import { View, Text, StyleSheet,TouchableOpacity, TextInput } from 'react-native'
import { COLORS, FONTS } from '../../constants/theme';
import { useTheme } from "@react-navigation/native";


type props = {
    code : any,
    setCode :any ,
    maximumLength :any,
    setIsPinReady:any,
}

const Customotp = ({code,setCode,maximumLength,setIsPinReady} : props) => {
    
    const boxArray = new Array(maximumLength).fill(0);

    const inputRef = useRef<any>();

    const theme = useTheme();
    const {colors}:{colors : any} = theme;


    const boxDigit = (_, index:any) => {
        const emptyInput = "";
        const digit = code[index] || emptyInput;

        const isCurrentDigit = index === code.length;
        const isLastDigit = index === maximumLength - 1;
        const isCodeFull = code.length === maximumLength;
        
        const isDigitFocused = isCurrentDigit || (isLastDigit && isCodeFull);


        return (
            <View  key={index} style={[styles.SplitBoxes, isDigitFocused ? styles.SplitBoxesFocused : null]}>
                <Text style={[FONTS.fontJostLight,styles.SplitBoxText,{color:colors.title}]}>{digit}</Text>
            </View>
        );
    };


    const [isInputBoxFocused, setIsInputBoxFocused] = useState(false);

    const handleOnPress = () => {
        setIsInputBoxFocused(true);
        inputRef.current.focus();
      };
     
      const handleOnBlur = () => {
        setIsInputBoxFocused(false);
      };

     

  return (
    <View style={styles.OTPInputContainer}>
        <TouchableOpacity style={styles.SplitOTPBoxesContainer} onPress={ handleOnPress }>
            {boxArray.map(boxDigit)}
        </TouchableOpacity>
        <TextInput 
            style={styles.TextInputHidden}
            value={code}
            onChangeText={setCode}
            maxLength={maximumLength}
            ref={inputRef}
            onFocus={handleOnPress}
            onBlur={handleOnBlur}
            keyboardType={'number-pad'}
        />
    </View>
  )
}


const styles = StyleSheet.create({
    OTPInputContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    TextInputHidden: {
        position:'absolute',
        opacity:0
    },
    SplitOTPBoxesContainer :{
        width:'100%',
        flexDirection:'row',
        justifyContent:'space-evenly',
        paddingTop:10,
        gap:25,
        paddingHorizontal:40
    },
    SplitBoxes :{
        width:61,
        height:48,
        backgroundColor:COLORS.background,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10
    },
    SplitBoxText :{
        fontSize:28,
        textAlign:'center',
        color:'#000'
    },
    SplitBoxesFocused:{
        borderColor:COLORS.primary,
        shadowColor:COLORS.primaryLight, 
    }
});
export default Customotp