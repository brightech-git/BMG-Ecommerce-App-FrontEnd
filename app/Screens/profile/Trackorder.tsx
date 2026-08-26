// app/Screens/profile/Trackorder.tsx
// Primary:  GET /order/track/user?orderId= → { current_status, timeline[], order_id, items[], canCancel }
// Secondary:GET /order/getOrder?orderId=   → payment / address fallback
// Status:   GET /order/status-master       → { flow[{key,label,icon,step}], terminal[...] }
// Cancel:   POST /order/update-status
// Reorder:  POST /order/reorder
// Invoice:  GET /order/invoice/:orderId    (on demand)
import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, RefreshControl, ActivityIndicator,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import {
  useOrderById, useOrderTrackByUser, useOrderStatusMaster,
  useCancelOrder, useOrderInvoice,
} from '../../api/hooks/useOrders';
import { absUrl } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, ErrorState } from '../../components/common/StateViews';
import { toastSuccess, toastError } from '../../utils/toast';
import { useCompany } from '../../api/hooks/useCompany';
import { useDownloadInvoice } from '../../utils/downloadInvoice';

type Props = StackScreenProps<RootStackParamList, 'Trackorder'>;

/* ── Helpers ─────────────────────────────────────────────────── */
const num = (v: any) => {
  const n = parseFloat(String(v ?? '0').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

const fmtDate = (raw: any) => {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return String(raw).slice(0, 10); }
};

const fmtDateTime = (raw: any) => {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return String(raw).replace('T', ' ').slice(0, 16); }
};

// Map Feather icon names that may come from the API
const ICON_MAP: Record<string, string> = {
  'shopping-bag': 'shopping-bag',
  'box': 'box',
  'package': 'package',
  'truck': 'truck',
  'navigation': 'navigation',
  'map-pin': 'map-pin',
  'home': 'home',
  'clock': 'clock',
  'loader': 'loader',
  'check': 'check',
  'check-circle': 'check-circle',
  'x-circle': 'x-circle',
  'rotate-ccw': 'rotate-ccw',
  'refresh-ccw': 'refresh-cw',
  'alert-circle': 'alert-circle',
};
const safeIcon = (icon?: string) => ICON_MAP[icon ?? ''] ?? 'circle';

// Terminal status keys (show different UI — no stepper)
const TERMINAL_KEYS = new Set(['CANCELLED', 'RETURNED', 'REFUNDED', 'NOT_DELIVERED']);

// Color for a given status key
const statusColor = (key = '') => {
  const k = key.toUpperCase();
  if (k === 'DELIVERED')     return '#16a34a';
  if (k === 'CANCELLED')     return '#dc2626';
  if (k === 'RETURNED')      return '#dc2626';
  if (k === 'REFUNDED')      return '#dc2626';
  if (k === 'NOT_DELIVERED') return '#dc2626';
  if (k === 'SHIPPED' || k === 'IN_TRANSIT') return '#2563eb';
  if (k === 'OUT_FOR_DELIVERY') return '#7c3aed';
  if (k === 'PACKING' || k === 'READY_TO_SHIP') return '#7c3aed';
  if (k === 'PLACED' || k === 'PENDING') return '#d97706';
  return COLORS.warning;
};

/* ── Small UI pieces ─────────────────────────────────────────── */
const Card = ({ children, style, C }: any) => (
  <View style={[styles.card, C ? { backgroundColor: C.card } : undefined, style]}>{children}</View>
);

const SecTitle = ({ title, C }: { title: string; C?: any }) => (
  <Text style={[styles.secTitle, C ? { color: C.title } : undefined]}>{title}</Text>
);

const InfoRow = ({
  label, value, valueStyle, C,
}: {
  label: string; value?: string | null | undefined; valueStyle?: any; C?: any;
}) =>
  value ? (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, C ? { color: C.textLight } : undefined]}>{label}</Text>
      <Text style={[styles.infoValue, C ? { color: C.title } : undefined, valueStyle]}>{value}</Text>
    </View>
  ) : null;

