import React, { useState } from 'react'
import { View, Text, SafeAreaView, Image, TouchableOpacity, TextInput, Platform } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { FONTS } from '../../constants/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';



const SearchData = [
    {
        title: "All",
    },
    {
        title: "Rings",
    },
    {
        title: "Necklaces",
    },
    {
        title: "Earrings",
    },
    {
        title: "Bracelets",
    },
]

const SearchHistoryData = [
    {
        title: "Radiant Ruby Pendant",
    },
    {
        title: "Rose Gold Chain Bracelet",
    },
    {
        title: "Pearl Cluster Ring",
    },
    {
        title: "Amethyst Hoop Earrings",
    },
    {
        title: "Topaz Solitaire Ring",
    },

]

type SearchScreenProps = StackScreenProps<RootStackParamList, 'Search'>;

const Search = ({ navigation } : SearchScreenProps) => {

    const theme = useTheme();
    const { colors }:{colors : any} = theme;


    const [items, setItems] = useState(SearchHistoryData);

    const removeItem = () => {
        setItems([]);
    };

    const [show, setshow] = useState(SearchHistoryData);


  const removeItem2 = (indexToRemove: number) => {
    setshow(prevItems => prevItems.filter((item, index) => index !== indexToRemove));
  };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            {theme.dark
                ?
                null
                :
                <LinearGradient colors={['#C37B5F', '#F9F5F3']}
                    style={{ width: '100%', height: 230, top: 0, position: 'absolute' }}
                ></LinearGradient>
            }
            <View style={[GlobalStyleSheet.container, { paddingBottom: 10, }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[
                            GlobalStyleSheet.background,
                            {
                                height: 48,
                                width: 48,
                                backgroundColor:colors.card,
                                borderRadius:15
                            }]}
                    >
                        <Image
                            style={{ height: 18, width: 18, resizeMode: 'contain', tintColor: colors.title  }}
                            source={IMAGES.arrowleft}
                        />
                    </TouchableOpacity>
                    <View style={{ height: 48, flex: 1, backgroundColor: colors.card, borderRadius: 15 }}>
                        <TextInput
                            style={{ ...FONTS.fontRegular, fontSize: 16, color: colors.text, paddingLeft: 20,flex:1 }}
                            placeholder='Search Best items for You'
                            placeholderTextColor={colors.title}
                        />
                    </View>
                </View>
                <View style={{ marginTop: 30 }}>
                    <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title }}>Categories</Text>
                </View>
                <View style={{marginHorizontal:-15}}> 
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 ,paddingHorizontal:15}}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 10 }}>
                            {SearchData.map((data, index) => {
                                return (
                                    <View
                                        key={index}
                                        style={[{
                                            shadowColor: 'rgba(195, 123, 95, 0.20)',
                                            shadowOffset: {
                                                width: 2,
                                                height: 10,
                                            },
                                            shadowOpacity: .1,
                                            shadowRadius: 5,
                                            marginBottom:5
                                        }, Platform.OS === "ios" && {
                                            backgroundColor: 'rgba(255, 255, 255, 0.70)',
                                            borderRadius: 12,
                                        }]}
                                    >
                                        <TouchableOpacity
                                            activeOpacity={0.5}
                                            onPress={() => navigation.navigate('Products')}
                                            key={index}
                                            style={{
                                                backgroundColor:colors.card,
                                                height: 40,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 10,
                                                marginTop: 10,
                                                paddingHorizontal: 25,
                                                paddingVertical: 5
                                            }}>
                                            <Text style={{ ...FONTS.fontMedium, fontSize: 13, color: colors.title }}>{data.title}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                        </View>
                    </ScrollView>
                </View>
                {items.length > 0 &&
                    <View style={{ marginTop: 30 }}>
                        {show.length > 0 && 
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title }}>Search History</Text>
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    onPress={() => removeItem()}
                                >
                                    <Text style={{ ...FONTS.fontMedium, fontSize: 12, color: colors.title }}>Clear All</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        <View style={{ marginTop: 10 }}>
                            {show.map((data, index) => {
                                return (
                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 }}>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>{data.title}</Text>
                                        <TouchableOpacity
                                            activeOpacity={0.5}
                                            onPress={() => removeItem2(index)}
                                        >
                                            <Image
                                                style={{ height: 19, width: 19, resizeMode: 'contain', opacity: 0.5, tintColor: colors.title }}
                                                source={IMAGES.close}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )	
                            })}
                        </View>
                    </View>
                }
            </View>
        </SafeAreaView>
    )
}

export default Search