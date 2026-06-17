// app/Screens/profile/Myorder.tsx
// Website: /account/orders (Order). Data: /order/history.
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useOrderHistory } from '../../api/hooks/useOrders';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';

type Nav = StackNavigationProp<RootStackParamList>;
const asArray = (d: any): any[] =>
  Array.isArray(d) ? d : d?.data ?? d?.orders ?? d?.data?.orders ?? [];

const statusColor = (s = '') => {
  const t = s.toLowerCase();
  if (t.includes('deliver')) return COLORS.success;
  if (t.includes('cancel')) return COLORS.danger;
  if (t.includes('ship') || t.includes('transit')) return COLORS.info;
  return COLORS.warning;
};

const Myorder = () => {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, refetch } = useOrderHistory();
  const orders = useMemo(() => asArray(data), [data]);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>My Orders</Text>
        <View style={styles.hBtn} />
      </View>

      {isLoading ? (
        <Loader message="Loading orders..." />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState icon="package" title="No orders yet"
          subtitle="Your placed orders will appear here."
          ctaLabel="Start shopping" onCta={() => navigation.navigate('Products', {})} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(it: any, i) => String(it.orderId ?? it.id ?? i)}
          contentContainerStyle={{ padding: SIZES.padding }}
          renderItem={({ item }: any) => {
            const oid = item.orderId ?? item.id;
            const status = item.status ?? item.current_status ?? item.orderStatus ?? 'Pending';
            const amount = item.totalAmount ?? item.amount ?? item.grandTotal;
            const count = (item.items?.length ?? item.orderItems?.length ?? item.itemCount) || undefined;
            return (
              <TouchableOpacity style={styles.card} activeOpacity={0.85}
                onPress={() => navigation.navigate('Trackorder', { orderId: oid })}>
                <View style={styles.cardTop}>
                  <Text style={styles.oid}>Order #{oid}</Text>
                  <View style={[styles.badge, { backgroundColor: statusColor(status) + '22' }]}>
                    <Text style={[styles.badgeTxt, { color: statusColor(status) }]}>{status}</Text>
                  </View>
                </View>
                {!!item.createdAt && <Text style={styles.date}>{String(item.createdAt).slice(0, 10)}</Text>}
                <View style={styles.cardBottom}>
                  {count != null && <Text style={styles.meta}>{count} item{count === 1 ? '' : 's'}</Text>}
                  {amount != null && <Text style={styles.amount}>{'₹'}{Number(amount).toLocaleString('en-IN')}</Text>}
                </View>
                <View style={styles.track}>
                  <Text style={styles.trackTxt}>View details & track</Text>
                  <Feather name="chevron-right" size={16} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
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
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  oid: { ...FONTS.font, ...FONTS.fontSemiBold, color: COLORS.title },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeTxt: { ...FONTS.fontXs, ...FONTS.fontSemiBold },
  date: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 4 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  meta: { ...FONTS.fontSm, color: COLORS.textLight },
  amount: { ...FONTS.h6, ...FONTS.fontBold, color: COLORS.title },
  track: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 10,
    borderTopWidth: 1, borderTopColor: COLORS.borderColor, paddingTop: 10 },
  trackTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary },
});

export default Myorder;
