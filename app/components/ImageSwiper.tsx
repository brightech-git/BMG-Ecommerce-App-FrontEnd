import React, { useState } from 'react';
import { View, Image, useWindowDimensions,TouchableOpacity } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

const ImageSwiper = ({ data }) => {
  const [newData] = useState([
    { key: 'space-left' },
    ...data,
    { key: 'space-right' },
  ]);

  const { width } = useWindowDimensions();
  const SIZE = width * 0.6;
  const SPACER = (width - SIZE) / 2;
  const x = useSharedValue(0);

  const onScroll = (event) => {
      x.value = event.nativeEvent.contentOffset.x;
  };

  const navigation = useNavigation();
  
  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
      scrollEventThrottle={16}
      snapToInterval={SIZE}
      decelerationRate="fast"
      onScroll={onScroll}
    >
      {newData.map((item, index) => {

        const style = useAnimatedStyle(() => {
          const scale = interpolate(
            x.value,
            [(index - 2) * SIZE, (index - 1) * SIZE, index * SIZE],
            [0.8, 1, 0.8]
            );
            return {
              transform: [
                { scale },
              ],
            };
          });
          
          if (!item.image) {
            return <View style={{ width: SPACER}} key={index} />;
          }


        return (
          <View key={index} style={{ width: SIZE,alignItems:'center'}}>
            <Animated.View style={[style, { overflow: 'hidden' }]}>
              <TouchableOpacity
                activeOpacity={.9}
                onPress={() => navigation.navigate('ProductDetails')}
                style={{ height: 300, width: 218, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderRadius: 340 }}
              >
                <Image
                  style={{ height: 281, width: 198, borderRadius: 340 }}
                  source={item.image}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      })}
    </Animated.ScrollView>
  );
};

export default ImageSwiper;
