import React, { useRef, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { Feather  } from '@expo/vector-icons';
import LoginSheet from '../../components/BottomSheet/LoginSheet';
import RegisterSheet from '../../components/BottomSheet/RegisterSheet';
import SuccessSheet from '../../components/BottomSheet/SuccessSheet';
import Header from '../../layout/Header';
import ListItem from '../../components/list/ListItem';



const BottomSheet = () => {

      const { colors }:{colors :any} = useTheme();
    const refRBSheet = useRef<any>();
    const [activeSheet, setActiveSheet] = useState('');

    const ActionData = [
        {
            icon: "check-circle",
            title: "Success Sheet",
            sheet: 'success',
        },
        {
            icon: "log-out",
            title: "Login Sheet",
            sheet: 'login',
        },
        {
            icon: "file-text",
            title: "Register Sheet",
            sheet: 'register',
        },
    ]

    return (
        <>

            <RBSheet
                ref={refRBSheet}
                closeOnDragDown={true}
                height={
                    activeSheet === "success" ? 250 :
                        activeSheet === "login" ? 390 :
                            activeSheet === "register" ? 480 : 230}
                openDuration={100}
                customStyles={{
                    wrapper: {
                    },
                    container: {
                        backgroundColor: colors.card,
                    },
                    draggableIcon: {
                        marginTop: 10,
                        marginBottom: 0,
                        height: 5,
                        width: 80,
                        backgroundColor: colors.border,
                    }
                }}
            >
                {
                    activeSheet === "success" ?
                        <SuccessSheet /> :
                        activeSheet === "login" ?
                            <LoginSheet sheetRef={refRBSheet} /> :
                            activeSheet === "register" ?
                                <RegisterSheet sheetRef={refRBSheet} />
                                :
                                <SuccessSheet />
                }

            </RBSheet>

            <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
                <View style={{ backgroundColor: colors.background, flex: 1 }}>
                    
                        <Header
                            // titleLeft
                            title={'Bottom Sheets'}
                            leftIcon={'back'}
                        />
                   
                    <ScrollView>
                        <View style={{ paddingBottom: 15, paddingTop: 15 }}>
                            {ActionData.map((data:any, index:any) => {
                                return (
                                    <ListItem
                                        key={index}
                                        icon={<Feather size={16} color={colors.title} name={data.icon} />}
                                        title={data.title}
                                        onPress={() => { setActiveSheet(data.sheet); refRBSheet.current.open() }}
                                    />
                                )
                            })}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    );
};

export default BottomSheet;