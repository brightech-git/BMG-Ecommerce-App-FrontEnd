// app/Screens/profile/Myorder.tsx
// Full order list: status tabs, time filter, search, active filter chips, pagination.
// API: GET /order/history?status=&days=&page=&size=
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  StatusBar, ScrollView, RefreshControl, TextInput,
  ActivityIndicator,
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

type Nav = StackNavigationProp<RootStackParamList>;

// ── Constants ────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// Fallback status options (used if status-master API is unavailable).
// Keys match the uppercase values the server actually uses.
const FALLBACK_STATUS: { label: string; key: string }[] = [
  { label: 'All',              key: '' },
  { label: 'Pending',          key: 'PENDING' },
  { label: 'Placed',           key: 'PLACED' },
  { label: 'Processing',       key: 'IN_PROCESSING' },
  { label: 'Packing',          key: 'PACKING' },
  { label: 'Ready to Ship',    key: 'READY_TO_SHIP' },
  { label: 'Shipped',          key: 'SHIPPED' },
  { label: 'In Transit',       key: 'IN_TRANSIT' },
  { label: 'Out for Delivery', key: 'OUT_FOR_DELIVERY' },
  { label: 'Delivered',        key: 'DELIVERED' },
  { label: 'Cancelled',        key: 'CANCELLED' },
];

const TIME_OPTIONS = [
  { label: 'Last 7 days',   days: 7 },
  { label: 'Last 30 days',  days: 30 },
  { label: 'Last 3 months', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'Last 1 year',   days: 365 },
];

// ── Helpers ──────────────────────────────────────────────────────────
const toOrders = (d: any): any[] =>
  Array.isArray(d) ? d
    : Array.isArray(d?.data) ? d.data
    : Array.isArray(d?.orders) ? d.orders
    : Array.isArray(d?.data?.orders) ? d.data.orders
    : [];

const fmtDate = (raw: any): string => {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return String(raw).slice(0, 10); }
};

