// app/utils/downloadInvoice.ts
// Generates a styled A4 portrait PDF invoice → opens directly in device PDF viewer.
// Mirrors web PrintStatement.jsx structure. No invoice API needed.
import { useState } from 'react';
import { Platform, Alert, ToastAndroid } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Asset } from 'expo-asset';

const IMAGE_BASE = 'https://app.bmgjewellers.com';

/* ── Rupee → Words ─────────────────────────────────────────────── */
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
  'Seventeen','Eighteen','Nineteen'];
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

function below1000(n: number): string {
  if (n === 0) return '';
  if (n < 20)  return ones[n] + ' ';
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '') + ' ';
  return ones[Math.floor(n / 100)] + ' Hundred ' + below1000(n % 100);
}
function toWords(amt: number): string {
  const v = Math.round(amt);
  if (v === 0) return 'Zero Rupees Only';
  let r = '';
  if (v >= 10000000) r += below1000(Math.floor(v / 10000000)) + 'Crore ';
  if (v % 10000000 >= 100000) r += below1000(Math.floor((v % 10000000) / 100000)) + 'Lakh ';
  if (v % 100000 >= 1000) r += below1000(Math.floor((v % 100000) / 1000)) + 'Thousand ';
  r += below1000(v % 1000);
  return r.trim() + ' Rupees Only';
}

/* ── Helpers ────────────────────────────────────────────────────── */
const toNum = (v: any) => {
  const x = parseFloat(String(v ?? '0').replace(/[^0-9.]/g, ''));
  return isNaN(x) ? 0 : x;
};
const fmtDate = (raw: any) => {
  if (!raw) return 'N/A';
  try {
    return new Date(raw).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return String(raw).slice(0, 10); }
};

