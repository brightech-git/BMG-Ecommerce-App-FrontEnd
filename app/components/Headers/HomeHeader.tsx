import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { FONTS } from '../../constants/theme';
import { IMAGES } from '../../constants/Images';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import SearchBar from '../SearchBar';

const HomeHeader = ({ onNotificationPress }: { onNotificationPress: () => void }) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const drawerNavigation = useNavigation<DrawerNavigationProp<any>>();

    return (
        <View style={[GlobalStyleSheet.container, { marginHorizontal: 5, marginVertical: 5, backgroundColor: colors.background, marginBottom: 0, paddingBottom: 0 }]}>
            {/* Top Row: Avatar + Bell */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 }}>
                <TouchableOpacity onPress={() => drawerNavigation.openDrawer()}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, paddingRight: 15 }}>
                        <Image
                            style={{ height: 45, width: 45, borderRadius: 15 }}
                            source={IMAGES.small1}
                        />
                        <Text style={{ ...FONTS.Marcellus, fontSize: 14, color: colors.title }}>
                            Hello{"\n"}<Text style={{ fontSize: 18 }}>Elizabeth</Text>
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onNotificationPress}
                    style={{ height: 45, width: 45, backgroundColor: colors.card, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Image
                        style={[GlobalStyleSheet.image, { tintColor: colors.title }]}
                        source={IMAGES.bell}
                    />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={{ marginTop: 20 }}>
                <SearchBar placeholder='Search' />
            </View>

            {/* Shadow decoration below search */}
            <View style={{ height: 50, backgroundColor: colors.card, opacity: .6, borderRadius: 10, marginHorizontal: 20, marginTop: -40, zIndex: -1 }} />
        </View>
    );
};

export default HomeHeader;
