// app/Screens/profile/Myorder.tsx
// Website: /account/orders. Data: GET /order/history
// Shows order list with item thumbnails, status filter tabs, pull-to-refresh.
import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  StatusBar, ScrollView, RefreshControl, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useOrderHistory, useOrderStatusMaster } from '../../api/hooks/useOrders';
import { firstImage, absUrl } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';
import { CartWishlistBadge } from '../../components/common/CartWishlistBadge';

type Nav = StackNavigationProp<RootStackParamList>;

// Fallback filters if status master API fails
const FALLBACK_FILTERS = [
  'All', 'Order Created', 'Confirmed', 'Packing',
  'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled',
];

// Extract display label from a status master item
const statusLabel = (s: any): string =>
  s?.displayName ?? s?.display_name ?? s?.statusName ?? s?.status ?? String(s);

// Extract key used for matching order.status
const statusKey = (s: any): string =>
  s?.status ?? s?.statusCode ?? s?.key ?? statusLabel(s);

const toOrders = (d: any): any[] =>
  Array.isArray(d) ? d
    : Array.isArray(d?.data) ? d.data
    : Array.isArray(d?.orders) ? d.orders
    : Array.isArray(d?.data?.orders) ? d.data.orders
    : [];

const fmtDate = (raw: any): string => {
  if (!raw) return '';
  try {
    const d = new Date(raw);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return String(raw).slice(0, 10); }
};

const STATUS_META: Record<string, { color: string; icon: string }> = {
  delivered:  { color: '#16a34a', icon: 'check-circle' },
  cancelled:  { color: '#dc2626', icon: 'x-circle' },
  shipped:    { color: '#2563eb', icon: 'truck' },
  transit:    { color: '#2563eb', icon: 'truck' },
  processing: { color: '#d97706', icon: 'clock' },
  confirmed:  { color: '#7c3aed', icon: 'check' },
  pending:    { color: '#d97706', icon: 'clock' },
};

const statusMeta = (s = '') => {
  const t = s.toLowerCase();
  for (const [k, v] of Object.entries(STATUS_META)) {
    if (t.includes(k)) return v;
  }
  return { color: COLORS.warning, icon: 'clock' };
};

const matchFilter = (orderStatus: string, filterLabel: string, filterKey: string) => {
  if (filterLabel === 'All') return true;
  const t = orderStatus.toLowerCase();
  // Try exact key match first, then display name substring
  if (filterKey && t === filterKey.toLowerCase()) return true;
  return t.includes(filterLabel.toLowerCase()) || t.includes(filterKey.toLowerCase());
};

// Pick the best image from an order item
// Handles both snake_case (tracking API: image_path) and camelCase (getOrder: imagePath)
const orderItemImage = (it: any): string | undefined => {
  const raw = it?.image_path ?? it?.imagePath ?? it?.image;
  if (raw) return absUrl(raw);
  if (it?.ImagePath) return firstImage(it.ImagePath);
  return undefined;
};

