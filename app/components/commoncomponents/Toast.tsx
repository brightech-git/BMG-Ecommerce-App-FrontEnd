import React, {
  createContext, useContext, useRef, useCallback,
  useState, useEffect,
} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Platform, StatusBar,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ── Types ────────────────────────────────────────────────────────
export type ToastType     = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type ToastSize     = 'sm' | 'md' | 'lg';

export type ToastOptions = {
  duration?: number;
  position?: ToastPosition;
  size?: ToastSize;
  message?: string;
  iconName?: string;
  closable?: boolean;
  action?: { label: string; onPress: () => void };
  onDismiss?: () => void;
};

type ToastItem = ToastOptions & { id: string; title: string; type: ToastType; };

type ToastContextType = {
  show:       (title: string, type: ToastType, options?: ToastOptions) => string;
  success:    (title: string, options?: ToastOptions) => string;
  error:      (title: string, options?: ToastOptions) => string;
  warning:    (title: string, options?: ToastOptions) => string;
  info:       (title: string, options?: ToastOptions) => string;
  loading:    (title: string, options?: ToastOptions) => string;
  dismiss:    (id: string) => void;
  dismissAll: () => void;
};

// ── Type config ──────────────────────────────────────────────────
const TYPE_CFG: Record<ToastType, { icon: string; bg: string; accent: string; textColor: string }> = {
  success: { icon: 'checkmark-circle',   bg: '#0F2A14', accent: COLORS.success, textColor: '#B8ECA0' },
  error:   { icon: 'close-circle',       bg: '#2A0F0F', accent: COLORS.danger,  textColor: '#F9B8B8' },
  warning: { icon: 'warning',            bg: '#2A1E0A', accent: COLORS.warning, textColor: '#FFD39A' },
  info:    { icon: 'information-circle', bg: '#0D1F35', accent: COLORS.info,    textColor: '#B8D4F9' },
  loading: { icon: 'sync-circle',        bg: '#0F1117', accent: COLORS.primary, textColor: '#FFD4A8' },
};

// ── Spinner ──────────────────────────────────────────────────────
function SpinIcon({ color, size }: { color: string; size: number }) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(rot, { toValue: 1, duration: 900, useNativeDriver: true })).start();
  }, []);
  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Ionicons name="sync-outline" size={size} color={color} />
    </Animated.View>
  );
}

