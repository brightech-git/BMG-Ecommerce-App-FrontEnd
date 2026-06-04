import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather  } from '@expo/vector-icons';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import Button from '../../components/Button/Button';
import ButtonLight from '../../components/Button/ButtonLight';
import ButtonOutline from '../../components/Button/ButtonOutline';
import Badge from '../../components/Badge/Badge';

import { CollapsedItem } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';

const Buttons = () => {

      const { colors }:{colors :any} = useTheme();

    return (
        <>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: colors.background,
                    }}
                >
                    
                        <Header
                            // titleLeft
                            title={'Buttons'}
                            leftIcon={'back'}
                        />
                    
                    <ScrollView>
                        <View style={GlobalStyleSheet.container}>
                            <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                                <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={{ ...FONTS.h6, color: colors.title }}>Classic Button</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={[GlobalStyleSheet.row, { gap: 8 }]}>
                                        <Button
                                            title={'Primary'}
                                            color={COLORS.primary}
                                        />
                                        <Button
                                            color={COLORS.secondary}
                                            text={COLORS.card}
                                            title={'Secondary'}
                                        />
                                        <Button
                                            color={COLORS.danger}
                                            title={'Danger'}
                                        />
                                        <Button
                                            color={COLORS.success}
                                            title={'Success'}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                                <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={{ ...FONTS.h6, color: colors.title }}>Rounded Button</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={[GlobalStyleSheet.row, { gap: 8 }]}>
                                        <Button
                                            title={'Primary'}
                                            btnRounded
                                            color={COLORS.primary}
                                        />
                                        <Button
                                            color={COLORS.secondary}
                                            btnRounded
                                            text={COLORS.card}
                                            title={'Secondary'}
                                        />
                                        <Button
                                            color={COLORS.danger}
                                            btnRounded
                                            title={'Danger'}
                                        />
                                        <Button
                                            color={COLORS.success}
                                            btnRounded
                                            title={'Success'}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                                <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={{ ...FONTS.h6, color: colors.title }}>Icon With Button</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={[GlobalStyleSheet.row, { gap: 8 }]}>
                                        <Button
                                            title={'Primary'}
                                            btnRounded
                                            color={COLORS.primary}
                                            icon={<Feather size={24} color={colors.title} name={'arrow-right'} />}
                                        />
                                        <Button
                                            color={COLORS.secondary}
                                            btnRounded
                                            text={COLORS.card}
                                            icon={<Feather size={24} color={colors.title} name={'arrow-right'} />}
                                            title={'Secondary'}
                                        />
                                        <Button
                                            color={COLORS.danger}
                                            btnRounded
                                            icon={<Feather size={24} color={colors.title} name={'arrow-right'} />}
                                            title={'Danger'}
                                        />
                                        <Button
                                            color={COLORS.success}
                                            btnRounded
                                            icon={<Feather size={24} color={colors.title} name={'arrow-right'} />}
                                            title={'Success'}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                                <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={{ ...FONTS.h6, color: colors.title }}>Full Width Button</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={{ gap: 8 }}>
                                        <Button
                                            title={'Primary'}
                                            color={COLORS.primary}
                                        />
                                        <Button
                                            title={'Primary'}
                                            btnRounded
                                            color={COLORS.primary}
                                        />
                                        <Button
                                            title={'Primary'}
                                            btnRounded
                                            fullWidth
                                            color={COLORS.primary}
                                            icon={<Feather size={24} color={colors.title} name={'arrow-right'} />}
                                        />

                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                                <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={{ ...FONTS.h6, color: colors.title }}>Button Light</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={[GlobalStyleSheet.row, { gap: 8 }]}>
                                        <ButtonLight
                                            title={'Primary'}
                                            color={COLORS.primary}
                                        />
                                        <ButtonLight
                                            text={COLORS.title}
                                            color={COLORS.secondary}
                                            title={'Secondary'}
                                        />
                                        <ButtonLight
                                            color={COLORS.danger}
                                            title={'Danger'}
                                        />
                                        <ButtonLight
                                            color={COLORS.success}
                                            title={'Success'}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                                <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={{ ...FONTS.h6, color: colors.title }}>Button Outline</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={[GlobalStyleSheet.row, { gap: 8 }]}>
                                        <ButtonOutline
                                            color={COLORS.primary}
                                            title={'Primary'}
                                        />
                                        <ButtonOutline
                                            text={COLORS.title}
                                            color={COLORS.secondary}
                                            title={'Secondary'}
                                        />
                                        <ButtonOutline
                                            color={COLORS.danger}
                                            title={'Danger'}
                                        />
                                        <ButtonOutline
                                            color={COLORS.success}
                                            title={'Success'}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                                <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.borderColor }]}>
                                    <Text style={{ ...FONTS.h6, color: colors.title }}>Badge Button</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={[GlobalStyleSheet.row, { gap: 8 }]}>
                                        <Button
                                            title={'Notification'}
                                            badge={() => <Badge rounded color={colors.card} title={'8'} />}
                                            color={COLORS.primary}
                                        />
                                        <ButtonOutline
                                            title={'Cart'}
                                            text={colors.title}
                                            color={COLORS.primary}
                                            badge={() => <Badge rounded  color={COLORS.primary} title={'2'} />}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                                <View style={[GlobalStyleSheet.cardHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={{ ...FONTS.h6, color: colors.title }}>Button Size</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={[GlobalStyleSheet.row, { gap: 8 }]}>
                                        <Button
                                            size={'sm'}
                                            title={'Small'}
                                            color={COLORS.primary}
                                        />
                                        <Button
                                            title={'Medium'}
                                            color={COLORS.primary}
                                        />
                                        <Button
                                            size={'lg'}
                                            title={'Large'}
                                            color={COLORS.primary}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    );
};

export default Buttons;