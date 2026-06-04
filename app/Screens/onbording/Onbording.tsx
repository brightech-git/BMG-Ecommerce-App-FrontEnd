import React, { useRef, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, SafeAreaView, Text, Image, Animated, ScrollView, StyleSheet, Platform,TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import Button from '../../components/Button/Button';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { GlobalStyleSheet } from '../../constants/StyleSheet';


const DATA = [
    {
        title: "The Natural \nBeauty Of A Jewelry Collection",
        desc: 'Sophisticated Collection Inspired By Passion',
    },
    {
        title: "The Natural \nBeauty Of A Jewelry Collection",
        desc: 'Sophisticated Collection Inspired By Passion',
    },
    {
        title: "The Natural \nBeauty Of A Jewelry Collection",
        desc: 'Sophisticated Collection Inspired By Passion',
    },
]


type OnbordingScreenProps = StackScreenProps<RootStackParamList, 'Onbording'>;

const Onbording = ({navigation} : OnbordingScreenProps) => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;
    const scrollRef = useRef<any>();
    const scrollX = useRef(new Animated.Value(0)).current;

    const [sliderIndex , setSliderIndex] = useState(1);

    const onScroll = (val:any) => {
        if(sliderIndex == 3){
            navigation.navigate('SignIn')
        }
        // console.log(scrollX);
        scrollRef.current?.scrollTo({
            // x: val.nativeEvent.contentOffset.x,
            x : SIZES.width * val,
            animated: true,
        });

        setSliderIndex(sliderIndex + 1);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={{ flexGrow:1 }}>
                <View style={[GlobalStyleSheet.container,{padding:0, flex: 1,overflow:'hidden'}]}>
                    <View style={[GlobalStyleSheet.row,{justifyContent:'space-between'}]}>
                        <View 
                            style={[
                                GlobalStyleSheet.col50,
                                {transform: [{ rotate: '-41.8deg' }],
                                height:undefined,
                                aspectRatio:1/1.5,
                                backgroundColor:'#C7C8CC',
                                marginTop:-40,
                                marginLeft:-40,
                                overflow:'hidden',
                                borderBottomLeftRadius:160,
                                borderBottomRightRadius:160,
                                borderTopRightRadius:100,
                                }
                            ]}
                        >
                            <Image
                                style={{width:'100%',height:undefined,aspectRatio:2.4/3.2,transform: [{ rotate: '41.8deg' },{scale : 1.5}],marginTop:60,marginLeft:Platform.OS === 'web' ? 0: 25}}
                                source={IMAGES.item1}
                            />
                        </View>
                        <View style={[GlobalStyleSheet.col50,{width:144,height:144,borderRadius:100,backgroundColor:COLORS.white,marginRight:50,marginTop:-30,alignItems:'center'}]}>
                            <Image
                                style={{resizeMode:'contain',width:'100%',height:undefined,aspectRatio:1/1,marginTop:40}}
                                source={IMAGES.item3}
                            />
                        </View>
                    </View>
                    <View style={[GlobalStyleSheet.row,{justifyContent:'space-between'}]}>
                        <View style={[GlobalStyleSheet.col50,{width:190,height:190,borderRadius:150,backgroundColor:COLORS.primary,marginLeft:-30,marginTop:70,overflow:'hidden',alignItems:'center',justifyContent:'center'}]}>
                            <Image
                                style={{width:'100%',height:undefined,aspectRatio:1/1.1,marginLeft:20,marginTop:10}}
                                source={IMAGES.item21}
                            />
                        </View>
                        <View style={[
                                GlobalStyleSheet.col50,
                                {transform: [{ rotate: '-135deg' }],
                                height:undefined,
                                aspectRatio:1/1,
                                backgroundColor:COLORS.secondary,
                                marginTop:'-60%',
                                marginRight:-80,
                                overflow:'hidden',
                                borderRadius:160
                                }
                            ]}
                        >
                            <Image
                                style={{width:'100%',height:undefined,aspectRatio:1/1.3,transform: [{ rotate: '135deg' },{scale :Platform.OS === 'web' ? 2 : 1.6}],marginTop:52}}
                                source={IMAGES.item2}
                            />
                        </View>
                    </View>
                </View>
                <View style={{marginTop:10}}>
                    <View style={[styles.indicatorConatiner,Platform.OS === "ios" && { 
                        bottom:10
                    }]} pointerEvents="none">
                        {DATA.map((x, i) => (
                            <Indicator i={i} key={i} scrollValue={scrollX} />
                        ))}
                    </View>
                    <ScrollView
                        // contentContainerStyle={{ marginTop: 20 }}
                        ref={scrollRef}
                        horizontal
                        pagingEnabled
                        scrollEventThrottle={16}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        onScroll={
                            Animated.event(
                                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                                { useNativeDriver: false },
                            )
                        }    
                    >
                        {DATA.map((data, index) => (

                            <View style={[styles.slideItem,Platform.OS === "ios" && {
                                // paddingBottom:35
                            }]} key={index}>
                                <View style={{paddingHorizontal:30 }}>
                                    <Text style={{ ...FONTS.Marcellus, fontSize:30, textAlign:'left', color: colors.title }}>{data.title}</Text>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 18, textAlign: 'left', lineHeight: 24, color: colors.title, paddingTop: 10 ,paddingRight:100}}>{data.desc}</Text>
                                </View>
                            </View>

                            ))
                        }
                    </ScrollView>
                </View>
                <View style={[GlobalStyleSheet.container,{paddingHorizontal:40}]}>
                    <View style={[GlobalStyleSheet.row,{justifyContent:'space-between',alignItems:'center'}]}>
                        <TouchableOpacity
                           onPress={() => navigation.navigate('SignIn')}
                        >
                            <Text style={{...FONTS.fontRegular,fontSize:16,color:colors.title,textDecorationLine:'underline'}}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={{width:'30%'}}
                        >
                            <Button
                                onPress={() => onScroll(sliderIndex)}
                                title={'Next'}
                                btnRounded
                                color={COLORS.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

function Indicator({ i, scrollValue } : any) {


    const theme = useTheme();
    const { colors }: {colors : any} = theme;

    const translateX = scrollValue.interpolate({
        inputRange: [-SIZES.width + i * SIZES.width, i * SIZES.width, SIZES.width + i * SIZES.width],
        outputRange: [-20, 0, 20],
    });
    return (
        <View style={[styles.indicator, { backgroundColor:theme.dark ? 'rgba(255,255,255,0.20)':'rgba(195, 123, 95, 0.20)', borderColor:theme.dark ? 'rgba(255,255,255,0.20)':'rgba(195, 123, 95, 0.20)' }]}>
            <Animated.View
                style={[styles.activeIndicator, { transform: [{ translateX }], backgroundColor: COLORS.primary }]}
            />
        </View>
    );
}


const styles = StyleSheet.create({


    slideItem: {
        width: SIZES.width,
        paddingBottom: 30,    
    },
    slideItem2: {
        width: SIZES.width,
        alignItems:'center',
        justifyContent: 'center',
        // padding: 20,
        paddingBottom: 0,
        paddingTop:20,
    },

    indicatorConatiner: {
        alignSelf: 'flex-end',
        position: 'absolute',
        flexDirection: 'row',
        paddingRight:30,
        top:-30
    },
    indicator: {
        height: 10,
        width: 10,
        borderRadius: 5,
        marginHorizontal: 5,
        borderWidth: 1,
        overflow: 'hidden',
    },
    activeIndicator: {
        height: '100%',
        width: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 10,
    },

})
export default Onbording;