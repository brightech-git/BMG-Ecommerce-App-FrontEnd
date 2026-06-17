import React, { useState } from 'react'
import { View, Text, SafeAreaView, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import SearchBar from '../../components/SearchBar';
import { useSearch } from '../../api/hooks/useSearch';
import { ProductList, toCardItem } from '../../components/ProductCard/ProductCard';

const SearchCategories = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'];

type SearchScreenProps = StackScreenProps<RootStackParamList, 'Search'>;

const Search = ({ navigation }: SearchScreenProps) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    const { query, setQuery, products, recentSearches, loading, loadingMore, hasMore, error, loadMore } = useSearch();
    const [localRecentSearches, setLocalRecentSearches] = useState<string[]>([]);

    // Sync recentSearches from API into local state
    React.useEffect(() => {
        if (recentSearches.length > 0) setLocalRecentSearches(recentSearches);
    }, [recentSearches]);

    const removeRecentItem = (index: number) => {
        setLocalRecentSearches(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllRecent = () => setLocalRecentSearches([]);

    const showResults = query.trim().length > 0;
    const cardItems = products.map(p => toCardItem({ ...p, ImagePath: p.ImagePath ?? undefined }));

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            {!theme.dark && (
                <LinearGradient
                    colors={['#C37B5F', '#F9F5F3']}
                    style={{ width: '100%', height: 230, top: 0, position: 'absolute' }}
                />
            )}
            <View style={[GlobalStyleSheet.container, { flex: 1, paddingBottom: 10 }]}>
                {/* Search Bar */}
                <SearchBar
                    placeholder='Search Best items for You'
                    value={query}
                    onChangeText={setQuery}
                    onBack={() => navigation.goBack()}
                />

                {/* Categories */}
                {!showResults && (
                    <>
                        <View style={{ marginTop: 30, marginBottom: 10 }}>
                            <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title }}>Categories</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {SearchCategories.map((cat, index) => (
                                <View
                                    key={index}
                                    style={[{
                                        shadowColor: 'rgba(195, 123, 95, 0.20)',
                                        shadowOffset: { width: 2, height: 10 },
                                        shadowOpacity: .1,
                                        shadowRadius: 5,
                                    }, Platform.OS === 'ios' && {
                                        backgroundColor: 'rgba(255,255,255,0.70)',
                                        borderRadius: 12,
                                    }]}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={() => navigation.navigate('Products')}
                                        style={{ backgroundColor: colors.card, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingHorizontal: 25 }}
                                    >
                                        <Text style={{ ...FONTS.fontMedium, fontSize: 13, color: colors.title }}>{cat}</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Recent Searches — show only when no query */}
                {!showResults && localRecentSearches.length > 0 && (
                    <View style={{ marginTop: 30 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title }}>Search History</Text>
                            <TouchableOpacity activeOpacity={0.5} onPress={clearAllRecent}>
                                <Text style={{ ...FONTS.fontMedium, fontSize: 12, color: colors.title }}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                        {localRecentSearches.map((item, index) => (
                            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 }}>
                                <TouchableOpacity onPress={() => setQuery(item)}>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>{item}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.5} onPress={() => removeRecentItem(index)}>
                                    <Image
                                        style={{ height: 19, width: 19, resizeMode: 'contain', opacity: 0.5, tintColor: colors.title }}
                                        source={IMAGES.close}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Search Results */}
                {showResults && (
                    <>
                        {loading ? (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                            </View>
                        ) : error ? (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ ...FONTS.fontRegular, color: COLORS.danger }}>{error}</Text>
                            </View>
                        ) : products.length === 0 ? (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>No results found for "{query}"</Text>
                            </View>
                        ) : (
                            <ProductList
                                products={cardItems}
                                defaultMode="grid2"
                                onPress={() => navigation.navigate('ProductDetails')}
                                onEndReached={loadMore}
                                loadingMore={loadingMore}
                            />
                        )}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

export default Search;