/* ── Screen ─────────────────────────────────────────────────── */
const Trackorder = ({ route, navigation }: Props) => {
  const { isDark, colors: C } = useTheme();
  const { orderId, seedOrder } = route.params;
  const [refreshing, setRefreshing]       = useState(false);
  const [timelineExpanded, setTimelineExp] = useState(false);
  const [cancelModal, setCancelModal]      = useState(false);
  const [cancelRemarks, setCancelRemarks]  = useState('');
  const { data: company } = useCompany();

  // PRIMARY: /order/track/user?orderId= — real API used by the app
  // Returns: current_status, timeline[], order_id, items[], canCancel
  const {
    data: trackRaw, isLoading, isError,
    refetch: refetchTrack, isFetching,
  } = useOrderTrackByUser(orderId);

  // SECONDARY: /order/getOrder?orderId= — fallback for payment/address fields
  const { data: orderRaw, refetch: refetchOrder } = useOrderById(orderId);

  // STATUS MASTER: /order/status-master — dynamic flow steps + terminal statuses
  const { data: masterRaw } = useOrderStatusMaster();

  // Invoice — fetch from API, then generate PDF locally
  const { refetch: fetchInvoice, isFetching: invoiceLoading } = useOrderInvoice(orderId);
  const { download: downloadInvoice } = useDownloadInvoice();

  // Cancel / Reorder mutations
  const { mutate: cancelOrder, isPending: cancelling } = useCancelOrder();

  /* ── Data resolution ─── */
  // Prefer tracking response; fall back to getOrder; fall back to seedOrder
  const track = useMemo(() => {
    const t = trackRaw?.data ?? trackRaw;
    if (t?.current_status || t?.order_id) return t;
    return null;
  }, [trackRaw]);

  const orderFallback = useMemo(() => {
    const o = orderRaw?.data ?? orderRaw;
    return (o?.orderId || o?.current_status) ? o : (seedOrder ?? {});
  }, [orderRaw, seedOrder]);

  // Prefer track for primary fields
  const currentStatus: string =
    track?.current_status ?? orderFallback?.status ?? orderFallback?.current_status ?? 'PENDING';

  const orderDate =
    track?.order_date ?? orderFallback?.orderTime ?? orderFallback?.createdAt ??
    orderFallback?.created_at ?? orderFallback?.order_date;

  // Items: tracking response has camelCase (productName, tagno, image_path)
  const items: any[] =
    track?.items ?? orderFallback?.order_items ?? orderFallback?.orderItems ?? orderFallback?.items ?? [];

  // Address: from getOrder fallback
  const addr: any =
    orderFallback?.delivery_address ?? orderFallback?.address ??
    orderFallback?.deliveryAddress ?? orderFallback?.shippingAddress ?? {};
  const addrName: string | undefined = addr?.customerName ?? addr?.name ?? orderFallback?.customerName;
  const addrPhone: string | undefined = addr?.phone ?? orderFallback?.contact ?? orderFallback?.mobile;

  // Payment: from getOrder fallback
  const paymentMode   = orderFallback?.payment_mode ?? orderFallback?.paymentMode;
  const paymentStatus = orderFallback?.payment_status ?? orderFallback?.paymentStatus;
  const transactionId = orderFallback?.transaction_id ?? orderFallback?.transactionId;
  const paidOn        = orderFallback?.payment_date ?? orderFallback?.paymentDate;

  // Amounts: compute from items if not at order level
  const itemSubtotal = items.reduce((sum: number, it: any) => sum + num(it.price ?? it.totalAmount ?? 0), 0);
  const shippingFee  = num(items[0]?.shippingFee ?? orderFallback?.shipping_fee ?? orderFallback?.shippingFee ?? 0);
  const totalAmt     = num(orderFallback?.total_amount ?? orderFallback?.totalAmount ?? orderFallback?.grandTotal)
    || (itemSubtotal + shippingFee);
  const discountAmt  = num(orderFallback?.discountAmount ?? orderFallback?.discount ?? 0);

  // Timeline events from tracking response
  const timeline: any[] = track?.timeline ?? [];

  // canCancel: from API if present
  const canCancel: boolean = track?.canCancel ?? false;
  const canReturn: boolean = currentStatus.toUpperCase() === 'DELIVERED';

  /* ── Status master ─── */
  const flowSteps: any[] = useMemo(() => {
    const m = masterRaw?.data ?? masterRaw;
    return Array.isArray(m?.flow) ? m.flow : [];
  }, [masterRaw]);

  const terminalStatuses: any[] = useMemo(() => {
    const m = masterRaw?.data ?? masterRaw;
    return Array.isArray(m?.terminal) ? m.terminal : [];
  }, [masterRaw]);

  // Is this a terminal state?
  const isTerminal = TERMINAL_KEYS.has(currentStatus.toUpperCase());

  // Find label + icon for current status
  const currentStatusInfo = useMemo(() => {
    const key = currentStatus.toUpperCase();
    const inFlow = flowSteps.find(s => s.key === key);
    if (inFlow) return { label: inFlow.label, icon: inFlow.icon };
    const inTerminal = terminalStatuses.find(s => s.key === key);
    if (inTerminal) return { label: inTerminal.label, icon: inTerminal.icon };
    return { label: currentStatus, icon: 'clock' };
  }, [currentStatus, flowSteps, terminalStatuses]);

  // Current step index in flow (0-based) for stepper
  const currentFlowIdx = useMemo(() => {
    const key = currentStatus.toUpperCase();
    const idx = flowSteps.findIndex(s => s.key === key);
    if (idx >= 0) return idx;
    // If status is in timeline but not in flow master (e.g. IN_PROCESSING),
    // find the highest flow step that appears in the timeline
    const doneKeys = new Set(timeline.map((t: any) => t.status?.toUpperCase()));
    let highest = -1;
    flowSteps.forEach((s, i) => { if (doneKeys.has(s.key)) highest = i; });
    return highest;
  }, [currentStatus, flowSteps, timeline]);

  /* ── Handlers ─── */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetchTrack(), refetchOrder()]);
    setRefreshing(false);
  }, [refetchTrack, refetchOrder]);

  const handleCancel = () => {
    setCancelRemarks('');
    setCancelModal(true);
  };

  const confirmCancel = () => {
    if (!cancelRemarks.trim()) {
      Alert.alert('Remarks required', 'Please enter a reason for cancellation.');
      return;
    }
    setCancelModal(false);
    cancelOrder(
      { orderId, newStatus: 'CANCELLED', remarks: cancelRemarks.trim() },
      {
        onSuccess: () => {
          toastSuccess('Order cancelled');
          refetchTrack();
        },
      },
    );
  };

  const handleInvoice = async () => {
    try {
      // Fetch invoice data from /order/invoice/:orderId
      const result: any = await fetchInvoice();
      console.log('[Invoice] raw fetch result:', JSON.stringify(result, null, 2));
      const inv = result?.data?.data ?? result?.data ?? result;
      console.log('[Invoice] resolved inv object:', JSON.stringify(inv, null, 2));
      console.log('[Invoice] paymentMode:', inv?.paymentMode, '| paymentStatus:', inv?.paymentStatus);

      if (!inv?.orderId) {
        toastError('Invoice data not available');
        return;
      }

      // The dedicated invoice endpoint often returns literal "N/A" placeholders for
      // paymentMode/paymentStatus. Fall back to the reliable /order/getOrder fields
      // (already resolved above as `paymentMode`/`paymentStatus`/`currentStatus`)
      // when the invoice's own value is missing/blank/"N/A".
      const cleanVal = (v: any) =>
        (v === undefined || v === null || v === '' || String(v).toUpperCase() === 'N/A') ? undefined : v;

      const finalPaymentMode   = cleanVal(inv.paymentMode) ?? cleanVal(paymentMode) ?? 'N/A';
      const finalPaymentStatus = cleanVal(inv.paymentStatus) ?? cleanVal(paymentStatus) ?? cleanVal(currentStatus) ?? 'N/A';
      console.log('[Invoice] payment field resolution:', {
        invPaymentMode: inv.paymentMode, orderFallbackPaymentMode: paymentMode,
        invPaymentStatus: inv.paymentStatus, orderFallbackPaymentStatus: paymentStatus, currentStatus,
        finalPaymentMode, finalPaymentStatus,
      });

      // origin_address → Shipped From lines
      const origin = inv.origin_address ?? {};
      const originLines: string[] = [
        origin.addressLine1,
        origin.addressLine2,
        [origin.city, origin.state, origin.pincode].filter(Boolean).join(', '),
        origin.country,
      ].filter(Boolean) as string[];

      // address → delivery address lines
      const delivery = inv.address ?? {};
      const deliveryLines: string[] = [
        delivery.addressLine,
        delivery.locality,
        [delivery.city, delivery.state, delivery.pincode].filter(Boolean).join(', '),
        delivery.landmark ? `Landmark: ${delivery.landmark}` : null,
      ].filter(Boolean) as string[];

      downloadInvoice({
        orderId:      inv.orderId,
        invoiceNo:    inv.invoiceNo,
        orderDate:    inv.orderTime?.timestamp ?? inv.orderTime,
        invoiceDate:  inv.invoiceDate?.timestamp ?? inv.invoiceDate,
        // Origin (Shipped From)
        originName:    origin.name ?? company?.COMPANYNAME,
        originAddress: originLines,
        originPhone:   origin.phone,
        // Company extras
        companyName:  company?.COMPANYNAME ?? origin.name,
        companyGst:   company?.GSTNO,
        companyEmail: company?.EMAIL ?? null,          // inv.email is the customer's email — never use it here
        // Customer (Bill To)
        customerName:    inv.customerName ?? delivery.name,
        customerPhone:   inv.contact ?? delivery.phone,
        customerEmail:   inv.email,
        customerAddress: deliveryLines,
        // Payment
        paymentMode:   finalPaymentMode,
        paymentStatus: finalPaymentStatus,
        transactionId: inv.transactionId ?? null,
        paidOn:        null,
        // Items — invoice API uses snake_case
        items: (inv.items ?? []).map((it: any) => ({
          id:          it.id,
          name:        it.product_name ?? it.productName ?? 'Item',
          itemId:      it.sno ?? it.tagno,
          sno:         it.sno,
          tagno:       it.tagno,
          qty:         it.quantity ?? 1,
          netWt:       it.net_wt  ?? it.netWt  ?? null,
          grsWt:       it.grs_wt  ?? it.grsWt  ?? null,
          grsAmt:      it.gross_amount ?? it.grossAmount ?? null,
          gstPer:      it.gst_per  ?? it.gstPer  ?? null,
          gstAmount:   it.gst_amount ?? it.gstAmount ?? null,
          price:       it.price,
          totalAmount: it.price,
          imageUrl:    it.image_path ?? it.imagePath ?? null,
        })),
        shippingFee:  inv.shippingFee ?? 0,
        totalAmount:  inv.totalAmount,
      });
    } catch (err: any) {
      toastError('Could not load invoice', err?.message ?? '');
    }
  };

  /* ── Loading / Error guards ─── */
  if (isLoading && !seedOrder) {
    return <View style={[styles.safe, { backgroundColor: C.background }]}><Loader message="Loading order…" /></View>;
  }
  if (isError && !track && !seedOrder) {
    return <View style={[styles.safe, { backgroundColor: C.background }]}><ErrorState onRetry={refetchTrack} /></View>;
  }

  const sColor = statusColor(currentStatus);

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]} numberOfLines={1}>Order #{orderId}</Text>
        <TouchableOpacity style={styles.hBtn} onPress={onRefresh}>
          {isFetching
            ? <ActivityIndicator size="small" color={COLORS.primary} />
            : <Feather name="refresh-cw" size={18} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* ── Status Card ── */}
        <Card C={C}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIcon, { backgroundColor: sColor + '18' }]}>
              <Feather name={safeIcon(currentStatusInfo.icon) as any} size={22} color={sColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusText, { color: sColor }]}>{currentStatusInfo.label}</Text>
              {!!orderDate && (
                <Text style={[styles.statusSub, { color: C.textLight }]}>Placed on {fmtDate(orderDate)}</Text>
              )}
            </View>
            {totalAmt > 0 && (
              <Text style={[styles.statusAmt, { color: C.title }]}>₹{totalAmt.toLocaleString('en-IN')}</Text>
            )}
          </View>

          {/* ── 8-Step Progress Stepper (hidden for terminal statuses) ── */}
          {/* {!isTerminal && flowSteps.length > 0 && (
            <View style={styles.stepper}>
              {flowSteps.map((step: any, i: number) => {
                const done   = i <= currentFlowIdx;
                const active = i === currentFlowIdx;
                return (
                  <React.Fragment key={step.key}>
                    <View style={styles.stepCol}>
                      <View style={[
                        styles.stepDot,
                        done && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                        active && styles.stepDotActive,
                      ]}>
                        {done && <Feather name="check" size={8} color="#fff" />}
                      </View>
                      <Text
                        style={[styles.stepLabel, done && { color: COLORS.primary, ...FONTS.fontSemiBold }]}
                        numberOfLines={2}
                      >
                        {step.label}
                      </Text>
                    </View>
                    {i < flowSteps.length - 1 && (
                      <View style={[styles.stepLine, i < currentFlowIdx && { backgroundColor: COLORS.primary }]} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          )}  */}
        </Card>

        {/* ── Action Buttons ── */}
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

        </View>

        {/* Return / Refund button */}
        {canReturn && !isTerminal && (
          <TouchableOpacity
            style={styles.returnBtn}
            onPress={() => navigation.navigate('OrderReturn', { orderId })}
          >
            <Feather name="rotate-ccw" size={14} color={COLORS.danger} />
            <Text style={styles.returnTxt}>Request Return / Refund</Text>
            <Feather name="chevron-right" size={14} color={COLORS.danger} />
          </TouchableOpacity>
        )}

        {/* ── Order Tracking Timeline ── */}
        <SecTitle title="Order Timeline" C={C} />
        <Card C={C}>
          {(() => {
            // Sort by sequence field (API returns events in insertion order, not sequence order)
            const sortedTimeline = [...timeline].sort(
              (a: any, b: any) => (a.sequence ?? 0) - (b.sequence ?? 0),
            );

            // Always inject "Order Created" as first green step if not already present
            const hasOrderCreated = sortedTimeline.some(
              (t: any) => ['PENDING', 'ORDER_CREATED'].includes(t.status?.toUpperCase() ?? ''),
            );
            const syntheticFirst = hasOrderCreated ? [] : [{
              uid:     'done-synthetic-0',
              key:     'ORDER_CREATED',
              label:   'Order Created',
              remarks: 'Your order has been placed.',
              time:    sortedTimeline[0]?.updated_at ?? null,
              done:    true,
              isSynthetic: true,
            }];

            const doneKeys = new Set(sortedTimeline.map((t: any) => t.status?.toUpperCase()));

            // Completed events — sorted by sequence (oldest/lowest first), keyed by index to avoid dups
            const completedItems: any[] = [
              ...syntheticFirst,
              ...sortedTimeline.map((ev: any, idx: number) => ({
                uid:     `done-${idx}`,          // unique render key
                key:     ev.status?.toUpperCase() ?? '',
                label:   ev.label ?? ev.status ?? '',
                remarks: ev.remarks,
                time:    ev.updated_at,
                done:    true,
              })),
            ];

            // Upcoming flow steps not yet in timeline
            const upcomingItems: any[] = isTerminal ? [] : flowSteps
              .filter((s: any) => !doneKeys.has(s.key))
              .map((s: any, idx: number) => ({
                uid:     `up-${idx}`,           // unique render key
                key:     s.key,
                label:   s.label,
                remarks: null,
                time:    null,
                done:    false,
              }));

            const allSteps = [...completedItems, ...upcomingItems];
            if (allSteps.length === 0) {
              return (
                <View style={styles.centerRow}>
                  <Feather name="map-pin" size={18} color={C.borderColor} />
                  <Text style={[styles.emptyTxt, { color: C.textLight }]}>No tracking events yet</Text>
                </View>
              );
            }

            const lastDoneIdx = completedItems.length - 1;  // index of current/latest done step

            // Collapsed view: first created + current status + next upcoming
            // Deduplicate in case there's only 1 completed step
            const collapsedSet = new Set<number>();
            collapsedSet.add(0);                                         // first (Order Created)
            if (lastDoneIdx >= 0) collapsedSet.add(lastDoneIdx);         // current status
            if (lastDoneIdx + 1 < allSteps.length)
              collapsedSet.add(lastDoneIdx + 1);                         // next upcoming
            const collapsedSteps = [...collapsedSet].map(i => allSteps[i]);

            const needsToggle  = allSteps.length > collapsedSteps.length;
            const visibleSteps = timelineExpanded || !needsToggle ? allSteps : collapsedSteps;

            return (
              <>
                {visibleSteps.map((step: any, i: number) => {
                  const globalIdx = allSteps.indexOf(step);
                  const isLast    = i === visibleSteps.length - 1;
                  const isLatest  = step.done && globalIdx === lastDoneIdx;
                  // Show faded gap line when collapsed and there are hidden steps between items
                  const hiddenBetween = !timelineExpanded && needsToggle &&
                    i < visibleSteps.length - 1 &&
                    allSteps.indexOf(visibleSteps[i + 1]) - globalIdx > 1;

                  const dotBg     = step.done ? '#16a34a' : '#E5E7EB';
                  const dotBorder = step.done ? '#16a34a' : '#D1D5DB';
                  const nextStep  = visibleSteps[i + 1];
                  const lineColor = step.done && nextStep?.done ? '#16a34a' : '#E5E7EB';

                  return (
                    <View key={step.uid} style={styles.tlRow}>
                      {/* Dot + connector line */}
                      <View style={styles.tlLeft}>
                        <View style={[
                          styles.tlDot,
                          { backgroundColor: dotBg, borderColor: dotBorder },
                          isLatest && styles.tlDotCurrent,
                        ]}>
                          {step.done && <Feather name="check" size={8} color="#fff" />}
                        </View>
                        {!isLast && (
                          <View style={[
                            styles.tlLine,
                            { backgroundColor: lineColor },
                            hiddenBetween && styles.tlLineDashed,
                          ]} />
                        )}
                      </View>

                      {/* Content */}
                      <View style={[styles.tlBody, !isLast && { paddingBottom: 18 }]}>
                        <Text style={[
                          styles.tlLabel,
                          step.done
                            ? (isLatest
                                ? { color: '#16a34a', ...FONTS.fontSemiBold }
                                : { color: C.title })
                            : { color: C.textLight },
                        ]}>
                          {step.label}
                          {!!step.time && (
                            <Text style={[styles.tlDateInline, { color: C.textLight }]}>
                              {',  ' + fmtDate(step.time)}
                            </Text>
                          )}
                        </Text>
                        {!!step.remarks && (
                          <Text style={[styles.tlMeta, { color: C.textLight }]}>{step.remarks}</Text>
                        )}
                        {!step.done && (
                          <Text style={[styles.tlTime, { color: '#C0C0C0' }]}>Upcoming</Text>
                        )}
                      </View>
                    </View>
                  );
                })}

                {/* Toggle button */}
                {needsToggle && (
                  <TouchableOpacity
                    style={[styles.seeAllBtn, { borderTopColor: C.borderColor }]}
                    onPress={() => setTimelineExp(e => !e)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.seeAllTxt}>
                      {timelineExpanded
                        ? 'Show Less'
                        : `See All Updates (${allSteps.length})`}
                    </Text>
                    <Feather
                      name={timelineExpanded ? 'chevron-up' : 'chevron-right'}
                      size={14}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                )}
              </>
            );
          })()}
        </Card>

        {/* ── Order Items ── */}
        <SecTitle title={`Items (${items.length})`} C={C} />
        <Card C={C} style={{ padding: 0, overflow: 'hidden' }}>
          {items.length === 0 ? (
            <View style={[styles.centerRow, { padding: 16 }]}>
              <Text style={[styles.emptyTxt, { color: C.textLight }]}>No item details available</Text>
            </View>
          ) : items.map((it: any, i: number) => {
            // Tracking API uses: productName (camelCase), tagno, sno, image_path
            const name   = it.productName ?? it.product_name ?? it.ITEMNAME ?? it.name ?? 'Item';
            const qty    = it.quantity ?? 1;
            const price  = num(it.price ?? it.totalAmount ?? 0);
            const tagNo  = it.tagno ?? it.tagNo ?? it.TAGNO;
            const sno    = it.sno;
            const weight = it.netWt ?? it.net_wt ?? it.grsWt;
            const imgRaw = it.image_path ?? it.imagePath ?? it.image;
            const img    = imgRaw ? absUrl(imgRaw) : undefined;

            return (
              <View key={it.id ?? i} style={[styles.itemRow, i > 0 && [styles.itemRowBorder, { borderTopColor: C.borderColor }]]}>
                {img ? (
                  <SmartImage uri={img} style={styles.itemImg} />
                ) : (
                  <View style={[styles.itemImg, styles.itemImgFallback, { backgroundColor: C.input }]}>
                    <Feather name="image" size={22} color={C.borderColor} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: C.title }]} numberOfLines={2}>{name}</Text>
                  {!!tagNo && <Text style={[styles.itemMeta, { color: C.textLight }]}>Tag No: {tagNo}</Text>}
                  {!!sno   && <Text style={[styles.itemMeta, { color: C.textLight }]}>SKU: {sno}</Text>}
                  {!!weight && <Text style={[styles.itemMeta, { color: C.textLight }]}>Wt: {weight}g</Text>}
                  <Text style={[styles.itemMeta, { color: C.textLight }]}>Qty: {qty}</Text>
                </View>
                {price > 0 && (
                  <Text style={[styles.itemPrice, { color: C.title }]}>₹{price.toLocaleString('en-IN')}</Text>
                )}
              </View>
            );
          })}
        </Card>

        {/* ── Price Details ── */}
        <SecTitle title="Price Details" C={C} />
        <Card C={C}>
          {itemSubtotal > 0 && (
            <InfoRow label="Item Total" value={`₹${itemSubtotal.toLocaleString('en-IN')}`} C={C} />
          )}
          {discountAmt > 0 && (
            <InfoRow
              label="Discount"
              value={`− ₹${discountAmt.toLocaleString('en-IN')}`}
              valueStyle={{ color: '#16a34a' }}
              C={C}
            />
          )}
          <InfoRow
            label="Shipping"
            value={shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN')}`}
            C={C}
          />
          {(paymentMode || paymentStatus) && (
            <InfoRow
              label="Payment"
              value={
                paymentMode === 'CASH' || paymentMode === 'COD'
                  ? 'Cash on Delivery'
                  : (paymentMode ?? undefined)
              }
              C={C}
            />
          )}
          <View style={[styles.totalRow, { borderTopColor: C.borderColor }]}>
            <Text style={[styles.totalLabel, { color: C.title }]}>Total Paid</Text>
            <Text style={[styles.totalValue, { color: C.title }]}>₹{totalAmt.toLocaleString('en-IN')}</Text>
          </View>
        </Card>

        {/* ── Delivery Address ── */}
        {!!(addrName || addr?.addressLine || addr?.addressLine1 || addr?.address_line) && (
          <>
            <SecTitle title="Delivery Address" C={C} />
            <Card C={C}>
              <View style={styles.addrRow}>
                <View style={styles.addrIcon}>
                  <Feather name="map-pin" size={16} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  {!!addrName && <Text style={[styles.addrName, { color: C.title }]}>{addrName}</Text>}
                  <Text style={[styles.addrLine, { color: C.text }]}>
                    {[
                      addr.addressLine ?? addr.addressLine1 ?? addr.address_line,
                      addr.locality,
                    ].filter(Boolean).join(', ')}
                  </Text>
                  <Text style={[styles.addrLine, { color: C.text }]}>
                    {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                  </Text>
                  {!!addrPhone && <Text style={[styles.addrPhone, { color: C.textLight }]}>📞 {addrPhone}</Text>}
                </View>
              </View>
            </Card>
          </>
        )}
      </ScrollView>

      {/* ── Cancel Remarks Modal ── */}
      <Modal visible={cancelModal} transparent animationType="fade" onRequestClose={() => setCancelModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalBox, { backgroundColor: C.card }]}>
            <Text style={[styles.modalTitle, { color: C.title }]}>Cancel Order</Text>
            <Text style={[styles.modalSub, { color: C.textLight }]}>Please tell us why you want to cancel this order.</Text>
            <TextInput
              style={[styles.remarksInput, { backgroundColor: C.input ?? C.background, color: C.title, borderColor: C.borderColor }]}
              placeholder="Enter reason for cancellation…"
              placeholderTextColor={C.textLight}
              value={cancelRemarks}
              onChangeText={setCancelRemarks}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={[styles.charCount, { color: C.textLight }]}>{cancelRemarks.length}/300</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: C.borderColor }]}
                onPress={() => setCancelModal(false)}
              >
                <Text style={[styles.modalBtnTxt, { color: C.title }]}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDanger]}
                disabled={cancelling}
                onPress={confirmCancel}
              >
                <Text style={[styles.modalBtnTxt, { color: '#fff' }]}>
                  {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

/* ── Styles ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  hBtn:   { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, textAlign: 'center', ...FONTS.h5, ...FONTS.fontSemiBold },

  card: {
    borderRadius: 16, padding: 16, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  // Status
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  statusIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statusText: { ...FONTS.h6, ...FONTS.fontSemiBold },
  statusSub:  { ...FONTS.fontXs, marginTop: 2 },
  statusAmt:  { ...FONTS.h5, ...FONTS.fontBold },

  // 8-step Stepper
  stepper:      { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  stepCol:      { flex: 1, alignItems: 'center' },
  stepDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#E5E7EB', borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: {
    elevation: 3, shadowColor: COLORS.primary,
    shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 0 },
  },
  stepLabel: {
    ...FONTS.fontXs, marginTop: 5,
    textAlign: 'center', maxWidth: 40, fontSize: 8,
  },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginTop: 10 },

  // Action buttons
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5,
  },
  cancelBtn:  { borderColor: COLORS.danger  + '55', backgroundColor: COLORS.danger  + '0A' },
  invoiceBtn: { borderColor: COLORS.primary + '55', backgroundColor: COLORS.primary + '0A' },
  actionTxt:  { ...FONTS.fontXs, ...FONTS.fontSemiBold },

  // Return button
  returnBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.danger + '55',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: COLORS.danger + '0A', marginBottom: 4,
    alignSelf: 'stretch', justifyContent: 'center',
  },
  returnTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.danger, flex: 1, textAlign: 'center' },

  // Section title
  secTitle: { ...FONTS.h6, ...FONTS.fontSemiBold, marginTop: 14, marginBottom: 8 },

  // Helper rows
  centerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  emptyTxt:  { ...FONTS.fontSm },

  // Timeline
  tlRow:  { flexDirection: 'row', gap: 12 },
  tlLeft: { alignItems: 'center', width: 18 },
  tlDot: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  tlDotCurrent: {
    width: 22, height: 22, borderRadius: 11,
    elevation: 4, shadowColor: '#16a34a', shadowOpacity: 0.45,
    shadowRadius: 5, shadowOffset: { width: 0, height: 0 },
  },
  tlLine:       { flex: 1, width: 2, backgroundColor: '#E5E7EB', marginVertical: 3 },
  tlLineDashed: { opacity: 0.35 },  // faded line between collapsed rows to suggest hidden steps
  tlBody:       { flex: 1, paddingBottom: 4 },
  tlLabel:      { ...FONTS.fontSm, ...FONTS.fontMedium },
  tlDateInline: { ...FONTS.fontXs, fontWeight: '400' },
  tlMeta:       { ...FONTS.fontXs, marginTop: 2 },
  tlTime:       { ...FONTS.fontXs, marginTop: 2, fontStyle: 'italic' },
  seeAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 14, paddingTop: 12,
    borderTopWidth: 1,
  },
  seeAllTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary },

  // Items
  itemRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  itemRowBorder:  { borderTopWidth: 1 },
  itemImg:        { width: 72, height: 72, borderRadius: 10 },
  itemImgFallback:{ alignItems: 'center', justifyContent: 'center' },
  itemName:       { ...FONTS.fontSm, ...FONTS.fontSemiBold, lineHeight: 18 },
  itemMeta:       { ...FONTS.fontXs, marginTop: 3 },
  itemPrice:      { ...FONTS.font, ...FONTS.fontBold },

  // Price / Payment
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  infoLabel: { ...FONTS.fontSm },
  infoValue: { ...FONTS.fontSm, ...FONTS.fontMedium, maxWidth: '60%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, marginTop: 6, paddingTop: 10,
  },
  totalLabel: { ...FONTS.font, ...FONTS.fontSemiBold },
  totalValue: { ...FONTS.h5, ...FONTS.fontBold },

  // Address
  addrRow:  { flexDirection: 'row', gap: 12 },
  addrIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary + '12', alignItems: 'center', justifyContent: 'center',
  },
  addrName:  { ...FONTS.font, ...FONTS.fontSemiBold, marginBottom: 4 },
  addrLine:  { ...FONTS.fontSm, lineHeight: 20 },
  addrPhone: { ...FONTS.fontSm, marginTop: 6 },

  // Cancel modal
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox:       { width: '100%', borderRadius: 16, padding: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  modalTitle:     { ...FONTS.h5, ...FONTS.fontSemiBold, marginBottom: 6 },
  modalSub:       { ...FONTS.fontSm, marginBottom: 14, lineHeight: 20 },
  remarksInput:   { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 100, ...FONTS.fontSm },
  charCount:      { ...FONTS.fontXs, textAlign: 'right', marginTop: 4, marginBottom: 16 },
  modalBtns:      { flexDirection: 'row', gap: 10 },
  modalBtn:       { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  modalBtnDanger: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
  modalBtnTxt:    { ...FONTS.fontSm, ...FONTS.fontSemiBold },
});

export default Trackorder;
