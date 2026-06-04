import React from 'react';
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS,} from '../../constants/theme';
import Header from '../../layout/Header';

import ListStyle1 from '../../components/list/ListStyle1';
import ListItem from '../../components/list/ListItem';
import { IMAGES } from '../../constants/Images';

const ListScreen = () => {

      const { colors }:{colors :any} = useTheme();


    const defaultlist = [
        {
            title: "Edit profile",
        },
        {
            title: "Saved Cards & Wallet",
        },
        {
            title: "Saved Addresses",
        },
        {
            title: "Select Language",
        },
    ]

    const Listwithicon = [
        {
            icon: IMAGES.user2,
            title: "Edit profile",
        },
        {
            icon: IMAGES.card2,
            title: "Saved Cards & Wallet",
        },
        {
            icon: IMAGES.map2,
            title: "Saved Addresses",
        },
        {
            icon: IMAGES.translation,
            title: "Select Language",
        },
    ]

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                }}
            >
                
                    <Header
                        // titleLeft
                        title={'List Styles'}
                        leftIcon={'back'}
                    />
                
                <ScrollView>
                    <View style={GlobalStyleSheet.container}>
                        <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                            <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                <Text style={{ ...FONTS.h6, color: colors.title }}>Default list</Text>
                            </View>
                            <View style={{ paddingBottom: 15, paddingTop: 15 }}>
                                {defaultlist.map((data, index) => {
                                    return (
                                        <ListItem
                                            key={index}
                                            title={data.title}
                                            onPress={() => ('')}
                                        />
                                    )
                                })}
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                            <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                <Text style={{ ...FONTS.h6, color: colors.title }}>List with icon</Text>
                            </View>
                            <View style={{ paddingBottom: 15, paddingTop: 15 }}>
                                {Listwithicon.map((data, index) => {
                                    return (
                                        <ListItem
                                            key={index}
                                            icon={
                                                <Image
                                                    style={{
                                                        height: 20,
                                                        width: 20,
                                                        tintColor: colors.title,
                                                        resizeMode: 'contain',
                                                    }}
                                                    source={data.icon}
                                                />
                                            }
                                            title={data.title}
                                            onPress={() => ('')}
                                        />
                                    )
                                })}
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                            <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                <Text style={{ ...FONTS.h6, color: colors.title }}>List with image</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <ListStyle1
                                    arrowRight
                                    image={IMAGES.small8}
                                    title={'James'}
                                />
                                <ListStyle1
                                    arrowRight
                                    image={IMAGES.small9}
                                    title={'Robert'}
                                />
                                <ListStyle1
                                    arrowRight
                                    image={IMAGES.small10}
                                    title={'John Doe'}
                                />
                                <ListStyle1
                                    arrowRight
                                    image={IMAGES.small11}
                                    title={'David geta'}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};


export default ListScreen;