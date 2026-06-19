// app/Screens/Notification/Notification.tsx
// Website page: Notifications (NotificationService).
// Data: GET /notification  (auth-gated, token required).
// Converts website notification list into a swipeable FlatList.
// Files created: this file (replaces old template).
// Files modified: none (hook/service already exist).
// Navigation: already registered as "Notification" in StackNavigator.
// API: MISC.NOTIFICATION_LIST via useNotifications() hook.
// States: loading (Loader), empty (EmptyState), error (ErrorState), unauth (sign-in prompt).
// NOTE: root App.tsx provides SafeAreaView — use a plain View container.
import React, { useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  StatusBar, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useNotifications } from '../../api/hooks/useNotifications';
import { useAuthToken } from '../../api/hooks/useAuthToken';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';

type Nav = StackNavigationProp<RootStackParamList>;

// Resolve notification label/message/date from various backend shapes
const resolveNotif = (n: any) => ({
  id:      n.id ?? n._id ?? n.notificationId ?? Math.random(),
  title:   n.title ?? n.subject ?? n.heading ?? 'Notification',
  message: n.message ?? n.body ?? n.description ?? n.content ?? '',
  date:    n.createdAt ?? n.date ?? n.sentAt ?? '',
  read:    n.isRead ?? n.read ?? false,
});

const formatDate = (raw: string): string => {
  if (!raw) return '';
  try {
    const d = new Date(raw);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(raw).slice(0, 10);
  }
};

const NotifItem = ({ item }: { item: ReturnType<typeof resolveNotif> }) => (
  <View style={[styles.card, !item.read && styles.cardUnread]}>
    <View style={[styles.iconWrap, !item.read && styles.iconWrapActive]}>
      <Feather name="bell" size={18} color={item.read ? COLORS.textLight : COLORS.primary} />
    </View>
    <View style={styles.cardBody}>
      <View style={styles.cardTop}>
        <Text style={[styles.cardTitle, !item.read && styles.cardTitleBold]} numberOfLines={1}>
          {item.title}
        </Text>
        {!!item.date && <Text style={styles.cardDate}>{formatDate(item.date)}</Text>}
      </View>
      {!!item.message && (
        <Text style={styles.cardMsg} numberOfLines={2}>{item.message}</Text>
      )}
    </View>
    {!item.read && <View style={styles.unreadDot} />}
  </View>
);

const Notification = () => {
  const navigation = useNavigation<Nav>();
  const token = useAuthToken();
  const { notifications, isLoading, isError, error, refetch, isRefetching } = useNotifications();

  const items = useMemo(() => notifications.map(resolveNotif), [notifications]);

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  const Header = (
    <View style={styles.header}>
      {navigation.canGoBack() && (
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
      )}
      <Text style={styles.hTitle}>
        Notifications{items.length > 0 ? ` (${items.length})` : ''}
      </Text>
      <View style={styles.hBtn} />
    </View>
  );

  if (!token) {
    return (
      <View style={styles.safe}>
        {Header}
        <EmptyState
          icon="bell"
          title="Sign in to see notifications"
          subtitle="Your personalised alerts and updates will appear here."
          ctaLabel="Sign In"
          onCta={() => navigation.navigate('SignIn')}
        />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      {Header}

      {isLoading ? (
        <Loader message="Loading notifications..." />
      ) : isError ? (
        <ErrorState message={(error as any)?.message} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="bell-off"
          title="No notifications yet"
          subtitle="We'll let you know about orders, offers, and updates here."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => <NotifItem item={item} />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  list: { paddingVertical: 12, paddingHorizontal: SIZES.padding },
  sep: { height: 10 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: COLORS.white, borderRadius: 14, padding: 14,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    borderWidth: 1, borderColor: COLORS.borderColor,
  },
  cardUnread: {
    borderColor: COLORS.primary + '44',
    backgroundColor: COLORS.primaryLight,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.input,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapActive: { backgroundColor: COLORS.primary + '18' },
  cardBody: { flex: 1 },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 8,
  },
  cardTitle: {
    flex: 1, ...FONTS.fontSm, color: COLORS.title,
  },
  cardTitleBold: { ...FONTS.fontSemiBold },
  cardDate: { ...FONTS.fontXs, color: COLORS.textLight, flexShrink: 0 },
  cardMsg: { ...FONTS.fontXs, color: COLORS.text, marginTop: 4, lineHeight: 17 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primary, marginTop: 5, flexShrink: 0,
  },
});

export default Notification;
