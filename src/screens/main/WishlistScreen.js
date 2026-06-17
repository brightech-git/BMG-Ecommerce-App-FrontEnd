import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useFavorites} from '../../hooks/useFavorites';
import {useAuth} from '../../context/AuthContext';
import ProductCard from '../../components/common/ProductCard';
import {colors} from '../../theme/theme';

const {width: SW} = Dimensions.get('window');
const CARD_W = (SW - 32 - 10) / 2;

const WishlistScreen = ({navigation}) => {
  const {favorites, isLoading} = useFavorites();
  const {isAuthenticated} = useAuth();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={{fontSize: 56, marginBottom: 16}}>❤️</Text>
          <Text style={styles.emptyTitle}>Please log in</Text>
          <Text style={styles.emptySub}>Sign in to view your wishlist</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.actionBtnText}>Sign In</Text>
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
        <Text style={styles.headerTitle}>Wishlist</Text>
        <Text style={styles.countText}>
          {isLoading ? '' : `${favorites.length} items`}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={{fontSize: 56, marginBottom: 16}}>💛</Text>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySub}>
            Tap the heart icon on any product to save it here
          </Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.actionBtnText}>Browse Collection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, i) =>
            item?.TAGKEY ? String(item.TAGKEY) : `w-${i}`
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <ProductCard
              item={item}
              cardWidth={CARD_W}
              onPress={p =>
                navigation.navigate('ProductDetail', {
                  tagKey: p.TAGKEY,
                  itemName: p.ITEMNAME,
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default WishlistScreen;

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
  countText: {fontSize: 12, color: colors.primaryLight, minWidth: 48, textAlign: 'right'},

  loadingWrap: {flex: 1, alignItems: 'center', justifyContent: 'center'},

  list: {padding: 16, paddingBottom: 32},
  row: {justifyContent: 'space-between'},

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionBtn: {
    backgroundColor: colors.primaryMild,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  actionBtnText: {fontSize: 14, fontWeight: '700', color: colors.white},
});
