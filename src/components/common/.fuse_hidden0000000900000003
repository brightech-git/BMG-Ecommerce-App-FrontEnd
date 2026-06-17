/**
 * Logo — renders the BMG Jewellers logo image (src/images/logo.png).
 *
 * The artwork is orange on a transparent background, so on the app's orange
 * headers it would disappear. To keep the brand visible everywhere, the logo
 * is rendered on a light rounded "chip" background by default. Pass
 * `transparent` to drop the chip (e.g. when it already sits on white).
 *
 * If the image asset ever fails to load it falls back to a text wordmark.
 */
import React, {useState} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {colors, fonts} from '../../theme/theme';

import logoSource from '../../images/logo.png';

const Logo = ({
  width = 132,
  height = 42,
  transparent = false,
  bg = colors.white,
  style,
}) => {
  const [failed, setFailed] = useState(false);

  const chipStyle = transparent
    ? null
    : [styles.chip, {backgroundColor: bg}];

  if (failed) {
    return (
      <View style={[chipStyle, styles.fallbackRow, style]}>
        <Text style={styles.fallbackMain}>BMG</Text>
        <Text style={styles.fallbackSub}>JEWELLERS</Text>
      </View>
    );
  }

  return (
    <View style={[chipStyle, style]}>
      <Image
        source={logoSource}
        defaultSource={logoSource}
        onError={() => setFailed(true)}
        style={{width, height, resizeMode: 'contain'}}
      />
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  fallbackRow: {flexDirection: 'row', alignItems: 'center'},
  fallbackMain: {
    fontSize: 22,
    fontWeight: fonts.weight.black,
    color: colors.primary,
    letterSpacing: 3,
  },
  fallbackSub: {
    fontSize: 9,
    fontWeight: fonts.weight.extraBold,
    color: colors.primary,
    letterSpacing: 4,
    marginLeft: 7,
    alignSelf: 'center',
  },
});
