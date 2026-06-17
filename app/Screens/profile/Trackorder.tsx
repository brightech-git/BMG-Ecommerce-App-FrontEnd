// app/Screens/profile/Trackorder.tsx
// Website: /account/orderdetails/:id + tracking. Data: /order/tracking/:orderId.
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useOrderTracking } from '../../api/hooks/useOrders';
import { firstImage } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, ErrorState } from '../../components/common/StateViews';

type Props = StackScreenProps<RootStackParamList, 'Trackorder'>;

const Trackorder = ({ route, navigation }: Props) => {
  const { orderId } = route.params;
  const { data, isLoading, isError, refetch } = useOrderTracking(orderId);

  const order: any = (data as any)?.data ?? data ?? {};
  const timeline: any[] = order.timeline ?? order.history ?? order.statusHistory ?? [];
  const items: any[] = order.items ?? order.orderItems ?? [];
  const current = order.current_status ?? order.status ?? 'Pending';
  const amount = order.totalAmount ?? order.amount;

  const steps = useMemo(() => timeline, [timeline]);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>Order #{orderId}</Text>
        <View style={styles.hBtn} />
      </View>

      {isLoading ? (
        <Loader message="Loading order..." />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 30 }}>
          {/* Status */}
          <View style={styles.statusCard}>
            <Feather name="truck" size={20} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={styles.statusValue}>{current}</Text>
            </View>
            {amount != null && <Text style={styles.amount}>{'₹'}{Number(amount).toLocaleString('en-IN')}</Text>}
          </View>

          {/* Timeline */}
          {steps.length > 0 && (
            <>
              <Text style={styles.secTitle}>Tracking</Text>
              <View style={styles.timeline}>
                {steps.map((s: any, i: number) => {
                  const label = s.status ?? s.title ?? s.statusName ?? s.action ?? String(s);
                  const ts = s.date ?? s.timestamp ?? s.createdAt ?? s.time;
                  const last = i === steps.length - 1;
                  return (
                    <View key={i} style={styles.tlRow}>
                      <View style={styles.tlLeft}>
                        <View style={[styles.dot, i === 0 && styles.dotActive]} />
                        {!last && <View style={styles.tlLine} />}
                      </View>
                      <View style={{ flex: 1, paddingBottom: 18 }}>
                        <Text style={styles.tlLabel}>{label}</Text>
                        {!!ts && <Text style={styles.tlTime}>{String(ts).replace('T', ' ').slice(0, 16)}</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Items */}
          {items.length > 0 && (
            <>
              <Text style={styles.secTitle}>Items</Text>
              {items.map((it: any, i: number) => (
                <View key={i} style={styles.itemRow}>
                  <SmartImage uri={firstImage(it.imagePath ?? it.ImagePath)} style={styles.itemImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName} numberOfLines={2}>{it.productName ?? it.ITEMNAME ?? it.name}</Text>
                    <Text style={styles.itemMeta}>Qty: {it.quantity ?? 1}</Text>
                  </View>
                  {(it.price ?? it.FinalAmount) != null && (
                    <Text style={styles.itemPrice}>{'₹'}{Number(it.price ?? it.FinalAmount).toLocaleString('en-IN')}</Text>
                  )}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white,
    padding: 14, borderRadius: 14, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  statusLabel: { ...FONTS.fontXs, color: COLORS.textLight },
  statusValue: { ...FONTS.h6, ...FONTS.fontSemiBold, color: COLORS.title },
  amount: { ...FONTS.h6, ...FONTS.fontBold, color: COLORS.primary },
  secTitle: { ...FONTS.h6, ...FONTS.fontSemiBold, color: COLORS.title, marginTop: 22, marginBottom: 10 },
  timeline: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16 },
  tlRow: { flexDirection: 'row', gap: 12 },
  tlLeft: { alignItems: 'center', width: 16 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.borderColor, marginTop: 2 },
  dotActive: { backgroundColor: COLORS.primary },
  tlLine: { flex: 1, width: 2, backgroundColor: COLORS.borderColor, marginVertical: 2 },
  tlLabel: { ...FONTS.font, ...FONTS.fontMedium, color: COLORS.title },
  tlTime: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white,
    padding: 10, borderRadius: 12, marginBottom: 10 },
  itemImg: { width: 60, height: 60, borderRadius: 8 },
  itemName: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title },
  itemMeta: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 2 },
  itemPrice: { ...FONTS.fontSm, ...FONTS.fontBold, color: COLORS.title },
});

export default Trackorder;
