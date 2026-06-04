import React, { useState } from 'react';
import { LayoutAnimation, SafeAreaView, ScrollView, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Header from '../../layout/Header';
import SwipeBox from '../../components/SwipeBox';
import { IMAGES } from '../../constants/Images';

const SwipeData = [
    {
        image: IMAGES.small6,
        title: "New Arrivals Alert!",
        date: "15 July 2024"
    },
    {
        image: IMAGES.small5,
        title: "Flash Sale Announcement",
        date: "15 July 2024"
    },
    {
        image: IMAGES.small4,
        title: "Exclusive Discounts Inside",
        date: "15 July 2024"
    },
    {
        image: IMAGES.small3,
        title: "Limited Stock - Act Fast!",
        date: "15 July 2024"
    },
    {
        image: IMAGES.small2,
        title: "Get Ready to Shop",
        date: "15 July 2024"
    },
    {
        image: IMAGES.small6,
        title: "Don't Miss Out on Savings",
        date: "15 July 2024"
    },
    {
        image: IMAGES.small5,
        title: "Special Offer Just for You",
        date: "15 July 2024"
    },
    {
        image: IMAGES.small4,
        title: "Don't Miss Out on Savings",
        date: "15 July 2024"
    },
    {
        image: IMAGES.small3,
        title: "Get Ready to Shop",
        date: "15 July 2024"
    },
    {
        image: IMAGES.small2,
        title: "Special Offer Just for You",
        date: "15 July 2024"
    },
]
const SwipeableScreen = () => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    const [lists, setLists] = useState(SwipeData);

    const deleteItem = (index:any) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
        const arr = [...lists];
        arr.splice(index, 1);
        setLists(arr);
    };
    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: colors.card,
        }}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
               
                    <Header
                        leftIcon={'back'}
                        title={'Swipeable'}
                        
                    />
                
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <ScrollView>
                        <View style={{ paddingTop: 5 }}>
                            {lists.map((data, index) => {
                                return (
                                    <View
                                        key={index}
                                    >
                                        <SwipeBox data={data} theme={theme} colors={colors} handleDelete={() => deleteItem(index)} />
                                        <View
                                            style={{
                                                height: 1,
                                                width: '100%',
                                                backgroundColor: colors.border,
                                            }}
                                        />
                                    </View>
                                )
                            })}
                        </View>
                    </ScrollView>
                </GestureHandlerRootView>
            </View>
        </SafeAreaView>
    );
};

export default SwipeableScreen;
