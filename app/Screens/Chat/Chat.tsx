import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import {  FONTS, COLORS } from '../../constants/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

const MessagesData = [
    {
        image: IMAGES.small2,
        title: "Emily Johnson",
        message: "Text me!",
        time: "Fri",
        hasstory: true,
    },
    {
        image: IMAGES.small3,
        title: "Michael Anderson",
        message: "Call me back.",
        time: "Mon",
        hasstory: true,
    },
    {
        image: IMAGES.small4,
        title: "Olivia Davis",
        message: "I got you bro!",
        time: "2 Hours"
    },
    {
        image: IMAGES.small5,
        title: "Daniel Wilson",
        message: "Haha, i hit you up",
        time: "2 Min"
    },
    {
        image: IMAGES.small6,
        title: "Sophia Martinez",
        message: "Text me!",
        time: "Fri",
        hasstory: true,
    },
    {
        image: IMAGES.small7,
        title: "William Thompson",
        message: "Call me back.",
        time: "Mon",
        hasstory: true,
    },
    {
        image: IMAGES.small2,
        title: "Ava Hernandez",
        message: "I got you bro!",
        time: "2 Hours"
    },
    {
        image: IMAGES.small3,
        title: "James White",
        message: "Haha, i hit you up",
        time: "2 Min"
    },
    {
        image: IMAGES.small4,
        title: "Mia Rodriguez",
        message: "Text me!",
        time: "Fri",
        hasstory: true,
    },
    {
        image: IMAGES.small5,
        title: "Benjamin Clark",
        message: "Call me back.",
        time: "Mon",
        hasstory: true,
    },
    {
        image: IMAGES.small6,
        title: "Olivia Davis",
        message: "I got you bro!",
        time: "2 Hours"
    },
    {
        image: IMAGES.small7,
        title: "Daniel Wilson",
        message: "Haha, i hit you up",
        time: "2 Min"
    },
]

type ChatScreenProps = StackScreenProps<RootStackParamList, 'Chat'>;

const Chat = ({ navigation } : ChatScreenProps) => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={"Messages"}
                leftIcon={'back'}
                rightIcon2={'search'}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ marginHorizontal: -15, }}
            >
                <View style={[GlobalStyleSheet.container, {}]}>

                    {MessagesData.map((data, index) => {
                        return (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('SingleChat')}
                                key={index}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.border,
                                    paddingBottom: 10,
                                    marginTop: 10,
                                    paddingHorizontal: 15
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Image
                                        style={{ height: 60, width: 60, resizeMode: 'contain', borderRadius: 20 }}
                                        source={data.image}
                                    />
                                    <View>
                                        <Text style={{ ...FONTS.Marcellus, fontSize: 18, color: colors.title }}>{data.title}</Text>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 13, color: colors.title }}>{data.message}</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: '#8C8C8C' }}>{data.time}</Text>
                                </View>
                                {data.hasstory ?

                                    <View style={{ height: 16, width: 16, borderRadius: 15, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: 10, left: 62 }}>
                                        <View style={{ height: 12, width: 12, borderRadius: 12, backgroundColor: COLORS.success }}></View>
                                    </View>

                                    : null}
                            </TouchableOpacity>
                        )
                    })}

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Chat