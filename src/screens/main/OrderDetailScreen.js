import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {getOrderById, cancelOrder} from '../../services/OrderService';
import {colors} from '../../theme/theme';

const BASE = 'https://app.bmgjewellers.com';

const resolveImg = src => {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  return `${BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const fmt = val => {
  const n = parseFloat(val);
  if (!n) return '—';
  return `₹${n.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
};

const fmtDate = d => {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];

const StatusTimeline = ({current}) => {
  const idx = STATUS_STEPS.indexOf((current ?? '').toLowerCase());
  return (
    <View style={styles.timeline}>
      {STATUS_STEPS.map((step, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <View key={step} style={styles.timelineItem}>
            <View style={[styles.timelineDot, done && styles.timelineDotDone, active && styles.timelineDotActive]}>
              {done && <Ionicons name="checkmark" size={10} color={colors.white} />}
            </View>
            {i < STATUS_STEPS.length - 1 && (
              <View style={[styles.timelineLine, done && i < idx && styles.timelineLineDone]} />
            )}
            <Text style={[styles.timelineLabel, active && styles.timelineLabelActive]}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const OrderDetailScreen = ({route, navigation}) => {
  const {orderId, order: passedOrder} = route.params ?? {};
  const queryClient = useQueryClient();

  const {data, isLoading, isError} = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
    initialData: passedOrder ? {data: passedOrder} : undefined,
    staleTime: 2 * 60 * 1000,
  });

  const order = data?.data ?? data ?? passedOrder;

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['order', orderId]});
      queryClient.invalidateQueries({queryKey: ['orderHistory']});
      Toast.show({type: 'success', text1: 'Order cancelled'});
    },
    onError: err =>
      Toast.show({type: 'error', text1: 'Failed', text2: err.message}),
  });

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      {text: 'Keep Order', style: 'cancel'},
      {
        text: 'Cancel Order',
        style: 'destructive',
        onPress: () =>
          cancelMutation.mutate({orderId, status: 'cancelled'}),
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{width: 22}} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{width: 22}} />
        </View>
        <View style={styles.centered}>
          <Text style={{fontSize: 40}}>😕</Text>
          <Text style={styles.emptyTitle}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = order?.orderStatus ?? order?.status ?? 'placed';
  const items = order?.items ?? order?.products ?? [];
  const shippingAddress = order?.shippingAddress ?? order?.address ?? {};
  const canCancel = !['cancelled', 'delivered'].includes(status.toLowerCase());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{orderId}</Text>
        <View style={{width: 22}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <Text style={styles.orderDate}>{fmtDate(order?.createdAt)}</Text>
          <StatusTimeline current={status} />
        </View>

        {/* Items */}
        {items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({items.length})</Text>
            {items.map((item, i) => {
              const imgUri = resolveImg(item?.image ?? item?.ImagePath);
              const name = item?.itemName ?? item?.ITEMNAME ?? 'Product';
              const price = fmt(item?.price ?? item?.FinalAmount ?? item?.amount);
              return (
                <View key={i} style={styles.itemRow}>
                  {imgUri ? (
                    <Image source={{uri: imgUri}} style={styles.itemImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.itemImg, styles.imgPlaceholder]}>
                      <Text style={{fontSize: 20}}>💍</Text>
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
                    {item?.TAGKEY ? (
                      <Text style={styles.itemMeta}>Tag: {item.TAGKEY}</Text>
                    ) : null}
                    {item?.quantity && item.quantity > 1 ? (
                      <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
                    ) : null}
                    <Text style={styles.itemPrice}>{price}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Price summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              {fmt(order?.subtotal ?? order?.totalAmount)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery</Text>
            <Text style={[styles.priceValue, {color: colors.success}]}>Free</Text>
          </View>
          {order?.discount ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={[styles.priceValue, {color: colors.success}]}>
                -{fmt(order.discount)}
              </Text>
            </View>
          ) : null}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>
              {fmt(order?.grandTotal ?? order?.totalAmount ?? order?.amount)}
            </Text>
          </View>
        </View>

        {/* Shipping address */}
        {(shippingAddress?.address || shippingAddress?.name) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            {shippingAddress.name ? (
              <Text style={styles.addrLine}>{shippingAddress.name}</Text>
            ) : null}
            {shippingAddress.address ? (
              <Text style={styles.addrLine}>{shippingAddress.address}</Text>
            ) : null}
            {shippingAddress.city ? (
              <Text style={styles.addrLine}>
                {shippingAddress.city}
                {shippingAddress.state ? `, ${shippingAddress.state}` : ''}
                {shippingAddress.pincode ? ` - ${shippingAddress.pincode}` : ''}
              </Text>
            ) : null}
            {shippingAddress.mobile ? (
              <Text style={styles.addrLine}>📞 {shippingAddress.mobile}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Cancel button */}
        {canCancel && (
          <View style={styles.cancelSection}>
            <TouchableOpacity
              style={[styles.cancelBtn, cancelMutation.isPending && {opacity: 0.6}]}
              onPress={handleCancel}
              disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color={colors.error} />
                  <Text style={styles.cancelBtnText}>Cancel Order</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{height: 32}} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },

  section: {
    backgroundColor: colors.surface,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  orderDate: {fontSize: 12, color: colors.textSecondary, marginBottom: 16},

  // timeline
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timelineItem: {alignItems: 'center', flex: 1},
  timelineDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  timelineDotDone: {backgroundColor: colors.primary, borderColor: colors.primary},
  timelineDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
    transform: [{scale: 1.2}],
  },
  timelineLine: {
    position: 'absolute',
    top: 10, left: '60%', right: '-60%',
    height: 2, backgroundColor: colors.border,
    zIndex: -1,
  },
  timelineLineDone: {backgroundColor: colors.primary},
  timelineLabel: {
    fontSize: 9, fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4, textAlign: 'center',
  },
  timelineLabelActive: {color: colors.primary, fontWeight: '800'},

  // items
  itemRow: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: 12,
  },
  itemImg: {width: 68, height: 68, borderRadius: 8},
  imgPlaceholder: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {flex: 1, paddingLeft: 12},
  itemName: {fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 2},
  itemMeta: {fontSize: 11, color: colors.textSecondary},
  itemPrice: {fontSize: 14, fontWeight: '800', color: colors.primary, marginTop: 4},

  // price
  priceRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  priceLabel: {fontSize: 13, color: colors.textSecondary},
  priceValue: {fontSize: 13, fontWeight: '600', color: colors.text},
  totalRow: {
    borderTopWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    paddingTop: 10,
  },
  totalLabel: {fontSize: 15, fontWeight: '800', color: colors.text},
  totalValue: {fontSize: 16, fontWeight: '900', color: colors.primary},

  // address
  addrLine: {fontSize: 13, color: colors.text, lineHeight: 20},

  // cancel
  cancelSection: {padding: 16},
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: 10,
    paddingVertical: 13,
  },
  cancelBtnText: {fontSize: 14, fontWeight: '700', color: colors.error},

  centered: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12},
  emptyTitle: {fontSize: 17, fontWeight: '700', color: colors.text},
});
