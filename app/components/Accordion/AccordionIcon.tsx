import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import FeatherIcon from "react-native-vector-icons/Feather";
import { COLORS, FONTS} from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import { IMAGES } from '../../constants/Images';

const AccordionIcon = () => {

      const { colors }:{colors :any} = useTheme();

    const [activeSections, setActiveSections] = useState([0]);
    const setSections = (sections:any) => {
        setActiveSections(
            sections.includes(undefined) ? [] : sections
        );
    };

    const SECTIONS = [
        {
            icon: IMAGES.ads,
            title: 'Who Can Benefit from Ecommerce?',
            content: 'Global Reach: Ecommerce allows businesses to reach a global customer base. With an online store, you can sell your products or services to customers anywhere in the world.',
        },
        {
            icon: IMAGES.chat,
            title: '10 Ways to Maximize Your Profits.',
            content: 'Global Reach: Ecommerce allows businesses to reach a global customer base. With an online store, you can sell your products or services to customers anywhere in the world.',
        },
        {
            icon: IMAGES.profile,
            title: 'Exploring the Benefits of Ecommerce',
            content: 'Global Reach: Ecommerce allows businesses to reach a global customer base. With an online store, you can sell your products or services to customers anywhere in the world.',
        },
        {
            icon: IMAGES.sun,
            title: 'The Impact of Ecommerce on Business',
            content: 'Global Reach: Ecommerce allows businesses to reach a global customer base. With an online store, you can sell your products or services to customers anywhere in the world.',
        },
    ];

    const AccordionHeader = (item:any, _:any, isActive:any)  => {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
            }}>
                <Image
                    style={{
                        height: 18,
                        width: 18,
                        resizeMode: 'contain',
                        tintColor: colors.title,
                        marginRight: 10,
                    }}
                    source={item.icon}
                />
                <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title, flex: 1 }]}>{item.title}</Text>
                <FeatherIcon name={isActive ? "chevron-up" : "chevron-down"} size={18} color={colors.title} />
            </View>
        )
    }

    const AccordionBody = (item:any, _:any, isActive:any) => {
        return (
            <View style={{ marginBottom: 15 }}>
                <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 20 }]}>{item.content}</Text>
            </View>
        )
    }

    return (
        <>
            <Accordion
                sections={SECTIONS}
                duration={300}
                sectionContainerStyle={{
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    paddingVertical: 4,
                }}
                activeSections={activeSections}
                onChange={setSections}
                touchableComponent={TouchableOpacity}
                renderHeader={AccordionHeader}
                renderContent={AccordionBody}
            />
        </>
    );
};

export default AccordionIcon;