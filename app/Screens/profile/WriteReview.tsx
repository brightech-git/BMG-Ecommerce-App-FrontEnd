import React, { useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Header from '../../layout/Header';
import { FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { Rating } from 'react-native-ratings';
import CustomInput from '../../components/Input/CustomInput';
import Button from '../../components/Button/Button';
import { SmartImage } from '../../components/common/SmartImage';
import { ScrollView } from 'react-native-gesture-handler';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useProfile } from '../../api/hooks/useProfile';
import { useSubmitReview } from '../../api/hooks/useReviews';
import { toastError } from '../../utils/toast';

type Props = StackScreenProps<RootStackParamList, 'WriteReview'>;

const WriteReview = ({ route, navigation }: Props) => {
    const { tagNo, itemId, productName, productImage } = route.params;

    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const { profile } = useProfile();
    const { mutate: submitReview, isPending } = useSubmitReview(tagNo);

    const [reviewerName, setReviewerName] = useState((profile as any)?.username ?? (profile as any)?.name ?? '');
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);

    const handleSubmit = () => {
        if (isPending) return;
        if (!reviewerName.trim()) {
            toastError('Please enter your name');
            return;
        }
        if (!rating) {
            toastError('Please give a star rating');
            return;
        }
        if (!comment.trim()) {
            toastError('Please write your review');
            return;
        }
        submitReview(
            { reviewerName: reviewerName.trim(), comment: comment.trim(), rating, tagNo, itemId },
            { onSuccess: () => navigation.goBack() },
        );
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={"Write Review"}
                leftIcon={"back"}
            />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
                <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
                    {!!productName && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
                            <SmartImage uri={productImage} style={{ width: 60, height: 60, borderRadius: 10 }} />
                            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title, flex: 1 }} numberOfLines={2}>
                                {productName}
                            </Text>
                        </View>
                    )}

                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                        <Text style={{ ...FONTS.Marcellus, fontSize: 24, color: colors.title }}>Overall Rating</Text>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 16, color: colors.text, marginTop: 5 }}>
                            {rating ? `You rated ${rating} out of 5` : 'Tap a star to rate this product'}
                        </Text>
                    </View>
                    <Rating
                        ratingCount={5}
                        imageSize={40}
                        startingValue={0}
                        style={{ paddingTop: 20 }}
                        onSwipeRating={(value: number) => setRating(Math.round(value))}
                        onFinishRating={(value: number) => setRating(Math.round(value))}
                    />

                    <View style={{ marginBottom: 15, marginTop: 30 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Full Name</Text>
                        <CustomInput
                            value={reviewerName}
                            onChangeText={setReviewerName}
                            background
                        />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>Product Review</Text>
                        <CustomInput
                            value={comment}
                            onChangeText={setComment}
                            inputLg
                            background
                        />
                    </View>
                </View>
            </ScrollView>
            <View
                 style={[{
                    width: '100%',
                    shadowColor:'rgba(195, 123, 95, 0.25)',
                    shadowOffset: {
                        width: 2,
                        height: -20,
                    },
                    shadowOpacity: .1,
                    shadowRadius: 5,
                }, Platform.OS === "ios" && {
                    backgroundColor: colors.card,
                    borderTopLeftRadius:25,borderTopRightRadius:25,
                }]}
            >
                <View style={[{ height: 88, backgroundColor: colors.card,borderTopLeftRadius:25,borderTopRightRadius:25 }]}>
                    <View style={[GlobalStyleSheet.container, { paddingHorizontal: 10, marginTop: 20, paddingTop: 0 }]}>
                        <Button
                            onPress={handleSubmit}
                            title={isPending ? "Submitting..." : "Submit Review"}
                            btnRounded
                            color={COLORS.primary}
                        />
                    </View>
                </View>
            </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default WriteReview