const Myorder = () => {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, refetch, isFetching } = useOrderHistory();
  const { data: statusMasterRaw } = useOrderStatusMaster();
  const [activeIdx, setActiveIdx] = useState(0); // 0 = All

  const orders = useMemo(() => {
    const list = toOrders(data);
    if (__DEV__ && list.length > 0) {
    }
    return list;
  }, [data]);

  // Build filter list from status master; fallback if API returns nothing
  const filters: { label: string; key: string }[] = useMemo(() => {
    const all = { label: 'All', key: 'All' };
    const raw: any[] =
      Array.isArray(statusMasterRaw) ? statusMasterRaw
      : Array.isArray(statusMasterRaw?.data) ? statusMasterRaw.data
      : [];
    if (raw.length === 0) return FALLBACK_FILTERS.map(f => ({ label: f, key: f }));
    return [all, ...raw.map(s => ({ label: statusLabel(s), key: statusKey(s) }))];
  }, [statusMasterRaw]);

  const activeFilter = filters[activeIdx] ?? filters[0];

  const filtered = useMemo(() =>
    orders.filter((o: any) => {
      const s = o.status ?? o.current_status ?? o.orderStatus ?? '';
      return matchFilter(s, activeFilter.label, activeFilter.key);
    }),
  [orders, activeFilter]);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>My Orders</Text>
        <CartWishlistBadge />
      </View>

      {/* Filter tabs — driven by /order/status-master */}
      <View style={styles.tabWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {filters.map((f, i) => (
            <TouchableOpacity
              key={f.key + i}
              style={[styles.tab, activeIdx === i && styles.tabActive]}
              onPress={() => setActiveIdx(i)}
            >
              <Text style={[styles.tabTxt, activeIdx === i && styles.tabTxtActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <Loader message="Loading orders…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="package"
          title={activeFilter.label === 'All' ? 'No orders yet' : `No ${activeFilter.label} orders`}
          subtitle={activeFilter.label === 'All' ? 'Your placed orders will appear here.' : 'Try a different filter.'}
          ctaLabel={activeFilter.label === 'All' ? 'Start shopping' : undefined}
          onCta={activeFilter.label === 'All' ? () => navigation.navigate('Products', {}) : undefined}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it: any, i) => String(
            it.orderId ?? it.OrderId ?? it.order_id ?? it.orderID ??
            it.id ?? it.Id ?? it.ID ?? it.orderNo ?? i
          )}
          contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={COLORS.primary} />}
          renderItem={({ item: o }: any) => {
            // Cover every possible field name the backend may return for the order ID
            const oid: string | number | undefined =
              o.orderId    ?? o.OrderId    ?? o.order_id   ??
              o.orderID    ?? o.OrderID    ?? o.id         ??
              o.Id         ?? o.ID         ?? o.orderNo    ??
              o.orderNumber ?? o.order_no;

            if (__DEV__ && !oid) {
            }

            const status = o.status ?? o.current_status ?? o.orderStatus ?? 'Pending';
            const { color, icon } = statusMeta(status);
            const amount = o.totalAmount ?? o.amount ?? o.grandTotal;
            const items: any[] = o.order_items ?? o.items ?? o.orderItems ?? [];
            const count = items.length || o.itemCount || undefined;
            const date = fmtDate(o.orderTime ?? o.createdAt ?? o.orderDate ?? o.created_at);
            const images = items.map(orderItemImage).filter(Boolean).slice(0, 4) as string[];

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => {
                  if (!oid) return;
                  // push() always creates a fresh screen — navigate() reuses existing
                  // Pass full order object so Trackorder shows data immediately
                  (navigation as any).push('Trackorder', {
                    orderId: String(oid),
                    seedOrder: o,
                  });
                }}
              >
                {/* Card header */}
                <View style={styles.cardHead}>
                  <View>
                    <Text style={styles.oid}>Order #{oid}</Text>
                    {!!date && <Text style={styles.date}>{date}</Text>}
                  </View>
                  <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                    <Feather name={icon as any} size={12} color={color} />
                    <Text style={[styles.badgeTxt, { color }]}>{status}</Text>
                  </View>
                </View>

                {/* Item thumbnails */}
                {images.length > 0 ? (
                  <View style={styles.thumbRow}>
                    {images.map((uri, i) => (
                      <SmartImage key={i} uri={uri} style={styles.thumb} />
                    ))}
                    {count != null && count > 4 && (
                      <View style={styles.moreThumb}>
                        <Text style={styles.moreTxt}>+{count - 4}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  // No images — show placeholder row with item count
                  <View style={styles.noImgRow}>
                    <Feather name="package" size={28} color={COLORS.borderColor} />
                    {count != null && (
                      <Text style={styles.itemCount}>{count} item{count !== 1 ? 's' : ''}</Text>
                    )}
                  </View>
                )}

                {/* Footer */}
                <View style={styles.cardFoot}>
                  <View>
                    {count != null && images.length > 0 && (
                      <Text style={styles.itemCountSm}>{count} item{count !== 1 ? 's' : ''}</Text>
                    )}
                    {amount != null && (
                      <Text style={styles.amount}>₹{Number(amount).toLocaleString('en-IN')}</Text>
                    )}
                  </View>
                  <View style={styles.trackCta}>
                    <Text style={styles.trackTxt}>View Details</Text>
                    <Feather name="chevron-right" size={15} color={COLORS.primary} />
                  </View>
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
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, textAlign: 'center', ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  tabWrap: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  tabScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: 'transparent',
  },
  tabActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  tabTxt: { ...FONTS.fontSm, color: COLORS.textLight },
  tabTxtActive: { ...FONTS.fontSemiBold, color: COLORS.primary },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 14,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  oid: { ...FONTS.font, ...FONTS.fontSemiBold, color: COLORS.title },
  date: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  badgeTxt: { ...FONTS.fontXs, ...FONTS.fontSemiBold },
  thumbRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  thumb: { width: 68, height: 68, borderRadius: 10, backgroundColor: '#F3F4F6' },
  moreThumb: {
    width: 68, height: 68, borderRadius: 10, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  moreTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.textLight },
  noImgRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, marginBottom: 12,
  },
  itemCount: { ...FONTS.fontSm, color: COLORS.textLight },
  cardFoot: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: COLORS.borderColor, paddingTop: 10,
  },
  itemCountSm: { ...FONTS.fontXs, color: COLORS.textLight },
  amount: { ...FONTS.h6, ...FONTS.fontBold, color: COLORS.title, marginTop: 2 },
  trackCta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trackTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary },
});

export default Myorder;
