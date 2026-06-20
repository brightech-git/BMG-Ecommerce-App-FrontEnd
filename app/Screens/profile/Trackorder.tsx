// app/Screens/profile/Trackorder.tsx
// APIs used (matches website OrderDetails.jsx):
//   PRIMARY: GET /order/tracking/:orderId  → order details + status (website's useTrackingById)
//   FALLBACK: GET /order/getOrder?orderId= → basic order data
//   GET /order/track/user?orderId=         → fallback user-level tracking events
//   GET /order/invoice/:orderId            → invoice PDF URL (on demand)
//   POST /dtdc/track                       → live DTDC courier tracking
//   POST /order/update-status              → cancel order
//   POST /order/reorder                    → reorder
import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, RefreshControl, Linking, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import {
  useOrderById, useOrderTracking, useOrderTrackByUser,
  useCancelOrder, useReorder, useOrderInvoice, useDtdcTrack,
} from '../../api/hooks/useOrders';
import { firstImage, absUrl } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, ErrorState } from '../../components/common/StateViews';
import { toastSuccess, toastError } from '../../utils/toast';

type Props = StackScreenProps<RootStackParamList, 'Trackorder'>;

/* ── Helpers ────────────────────────────────────────────────── */
const num = (v: any) => { const n = parseFloat(String(v ?? '0').replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };

const fmtDate = (raw: any) => {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return String(raw).slice(0, 10); }
};

const fmtDateTime = (raw: any) => {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return String(raw).replace('T', ' ').slice(0, 16); }
};

// Unwrap different backend response shapes
const unwrap = (raw: any) => raw?.data ?? raw ?? {};

const toEvents = (raw: any): any[] => {
  const d = raw?.data ?? raw;
  if (!d) return [];
  // DTDC response wraps events under shipments[].scans
  if (Array.isArray(d?.shipments)) {
    const scans: any[] = [];
    for (const s of d.shipments) {
      if (Array.isArray(s?.scans)) scans.push(...s.scans);
    }
    if (scans.length > 0) return scans;
  }
  return (
    d?.trackingEvents ?? d?.events ??
    d?.timeline ?? d?.history ?? d?.statusHistory ??
    (Array.isArray(d) ? d : [])
  );
};

// Best image from an order item
// Tracking API uses image_path (snake_case); getOrder API uses imagePath (camelCase)
const itemImg = (it: any): string | undefined => {
  const raw = it?.image_path ?? it?.imagePath ?? it?.image;
  if (raw) return absUrl(raw);
  if (it?.ImagePath) return firstImage(it.ImagePath);
  return undefined;
};

/* ── Status config ──────────────────────────────────────────── */
const STATUS_CFG: { key: string; color: string; icon: string }[] = [
  { key: 'delivered',   color: '#16a34a', icon: 'check-circle' },
  { key: 'cancelled',   color: '#dc2626', icon: 'x-circle' },
  { key: 'out for delivery', color: '#7c3aed', icon: 'navigation' },
  { key: 'shipped',     color: '#2563eb', icon: 'truck' },
  { key: 'transit',     color: '#2563eb', icon: 'truck' },
  { key: 'processing',  color: '#d97706', icon: 'settings' },
  { key: 'confirmed',   color: '#059669', icon: 'check' },
  { key: 'pending',     color: '#d97706', icon: 'clock' },
];
const getStatusCfg = (s = '') => {
  const t = s.toLowerCase();
  return STATUS_CFG.find(c => t.includes(c.key)) ?? { color: COLORS.warning, icon: 'clock' };
};

// 7-step progress tracker matching website flow
const STEPS = [
  'Order\nCreated', 'Confirmed', 'Packing',
  'Ready to\nShip', 'Shipped', 'Out for\nDelivery', 'Delivered',
];
const stepIndex = (s = '') => {
  const t = s.toLowerCase();
  if (t.includes('delivered') && !t.includes('out')) return 6;
  if (t.includes('out for delivery') || t.includes('out_for_delivery')) return 5;
  if (t.includes('shipped') || t.includes('transit')) return 4;
  if (t.includes('ready to ship') || t.includes('ready_to_ship') || t.includes('readytoship')) return 3;
  if (t.includes('packing') || t.includes('packed')) return 2;
  if (t.includes('confirmed') || t.includes('processing') || t.includes('approved')) return 1;
  return 0; // Order Created / Pending
};

