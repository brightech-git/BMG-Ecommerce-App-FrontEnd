// components/AppAvatar.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../theme';

type Props = {
  source?: { uri: string } | null;
  name?: string;          // fallback initials
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  showOnline?: boolean;
  showEdit?: boolean;
  onEditPress?: () => void;
  variant?: 'circle' | 'rounded';
  style?: ViewStyle;
};

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

export default function AppAvatar({
  source, name = '', size = 'md', onPress,
  showOnline = false, showEdit = false, onEditPress,
  variant = 'circle', style,
}: Props) {
  const { COLORS, FONTS, moderateScale } = useTheme();

  const sizes: Record<string, number> = { xs: 28, sm: 36, md: 48, lg: 64, xl: 88 };
  const fontSizes: Record<string, number> = { xs: 10, sm: 13, md: 18, lg: 24, xl: 32 };
  const sz  = moderateScale(sizes[size]);
  const fs  = moderateScale(fontSizes[size]);
  const br  = variant === 'circle' ? sz / 2 : sz * 0.25;

  const onlineSz = moderateScale(size === 'xl' ? 16 : size === 'lg' ? 13 : 10);
  const editSz   = moderateScale(size === 'xl' ? 28 : 22);

  const initials = getInitials(name);

  const content = (
    <View style={[{ width: sz, height: sz, borderRadius: br, overflow: 'hidden', backgroundColor: COLORS.primaryPale, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.primaryLighter }, style]}>
      {source?.uri ? (
        <Image source={source} style={{ width: sz, height: sz }} resizeMode="cover" />
      ) : initials ? (
        <Text style={{ fontFamily: FONTS.family.bold, fontSize: fs, color: COLORS.primary }}>{initials}</Text>
      ) : (
        <Ionicons name="person" size={sz * 0.5} color={COLORS.primaryLight} />
      )}
    </View>
  );

  return (
    <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{content}</TouchableOpacity>
      ) : content}

      {showOnline && (
        <View style={[styles.onlineDot, { width: onlineSz, height: onlineSz, borderRadius: onlineSz / 2, backgroundColor: COLORS.success, borderColor: COLORS.white }]} />
      )}

      {showEdit && (
        <TouchableOpacity onPress={onEditPress} style={[styles.editBtn, { width: editSz, height: editSz, borderRadius: editSz / 2, backgroundColor: COLORS.primary, borderColor: COLORS.white }]}>
          <Ionicons name="camera" size={editSz * 0.45} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  onlineDot: { position: 'absolute', bottom: 1, right: 1, borderWidth: 2 },
  editBtn:   { position: 'absolute', bottom: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
});