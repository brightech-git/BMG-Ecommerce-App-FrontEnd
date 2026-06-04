import React,{useEffect, useRef} from 'react';
import { 
    View, 
    Animated, 
    TouchableOpacity, 
    StyleSheet 
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/theme';

type Props = {
    percentage: number;
    scrollTo: any;
    theme : any;
};
const NextBtn = ({percentage,scrollTo,theme}: Props) => {

    const size = 70;
    const strokeWidth = 2;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const progressAnimation = useRef(new Animated.Value(0)).current;
    const progressRef = useRef<any>(null);


    const animation = (toValue:any) => {
       return Animated.timing(progressAnimation,{
        toValue,
        duration:250,
        useNativeDriver:false
       }).start();
    }

    useEffect(() => {
        animation(percentage);
    },[percentage]);

    useEffect(() => {
        progressAnimation.addListener((value) => {
            const strokeDashoffset = circumference - (circumference * value.value) / 100;
            if(progressRef?.current){
                progressRef.current.setNativeProps({
                    strokeDashoffset
                })
            }
        });
        return () => {
            progressAnimation.removeAllListeners();
        }
    },[])

    return (
        <TouchableOpacity
            onPress={scrollTo}
            style={{
                alignItems:'center',
                justifyContent:'center',
            }}
        >
            <Svg width={size} height={size} fill={'transparent'}>
                <G origin={center} rotation={"-90"}>
                    <Circle
                        stroke={theme.dark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.1)'}
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    <Circle
                        ref={progressRef}
                        stroke={theme.dark ? '#fff' : '#000'}
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                    />
                </G>
            </Svg>
            <View
                style={styles.processBtn}
            >
                <FeatherIcon color={COLORS.title} size={22} name="arrow-right"/>
            </View>
        </TouchableOpacity>
    )
}

const styles= StyleSheet.create({
    processBtn : {
        height:50,
        width:50,
        borderRadius:25,
        backgroundColor:COLORS.primary,
        alignItems:'center',
        justifyContent:'center',
        position:'absolute',
    }
})

export default NextBtn; 