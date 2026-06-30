import React, { useState, useEffect, useRef } from 'react';
import { IMAGE_BASE_URL } from '@env';
import { SmartImage, FALLBACK_IMAGE } from '../common/SmartImage';
import { useTheme } from '../../context/ThemeContext';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

export type ViewMode = 'list' | 'grid2';

export interface ProductCardItem {
  id: string;
  name: string;
  subName: string;
  price: string;
  originalPrice?: string;
  offerPercent?: string;
  /** Pass ALL image URLs — they loop automatically */
  images?: string[];
}

/** Helper: map raw API response → ProductCardItem */
export function toCardItem(raw: {
  TAGKEY: string;
  ITEMNAME: string;
  SUBITEMNAME: string;
  FinalAmount: string;
  OriginalAmount?: string;
  OfferPercentage?: string;
  ImagePath?: string;
}): ProductCardItem {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(raw.ImagePath ?? '[]');
    const paths = Array.isArray(parsed) ? parsed : [];
    images = paths.map((p: string) => `${IMAGE_BASE_URL}${p}`);
  } catch {
    images = [];
  }
  return {
    id: raw.TAGKEY,
    name: raw.ITEMNAME,
    subName: raw.SUBITEMNAME,
    price: raw.FinalAmount,
    originalPrice: raw.OriginalAmount,
    offerPercent: raw.OfferPercentage,
    images,
  };
}

// ─── Auto Image Carousel ──────────────────────────────────────────────────────

interface CarouselProps {
  images: string[];
  width: number;
  height: number;
  /** Auto-advance interval in ms (default 2500) */
  interval?: number;
}

