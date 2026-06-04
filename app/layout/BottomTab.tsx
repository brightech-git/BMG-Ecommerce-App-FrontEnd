import { useEffect, useRef, useState } from 'react';
import { Image, Platform, TouchableOpacity, View, Animated, Text, Dimensions } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { IMAGES } from '../constants/Images';

type Props = {
    state : any,
    navigation : any,
    descriptors : any
}


const BottomTab = ({ state, descriptors, navigation } : Props) => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;

    const [tabWidth, setWidth] = useState(wp('100%'));

    const tabWD =
        tabWidth < SIZES.container ? ( tabWidth - 20) / 5 : SIZES.container / 5;

    const circlePosition = useRef(
        new Animated.Value(0),
    ).current;

    Dimensions.addEventListener('change', val => {
        setWidth(val.window.width);
    });
    
    useEffect(() => {
        Animated.spring(circlePosition, {
            toValue: state.index * tabWD,
            useNativeDriver: true,
        }).start();
    },[state.index,tabWidth])


    const onTabPress = (index: number) => {
        const tabW =
            tabWidth < SIZES.container ? ( tabWidth - 20) / 5 : SIZES.container / 5; // Adjust this according to your tab width

        Animated.spring(circlePosition, {
            toValue: index * tabW,
            useNativeDriver: true,
        }).start();
    };


    return (
        <View
            style={[GlobalStyleSheet.container,{
                padding:0,
                backgroundColor: colors.background,
                shadowColor:theme.dark ? 'rgba(255,255,255,1)': 'rgba(0,0,0,1)',
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: .1,
                shadowRadius: 5,
                position:'absolute',
                width:'auto',
                left:10,
                right:10,
                bottom:10,
                borderRadius:15
            }, Platform.OS === 'ios' && {
                backgroundColor: colors.card,
                borderRadius:15
            }]}
        >
            <View
                style={{
                    height: 65,
                    backgroundColor:colors.card,
                    borderRadius:15,
                }}
            >
                <View style={[GlobalStyleSheet.container, {
                    padding:0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 0,
                    paddingBottom: 0,
                }]}>
                    <Animated.View
                        style={{
                            width: tabWidth < SIZES.container ? (tabWidth - 20) / 5 : SIZES.container / 5,
                            position: 'absolute',
                            transform: [{ translateX: circlePosition }],
                           // backgroundColor:'red',
                            zIndex: 1,
                            top:-40,
                            bottom:0,
                            left: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <View
                            style={{
                                height: 50,
                                width: 50,
                                borderRadius: 40,
                                backgroundColor:COLORS.primary,
                                marginTop: 5,
                            }}
                        />
                    </Animated.View>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            height: '100%',
                            width: tabWidth < SIZES.container ? ( tabWidth - 20) / 5: SIZES.container / 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: [{ translateX: circlePosition }],
                            // zIndex: 1,
                            // top: -20,
                            // left: 0,
                        }}
                    >
                        <Image
                            style={{tintColor:colors.card,resizeMode:'contain',marginTop:Platform.OS === 'web' ? -70 :-80}}
                            source={IMAGES.cricle}
                        />
                    </Animated.View>
                    {state.routes.map((route:any, index:any) => {
                        const { options } = descriptors[route.key];
                        const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                    ? options.title
                                    : route.name;

                        const isFocused = state.index === index;


                        const iconTranslateY = useRef(new Animated.Value(0)).current;
                        Animated.timing(iconTranslateY, {
                            toValue: isFocused ? -18 : 0,
                            duration: 200,
                            useNativeDriver: true,
                        }).start();

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate({ name: route.name, merge: true });
                                onTabPress(index);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={.8}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={options.tabBarTestID}
                                onPress={onPress}
                                style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'center', marginTop:isFocused ? 15: 0 ,zIndex:12 }}
                            >
                                <Animated.View
                                    style={{
                                        transform: [{translateY: iconTranslateY}],
                                }}>
                                    <Image
                                        style={{ width: 21, height: 21, tintColor: isFocused ? COLORS.white : colors.title, resizeMode: 'contain' }}
                                        source={
                                            label == 'Home' ? IMAGES.home :
                                            label == 'Wishlist' ? IMAGES.heart2 :
                                            label == 'MyCart' ? IMAGES.shopping2 :
                                            label == 'Category' ? IMAGES.document :
                                            label == 'Profile' ? IMAGES.user2 : IMAGES.home
                                        }

                                    />
                                </Animated.View>
                                {isFocused 
                                    ?
                                    <Text style={{...FONTS.fontMedium,color: colors.title,fontSize:11,zIndex:15,}}>{label}</Text>
                                    :
                                    null
                                }
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

export default BottomTab;