// /**
//  * GridBannerSection — React Native port of the web GridBanner component.
//  * Styled to match the BMG website.
//  */

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
// } from 'react-native';
// import { resolveImageMeta, parseLinkParams } from '../../utils/imageUtils';
// import { colors, fonts } from '../../theme/theme';

// const { width: SCREEN_W } = Dimensions.get('window');

// // ─────────────────────────────────────────────────────────────────────────────
// // GridImage
// // ─────────────────────────────────────────────────────────────────────────────
// const GridImage = ({ image, width, height, onPress, radius = 10 }) => {
//   const [loaded, setLoaded] = useState(false);
//   const meta = resolveImageMeta(image, true);

//   if (!meta.uri) return null;

//   const hasAction = !!(meta.link || meta.filterId);

//   return (
//     <TouchableOpacity
//       onPress={() => onPress && onPress(meta)}
//       activeOpacity={hasAction ? 0.85 : 1}
//       disabled={!hasAction}>
//       <View
//         style={{
//           width,
//           height,
//           borderRadius: radius,
//           overflow: 'hidden',
//           backgroundColor: colors.cardPrimary,
//         }}>
//         {!loaded && (
//           <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
//             <ActivityIndicator size="small" color={colors.primary} />
//           </View>
//         )}
//         <Image
//           source={{ uri: meta.uri }}
//           style={{ width, height }}
//           resizeMode="cover"
//           onLoad={() => setLoaded(true)}
//         />
//       </View>
//     </TouchableOpacity>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────────────────────────────────────

// const resolveImage = image => {
//   if (typeof image === 'string') {
//     return { url: image, link: null, alt: '', filterId: null };
//   }
//   if (!image || typeof image !== 'object') {
//     return { url: '', link: null, alt: '', filterId: null };
//   }
//   if (image.desktop || image.mobile) {
//     const source = image.mobile || image.desktop;
//     return {
//       url: source?.url || '',
//       link: source?.link || null,
//       alt: image.alt || '',
//       filterId: source?.filterId || image.filterId || null,
//     };
//   }
//   return {
//     url: image.url || '',
//     link: image.link || null,
//     alt: image.alt || '',
//     filterId: image.filterId || null,
//   };
// };

// const frToWidths = (columns, availableWidth) => {
//   const totalFr = columns.reduce((sum, fr) => sum + fr, 0);
//   return columns.map(fr => (fr / totalFr) * availableWidth);
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Main Component
// // ─────────────────────────────────────────────────────────────────────────────
// const GridBannerSection = ({ banner, onBannerPress }) => {
//   const {
//     title,
//     description,
//     images = [],
//     mobileLayout,
//     desktopLayout,
//     gap = true,
//     centered = false,
//     backgroundColor = 'white',
//   } = banner;

//   const layout = mobileLayout || desktopLayout;

//   const handlePress = meta => {
//     if (onBannerPress) onBannerPress(parseLinkParams(meta.link), meta);
//   };

//   if (!layout || !images.length) return null;

//   const { columns = [1, 1] } = layout;

//   const outerPad = gap ? 8 : 0;
//   const innerGap = gap ? 6 : 0;
//   const cornerRadius = gap ? 12 : 0;

//   const availW = SCREEN_W - outerPad * 2;
//   const colWidths = frToWidths(columns, availW - innerGap * (columns.length - 1));
//   const baseRowH = Math.round(Math.min(...colWidths) * 0.75);

//   const numCols = columns.length;
//   const colNextRow = Array(numCols).fill(0);

//   const placed = images.map(image => {
//     const rowSpan = image?.rowSpan || 1;
//     let bestCol = 0;
//     for (let c = 1; c < numCols; c++) {
//       if (colNextRow[c] < colNextRow[bestCol]) bestCol = c;
//     }
//     const rowStart = colNextRow[bestCol];
//     colNextRow[bestCol] = rowStart + rowSpan;
//     return { colIndex: bestCol, rowStart, rowSpan, image };
//   });

//   const totalRows = Math.max(...colNextRow);
//   const grid = Array.from({ length: totalRows }, () => Array(numCols).fill(null));
//   placed.forEach(item => {
//     grid[item.rowStart][item.colIndex] = item;
//   });

//   return (
//     <View style={[styles.section, { backgroundColor }]}>
//       {title ? (
//         <Text style={[styles.sectionTitle, centered && styles.centered]}>
//           {title}
//         </Text>
//       ) : null}

//       {description ? (
//         <Text style={[styles.sectionDesc, centered && styles.centered]}>
//           {description}
//         </Text>
//       ) : null}

//       <View style={{ paddingHorizontal: outerPad }}>
//         {Array.from({ length: totalRows }, (_, rowIdx) => (
//           <View
//             key={rowIdx}
//             style={[styles.row, { gap: innerGap, marginBottom: innerGap }]}>
//             {columns.map((_, colIdx) => {
//               const item = grid[rowIdx][colIdx];

//               if (!item && rowIdx > 0) {
//                 const isSpanned = placed.some(
//                   p =>
//                     p.colIndex === colIdx &&
//                     p.rowStart < rowIdx &&
//                     p.rowStart + p.rowSpan > rowIdx,
//                 );
//                 if (isSpanned) return null;
//               }

//               const cellW = colWidths[colIdx];
//               const rowSpan = item?.rowSpan || 1;
//               const cellH = baseRowH * rowSpan + innerGap * (rowSpan - 1);

//               if (!item) {
//                 return <View key={colIdx} style={{ width: cellW, height: cellH }} />;
//               }

//               const img = resolveImage(item.image);
//               if (!img.url) {
//                 return <View key={colIdx} style={{ width: cellW, height: cellH }} />;
//               }

//               return (
//                 <GridImage
//                   key={colIdx}
//                   image={item.image}
//                   width={cellW}
//                   height={cellH}
//                   onPress={handlePress}
//                   radius={cornerRadius}
//                 />
//               );
//             })}
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// };

// export default GridBannerSection;

// // ─────────────────────────────────────────────────────────────────────────────
// // Styles
// // ─────────────────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   section: { marginVertical: 4, paddingVertical: 2 },

//   sectionTitle: {
//     fontSize: fonts.size.lg,
//     fontWeight: fonts.weight.bold,
//     color: colors.text,
//     paddingHorizontal: 14,
//     paddingTop: 12,
//     paddingBottom: 2,
//   },
//   sectionDesc: {
//     fontSize: 12,
//     color: colors.textSecondary,
//     paddingHorizontal: 14,
//     paddingBottom: 8,
//   },
//   centered: {
//     textAlign: 'center',
//   },

//   row: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },

//   placeholder: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: colors.cardPrimary,
//   },
// });
