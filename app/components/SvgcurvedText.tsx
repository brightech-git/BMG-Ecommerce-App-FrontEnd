import React, { Component } from 'react';
import { View, Text, SafeAreaView,Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import {  Circle, Text as SvgText, TextPath, TSpan, G, Svg }from 'react-native-svg';
import { IMAGES } from '../constants/Images';


const SvgcurvedText = ({small} :any) => {
  
    const theme = useTheme();
    const {colors} : {colors : any} = theme;

    return (
        <SafeAreaView style={{}}>
            <View style={{}}>
                <Svg height="150" width="150"
                viewBox="0 0 180 180" >
                    <G id="circle">
                        <Circle
                        r={25}
                        x={100}
                        y={120}
                        // fill={small ? 'rgba(255, 255, 255, 0.70)':colors.card}
                        // stroke={small ? 'rgba(255, 255, 255, 0.70)':colors.card}
                        fill="none"
                        strokeWidth={14}
                        transform="rotate(-145)"
                        />
                    </G>
                    <SvgText fill={colors.title} fontSize="11">
                        <TextPath href="#circle">
                            <TSpan dx="0" dy={small ? -10 : -18}>
                                MORE  COLLECTION  EXPLORE
                            </TSpan>
                        </TextPath>
                    </SvgText>
                </Svg>
                <View>
                    <Image
                        style={{height:15,width:15,resizeMode:'contain',position:'absolute',top:-60,right:57,tintColor:colors.title}}
                        source={IMAGES.playbtn}
                    />
                </View>
            </View>
        </SafeAreaView>
    
    )
}

export default SvgcurvedText