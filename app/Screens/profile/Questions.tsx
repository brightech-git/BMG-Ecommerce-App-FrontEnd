import { View, Text, SafeAreaView, Platform } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import QuestionsAccordion from '../../components/Accordion/QuestionsAccordion';


const Questions = () => {

     const theme = useTheme();
    const { colors }:{colors : any} = theme;

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={"Questions & Answers"}
                leftIcon={'back'}
                rightIcon4={'chat'}
            />
            <View style={GlobalStyleSheet.container}>
                <View
                    style={[{
                        shadowColor: "rgba(195,135,95,0.30)",
                        shadowOffset: {
                            width: -5,
                            height: 20,
                        },
                        shadowOpacity: .1,
                        shadowRadius: 5,
                    }, Platform.OS === "ios" && {
                        backgroundColor: colors.card,
                        borderRadius:10
                    }]}
                >
                    <QuestionsAccordion />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Questions