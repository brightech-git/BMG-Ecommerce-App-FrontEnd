// app/components/order/OrderInvoiceCard.tsx
// Receipt-style invoice card — built entirely from local data, no invoice API.
// Mirrors the web OrderDetails.jsx "Order Summary" section.
import React from 'react';
import {
  View, Text, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

/* ── helpers ── */
const fmt = (v: any) => {
  const n = parseFloat(String(v ?? '0').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

const fmtCurrency = (v: any) =>
  `₹${fmt(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (raw: any) => {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return String(raw).slice(0, 10); }
};

/* ── Payment status badge colours ── */
const payStatusStyle = (s = '') => {
  const u = s.toUpperCase();
  if (u === 'PAID' || u === 'SUCCESS' || u === 'CAPTURED')
    return { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' };
  if (u === 'FAILED' || u === 'DECLINED')
    return { bg: '#FEF2F2', text: '#991B1B', border: '#FCA5A5' };
  return { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' };
};

/* ── Divider ── */
const Dashes = () => <View style={styles.dashes} />;

/* ── Props ── */
export interface InvoiceItem {
  id?: any;
  productName?: string;
  product_name?: string;
  name?: string;
  tagno?: string;
  tagNo?: string;
  sno?: string;
  quantity?: number;
  price?: number;
  totalAmount?: number;
  shippingFee?: number;
  image_path?: string;
}

export interface OrderInvoiceCardProps {
  orderId: string;
  orderDate?: string | null;
  items: InvoiceItem[];
  paymentMode?: string | null;
  paymentStatus?: string | null;
  transactionId?: string | null;
  paidOn?: string | null;
  discountAmt?: number;
  companyName?: string;
}

/* ════════════════════════════════════════════════════════════════ */
const OrderInvoiceCard: React.FC<OrderInvoiceCardProps> = ({
  orderId,
  orderDate,
  items,
  paymentMode,
  paymentStatus,
  transactionId,
  paidOn,
  discountAmt = 0,
  companyName = 'BMG JEWELLERS',
}) => {
  /* compute totals from items */
  const itemSubtotal = items.reduce((s, it) => s + fmt(it.price ?? it.totalAmount ?? 0), 0);
  const shippingFee  = fmt(items[0]?.shippingFee ?? 0);
  const grandTotal   = itemSubtotal - discountAmt + shippingFee;

  const ps = payStatusStyle(paymentStatus ?? '');

  const modeLabel =
    !paymentMode ? 'N/A'
    : paymentMode.toUpperCase() === 'COD' || paymentMode.toUpperCase() === 'CASH'
      ? 'Cash on Delivery'
      : paymentMode;

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconBox}>
          <Feather name="file-text" size={16} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.invoiceLabel}>ORDER INVOICE</Text>
        </View>
      </View>

      <Dashes />

      {/* ── Order meta ── */}
      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={styles.metaKey}>Order ID</Text>
          <Text style={styles.metaVal} numberOfLines={1}>#{orderId}</Text>
        </View>
        {!!orderDate && (
          <View style={[styles.metaCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.metaKey}>Date</Text>
            <Text style={styles.metaVal}>{fmtDate(orderDate)}</Text>
          </View>
        )}
      </View>

      <Dashes />

      {/* ── Items ── */}
      <Text style={styles.sectionLabel}>ITEMS</Text>
      {items.map((it, i) => {
        const name  = it.productName ?? it.product_name ?? it.name ?? 'Item';
        const qty   = it.quantity ?? 1;
        const price = fmt(it.price ?? it.totalAmount ?? 0);
        const tag   = it.tagno ?? it.tagNo;
        return (
          <View key={it.id ?? i} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
              {!!tag && <Text style={styles.itemSub}>Tag: {tag}{it.sno ? `  ·  SKU: ${it.sno}` : ''}</Text>}
              <Text style={styles.itemSub}>Qty: {qty}</Text>
            </View>
            <Text style={styles.itemPrice}>{fmtCurrency(price)}</Text>
          </View>
        );
      })}

      <Dashes />

      {/* ── Subtotal & shipping ── */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryKey}>Subtotal</Text>
        <Text style={styles.summaryVal}>{fmtCurrency(itemSubtotal)}</Text>
      </View>
      {discountAmt > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Discount</Text>
          <Text style={[styles.summaryVal, { color: '#16a34a' }]}>− {fmtCurrency(discountAmt)}</Text>
        </View>
      )}
      <View style={styles.summaryRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Feather name="truck" size={11} color={COLORS.textLight} />
          <Text style={styles.summaryKey}>Shipping</Text>
        </View>
        <Text style={[styles.summaryVal, shippingFee === 0 && { color: '#16a34a' }]}>
          {shippingFee === 0 ? 'FREE' : fmtCurrency(shippingFee)}
        </Text>
      </View>

      {/* ── Payment ── */}
      {!!paymentMode && (
        <View style={styles.summaryRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Feather name="credit-card" size={11} color={COLORS.textLight} />
            <Text style={styles.summaryKey}>Payment</Text>
          </View>
          <Text style={styles.summaryVal}>{modeLabel}</Text>
        </View>
      )}
      {!!paymentStatus && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Pay Status</Text>
          <View style={[styles.payBadge, { backgroundColor: ps.bg, borderColor: ps.border }]}>
            <Text style={[styles.payBadgeTxt, { color: ps.text }]}>
              {paymentStatus.toUpperCase()}
            </Text>
          </View>
        </View>
      )}
      {!!transactionId && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Txn ID</Text>
          <Text style={[styles.summaryVal, { fontSize: 10 }]} numberOfLines={1}>{transactionId}</Text>
        </View>
      )}
      {!!paidOn && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Paid On</Text>
          <Text style={styles.summaryVal}>{fmtDate(paidOn)}</Text>
        </View>
      )}

      <Dashes />

      {/* ── Grand Total ── */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL PAID</Text>
        <Text style={styles.totalAmt}>{fmtCurrency(grandTotal)}</Text>
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Feather name="check-circle" size={12} color={COLORS.primary} />
        <Text style={styles.footerTxt}>Thank you for shopping with {companyName}!</Text>
      </View>
    </View>
  );
};

/* ── Styles ── */
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },

  /* header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primary + '0D',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '20',
  },
  headerIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  companyName: {
    ...FONTS.fontSm, ...FONTS.fontBold,
    color: COLORS.title, letterSpacing: 0.5,
  },
  invoiceLabel: {
    fontSize: 9, letterSpacing: 2,
    color: COLORS.primary, ...FONTS.fontSemiBold,
    marginTop: 1,
  },

  /* dashes */
  dashes: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    borderStyle: 'dashed',
    marginHorizontal: 16,
    marginVertical: 10,
  },

  /* meta */
  metaRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  metaCol:  {},
  metaKey:  { ...FONTS.fontXs, color: COLORS.textLight, marginBottom: 2 },
  metaVal:  { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title },

  /* section label */
  sectionLabel: {
    fontSize: 9, letterSpacing: 1.5, color: COLORS.textLight,
    ...FONTS.fontSemiBold, paddingHorizontal: 16, marginBottom: 6,
  },

  /* items */
  itemRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 7, gap: 8,
  },
  itemName: { ...FONTS.fontSm, ...FONTS.fontMedium, color: COLORS.title, lineHeight: 17 },
  itemSub:  { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 2 },
  itemPrice:{ ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, minWidth: 76, textAlign: 'right' },

  /* summary rows */
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 5,
  },
  summaryKey: { ...FONTS.fontSm, color: COLORS.textLight },
  summaryVal: { ...FONTS.fontSm, ...FONTS.fontMedium, color: COLORS.title },

  /* pay badge */
  payBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1,
  },
  payBadgeTxt: { fontSize: 10, ...FONTS.fontSemiBold },

  /* total */
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.primary + '08',
  },
  totalLabel: {
    fontSize: 11, letterSpacing: 1, ...FONTS.fontBold, color: COLORS.title,
  },
  totalAmt: {
    ...FONTS.h4, ...FONTS.fontBold, color: COLORS.primary,
  },

  /* footer */
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: COLORS.borderColor,
  },
  footerTxt: { ...FONTS.fontXs, color: COLORS.textLight, fontStyle: 'italic' },
});

export default OrderInvoiceCard;