const isCancellable = (s = '') => {
  const t = s.toLowerCase();
  return !t.includes('delivered') && !t.includes('cancelled') && !t.includes('cancel') && !t.includes('shipped');
};

/* ── Small UI pieces ────────────────────────────────────────── */
const Card = ({ children, style }: any) => <View style={[styles.card, style]}>{children}</View>;

const SecTitle = ({ title }: { title: string }) => <Text style={styles.secTitle}>{title}</Text>;

const InfoRow = ({ label, value, valueStyle }: { label: string; value?: string | null; valueStyle?: any }) =>
  value ? (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
    </View>
  ) : null;

/* ── Screen ─────────────────────────────────────────────────── */
const Trackorder = ({ route, navigation }: Props) => {
  const { orderId, seedOrder } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  // PRIMARY: GET /order/tracking/:orderId — matches website's useTrackingById
  // Returns: current_status, order_items, total_amount, payment_mode, delivery_address, etc.
  const {
    data: trackRaw, isLoading, isError,
    refetch: refetchTrack, isFetching: fetchingTrack,
  } = useOrderTracking(orderId);

  // SECONDARY: GET /order/getOrder?orderId= — camelCase fields, used as fallback
  const {
    data: orderRaw,
    refetch: refetchOrder,
  } = useOrderById(orderId);

  const {
    data: userTrackRaw, isLoading: userTrackLoading,
    refetch: refetchUserTrack,
  } = useOrderTrackByUser(orderId);

  const { refetch: fetchInvoice, isFetching: invoiceLoading } = useOrderInvoice(orderId);

  const { mutate: cancelOrder, isPending: cancelling } = useCancelOrder();
  const { mutate: reorder, isPending: reordering } = useReorder();

  // Resolve order data — priority: tracking API → getOrder API → seedOrder from list
  // Tracking API (snake_case) is preferred — matches website's approach
  const order = useMemo(() => {
    const tracked = unwrap(trackRaw);
    // Tracking API returns current_status or order_id when successful
    if (tracked?.current_status || tracked?.order_id || tracked?.orderId) return tracked;
    const fetched = unwrap(orderRaw);
    if (fetched?.orderId || fetched?.status || fetched?.current_status) return fetched;
    return seedOrder ?? {};
  }, [trackRaw, orderRaw, seedOrder]);

  // Field resolution: handles both snake_case (tracking API) and camelCase (getOrder API)
  // Website's tracking API: current_status, order_items, total_amount, payment_mode, delivery_address
  const status     = order.current_status ?? order.status ?? order.orderStatus ?? 'Pending';
  const orderDate  = order.order_date ?? order.orderTime ?? order.createdAt ?? order.created_at;
  const paymentMode   = order.payment_mode ?? order.paymentMode;
  const paymentStatus = order.payment_status ?? order.paymentStatus;
  const transactionId = order.transaction_id ?? order.transactionId ?? order.razorpayPaymentId;
  const paidOn        = order.payment_date ?? order.paymentDate ?? order.paidAt;

  // Items: tracking API → order_items, getOrder API → orderItems
  const items: any[] = order.order_items ?? order.orderItems ?? order.items ?? order.orderDetails ?? [];

  // Delivery address: tracking API → delivery_address, getOrder API → address
  const addr: any = order.delivery_address ?? order.address ?? order.deliveryAddress ?? order.shippingAddress ?? {};
  const addrName: string | undefined = addr.customerName ?? addr.name ?? order.customerName;
  const addrPhone: string | undefined = addr.phone ?? order.contact ?? order.mobile;

  // AWB number: courierTrackingId / dtdcRefNumber (guard against literal string "null")
  const awbNumber: string | undefined =
    order.courierTrackingId && order.courierTrackingId !== 'null'
      ? order.courierTrackingId
      : order.dtdcRefNumber && order.dtdcRefNumber !== 'null'
        ? order.dtdcRefNumber
        : order.awbNumber ?? order.trackingId ?? order.awbNo ?? undefined;

  // Action flags: from tracking API or derived from status
  const canCancel = order.canCancel ?? isCancellable(status);
  const canReturn = order.canReturn ?? status.toLowerCase().includes('deliver');

  // Live DTDC tracking by AWB — mirrors website trackOrder()
  const {
    data: dtdcLiveRaw, isLoading: dtdcLiveLoading,
    refetch: refetchDtdcLive,
  } = useDtdcTrack(awbNumber);

  // Tracking events priority: DTDC live (AWB) → /order/track/user fallback
  const trackEvents: any[] = useMemo(() => {
    const live = toEvents(dtdcLiveRaw);
    if (live.length > 0) return live;
    return toEvents(userTrackRaw);
  }, [dtdcLiveRaw, userTrackRaw]);

  const trackingLoading = dtdcLiveLoading || userTrackLoading;

  const { color: sColor, icon: sIcon } = getStatusCfg(status);
  const step      = stepIndex(status);
  const cancelled = status.toLowerCase().includes('cancel');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetchTrack(), refetchOrder(), refetchUserTrack(), refetchDtdcLive()]);
    setRefreshing(false);
  }, [refetchTrack, refetchOrder, refetchUserTrack, refetchDtdcLive]);

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: () => cancelOrder(
          { orderId, newStatus: 'CANCELLED',remarks:"Cancelled By User" },
          { onSuccess: () => { toastSuccess('Order cancelled'); refetchOrder(); } }
        ),
      },
    ]);
  };

  const handleReorder = () =>
    reorder(orderId, {
      onSuccess: () => {
        toastSuccess('Items added to cart');
        navigation.navigate('MyCart');
      },
    });

  const handleInvoice = async () => {
    // Try to get invoice URL from API first
    try {
      const result: any = await fetchInvoice();
      const raw = result?.data ?? result;
      const url = raw?.invoiceUrl ?? raw?.url ?? raw?.pdfUrl ?? raw?.data?.invoiceUrl ?? order.invoiceUrl;
      if (url) { Linking.openURL(url); return; }
    } catch { /* fall through */ }
    // Fallback to value already in order object
    const url = order.invoiceUrl ?? order.invoice_url;
    if (url) Linking.openURL(url);
    else toastError('Invoice not available yet');
  };

  // Show full-screen loader only if we have NO seed data yet
  if (isLoading && !seedOrder) return <View style={styles.safe}><Loader message="Loading order…" /></View>;
  // Show error only if fetch failed AND we have no fallback data at all
  if (isError && !order.orderId && !order.order_id && !order.current_status)
    return <View style={styles.safe}><ErrorState onRetry={refetchTrack} /></View>;

  // Amount fields: tracking API → total_amount / shipping_fee / products_grandTotal
  const totalAmt    = num(order.total_amount    ?? order.totalAmount   ?? order.amount ?? order.grandTotal ?? 0);
  const shippingFee = num(order.shipping_fee    ?? order.shippingFee   ?? order.shipping ?? order.deliveryCharge ?? 0);
  const subtotalAmt = num(order.products_grandTotal ?? order.subtotal  ?? order.mrpTotal ?? 0);
  const discountAmt = num(order.discountAmount  ?? order.discount ?? order.discountAmountTotal ?? 0);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>Order #{orderId}</Text>
        <TouchableOpacity style={styles.hBtn} onPress={onRefresh}>
          {fetchingTrack
            ? <ActivityIndicator size="small" color={COLORS.primary} />
            : <Feather name="refresh-cw" size={18} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >

        {/* ── Status card + Progress stepper ── */}
        <Card>
          {/* Status row */}
          <View style={styles.statusRow}>
            <View style={[styles.statusIcon, { backgroundColor: sColor + '18' }]}>
              <Feather name={sIcon as any} size={20} color={sColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusText, { color: sColor }]}>{status}</Text>
              {!!orderDate && (
                <Text style={styles.statusSub}>Placed on {fmtDate(orderDate)}</Text>
              )}
            </View>
            {totalAmt > 0 && (
              <Text style={styles.statusAmt}>₹{totalAmt.toLocaleString('en-IN')}</Text>
            )}
          </View>

          {/* Progress stepper (hidden if cancelled) */}
          {!cancelled && (
            <View style={styles.stepper}>
              {STEPS.map((s, i) => {
                const done = i <= step;
                const active = i === step;
                return (
                  <React.Fragment key={s}>
                    <View style={styles.stepCol}>
                      <View style={[styles.stepDot,
                        done && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                        active && styles.stepDotActive,
                      ]}>
                        {done && <Feather name="check" size={9} color="#fff" />}
                      </View>
                      <Text style={[styles.stepLabel, done && { color: COLORS.primary, ...FONTS.fontSemiBold }]}
                        numberOfLines={2}>
                        {s}
                      </Text>
                    </View>
                    {i < STEPS.length - 1 && (
                      <View style={[styles.stepLine, i < step && { backgroundColor: COLORS.primary }]} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          )}

          {/* Courier / AWB info */}
          {!!awbNumber && (
            <View style={styles.awbRow}>
              <Feather name="package" size={14} color={COLORS.textLight} />
              <Text style={styles.awbTxt}>AWB: {awbNumber}</Text>
              {!!order.courierName && (
                <Text style={styles.awbCourier}> · {order.courierName}</Text>
              )}
            </View>
          )}
        </Card>

        {/* ── Action buttons ── */}
        <View style={styles.actionRow}>
          {canCancel && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              disabled={cancelling}
              onPress={handleCancel}
            >
              <Feather name="x-circle" size={14} color={COLORS.danger} />
              <Text style={[styles.actionTxt, { color: COLORS.danger }]}>
                {cancelling ? 'Cancelling…' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.invoiceBtn]}
            disabled={invoiceLoading}
            onPress={handleInvoice}
          >
            {invoiceLoading
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <Feather name="file-text" size={14} color={COLORS.primary} />}
            <Text style={[styles.actionTxt, { color: COLORS.primary }]}>Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.reorderBtn]}
            disabled={reordering}
            onPress={handleReorder}
          >
            <Feather name="refresh-cw" size={14} color={COLORS.white} />
            <Text style={[styles.actionTxt, { color: COLORS.white }]}>
              {reordering ? 'Adding…' : 'Reorder'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Return / Refund (only if delivered, using canReturn flag from tracking API) */}
        {canReturn && !cancelled && (
          <TouchableOpacity
            style={styles.returnBtn}
            onPress={() => navigation.navigate('OrderReturn', { orderId })}
          >
            <Feather name="rotate-ccw" size={14} color={COLORS.danger} />
            <Text style={styles.returnTxt}>Request Return / Refund</Text>
            <Feather name="chevron-right" size={14} color={COLORS.danger} />
          </TouchableOpacity>
        )}

        {/* ── DTDC Tracking Events ── */}
        <SecTitle title="Tracking" />
        <Card>
          {trackingLoading ? (
            <View style={styles.centerRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingTxt}>Loading tracking events…</Text>
            </View>
          ) : trackEvents.length === 0 ? (
            <View style={styles.centerRow}>
              <Feather name="map-pin" size={18} color={COLORS.borderColor} />
              <Text style={styles.emptyTxt}>No tracking events yet</Text>
            </View>
          ) : (
            trackEvents.map((ev: any, i: number) => {
              const label =
                ev.status ?? ev.scanType ?? ev.title ?? ev.statusName ?? ev.action ?? ev.description ?? '—';
              const ts  = ev.scanned_on ?? ev.date ?? ev.timestamp ?? ev.createdAt ?? ev.time;
              const loc = ev.location ?? ev.city ?? ev.scanLocation ?? ev.origin ?? ev.place;
              const remarks = ev.remarks ?? ev.description ?? ev.comment;
              const isFirst = i === 0;
              const isLast  = i === trackEvents.length - 1;
              return (
                <View key={i} style={styles.tlRow}>
                  <View style={styles.tlLeft}>
                    <View style={[styles.tlDot, isFirst && styles.tlDotActive]} />
                    {!isLast && <View style={styles.tlLine} />}
                  </View>
                  <View style={[styles.tlBody, !isLast && { paddingBottom: 18 }]}>
                    <Text style={[styles.tlLabel, isFirst && { color: COLORS.primary, ...FONTS.fontSemiBold }]}>
                      {label}
                    </Text>
                    {!!loc && (
                      <Text style={styles.tlMeta}>
                        <Feather name="map-pin" size={10} color={COLORS.textLight} /> {loc}
                      </Text>
                    )}
                    {!!remarks && remarks !== label && (
                      <Text style={styles.tlMeta}>{remarks}</Text>
                    )}
                    {!!ts && <Text style={styles.tlTime}>{fmtDateTime(ts)}</Text>}
                  </View>
                </View>
              );
            })
          )}
        </Card>

        {/* ── Order Items ── */}
        <SecTitle title={`Items (${items.length})`} />
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {items.length === 0 ? (
            <View style={[styles.centerRow, { padding: 16 }]}>
              <Text style={styles.emptyTxt}>No item details available</Text>
            </View>
          ) : items.map((it: any, i: number) => {
            const img   = itemImg(it);
            // Tracking API: product_name, item_id, tagno, net_wt
            // getOrder API: productName, ITEMNAME, tagNo, TAGNO
            const name  = it.product_name ?? it.productName ?? it.ITEMNAME ?? it.name ?? it.itemName ?? 'Item';
            const qty   = it.quantity ?? 1;
            const price = num(it.price ?? it.FinalAmount ?? it.totalPrice ?? 0);
            const tagNo = it.tagno ?? it.tagNo ?? it.TAGNO;
            const gst   = it.gstPer ?? it.GSTPER ?? it.gstPercent;
            const weight = it.net_wt ?? it.netWt ?? it.weight;
            return (
              <View key={i} style={[styles.itemRow, i > 0 && styles.itemRowBorder]}>
                {img
                  ? <SmartImage uri={img} style={styles.itemImg} />
                  : (
                    <View style={[styles.itemImg, styles.itemImgFallback]}>
                      <Feather name="image" size={22} color={COLORS.borderColor} />
                    </View>
                  )
                }
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
                  {!!tagNo && <Text style={styles.itemMeta}>Tag: {tagNo}</Text>}
                  {!!weight && <Text style={styles.itemMeta}>Wt: {weight}g</Text>}
                  <Text style={styles.itemMeta}>Qty: {qty}{gst ? `  ·  GST: ${gst}%` : ''}</Text>
                </View>
                {price > 0 && (
                  <Text style={styles.itemPrice}>₹{price.toLocaleString('en-IN')}</Text>
                )}
              </View>
            );
          })}
        </Card>

        {/* ── Price Breakdown ── */}
        <SecTitle title="Price Details" />
        <Card>
          {subtotalAmt > 0 && (
            <InfoRow label="MRP Total" value={`₹${subtotalAmt.toLocaleString('en-IN')}`} />
          )}
          {discountAmt > 0 && (
            <InfoRow label="Discount" value={`− ₹${discountAmt.toLocaleString('en-IN')}`}
              valueStyle={{ color: '#16a34a' }} />
          )}
          <InfoRow
            label="Shipping"
            value={shippingFee === 0 || String(order.shipping_fee ?? order.shippingFee) === 'Free'
              ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN')}`}
          />
          {num(order.gstAmount ?? order.gst_amount ?? 0) > 0 && (
            <InfoRow label="GST" value={`₹${num(order.gstAmount ?? order.gst_amount).toLocaleString('en-IN')}`} />
          )}
          <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: COLORS.borderColor, marginTop: 6, paddingTop: 10 }]}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{totalAmt.toLocaleString('en-IN')}</Text>
          </View>
        </Card>

        {/* ── Payment ── */}
        <SecTitle title="Payment" />
        <Card>
          <InfoRow label="Method" value={paymentMode === 'CASH' || paymentMode === 'COD' ? 'Cash on Delivery' : paymentMode ?? 'Online'} />
          <InfoRow label="Status" value={paymentStatus} />
          <InfoRow label="Transaction ID" value={transactionId} />
          <InfoRow label="Paid On" value={fmtDate(paidOn)} />
        </Card>

        {/* ── Delivery Address ── */}
        {!!(addrName || addr.addressLine || addr.addressLine1 || addr.address_line) && (
          <>
            <SecTitle title="Delivery Address" />
            <Card>
              <View style={styles.addrRow}>
                <View style={styles.addrIcon}>
                  <Feather name="map-pin" size={16} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  {!!addrName && (
                    <Text style={styles.addrName}>{addrName}</Text>
                  )}
                  <Text style={styles.addrLine}>
                    {[addr.addressLine ?? addr.addressLine1 ?? addr.address_line, addr.locality].filter(Boolean).join(', ')}
                  </Text>
                  <Text style={styles.addrLine}>
                    {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                  </Text>
                  {!!(addr.country && addr.country !== 'India') && (
                    <Text style={styles.addrLine}>{addr.country}</Text>
                  )}
                  {!!addrPhone && (
                    <Text style={styles.addrPhone}>📞 {addrPhone}</Text>
                  )}
                </View>
              </View>
            </Card>
          </>
        )}

      </ScrollView>
    </View>
  );
};

/* ── Styles ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, textAlign: 'center', ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },

  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },

  // Status
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  statusIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  statusText: { ...FONTS.h6, ...FONTS.fontSemiBold },
  statusSub: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 2 },
  statusAmt: { ...FONTS.h5, ...FONTS.fontBold, color: COLORS.title },

  // Stepper
  stepper: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  stepCol: { flex: 1, alignItems: 'center' },
  stepDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#E5E7EB', borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { elevation: 3, shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  stepLabel: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 5, textAlign: 'center', maxWidth: 44, fontSize: 9 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginTop: 11 },

  // AWB
  awbRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
    backgroundColor: '#F9F6F1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  awbTxt: { ...FONTS.fontSm, color: COLORS.title },
  awbCourier: { ...FONTS.fontSm, color: COLORS.textLight },

  // Action buttons
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5,
  },
  cancelBtn:  { borderColor: COLORS.danger  + '55', backgroundColor: COLORS.danger  + '0A' },
  invoiceBtn: { borderColor: COLORS.primary + '55', backgroundColor: COLORS.primary + '0A' },
  reorderBtn: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  actionTxt: { ...FONTS.fontXs, ...FONTS.fontSemiBold },

  // Return button
  returnBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.danger + '55',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: COLORS.danger + '0A', marginBottom: 4, alignSelf: 'stretch',
    justifyContent: 'center',
  },
  returnTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.danger, flex: 1, textAlign: 'center' },

  // Section title
  secTitle: { ...FONTS.h6, ...FONTS.fontSemiBold, color: COLORS.title, marginTop: 14, marginBottom: 8 },

  // Helper rows
  centerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  loadingTxt: { ...FONTS.fontSm, color: COLORS.textLight },
  emptyTxt: { ...FONTS.fontSm, color: COLORS.textLight },

  // Tracking timeline
  tlRow: { flexDirection: 'row', gap: 12 },
  tlLeft: { alignItems: 'center', width: 14 },
  tlDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#E5E7EB', borderWidth: 2, borderColor: '#E5E7EB', marginTop: 2,
  },
  tlDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tlLine: { flex: 1, width: 2, backgroundColor: '#E5E7EB', marginVertical: 3 },
  tlBody: { flex: 1 },
  tlLabel: { ...FONTS.fontSm, ...FONTS.fontMedium, color: COLORS.title },
  tlMeta: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 2 },
  tlTime: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 2 },

  // Items
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  itemRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.borderColor },
  itemImg: { width: 72, height: 72, borderRadius: 10 },
  itemImgFallback: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  itemName: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, lineHeight: 18 },
  itemMeta: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 3 },
  itemPrice: { ...FONTS.font, ...FONTS.fontBold, color: COLORS.title },

  // Price details / Payment
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  infoLabel: { ...FONTS.fontSm, color: COLORS.textLight },
  infoValue: { ...FONTS.fontSm, ...FONTS.fontMedium, color: COLORS.title, maxWidth: '60%', textAlign: 'right' },
  totalLabel: { ...FONTS.font, ...FONTS.fontSemiBold, color: COLORS.title },
  totalValue: { ...FONTS.h5, ...FONTS.fontBold, color: COLORS.title },

  // Address
  addrRow: { flexDirection: 'row', gap: 12 },
  addrIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary + '12', alignItems: 'center', justifyContent: 'center',
  },
  addrName: { ...FONTS.font, ...FONTS.fontSemiBold, color: COLORS.title, marginBottom: 4 },
  addrLine: { ...FONTS.fontSm, color: COLORS.text, lineHeight: 20 },
  addrPhone: { ...FONTS.fontSm, color: COLORS.textLight, marginTop: 6 },
});

export default Trackorder;