/* Fetch an image URL and return a base64 data URI; returns '' on failure */
async function imgToDataUri(url: string): Promise<string> {
  try {
    const dest = `${FileSystem.cacheDirectory}inv_img_${Date.now()}.jpg`;
    const result = await FileSystem.downloadAsync(url, dest);
    if (result.status !== 200) return '';
    const b64 = await FileSystem.readAsStringAsync(result.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mime = url.endsWith('.png') ? 'image/png' : 'image/jpeg';
    // cleanup
    FileSystem.deleteAsync(result.uri, { idempotent: true }).catch(() => {});
    return `data:${mime};base64,${b64}`;
  } catch { return ''; }
}

/* ── Data shape ─────────────────────────────────────────────────── */
export interface InvoiceItem {
  id?: any;
  name?: string;
  itemId?: string | number;
  tagno?: string;
  sno?: string;
  qty?: number;
  netWt?: number | null;
  grsWt?: number | null;
  grsAmt?: number | null;   // grossAmount from API
  taxType?: string | null;  // gtstype from API
  gstPer?: number | null;
  gstAmount?: number | null;
  price?: number;
  totalAmount?: number;
  shippingFee?: number;
  imageUrl?: string;        // absolute URL — fetched + embedded as base64
}

export interface InvoiceData {
  orderId: string;
  invoiceNo?: string | null;       // e.g. "INV-20260630-3104"
  orderDate?: string | null;       // orderTime.timestamp
  invoiceDate?: string | null;     // invoiceDate.timestamp
  // Origin (Shipped From) — from origin_address
  originName?: string;
  originAddress?: string[];        // lines array
  originPhone?: string;
  // Company extras
  companyName?: string;
  companyGst?: string;
  companyEmail?: string | null;
  // Customer / Bill To — from address
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string[];
  paymentMode?: string | null;
  paymentStatus?: string | null;
  transactionId?: string | null;
  paidOn?: string | null;
  items: InvoiceItem[];
  shippingFee?: number;
  totalAmount?: number;
}

/* ── HTML builder ───────────────────────────────────────────────── */
function buildInvoiceHTML(
  data: InvoiceData,
  logoDataUri: string,
  itemImages: string[],
): string {
  const {
    orderId, invoiceNo, orderDate, invoiceDate,
    companyName = 'BMG JEWELLERS PRIVATE LIMITED',
    companyGst = '', companyEmail = '',
    originName, originAddress = [], originPhone = '',
    customerName = 'N/A', customerPhone = '', customerEmail = '',
    customerAddress = [],
    paymentMode, paymentStatus, transactionId, paidOn,
    items = [],
  } = data;

  const itemSubtotal = items.reduce((s, it) => s + toNum(it.price ?? it.totalAmount ?? 0), 0);
  const shipping     = toNum(data.shippingFee ?? items[0]?.shippingFee ?? 0);
  const grandTotal   = toNum(data.totalAmount) || (itemSubtotal + shipping);

  const payColor = (() => {
    const s = (paymentStatus ?? '').toUpperCase();
    if (['PAID','SUCCESS','CAPTURED'].includes(s)) return '#065f46';
    if (['FAILED','DECLINED'].includes(s)) return '#991b1b';
    return '#92400e';
  })();

  const modeLabel =
    !paymentMode ? 'N/A'
    : ['COD','CASH'].includes(paymentMode.toUpperCase()) ? 'Cash on Delivery'
    : paymentMode;

  /* items table rows — include product image thumbnail */
  const itemRows = items.map((it, i) => {
    const imgDataUri = itemImages[i] ?? '';
    const imgCell = imgDataUri
      ? `<img src="${imgDataUri}" style="width:34px;height:34px;object-fit:cover;border-radius:4px;border:1px solid #eee;display:block;margin:0 auto;" />`
      : `<div style="width:34px;height:34px;background:#f3f4f6;border-radius:4px;border:1px solid #ddd;margin:0 auto;"></div>`;

    const rowBg = i % 2 === 0 ? '#ffffff' : '#fafafa';
    const grsAmt   = toNum(it.grsAmt);
    const gstPer   = it.gstPer != null ? toNum(it.gstPer) : null;
    const gstAmt   = it.gstAmount != null ? toNum(it.gstAmount) : null;
    const netWt    = it.netWt != null ? toNum(it.netWt) : null;
    const total    = toNum(it.price ?? it.totalAmount ?? 0);

    return `
    <tr style="background:${rowBg};">
      <td style="text-align:center;padding:5px 3px;border-bottom:0.5px solid #e5e7eb;font-size:9px;">${i + 1}</td>
      <td style="padding:5px 4px;border-bottom:0.5px solid #e5e7eb;text-align:center;">${imgCell}</td>
      <td style="padding:5px 4px;border-bottom:0.5px solid #e5e7eb;font-size:8px;">
        ${it.sno ?? it.tagno ?? '-'}
      </td>
      <td style="padding:5px 6px;border-bottom:0.5px solid #e5e7eb;font-size:8px;font-weight:600;max-width:100px;">
        ${it.name ?? '-'}
      </td>
      <td style="text-align:center;padding:5px 3px;border-bottom:0.5px solid #e5e7eb;font-size:9px;">${toNum(it.qty) || 1}</td>
      <td style="text-align:right;padding:5px 4px;border-bottom:0.5px solid #e5e7eb;font-size:9px;">
        ${netWt != null ? netWt.toFixed(3) : '-'}
      </td>
      <td style="text-align:right;padding:5px 4px;border-bottom:0.5px solid #e5e7eb;font-size:9px;">
        ${grsAmt > 0 ? grsAmt.toFixed(2) : '-'}
      </td>
      <td style="text-align:center;padding:5px 3px;border-bottom:0.5px solid #e5e7eb;font-size:8px;">
        ${it.taxType ?? 'GST'}
      </td>
      <td style="text-align:center;padding:5px 3px;border-bottom:0.5px solid #e5e7eb;font-size:9px;">
        ${gstPer != null ? gstPer + '%' : '-'}
      </td>
      <td style="text-align:right;padding:5px 4px;border-bottom:0.5px solid #e5e7eb;font-size:9px;">
        ${gstAmt != null ? gstAmt.toFixed(2) : '-'}
      </td>
      <td style="text-align:right;padding:5px 6px;border-bottom:0.5px solid #e5e7eb;font-size:9px;font-weight:700;">
        ₹${total.toFixed(2)}
      </td>
    </tr>`;
  }).join('');

  const addrLines = customerAddress
    .map(l => `<div style="font-size:8px;color:#555;line-height:1.5;">${(l ?? '').toUpperCase()}</div>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=595, initial-scale=1.0"/>
<style>
  @page { size: A4 portrait; margin: 0; }

  /* ─── Reset ─────────────────────────────── */
  * {
    box-sizing: border-box; margin: 0; padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* ─── Background on html = auto-repeats across ALL pages ─────── */
  html, body {
    width: 100%;
    min-width: 100%;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background-color: #fff9f6;
    background-image:
      radial-gradient(ellipse at 2% 2%,   rgba(241,97,55,0.08) 0%, transparent 48%),
      radial-gradient(ellipse at 98% 98%, rgba(241,97,55,0.06) 0%, transparent 45%),
      repeating-linear-gradient(
        -48deg,
        transparent 0px, transparent 36px,
        rgba(241,97,55,0.028) 36px, rgba(241,97,55,0.028) 37px
      );
    background-size: 100% 100%;
    background-attachment: fixed;
  }

  body {
    width: 100%;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 10px;
    color: #333;
    background: transparent;   /* let html bg show through */
  }

  /* ─── Orange top accent bar (full bleed, no margin) ─── */
  .accent-bar {
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #f16137 0%, #e04c22 65%, #c73d14 100%);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ─── Content padding wrapper ─── */
  .content { padding: 20px 28px 16px; }

  /* ─── Header ─── */
  .hdr { display: table; width: 100%; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1.5px solid #f0ddd5; }
  .hdr-l { display: table-cell; vertical-align: middle; }
  .hdr-r { display: table-cell; vertical-align: middle; text-align: right; width: 105px; }
  .co-name { font-size: 14px; font-weight: bold; color: #f16137; letter-spacing: 0.4px; }
  .inv-sub { font-size: 9px; color: #bbb; letter-spacing: 2.5px; margin-top: 3px; text-transform: uppercase; }
  .inv-meta { font-size: 8px; color: #666; margin-top: 3px; }
  .logo { width: 90px; height: auto; }

  /* ─── Two-column details (table = reliable across print engines) ─── */
  .dtbl { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  .dtbl > tbody > tr > td { width: 50%; vertical-align: top; }
  .dtbl > tbody > tr > td:first-child { padding-right: 10px; }
  .dtbl > tbody > tr > td:last-child  { padding-left: 10px; border-left: 1px dashed #f0ddd5; }

  .sec { font-size: 8px; font-weight: bold; color: #f16137; letter-spacing: 1.8px;
         text-transform: uppercase; border-bottom: 1px solid #f0ddd5;
         padding-bottom: 3px; margin-bottom: 7px; }
  .dr  { display: table; width: 100%; margin-bottom: 4px; font-size: 9px; }
  .dl  { display: table-cell; font-weight: bold; color: #444; width: 86px; vertical-align: top; }
  .dv  { display: table-cell; color: #555; vertical-align: top; word-break: break-word; }
  .an  { font-weight: bold; color: #333; font-size: 9px; margin-bottom: 2px; }
  .al  { font-size: 8px; color: #555; line-height: 1.55; }

  /* ─── Items table ─── */
  .twrap { border: 1px solid #ddd; border-radius: 5px; overflow: hidden; margin-bottom: 0; }
  .tlbl  { font-size: 9px; font-weight: bold; color: #333;
           padding: 6px 10px 5px; background: #fdf5f2; border-bottom: 1px solid #eee; }
  table  { width: 100%; border-collapse: collapse; table-layout: fixed; }
  thead tr { background: #2c3e50; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  thead th {
    font-size: 8px; font-weight: 600; color: #fff;
    text-align: center; padding: 7px 3px;
    border-right: 0.5px solid rgba(255,255,255,0.18);
    overflow: hidden;
  }
  thead th:last-child { border-right: none; }
  tbody td { font-size: 8.5px; color: #222; overflow: hidden; }

  /* zebra rows */
  tbody tr:nth-child(even) { background: rgba(0,0,0,0.022); }

  /* ─── Shipping ─── */
  .ship { display: table; width: 100%; padding: 5px 10px; font-size: 9px;
          border: 1px solid #eee; border-top: none; background: #fafafa; }
  .ship-l { display: table-cell; font-weight: 600; }
  .ship-r { display: table-cell; text-align: right; }

  /* ─── Grand Total ─── */
  .gtotal {
    display: table; width: 100%;
    background: linear-gradient(90deg, #f16137 0%, #e04c22 100%);
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
    color: #fff; padding: 10px 14px; border-radius: 5px;
    margin-top: 10px; margin-bottom: 8px;
  }
  .gt-l { display: table-cell; font-size: 12px; font-weight: bold; letter-spacing: 1px; }
  .gt-r { display: table-cell; text-align: right; font-size: 14px; font-weight: bold; }

  /* ─── Amount in words ─── */
  .wbox {
    border-left: 3px solid #f16137;
    background: rgba(241,97,55,0.06);
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
    padding: 7px 12px; margin-bottom: 12px; border-radius: 0 4px 4px 0;
  }
  .wlbl { font-size: 8px; font-weight: bold; color: #444; margin-bottom: 2px; }
  .wtxt { font-size: 8.5px; color: #222; font-style: italic; }

  /* ─── Footer: normal flow, never overlaps ─── */
  .footer {
    border-top: 0.5px solid #ddd;
    padding: 10px 28px 16px;
    text-align: center;
    font-size: 7.5px;
    color: #999;
    margin-top: 16px;
    page-break-inside: avoid;
  }
  .fnote { font-style: italic; margin-bottom: 3px; }
</style>
</head>
<body>

  <!-- Full-bleed orange bar -->
  <div class="accent-bar"></div>

  <div class="content">

    <!-- Header -->
    <div class="hdr">
      <div class="hdr-l">
        <div class="co-name">${companyName}</div>
        <div class="inv-sub">Tax Invoice</div>
        ${invoiceNo  ? `<div class="inv-meta"><b>Invoice No:</b> ${invoiceNo}</div>` : ''}
        ${companyGst ? `<div class="inv-meta"><b>GSTIN:</b> ${companyGst}</div>` : ''}
      </div>
      <div class="hdr-r">
        ${logoDataUri ? `<img class="logo" src="${logoDataUri}" alt="Logo"/>` : ''}
      </div>
    </div>

    <!-- Two-column details -->
    <table class="dtbl">
      <tbody>
        <tr>
          <!-- LEFT -->
          <td>
            <div class="sec">Order Details</div>
            <div class="dr"><span class="dl">Order ID:</span><span class="dv">${orderId}</span></div>
            ${invoiceNo   ? `<div class="dr"><span class="dl">Invoice No:</span><span class="dv">${invoiceNo}</span></div>` : ''}
            <div class="dr"><span class="dl">Order Date:</span><span class="dv">${fmtDate(orderDate)}</span></div>
            ${invoiceDate ? `<div class="dr"><span class="dl">Invoice Date:</span><span class="dv">${fmtDate(invoiceDate)}</span></div>` : ''}

            <div class="sec" style="margin-top:13px;">Shipped From</div>
            <div class="an">${originName ?? companyName}</div>
            ${originAddress.map(l => `<div class="al">${(l ?? '').toUpperCase()}</div>`).join('')}
            ${originPhone  ? `<div class="al">Phone: ${originPhone}</div>` : ''}
            ${companyEmail ? `<div class="al">Email: ${companyEmail}</div>` : ''}
          </td>

          <!-- RIGHT -->
          <td>
            <div class="sec">Bill To</div>
            <div class="dr"><span class="dl">Customer:</span><span class="dv">${customerName}</span></div>
            ${customerPhone ? `<div class="dr"><span class="dl">Contact:</span><span class="dv">${customerPhone}</span></div>` : ''}
            ${customerEmail ? `<div class="dr"><span class="dl">Email:</span><span class="dv">${customerEmail}</span></div>` : ''}

            <div class="sec" style="margin-top:13px;">Payment Details</div>
            ${transactionId ? `<div class="dr"><span class="dl">Txn ID:</span><span class="dv">${transactionId}</span></div>` : ''}
            <div class="dr"><span class="dl">Mode of Pay:</span><span class="dv">${modeLabel}</span></div>
            <div class="dr">
              <span class="dl">Pay Status:</span>
              <span class="dv" style="font-weight:bold;color:${payColor};">${paymentStatus ?? 'N/A'}</span>
            </div>
            ${paidOn ? `<div class="dr"><span class="dl">Paid On:</span><span class="dv">${fmtDate(paidOn)}</span></div>` : ''}

            <div class="sec" style="margin-top:13px;">Shipping Address</div>
            <div class="an">${customerName}</div>
            ${addrLines}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Items table -->
    <div class="twrap">
      <div class="tlbl">ORDER ITEMS</div>
      <table>
        <colgroup>
          <col style="width:4%"/>   <!-- S.No  -->
          <col style="width:8%"/>   <!-- Image -->
          <col style="width:9%"/>   <!-- ItemID -->
          <col style="width:20%"/>  <!-- Name  -->
          <col style="width:4%"/>   <!-- Qty   -->
          <col style="width:9%"/>   <!-- NetWt -->
          <col style="width:10%"/>  <!-- GrsAmt -->
          <col style="width:7%"/>   <!-- TaxType -->
          <col style="width:6%"/>   <!-- Tax%  -->
          <col style="width:9%"/>   <!-- TaxAmt -->
          <col style="width:14%"/>  <!-- Total  → 4+8+9+20+4+9+10+7+6+9+14=100 -->
        </colgroup>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Image</th>
            <th style="text-align:left;">Item ID</th>
            <th style="text-align:left;">Product Name</th>
            <th>Qty</th>
            <th style="text-align:right;padding-right:4px;">Net Wt</th>
            <th style="text-align:right;padding-right:4px;">Gross Amt</th>
            <th>Tax Type</th>
            <th>Tax %</th>
            <th style="text-align:right;padding-right:4px;">Tax Amt</th>
            <th style="text-align:right;padding-right:6px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <!-- Shipping fee -->
    ${shipping > 0 ? `
    <div class="ship">
      <span class="ship-l">Shipping Fee</span>
      <span class="ship-r">₹${shipping.toFixed(2)}</span>
    </div>` : ''}

    <!-- Grand Total -->
    <div class="gtotal">
      <span class="gt-l">GRAND TOTAL</span>
      <span class="gt-r">₹ ${grandTotal.toFixed(2)}</span>
    </div>

    <!-- Amount in Words -->
    <div class="wbox">
      <div class="wlbl">Amount in Words:</div>
      <div class="wtxt">${toWords(grandTotal)}</div>
    </div>

  </div><!-- /.content -->

  <!-- Footer in normal flow — never overlaps, pushes down with content -->
  <div class="footer">
    <div class="fnote">* This is a computer-generated invoice and does not require a physical signature *</div>
    <div>Invoice ID: ${orderId}&nbsp;&nbsp;|&nbsp;&nbsp;Generated on: ${new Date().toLocaleDateString('en-IN')}</div>
  </div>

</body>
</html>`;
}

/* ── Hook ───────────────────────────────────────────────────────── */
export function useDownloadInvoice() {
  const [loading, setLoading] = useState(false);

  const download = async (data: InvoiceData) => {
    if (loading) return;
    setLoading(true);
    try {
      // 1. Load logo → base64
      let logoDataUri = '';
      try {
        const asset = Asset.fromModule(require('../../assets/logo.png'));
        await asset.downloadAsync();
        const b64 = await FileSystem.readAsStringAsync(asset.localUri ?? asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        logoDataUri = `data:image/png;base64,${b64}`;
      } catch { /* no logo — continue */ }

      // 2. Fetch product images → base64 (in parallel, fail-safe)
      const itemImages = await Promise.all(
        data.items.map(async (it) => {
          const url = it.imageUrl;
          if (!url) return '';
          // Prepend base if relative path
          const absUrl = url.startsWith('http') ? url : `${IMAGE_BASE}${url}`;
          return imgToDataUri(absUrl);
        })
      );

      // 3. Build HTML → PDF
      const html = buildInvoiceHTML(data, logoDataUri, itemImages);
      // A4 in points (595 × 842). Explicit dims stop expo-print defaulting to US Letter
      // which causes a scale mismatch → blurry/pixelated text in the rendered PDF.
      const { uri: tmpUri } = await Print.printToFileAsync({ html, width: 595, height: 842 });

      // 4. Save to documentDirectory with friendly name
      const dest = `${FileSystem.documentDirectory}invoice_${data.orderId}.pdf`;
      const info = await FileSystem.getInfoAsync(dest);
      if (info.exists) await FileSystem.deleteAsync(dest, { idempotent: true });
      await FileSystem.copyAsync({ from: tmpUri, to: dest });

      // 5. Open PDF directly (Android) or share sheet with Save to Files (iOS)
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(dest);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,  // FLAG_GRANT_READ_URI_PERMISSION
          type: 'application/pdf',
        });
        ToastAndroid.show('Invoice opened', ToastAndroid.SHORT);
      } else {
        await Sharing.shareAsync(dest, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
          dialogTitle: `Invoice ${data.orderId}`,
        });
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not generate invoice.');
    } finally {
      setLoading(false);
    }
  };

  return { download, loading };
}
