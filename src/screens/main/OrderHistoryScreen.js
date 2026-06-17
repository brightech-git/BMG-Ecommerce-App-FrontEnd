import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useQuery} from '@tanstack/react-query';
import {getOrderHistory} from '../../services/OrderService';
import {useAuth} from '../../context/AuthContext';
import {colors} from '../../theme/theme';

const STATUS_COLORS = {
  placed: '#FF9800',
  confirmed: '#2196F3',
  shipped: '#9C27B0',
  delivered: '#4CAF50',
  cancelled: '#F44336',
  pending: '#FF9800',
};

const statusColor = s =>
  STATUS_COLORS[(s ?? '').toLowerCase()] ?? colors.textSecondary;

const fmt = val => {
  const n = parseFloat(val);
  if (!n) return '—';
  return `₹${n.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
};

const fmtDate = dateStr => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const OrderCard = ({order, onPress}) => {
  const status = order?.orderStatus ?? order?.status ?? 'Placed';
  const total = order?.grandTotal ?? order?.totalAmount ?? order?.amount;
  const orderId = order?.orderId ?? order?.id ?? order?._id;
  const date = order?.createdAt ?? order?.orderDate;
  const itemCount = order?.items?.length ?? order?.itemCount ?? 0;

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.orderTop}>
        <View>
          <Text style={styles.orderIdLabel}>Order #{orderId}</Text>
          <Text style={styles.orderDate}>{fmtDate(date)}</Text>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: `${statusColor(status)}22`}]}>
          <Text style={[styles.statusText, {color: statusColor(status)}]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.orderDivider} />

      <View style={styles.orderBottom}>
        <Text style={styles.itemCountText}>
          {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''}` : 'Items'}
        </Text>
        <Text style={styles.orderTotal}>{fmt(total)}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );
};

const OrderHistoryScreen = ({navigation}) => {
  const {isAuthenticated} = useAuth();

  const {data, isLoading, isError, refetch, isRefetching} = useQuery({
    queryKey: ['orderHistory'],
    queryFn: () => getOrderHistory(),
    enabled: !!isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  const orders = data?.data ?? data?.orders ?? [];

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Order History</Text>
        </View>
        <View style={styles.centered}>
          <Text style={{fontSize: 56, marginBottom: 16}}>📦</Text>
          <Text style={styles.emptyTitle}>Please sign in</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{width: 22}} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={{fontSize: 40, marginBottom: 12}}>😕</Text>
          <Text style={styles.emptyTitle}>Failed to load orders</Text>
          <TouchableOpacity style={styles.btn} onPress={refetch}>
            <Text style={styles.btnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{fontSize: 56, marginBottom: 16}}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>Your orders will appear here</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, i) =>
            item?.orderId ?? item?.id ?? String(i)
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching && !isLoading}
          renderItem={({item}) => (
            <OrderCard
              order={item}
              onPress={() =>
                navigation.navigate('OrderDetail', {
                  orderId: item?.orderId ?? item?.id ?? item?._id,
                  order: item,
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default OrderHistoryScreen;

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

  list: {padding: 16, paddingBottom: 32},

  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
  },
  orderIdLabel: {fontSize: 14, fontWeight: '700', color: colors.text},
  orderDate: {fontSize: 11, color: colors.textSecondary, marginTop: 2},
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {fontSize: 11, fontWeight: '700', textTransform: 'capitalize'},
  orderDivider: {height: 1, backgroundColor: colors.border},
  orderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 4,
  },
  itemCountText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderTotal: {fontSize: 15, fontWeight: '800', color: colors.primary, marginRight: 4},

  centered: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyTitle: {fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6},
  emptySub: {fontSize: 13, color: colors.textSecondary, marginBottom: 24, textAlign: 'center'},
  btn: {
    backgroundColor: colors.primaryMild,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  btnText: {fontSize: 14, fontWeight: '700', color: colors.white},
});
