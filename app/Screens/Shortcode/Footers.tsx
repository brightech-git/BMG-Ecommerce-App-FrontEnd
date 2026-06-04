import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import Header from '../../layout/Header';
import { useTheme } from '@react-navigation/native';
import ListItem from '../../components/list/ListItem';



const Footers = ( {props } : any) => {

    const FooterData = [
        {
            title: "Footer Style 1",
            navigate: 'TabStyle1',
        },
        {
            title: "Footer Style 2",
            navigate: 'TabStyle2',
        },
        {
            title: "Footer Style 3",
            navigate: 'TabStyle3',
        },
        {
            title: "Footer Style 4",
            navigate: 'TabStyle4',
        },
    ]

      const { colors }:{colors :any} = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                }}
            >
                
                    <Header title={'Footer styles'}  leftIcon={'back'} />
                
                <ScrollView contentContainerStyle={{ paddingBottom: 15, paddingTop: 15 }}>
                    {FooterData.map((data, index) => {
                        return (
                            <ListItem
                                key={index}
                                title={data.title}
                                onPress={() => props.navigation.navigate(data.navigate)}
                            />
                        )
                    })}
                    {/* <View style={GlobalStyleSheet.container}>
                        <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                            <View style={GlobalStyleSheet.cardBody}>
                                <ListStyle1 onPress={() => props.navigation.navigate('TabStyle1')} arrowRight title={'Footer Style 1'} />
                                <ListStyle1 onPress={() => props.navigation.navigate('TabStyle2')} arrowRight title={'Footer Style 2'} />
                                <ListStyle1 onPress={() => props.navigation.navigate('TabStyle3')} arrowRight title={'Footer Style 3'} />
                                <ListStyle1 onPress={() => props.navigation.navigate('TabStyle4')} arrowRight title={'Footer Style 4'} />
                            </View>
                        </View>
                    </View> */}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};



export default Footers;