const ImageCarousel: React.FC<CarouselProps> = ({
  images,
  width,
  height,
  interval = 2500,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const validImages = images.filter(Boolean);
  const count = validImages.length;

  // Auto-advance
  useEffect(() => {
    if (count <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % count;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, width, interval]);

  // Sync dot on manual swipe
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
      // Reset timer on manual swipe
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveIndex(prev => {
          const next = (prev + 1) % count;
          scrollRef.current?.scrollTo({ x: next * width, animated: true });
          return next;
        });
      }, interval);
    }
  };

  if (count === 0) {
    return <Image source={FALLBACK_IMAGE} style={{ width, height }} resizeMode="cover" />;
  }

  return (
    <View style={{ width, height }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        style={{ width, height }}
      >
        {validImages.map((uri, i) => (
          <SmartImage key={i} uri={uri} style={{ width, height }} />
        ))}
      </ScrollView>

      {/* Dot indicators */}
      {count > 1 && (
        <View style={s.dots}>
          {validImages.map((_, i) => (
            <View
              key={i}
              style={[s.dot, i === activeIndex && s.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Offer Badge ──────────────────────────────────────────────────────────────

const OfferBadge = ({ percent }: { percent?: string }) => {
  if (!percent || percent === '0') return null;
  return (
    <View style={s.badge}>
      <Text style={s.badgeText}>{percent}% OFF</Text>
    </View>
  );
};

// ─── List Card ────────────────────────────────────────────────────────────────

const LIST_IMG_W = 120;
const LIST_IMG_H = 130;

const ListCard = ({
  item,
  onPress,
  C,
}: {
  item: ProductCardItem;
  onPress?: (item: ProductCardItem) => void;
  C: any;
}) => (
  <TouchableOpacity
    style={[s.listCard, { backgroundColor: C.card }]}
    activeOpacity={0.82}
    onPress={() => onPress?.(item)}
  >
    {/* Carousel on the left */}
    <View style={{ width: LIST_IMG_W, height: LIST_IMG_H }}>
      <ImageCarousel
        images={item.images ?? []}
        width={LIST_IMG_W}
        height={LIST_IMG_H}
        interval={2500}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <OfferBadge percent={item.offerPercent} />
      </View>
    </View>

    {/* Info */}
    <View style={s.listBody}>
      <Text style={[s.name, { color: C.title }]} numberOfLines={2}>{item.name}</Text>
      <Text style={s.subName} numberOfLines={1}>{item.subName}</Text>
      <View style={s.priceRow}>
        <Text style={[s.price, { color: C.title }]}>₹{item.price}</Text>
        {item.originalPrice && (
          <Text style={[s.origPrice, { color: C.textLight }]}>₹{item.originalPrice}</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Grid Card ────────────────────────────────────────────────────────────────

const GridCard = ({
  item,
  cardWidth,
  onPress,
  C,
}: {
  item: ProductCardItem;
  cardWidth: number;
  onPress?: (item: ProductCardItem) => void;
  C: any;
}) => {
  const imgH = cardWidth * 1.1;

  return (
    <TouchableOpacity
      style={[s.gridCard, { width: cardWidth, backgroundColor: C.card }]}
      activeOpacity={0.82}
      onPress={() => onPress?.(item)}
    >
      {/* Carousel fills card top */}
      <View style={{ width: cardWidth, height: imgH }}>
        <ImageCarousel
          images={item.images ?? []}
          width={cardWidth}
          height={imgH}
          interval={2500}
        />
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <OfferBadge percent={item.offerPercent} />
        </View>
      </View>

      {/* Info below */}
      <View style={s.gridBody}>
        <Text style={[s.name, { color: C.title }]} numberOfLines={2}>{item.name}</Text>
        <Text style={s.subName} numberOfLines={1}>{item.subName}</Text>
        <Text style={[s.price, { color: C.title }]}>₹{item.price}</Text>
        {item.originalPrice && (
          <Text style={[s.origPrice, { color: C.textLight }]}>₹{item.originalPrice}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── ProductList ──────────────────────────────────────────────────────────────

interface ProductListProps {
  products: ProductCardItem[];
  mode?: ViewMode;
  onPress?: (item: ProductCardItem) => void;
  onEndReached?: () => void;
  loadingMore?: boolean;
  contentContainerStyle?: object;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  mode = 'grid2',
  onPress,
  onEndReached,
  loadingMore = false,
  contentContainerStyle,
}) => {
  const { colors: C } = useTheme();
  const PAD = 12;
  const GAP = 10;
  const col2W = (SCREEN_WIDTH - PAD * 2 - GAP) / 2;

  const numCols = mode === 'list' ? 1 : 2;
  const cardW   = col2W;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <FlatList
        key={`mode-${mode}`}
        data={products}
        keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : String(index)}
        numColumns={numCols}
        contentContainerStyle={{
          paddingHorizontal: mode === 'list' ? 0 : PAD,
          paddingBottom: 32,
          paddingTop: 8,
          ...contentContainerStyle,
        }}
        columnWrapperStyle={
          numCols > 1 ? { gap: GAP, marginBottom: GAP } : undefined
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="small" color={GOLD} style={{ marginVertical: 15 }} /> : null
        }
        renderItem={({ item }) =>
          mode === 'list' ? (
            <ListCard item={item} onPress={onPress} C={C} />
          ) : (
            <GridCard item={item} cardWidth={cardW} onPress={onPress} C={C} />
          )
        }
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const GOLD  = '#B8872B';
const DARK  = '#1A1208';
const MUTED = '#8A7A65';
const RED   = '#D64933';
const WHITE = '#FFFFFF';

const s = StyleSheet.create({
  // Placeholder
  placeholder: {
    backgroundColor: '#EDE8DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTxt: { color: MUTED, fontSize: 12 },

  // Dots
  dots: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    backgroundColor: WHITE,
    width: 14,
  },

  // Badge
  badge: {
    position: 'absolute',
    top: 7,
    left: 7,
    backgroundColor: RED,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeText: { color: WHITE, fontSize: 10, fontWeight: '700' },

  // List card
  listCard: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  listBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },

  // Grid card
  gridCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  gridBody: { padding: 9, gap: 3 },

  // Shared text
  name:      { fontSize: 13, fontWeight: '800', color: DARK, lineHeight: 17 },
  subName:   { fontSize: 11, fontWeight: '600', color: GOLD },
  priceRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  price:     { fontSize: 15, fontWeight: '800', color: DARK },
  origPrice: { fontSize: 12, color: MUTED, textDecorationLine: 'line-through' },
});

// ─── Usage ────────────────────────────────────────────────────────────────────
//
//  import { ProductList, toCardItem } from './ProductCard';
//
//  const items = rawProducts.map(toCardItem);   // maps all images automatically
//
//  <ProductList
//    products={items}
//    defaultMode="grid2"
//    onPress={(item) => navigation.navigate('Detail', { id: item.id })}
//  />
//
//  — All images in ImagePath will loop automatically every 2.5s
//  — User can also swipe manually, timer resets on swipe
