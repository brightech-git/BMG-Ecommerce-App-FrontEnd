import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Platform } from 'react-native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { FONTS } from '../../constants/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';


const CategoriesData = [
    {
        image: IMAGES.product1,
        title: "Popular Ring"
    },
    {
        image: IMAGES.product2,
        title: "Earring"
    },
    {
        image: IMAGES.product3,
        title: "Bracelets"
    },
    {
        image: IMAGES.product4,
        title: "Anklets"
    },
    {
        image: IMAGES.product1,
        title: "Popular Ring"
    },
    {
        image: IMAGES.product2,
        title: "Earring"
    },
    {
        image: IMAGES.product3,
        title: "Bracelets"
    },
    {
        image: IMAGES.product4,
        title: "Anklets"
    },
]

const CategoryData = [
    {
        image: IMAGES.item22,
        title: "Necklaces",
        count: '24',
    },
    {
        image: IMAGES.item23,
        title: "Rings",
        count: '24',
    },
    {
        image: IMAGES.item24,
        title: "Earrings",
        count: '24',
    },
    {
        image: IMAGES.item25,
        title: "Anklets",
        count: '24',
    }
]

type CategoryScreenProps = StackScreenProps<RootStackParamList, 'Category'>;

const Category = ({ navigation } : CategoryScreenProps) => {

    const theme = useTheme();
    const { colors }:{colors :any} = theme;

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={"Category"}
                rightIcon2={'search'}
                leftIcon={'back'}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom:80}}
            >
                <View style={GlobalStyleSheet.container}>
                    <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title }}>Because You Need Time for Yourself.{"\n"}Blend Beauty in You</Text>
                    <View style={{ marginHorizontal: -15, }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 15 }}
                        >
                            <View style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                                {CategoriesData.map((data, index) => {
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={.9}
                                            onPress={() => navigation.navigate('Products')}
                                            key={index} style={{ alignItems: 'center',marginRight:7 }}
                                        >
                                             <View
                                                    style={[{
                                                        shadowColor: "rgba(195, 123, 95, 0.15)",
                                                        shadowOffset: {
                                                            width: 2,
                                                            height: 20,
                                                        },
                                                        shadowOpacity: .1,
                                                        shadowRadius: 5,
                                                    }, Platform.OS === "ios" && {
                                                        backgroundColor: colors.card,
                                                        borderRadius:100
                                                    }]}
                                                >
                                                    <View style={{backgroundColor:colors.card,height:88,width:88,borderRadius:100,alignItems:'center',justifyContent:'center'}}>
                                                        <Image
                                                            style={{ height: 80, width: 80,borderRadius:100, resizeMode: 'contain', }}
                                                            source={data.image}
                                                        />
                                                    </View>
                                                </View>
                                            <View style={{
                                                marginTop: 10
                                            }}>
                                                <Text style={{ ...FONTS.Marcellus, fontSize: 15, color: colors.title }}>{data.title}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={{ paddingTop: 30 }}>
                        <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title }}>Discover Latest Collection </Text>
                    </View>
                    <View style={[GlobalStyleSheet.row,{marginTop:20}]}>
                        {CategoryData.map((data, index) => {
                            return (
                                <TouchableOpacity
                                    activeOpacity={.9}
                                    onPress={() => navigation.navigate('Products')} 
                                    key={index} 
                                    style={[GlobalStyleSheet.col50, { marginBottom: 20, }]}
                                >
                                    <View style={{justifyContent:'center'}}>
                                        <Image
                                            style={{ height:null, width:'100%',aspectRatio:1/1.2, borderRadius: 20}}
                                            source={data.image}
                                        />
                                        <View 
                                            style={{ 
                                                backgroundColor:colors.card,
                                                height:40,
                                                width:'100%',
                                                borderRadius: 20,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transform:[{rotate:'90deg'}],
                                                position:'absolute',
                                                marginLeft:-60
                                            }}
                                        >
                                            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color:colors.title }}>{data.title}<Text style={{ ...FONTS.fontRegular, fontSize: 12 }}> ({data.count} Items)</Text></Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Category