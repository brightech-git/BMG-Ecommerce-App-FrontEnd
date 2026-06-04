import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS } from '../../constants/theme';

const ListStyle1 = (props) => {

      const { colors }:{colors :any} = useTheme();

    return (
        <>
            <TouchableOpacity
                onPress={() => props.onPress && props.onPress()}
                style={styles.listStyle}>
                {props.icon &&
                    <View
                        style={{
                            marginRight: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {props.icon}
                    </View>
                }
                {props.image &&
                    <Image
                        style={{
                            height: 30,
                            width: 30,
                            borderRadius: 30,
                            marginRight: 10,
                        }}
                        source={props.image}
                    />
                }
                <Text style={{ ...FONTS.font, ...FONTS.fontPoppins, color: colors.title, flex: 1 }}>{props.title}</Text>
                {props.arrowDown &&
                    <FontAwesome name={'angle-down'} color={colors.title} size={18} />
                }
                {props.arrowRight &&
                    <FontAwesome name={'angle-right'} color={colors.title} size={18} />
                }
            </TouchableOpacity>
        </>
    );
};


const styles = StyleSheet.create({
    listStyle: {
        // borderBottomWidth: 1,
        flexDirection: 'row',
        marginHorizontal: 15,
        height: 48,
        alignItems: 'center',
        paddingVertical: 10,
    }
})


export default ListStyle1;