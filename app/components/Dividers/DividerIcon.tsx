import React from 'react';
import { View,Platform } from 'react-native';
import { COLORS } from '../../constants/theme';

type Props = {
    color ?: string;
    style ?: object;
    dashed ?: any;
    icon ?: any;
}

const DividerIcon = ({color, style, dashed, icon} : Props) => {
    return (
        <>
            <View style={{flexDirection:'row',alignItems:'center'}}>
                {Platform.OS === "ios" ?
                    <View style={{ 
                        overflow: 'hidden' ,
                        marginTop:15,
                        marginBottom:15, 
                        flex:1,
                    }}>
                        <View
                            style={{
                                borderStyle: dashed ? 'dashed' : 'solid',
                                borderWidth: 1,
                                borderColor: color ? color : COLORS.borderColor,
                                margin: -2,
                                marginTop: 0,
                            }}>
                            <View style={{ height: 2 }} />
                        </View>
                    </View>
                    :
                    <View
                        style={{
                            borderBottomWidth:1, 
                            borderColor: color ? color : COLORS.borderColor,
                            borderStyle: dashed ? 'dashed' : 'solid',
                            marginTop:15,
                            marginBottom:15,
                            flex:1,
                            ...style,
                        }}
                    />
                }
                {
                    icon && 
                    <View style={{paddingHorizontal:10}}>

                        {icon}
                    </View>
                }
                {Platform.OS === "ios" ?
                    <View style={{ 
                        overflow: 'hidden' ,
                        marginTop:15,
                        marginBottom:15, 
                        flex:1,
                    }}>
                        <View
                            style={{
                                borderStyle: dashed ? 'dashed' : 'solid',
                                borderWidth: 1,
                                borderColor: color ? color : COLORS.borderColor,
                                margin: -2,
                                marginTop: 0,
                            }}>
                            <View style={{ height: 2 }} />
                        </View>
                    </View>
                    :
                    <View
                        style={{
                            borderBottomWidth:1, 
                            borderColor: color ? color : COLORS.borderColor,
                            borderStyle: dashed ? 'dashed' : 'solid',
                            marginTop:15,
                            marginBottom:15,
                            flex:1,
                            ...style,
                        }}
                    />
                }
            </View>
        </>
    );
};


export default DividerIcon;