const STATUS_META: Record<string, { color: string; icon: string }> = {
  delivered:  { color: '#16a34a', icon: 'check-circle' },
  cancelled:  { color: '#dc2626', icon: 'x-circle' },
  shipped:    { color: '#2563eb', icon: 'truck' },
  transit:    { color: '#2563eb', icon: 'truck' },
  processing: { color: '#d97706', icon: 'clock' },
  packed:     { color: '#7c3aed', icon: 'package' },
  placed:     { color: '#059669', icon: 'check' },
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

// Client-side search: match orderId or any item name
const matchSearch = (o: any, q: string): boolean => {
  if (!q.trim()) return true;
  const lq = q.toLowerCase();
  const oid = String(
    o.orderId ?? o.OrderId ?? o.order_id ?? o.orderID ?? o.id ?? o.orderNo ?? '',
  ).toLowerCase();
  if (oid.includes(lq)) return true;
  const items: any[] = o.order_items ?? o.items ?? o.orderItems ?? [];
  return items.some((it: any) => {
    const name = String(
      it.product_name ?? it.productName ?? it.ITEMNAME ?? it.name ?? '',
    ).toLowerCase();
    return name.includes(lq);
  });
};

// ── Screen ───────────────────────────────────────────────────────────
const Myorder = () => {
  const navigation = useNavigation<Nav>();

  // Filter state
  const [statusIdx,  setStatusIdx]  = useState(0);
  const [daysIdx,    setDaysIdx]    = useState<number | null>(null);
  const [searchQ,    setSearchQ]    = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [page,       setPage]       = useState(0);

  const searchRef = useRef<TextInput>(null);

  // Build status filter tabs from status master (flow + terminal),
  // falling back to FALLBACK_STATUS if the API isn't available.
  const { data: masterRaw } = useOrderStatusMaster();
  const STATUS_OPTIONS = useMemo(() => {
    const m = masterRaw?.data ?? masterRaw;
    const flow: any[]     = Array.isArray(m?.flow)     ? m.flow     : [];
    const terminal: any[] = Array.isArray(m?.terminal) ? m.terminal : [];
    const combined = [...flow, ...terminal];
    if (combined.length === 0) return FALLBACK_STATUS;
    return [
      { label: 'All', key: '' },
      ...combined.map((s: any) => ({ label: s.label, key: s.key })),
    ];
  }, [masterRaw]);

  const selectedStatus = STATUS_OPTIONS[statusIdx] ?? STATUS_OPTIONS[0];
  const selectedDays   = daysIdx !== null ? TIME_OPTIONS[daysIdx] : null;

  // Fetch all orders (no server-side status filter — we do it client-side
  // because the server uses uppercase keys and may not support filtering).
  const apiParams = useMemo(() => {
    const p: Record<string, any> = { page, size: PAGE_SIZE };
    if (selectedDays) p.days = selectedDays.days;
    return p;
  }, [selectedDays, page]);

  const { data, isLoading, isError, refetch, isFetching } = useOrderHistory(apiParams);

  const allOrders = useMemo(() => toOrders(data), [data]);

  // Client-side status filter — compare order's current_status / status
  // against the selected key (both uppercased for reliable matching).
  const orders = useMemo(() => {
    let list = allOrders;

    // Status filter
    if (selectedStatus.key) {
      const filterKey = selectedStatus.key.toUpperCase();
      list = list.filter((o: any) => {
        const s = String(
          o.current_status ?? o.status ?? o.orderStatus ?? '',
        ).toUpperCase();
        return s === filterKey;
      });
    }

    // Search filter
    if (searchQ.trim()) list = list.filter(o => matchSearch(o, searchQ));

    return list;
  }, [allOrders, selectedStatus.key, searchQ]);

  const hasActiveFilter = statusIdx !== 0 || daysIdx !== null || searchQ.trim() !== '';

  const clearAllFilters = useCallback(() => {
    setStatusIdx(0);
    setDaysIdx(null);
    setSearchQ('');
    setPage(0);
  }, []);

  const applyStatus = (i: number) => { setStatusIdx(i); setPage(0); };
  const applyDays   = (i: number) => { setDaysIdx(prev => prev === i ? null : i); setPage(0); };

  const onRefresh = useCallback(() => { setPage(0); refetch(); }, [refetch]);

  // Append next page (only if current page returned a full batch)
  const canLoadMore = allOrders.length === PAGE_SIZE;
  const loadMore    = () => { if (canLoadMore && !isFetching) setPage(p => p + 1); };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>My Orders</Text>
        <TouchableOpacity
          style={styles.hBtn}
          onPress={() => {
            setShowSearch(s => {
              if (s) setSearchQ('');
              else setTimeout(() => searchRef.current?.focus(), 100);
              return !s;
            });
          }}
        >
          <Feather name={showSearch ? 'x' : 'search'} size={20} color={COLORS.title} />
        </TouchableOpacity>
      </View>

      {/* ── Search bar (toggled) ── */}
      {showSearch && (
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color={COLORS.textLight} style={{ marginLeft: 12 }} />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            value={searchQ}
            onChangeText={setSearchQ}
            placeholder="Search by order ID or item name…"
            placeholderTextColor={COLORS.placeholder}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQ.length > 0 && (
            <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => setSearchQ('')}>
              <Feather name="x-circle" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Status tabs ── */}
      <View style={styles.tabWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {STATUS_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt.key || 'all'}
              style={[styles.tab, statusIdx === i && styles.tabActive]}
              onPress={() => applyStatus(i)}
            >
              <Text style={[styles.tabTxt, statusIdx === i && styles.tabTxtActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Time filter chips ── */}
      <View style={styles.timeWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeScroll}>
          {TIME_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt.days}
              style={[styles.timeChip, daysIdx === i && styles.timeChipActive]}
              onPress={() => applyDays(i)}
            >
              <Text style={[styles.timeChipTxt, daysIdx === i && styles.timeChipTxtActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Active filter pills ── */}
      {hasActiveFilter && (
        <View style={styles.pillsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
            {statusIdx !== 0 && (
              <View style={styles.pill}>
                <Text style={styles.pillTxt}>Status: {selectedStatus.label}</Text>
                <TouchableOpacity onPress={() => applyStatus(0)}>
                  <Feather name="x" size={12} color={COLORS.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
            {daysIdx !== null && (
              <View style={styles.pill}>
                <Text style={styles.pillTxt}>{selectedDays!.label}</Text>
                <TouchableOpacity onPress={() => { setDaysIdx(null); setPage(0); }}>
                  <Feather name="x" size={12} color={COLORS.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
            {searchQ.trim() !== '' && (
              <View style={styles.pill}>
                <Text style={styles.pillTxt} numberOfLines={1}>"{searchQ}"</Text>
                <TouchableOpacity onPress={() => setSearchQ('')}>
                  <Feather name="x" size={12} color={COLORS.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.clearAll} onPress={clearAllFilters}>
              <Text style={styles.clearAllTxt}>Clear all</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ── Content ── */}
      {isLoading && page === 0 ? (
        <Loader message="Loading orders…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="package"
          title={hasActiveFilter ? 'No orders found' : 'No orders yet'}
          subtitle={hasActiveFilter ? 'Try different filters.' : 'Your placed orders will appear here.'}
          ctaLabel={hasActiveFilter ? 'Clear filters' : 'Start shopping'}
          onCta={hasActiveFilter ? clearAllFilters : () => navigation.navigate('Products', {})}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(it: any, i) => String(
            it.orderId ?? it.OrderId ?? it.order_id ?? it.orderID ??
            it.id ?? it.Id ?? it.ID ?? it.orderNo ?? i,
          )}
          contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && page === 0}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetching && page > 0
              ? <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 12 }} />
              : null
          }
          renderItem={({ item: o }: any) => {
            const oid: string | number | undefined =
              o.orderId    ?? o.OrderId    ?? o.order_id   ??
              o.orderID    ?? o.OrderID    ?? o.id         ??
              o.Id         ?? o.ID         ?? o.orderNo    ??
              o.orderNumber ?? o.order_no;

            const status = o.status ?? o.current_status ?? o.orderStatus ?? 'Pending';
            const { color, icon } = statusMeta(status);
            const amount = o.totalAmount ?? o.amount ?? o.grandTotal ?? o.total_amount;
            const items: any[] = o.order_items ?? o.items ?? o.orderItems ?? [];
            const count = items.length || o.itemCount || undefined;
            const date  = fmtDate(
              o.orderTime ?? o.createdAt ?? o.orderDate ?? o.created_at ?? o.order_date,
            );
            const images: string[] = items
              .map((it: any) => {
                const raw = it?.image_path ?? it?.imagePath ?? it?.image;
                if (raw) return absUrl(raw);
                if (it?.ImagePath) return firstImage(it.ImagePath);
                return undefined;
              })
              .filter(Boolean)
              .slice(0, 4) as string[];

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => {
                  if (!oid) return;
                  (navigation as any).push('Trackorder', { orderId: String(oid), seedOrder: o });
                }}
              >
                {/* Card header */}
                <View style={styles.cardHead}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.oid} numberOfLines={1}>Order #{oid}</Text>
                    {!!date && <Text style={styles.date}>{date}</Text>}
                  </View>
                  <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                    <Feather name={icon as any} size={12} color={color} />
                    <Text style={[styles.badgeTxt, { color }]} numberOfLines={1}>{status}</Text>
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

// ── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn:   { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, textAlign: 'center', ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  searchInput: {
    flex: 1, paddingHorizontal: 10, paddingVertical: 11,
    ...FONTS.font, color: COLORS.title,
  },

  // Status tabs
  tabWrap:   { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  tabScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: 'transparent',
  },
  tabActive:    { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  tabTxt:       { ...FONTS.fontSm, color: COLORS.textLight },
  tabTxtActive: { ...FONTS.fontSemiBold, color: COLORS.primary },

  // Time filter row
  timeWrap:   { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#F0EDE8' },
  timeScroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  timeChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16,
    backgroundColor: '#F9F6F1', borderWidth: 1, borderColor: 'transparent',
  },
  timeChipActive:    { backgroundColor: '#FFF3E0', borderColor: COLORS.primary + '80' },
  timeChipTxt:       { ...FONTS.fontXs, color: COLORS.textLight },
  timeChipTxtActive: { ...FONTS.fontXs, ...FONTS.fontSemiBold, color: COLORS.primary },

  // Active filter pills
  pillsRow:    { backgroundColor: '#FFF9F0', borderBottomWidth: 1, borderBottomColor: '#F0EDE8' },
  pillsScroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 6, alignItems: 'center' },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.primary + '55',
    paddingHorizontal: 10, paddingVertical: 5,
  },
  pillTxt:     { ...FONTS.fontXs, ...FONTS.fontSemiBold, color: COLORS.primary, maxWidth: 140 },
  clearAll: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    backgroundColor: COLORS.danger + '0F', borderWidth: 1, borderColor: COLORS.danger + '44',
  },
  clearAllTxt: { ...FONTS.fontXs, ...FONTS.fontSemiBold, color: COLORS.danger },

  // Order card
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 14,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  cardHead: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 12,
  },
  oid:  { ...FONTS.font, ...FONTS.fontSemiBold, color: COLORS.title },
  date: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, maxWidth: 150,
  },
  badgeTxt: { ...FONTS.fontXs, ...FONTS.fontSemiBold, flexShrink: 1 },

  thumbRow:  { flexDirection: 'row', gap: 8, marginBottom: 12 },
  thumb:     { width: 68, height: 68, borderRadius: 10, backgroundColor: '#F3F4F6' },
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
  amount:      { ...FONTS.h6, ...FONTS.fontBold, color: COLORS.title, marginTop: 2 },

  trackCta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trackTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary },
});

export default Myorder;
