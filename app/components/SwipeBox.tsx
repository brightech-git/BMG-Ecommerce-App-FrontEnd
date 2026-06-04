import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { COLORS, FONTS } from '../constants/theme';
import { IMAGES } from '../constants/Images';

const SCREEN_WIDTH = Dimensions.get('window').width;


export default class SwipeBox extends Component {


  rightSwipe = (progress:any, dragX:any) => {
    const scale = dragX.interpolate({
      inputRange: [45, 90],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });


    return (
      <TouchableOpacity onPress={() => { this.close(); this.props.handleDelete() }} activeOpacity={0.6}>
        <View style={[styles.deleteBox, { backgroundColor: this.props.theme.dark ? COLORS.white : COLORS.primary }]}>
          <Animated.View>
            <Image
              style={{ height: 20, width: 20, resizeMode: 'contain', tintColor: this.props.theme.dark ? COLORS.primary : COLORS.white }}
              source={IMAGES.delete}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  updateRef = ref => {
    this._swipeableRow = ref;
  };
  close = () => {
    this._swipeableRow.close();
  };

  render() {
    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        renderRightActions={this.rightSwipe}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            borderBottomWidth: 1,
            borderBottomColor: this.props.colors.border,
            marginHorizontal: -15,
            paddingHorizontal: 30,
            paddingBottom: 10,
            paddingTop: 10,
            marginRight: 5,
          }}
        >
          <Image
            style={{ height: 60, width: 60, borderRadius: 20 }}
            source={this.props.data.image}
          />
          <View>
            <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: this.props.colors.title }}>{this.props.data.title}</Text>
            <Text style={{ ...FONTS.fontRegular, fontSize: 13, color: this.props.colors.title }}>{this.props.data.date}</Text>
          </View>
        </View>
      </Swipeable>
    );
  }
};
const styles = StyleSheet.create({
  container: {
    height: 80,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    padding: 20,
  },
  deleteBox: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 80,
    right: 0,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20
  },
});