// ── Toast Card ───────────────────────────────────────────────────
function ToastCard({ item, onDismiss, position, size }: {
  item: ToastItem; onDismiss: () => void; position: ToastPosition; size: ToastSize;
}) {
  const cfg = TYPE_CFG[item.type];
  const translateY = useRef(new Animated.Value(position.includes('bottom') ? 60 : -60)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.88)).current;
  const progress   = useRef(new Animated.Value(1)).current;
  const duration   = item.duration ?? 3500;

  const iconSizes: Record<ToastSize, number> = { sm: 18, md: 22, lg: 28 };
  const fontSizes: Record<ToastSize, number> = { sm: 12, md: 13, lg: 15 };
  const paddings:  Record<ToastSize, number> = { sm: 10, md: 13, lg: 16 };
  const iSize = iconSizes[size];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
      Animated.timing(opacity,    { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(scale,      { toValue: 1, useNativeDriver: true, damping: 16 }),
    ]).start();

    if (duration > 0 && item.type !== 'loading') {
      Animated.timing(progress, { toValue: 0, duration, useNativeDriver: false }).start();
    }
  }, []);

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.spring(scale,      { toValue: 0.88, useNativeDriver: true, damping: 20 }),
      Animated.timing(translateY, { toValue: position.includes('bottom') ? 40 : -40, duration: 200, useNativeDriver: true }),
    ]).start(() => { onDismiss(); item.onDismiss?.(); });
  }, []);

  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={[
      styles.card,
      {
        backgroundColor: cfg.bg,
        borderColor: cfg.accent + '40',
        padding: paddings[size],
        transform: [{ translateY }, { scale }],
        opacity,
        alignSelf: position.includes('right') ? 'flex-end' : position.includes('left') ? 'flex-start' : 'center',
      },
    ]}>
      <View style={[styles.accentBar, { backgroundColor: cfg.accent }]} />
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: cfg.accent + '22', width: iSize + 12, height: iSize + 12, borderRadius: (iSize + 12) / 2 }]}>
          {item.type === 'loading'
            ? <SpinIcon color={cfg.accent} size={iSize} />
            : <Ionicons name={(item.iconName ?? cfg.icon) as any} size={iSize} color={cfg.accent} />}
        </View>
        <View style={styles.textBlock}>
          <Text style={[FONTS.fontSemiBold, { fontSize: fontSizes[size], color: cfg.textColor }]} numberOfLines={2}>
            {item.title}
          </Text>
          {!!item.message && (
            <Text style={[FONTS.fontRegular, { fontSize: fontSizes[size] - 1, color: cfg.textColor + 'BB', marginTop: 2 }]} numberOfLines={2}>
              {item.message}
            </Text>
          )}
          {item.action && (
            <TouchableOpacity
              onPress={() => { item.action!.onPress(); handleDismiss(); }}
              style={[styles.actionBtn, { borderColor: cfg.accent + '60' }]}
            >
              <Text style={[FONTS.fontSemiBold, { fontSize: fontSizes[size] - 1, color: cfg.accent }]}>
                {item.action.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {(item.closable ?? true) && (
          <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={14} color={cfg.textColor + '99'} />
          </TouchableOpacity>
        )}
      </View>
      {duration > 0 && item.type !== 'loading' && (
        <View style={[styles.progressTrack, { backgroundColor: cfg.accent + '22' }]}>
          <Animated.View style={[styles.progressBar, { width: progressWidth, backgroundColor: cfg.accent }]} />
        </View>
      )}
    </Animated.View>
  );
}

// ── Position style ───────────────────────────────────────────────
const STATUS_H = StatusBar.currentHeight ?? (Platform.OS === 'ios' ? 44 : 0);
const POSITIONS: ToastPosition[] = ['top', 'top-left', 'top-right', 'bottom', 'bottom-left', 'bottom-right'];

function positionStyle(pos: ToastPosition) {
  const base: any = { position: 'absolute', zIndex: 9999, left: 0, right: 0 };
  if (pos === 'top')          return { ...base, top: STATUS_H + 12, alignItems: 'center' };
  if (pos === 'top-left')     return { ...base, top: STATUS_H + 12, left: 16, right: undefined };
  if (pos === 'top-right')    return { ...base, top: STATUS_H + 12, right: 16, left: undefined };
  if (pos === 'bottom')       return { ...base, bottom: 90, alignItems: 'center' };
  if (pos === 'bottom-left')  return { ...base, bottom: 90, left: 16, right: undefined };
  if (pos === 'bottom-right') return { ...base, bottom: 90, right: 16, left: undefined };
  return base;
}

// ── Context ──────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  }, []);

  const show = useCallback((title: string, type: ToastType, options: ToastOptions = {}): string => {
    const id  = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const dur = options.duration ?? (type === 'loading' ? 0 : 3500);
    setToasts(prev => [...prev, { id, title, type, duration: dur, ...options }]);
    if (dur > 0) timers.current[id] = setTimeout(() => dismiss(id), dur + 300);
    return id;
  }, [dismiss]);

  const api: ToastContextType = {
    show,
    success: (t, o) => show(t, 'success', o),
    error:   (t, o) => show(t, 'error',   o),
    warning: (t, o) => show(t, 'warning', o),
    info:    (t, o) => show(t, 'info',    o),
    loading: (t, o) => show(t, 'loading', { duration: 0, closable: false, ...o }),
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {POSITIONS.map(pos => {
        const group = toasts.filter(t => (t.position ?? 'top') === pos);
        if (!group.length) return null;
        return (
          <View key={pos} style={positionStyle(pos)} pointerEvents="box-none">
            <View style={{ gap: 8 }} pointerEvents="box-none">
              {group.map(item => (
                <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} position={pos} size={item.size ?? 'md'} />
              ))}
            </View>
          </View>
        );
      })}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1, overflow: 'hidden',
    minWidth: Math.min(width * 0.9, 360),
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 10,
  },
  accentBar:     { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3.5 },
  row:           { flexDirection: 'row', alignItems: 'center', paddingLeft: 10, gap: 10 },
  iconWrap:      { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  textBlock:     { flex: 1 },
  actionBtn:     { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  closeBtn:      { padding: 4, alignSelf: 'flex-start' },
  progressTrack: { height: 2.5, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressBar:   { height: '100%', borderRadius: 2 },
});

export default ToastProvider;
