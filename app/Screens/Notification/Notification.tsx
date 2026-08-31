// app/Screens/Notification/Notification.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  StatusBar, RefreshControl, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '../../api/hooks/useNotifications';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';
import { setPendingAuthRedirect } from '../../utils/authRedirect';

type Nav = StackNavigationProp<RootStackParamList>;

/* ─── Helpers ───────────────────────────────────────────────────── */
const resolve = (n: any) => ({
  id:      Number(n.id ?? n.notificationId ?? n._id ?? 0),
  title:   n.title ?? n.subject ?? n.heading ?? 'Notification',
  message: n.message ?? n.body ?? n.description ?? n.content ?? '',
  date:    n.createdAt ?? n.sentAt ?? n.date ?? '',
  read:    !!(n.isRead ?? n.read ?? false),
  type:    n.type ?? n.notificationType ?? 'general',
});

const fmtDate = (raw: string) => {
  if (!raw) return '';
  try {
    const d = new Date(raw);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60)           return 'just now';
    if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 7)    return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return ''; }
};

const typeIcon = (type: string): any => {
  if (type.includes('order'))   return 'shopping-bag';
  if (type.includes('offer') || type.includes('discount')) return 'tag';
  if (type.includes('deliver')) return 'truck';
  if (type.includes('payment')) return 'credit-card';
  return 'bell';
};

/* ─── Notification card ─────────────────────────────────────────── */
type Item = ReturnType<typeof resolve>;
type CardProps = {
  item: Item;
  onTap: (id: number) => void;
  onDelete: (id: number) => void;
  C: any;
};

const NotifCard = ({ item, onTap, onDelete, C }: CardProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => !item.read && onTap(item.id)}
    style={[
      card.wrap,
      { backgroundColor: C.card, borderColor: item.read ? C.borderColor : C.primary + '44' },
      !item.read && { backgroundColor: C.primaryLight },
    ]}
  >
    {/* Icon */}
    <View style={[card.iconWrap, { backgroundColor: item.read ? C.input : C.primary + '18' }]}>
      <Feather name={typeIcon(item.type)} size={18} color={item.read ? C.textLight : C.primary} />
    </View>

    {/* Body */}
    <View style={card.body}>
      <View style={card.top}>
        <Text
          style={[card.title, { color: C.title }, !item.read && { ...FONTS.fontSemiBold }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={[card.date, { color: C.textLight }]}>{fmtDate(item.date)}</Text>
      </View>
      {!!item.message && (
        <Text style={[card.msg, { color: C.text }]} numberOfLines={2}>{item.message}</Text>
      )}
      {!item.read && (
        <Text style={[card.tapHint, { color: C.primary }]}>Tap to mark as read</Text>
      )}
    </View>

    {/* Right: unread dot + delete */}
    <View style={card.right}>
      {!item.read && (
        <View style={[card.dot, { backgroundColor: C.primary }]} />
      )}
      <TouchableOpacity
        style={[card.deleteBtn, { backgroundColor: C.danger + '15' }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => onDelete(item.id)}
      >
        <Feather name="trash-2" size={14} color={C.danger} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const card = StyleSheet.create({
  wrap:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  iconWrap:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  body:      { flex: 1 },
  top:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title:     { flex: 1, ...FONTS.fontSm },
  date:      { ...FONTS.fontXs, flexShrink: 0 },
  msg:       { ...FONTS.fontXs, marginTop: 4, lineHeight: 17 },
  tapHint:   { ...FONTS.fontXs, marginTop: 4, fontStyle: 'italic' },
  right:     { alignItems: 'center', gap: 8, flexShrink: 0 },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});

/* ─── Screen ────────────────────────────────────────────────────── */
const Notification = () => {
  const navigation = useNavigation<Nav>();
  const { colors: C } = useTheme();
  const userId: number | undefined = useSelector((s: any) => s.auth?.user?.id);

  const { notifications, isLoading, isError, error, refetch, isRefetching } = useNotifications(userId);
  const { mutate: markRead }    = useMarkRead(userId);
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead(userId);
  const { mutate: deleteOne }   = useDeleteNotification(userId);
  const { mutate: deleteAll, isPending: deletingAll }  = useDeleteAllNotifications(userId);

  const items = useMemo(() => notifications.map(resolve), [notifications]);
  const unreadCount = useMemo(() => items.filter(i => !i.read).length, [items]);

  const handleDelete = useCallback((id: number) => {
    Alert.alert('Delete', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteOne(id) },
    ]);
  }, [deleteOne]);

  const handleDeleteAll = useCallback(() => {
    Alert.alert('Clear All', 'Remove all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => deleteAll() },
    ]);
  }, [deleteAll]);

  /* Unauthenticated */
  if (!userId) {
    return (
      <View style={[styles.safe, { backgroundColor: C.background }]}>
        <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />
        <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
          {navigation.canGoBack() && (
            <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={22} color={C.title} />
            </TouchableOpacity>
          )}
          <Text style={[styles.hTitle, { color: C.title }]}>Notifications</Text>
          <View style={styles.hBtn} />
        </View>
        <EmptyState
          icon="bell"
          title="Sign in to see notifications"
          subtitle="Your personalised alerts and updates will appear here."
          ctaLabel="Sign In"
          onCta={() => {
            setPendingAuthRedirect({ screen: 'Notification' });
            navigation.navigate('SignIn');
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />

      {/* ── Header ────────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        {navigation.canGoBack() && (
          <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={C.title} />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }}>
          <Text style={[styles.hTitle, { color: C.title }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.hSub, { color: C.primary }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.hAction, { backgroundColor: C.primaryLight }]}
            onPress={() => markAllRead()}
            disabled={markingAll}
          >
            <Feather name="check-circle" size={14} color={C.primary} />
            <Text style={[styles.hActionTxt, { color: C.primary }]}>Read all</Text>
          </TouchableOpacity>
        )}

        {/* Delete all */}
        {items.length > 0 && (
          <TouchableOpacity
            style={[styles.hAction, { backgroundColor: C.danger + '15' }]}
            onPress={handleDeleteAll}
            disabled={deletingAll}
          >
            <Feather name="trash-2" size={14} color={C.danger} />
            <Text style={[styles.hActionTxt, { color: C.danger }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Content ───────────────────────────────────────────────── */}
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
          keyExtractor={it => String(it.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />
          }
          renderItem={({ item }) => (
            <NotifCard
              item={item}
              onTap={id => markRead(id)}
              onDelete={handleDelete}
              C={C}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe:       { flex: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  hBtn:       { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle:     { ...FONTS.h5, ...FONTS.fontSemiBold },
  hSub:       { ...FONTS.fontXs },
  hAction:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  hActionTxt: { ...FONTS.fontXs, fontWeight: '700' },
  list:       { paddingVertical: 12, paddingHorizontal: SIZES.padding, paddingBottom: 100 },
});

export default Notification;
