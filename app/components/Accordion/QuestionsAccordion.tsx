import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import { COLORS, FONTS } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import CustomInput from '../Input/CustomInput';
import Button from '../Button/Button';
import FeatherIcon from "react-native-vector-icons/Feather";



const QuestionsAccordion = () => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    const [activeSections, setActiveSections] = useState([0]);
    const setSections = (sections:any) => {
        setActiveSections(
            sections.includes(undefined) ? [] : sections
        );
    };

    const SECTIONS = [
        {
            title: 'What is included with my purchase?',
            content: 'Package have the HTML files, SCSS files, CSS files, JS files, Well Define Documentation, Fonts and Icons, Responsive Designs, Image Assets, Customization Options, and many more.',
        },
        {
            title: 'What features does BMG Jewels Store offer?',
            content: 'BMG Jewels Store offers a wide range of features including responsive design, customizable layouts, product catalog pages, shopping cart functionality, checkout pages, user account management, and more.',

        },
        {
            title: "Can I customize the template's design?",
            content: 'Absolutely! BMG Jewels Store is built using Bootstrap, which makes it highly customizable. You can easily adjust colors, fonts, layout structures, and more to match your brand identity.',

        },
        {
            title: 'Is the template SEO-friendly?',
            content: "BMG Jewels Store is built with best practices in mind, including SEO optimization. You can optimize your product pages, meta tags, and other elements to improve your website's search engine visibility.",
        },
        {
            title: 'Are there pre-designed page templates included?',
            content: 'Yes, BMG Jewels Store typically includes pre-designed templates for essential pages like the homepage, product listings, product details, shopping cart, checkout, and user account pages.',
        },
        {
            title: 'Does BMG Jewels Store provide customer support?',
            content: 'BMG Jewels Store offers customer support options for their clients. Check the template documentation or you can directly contact to our support team from here - Click Here',

        },
        {
            title: "Is coding knowledge required to use BMG Jewels Store?",
            content: "Basic knowledge of HTML, CSS, and Bootstrap can be helpful for customizing BMG Jewels Store to your needs. However, it's designed to be user- friendly and doesn't necessarily require extensive coding skills.",

        },
        {
            title: 'How can I get started with BMG Jewels Store?',
            content: "To get started, purchase and download the BMG Jewels Store template. Then, follow the included documentation to set up and customize your e-commerce website based on your specific requirements.",
        },
    ];

    const AccordionHeader = (item:any, _:any, isActive:any)  => {

        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 15
            }}>
                <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.title, flex: 1 }]}>{item.title}</Text>
                <FeatherIcon name={isActive ? "chevron-up" : "chevron-down"} size={18} color={colors.title} />
            </View>
        )
    }

    const AccordionBody = (item:any, _:any, isActive:any)  => {
        return (
            <View style={{
                borderTopWidth: 1,
                borderTopColor: theme.dark ? COLORS.white : colors.border,
                paddingVertical: 10,
                paddingHorizontal: 15
            }}>

                <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 20 }]}>{item.content}</Text>
            </View>
        )
    }

    return (
        
            <>
                <Accordion
                    sections={SECTIONS}
                    duration={300}
                    sectionContainerStyle={[{
                        // borderWidth: 1,
                        // borderColor: theme.dark ? COLORS.white : colors.borderColor,
                        marginBottom: 15,
                        //paddingHorizontal: 20,
                        borderRadius: 10,
                        backgroundColor:colors.card
                    },]}
                    activeSections={activeSections}
                    onChange={setSections}
                    touchableComponent={TouchableOpacity}
                    renderHeader={AccordionHeader}
                    renderContent={AccordionBody}
                />
            </>
        
    );
}

export default QuestionsAccordion