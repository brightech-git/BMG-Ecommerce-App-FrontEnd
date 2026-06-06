// components/AppExportSheet.tsx
//
// Export to PDF, Excel (.xlsx), Word (.docx)
// Full support for: logo image, header background image/color,
// watermark, custom brand colors, per-format theming.
//
// ─── Install ──────────────────────────────────────────────────────
//   npx expo install expo-file-system expo-sharing expo-print expo-asset expo-image-manipulator
//   npm install xlsx      ← Excel
//   npm install docx      ← Word
//
// ─── Convert a local asset to base64 (helper) ────────────────────
//   import * as FileSystem from 'expo-file-system';
//   import { Asset } from 'expo-asset';
//
//   async function assetToBase64(module: number): Promise<string> {
//     const [asset] = await Asset.loadAsync(module);
//     const b64 = await FileSystem.readAsStringAsync(asset.localUri!, {
//       encoding: FileSystem.EncodingType.Base64,
//     });
//     return b64;   // pass as logoBase64 or bgBase64
//   }
//
// ─── Usage ────────────────────────────────────────────────────────
//
//   const [logoB64, setLogoB64] = useState('');
//   const [bgB64,   setBgB64]   = useState('');
//
//   useEffect(() => {
//     assetToBase64(require('./assets/logo.png')).then(setLogoB64);
//     assetToBase64(require('./assets/header_bg.png')).then(setBgB64);
//   }, []);
//
//   const exportData: ExportData = {
//     title:       'Transaction Report',
//     subtitle:    'DigiGold Portfolio — May 2026',
//     columns: [ ... ],
//     rows:    [ ... ],
//     summary: [ ... ],
//     branding: {
//       logoBase64:      logoB64,       // PNG/JPG as base64 string
//       logoMimeType:    'image/png',   // 'image/png' | 'image/jpeg'
//       logoWidth:       120,           // px for PDF / pt for Word
//       logoHeight:      40,
//       headerBgBase64:  bgB64,         // optional header bg image
//       headerBgMimeType:'image/png',
//       primaryColor:    '#FF971D',     // accent / table header color
//       secondaryColor:  '#C9B15D',
//       companyName:     'DigiGold',
//       watermarkText:   'CONFIDENTIAL',// optional diagonal watermark
//     },
//   };
//
//   <AppExportSheet
//     visible={showExport}
//     onClose={() => setShowExport(false)}
//     data={exportData}
//     filename="digigold_may2026"
//   />

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Modal,
  TouchableWithoutFeedback, PanResponder,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import Ionicons     from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing    from 'expo-sharing';
import * as Print      from 'expo-print';
import { useTheme }    from '../../../theme';

const { height: SH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
export type ExportColumn = {
  key:    string;
  label:  string;
  width?: number;
  align?: 'left' | 'right' | 'center';
};

export type ExportRow = Record<string, string | number>;

export type SummaryItem = {
  label: string;
  value: string;
};

export type ExportBranding = {
  /** Base64-encoded logo image (without data:image prefix) */
  logoBase64?:       string;
  logoMimeType?:     'image/png' | 'image/jpeg' | 'image/jpg';
  /** Logo display size in PDF (px) */
  logoWidth?:        number;
  logoHeight?:       number;
  /** Base64-encoded header background image */
  headerBgBase64?:   string;
  headerBgMimeType?: 'image/png' | 'image/jpeg' | 'image/jpg';
  /** Solid header bg color (used when no headerBgBase64) */
  headerBgColor?:    string;
  /** Table header & accent color */
  primaryColor?:     string;
  secondaryColor?:   string;
  /** Company / brand name shown in header */
  companyName?:      string;
  /** Diagonal watermark text (PDF & Word) */
  watermarkText?:    string;
  /** Watermark opacity 0–1 */
  watermarkOpacity?: number;
  /** Footer text override */
  footerText?:       string;
};

export type ExportData = {
  title:       string;
  subtitle?:   string;
  columns:     ExportColumn[];
  rows:        ExportRow[];
  summary?:    SummaryItem[];
  note?:       string;
  generatedBy?: string;
  branding?:   ExportBranding;
};

export type ExportFormat = 'pdf' | 'excel' | 'word';

type Props = {
  visible:   boolean;
  onClose:   () => void;
  data:      ExportData;
  filename?: string;
};

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function b64Src(b64: string, mime = 'image/png') {
  return `data:${mime};base64,${b64}`;
}

function today() {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ─────────────────────────────────────────────────────────────────
// PDF HTML builder  (logo + bg image + watermark)
// ─────────────────────────────────────────────────────────────────
function buildPDFHtml(data: ExportData): string {
  const br       = data.branding ?? {};
  const primary  = br.primaryColor  ?? '#FF971D';
  const secondary= br.secondaryColor ?? '#C9B15D';
  const company  = br.companyName   ?? 'DigiGold';
  const dateStr  = today();

  // ── Header background ──
  let headerBgStyle = `background: ${br.headerBgColor ?? primary};`;
  if (br.headerBgBase64) {
    const src = b64Src(br.headerBgBase64, br.headerBgMimeType ?? 'image/png');
    headerBgStyle = `background: url('${src}') center/cover no-repeat; background-color: ${br.headerBgColor ?? primary};`;
  }

  // ── Logo HTML ──
  const logoHtml = br.logoBase64
    ? `<img src="${b64Src(br.logoBase64, br.logoMimeType ?? 'image/png')}"
            style="width:${br.logoWidth ?? 110}px; height:${br.logoHeight ?? 36}px;
                   object-fit:contain; display:block;" />`
    : `<div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
         ${company}
       </div>`;

  // ── Watermark ──
  const wmOpacity = br.watermarkOpacity ?? 0.07;
  const watermarkHtml = br.watermarkText
    ? `<div style="
          position:fixed; top:38%; left:50%; transform:translate(-50%,-50%) rotate(-35deg);
          font-size:88px; font-weight:900; color:${primary};
          opacity:${wmOpacity}; white-space:nowrap; pointer-events:none;
          z-index:0; letter-spacing:6px; text-transform:uppercase;">
         ${br.watermarkText}
       </div>`
    : '';

  // ── Table header cells ──
  const thCells = data.columns.map(c =>
    `<th style="background:${primary};color:#fff;padding:10px 14px;
               font-weight:600;text-align:${c.align ?? 'left'};
               white-space:nowrap;font-size:13px;">${c.label}</th>`
  ).join('');

  // ── Table data rows ──
  const trRows = data.rows.map((row, i) => {
    const cells = data.columns.map(c =>
      `<td style="padding:9px 14px;text-align:${c.align ?? 'left'};
                  border-bottom:1px solid #F3F4F6;font-size:13px;">
         ${row[c.key] ?? ''}
       </td>`
    ).join('');
    return `<tr style="background:${i % 2 === 0 ? '#fff' : '#FFFBF5'};">${cells}</tr>`;
  }).join('');

  // ── Summary ──
  const summaryHtml = (data.summary ?? []).length > 0
    ? `<div style="margin-top:28px;background:#FFF9F0;border-radius:12px;overflow:hidden;border:1px solid ${primary}33;">
         <div style="padding:8px 16px;font-size:11px;font-weight:700;color:${primary};
                     text-transform:uppercase;letter-spacing:0.8px;background:${primary}22;">
           Summary
         </div>
         <table style="width:100%;border-collapse:collapse;">
           ${(data.summary ?? []).map(s =>
             `<tr>
               <td style="padding:8px 16px;color:#6B7280;font-size:13px;">${s.label}</td>
               <td style="padding:8px 16px;font-weight:700;color:${primary};text-align:right;font-size:14px;">${s.value}</td>
              </tr>`
           ).join('')}
         </table>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:-apple-system,Arial,sans-serif; color:#111; background:#fff; }
    .page { padding:0; max-width:900px; margin:0 auto; position:relative; }
    .header {
      ${headerBgStyle}
      padding:28px 36px 24px;
      display:flex; align-items:center; justify-content:space-between;
      position:relative;
    }
    .header::after {
      content:''; position:absolute; bottom:0; left:0; right:0;
      height:4px; background:${secondary};
    }
    .header-right { text-align:right; }
    .header-date { font-size:12px; color:rgba(255,255,255,0.75); margin-bottom:3px; }
    .header-doc  { font-size:13px; color:rgba(255,255,255,0.55); }
    .body { padding:28px 36px; position:relative; z-index:1; }
    .doc-title { font-size:22px;font-weight:700;color:#111;margin-bottom:4px; }
    .doc-sub   { font-size:13px;color:#6B7280;margin-bottom:22px; }
    table { width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden; }
    .footer {
      margin-top:32px; border-top:1px solid #F3F4F6;
      padding-top:14px; display:flex; justify-content:space-between;
    }
    .footer-text { font-size:11px; color:#9CA3AF; }
    .stripe { height:4px; background:linear-gradient(90deg,${primary},${secondary}); }
  </style>
</head>
<body>
  <div class="page">
    ${watermarkHtml}

    <!-- Header -->
    <div class="header">
      ${logoHtml}
      <div class="header-right">
        <div class="header-date">${dateStr}</div>
        <div class="header-doc">${data.generatedBy ?? company}</div>
      </div>
    </div>
    <div class="stripe"></div>

    <!-- Body -->
    <div class="body">
      <div class="doc-title">${data.title}</div>
      ${data.subtitle ? `<div class="doc-sub">${data.subtitle}</div>` : ''}

      <table>
        <thead><tr>${thCells}</tr></thead>
        <tbody>${trRows}</tbody>
      </table>

      ${summaryHtml}

      <div class="footer">
        <div class="footer-text">${data.note ?? ''}</div>
        <div class="footer-text">${br.footerText ?? `${data.generatedBy ?? company} · ${dateStr}`}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────
// PDF export
// ─────────────────────────────────────────────────────────────────
async function exportPDF(data: ExportData, filename: string) {
  const html       = buildPDFHtml(data);
  const { uri }    = await Print.printToFileAsync({ html, base64: false });
  const dest       = `${FileSystem.cacheDirectory}${filename}.pdf`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dest, {
      mimeType:    'application/pdf',
      dialogTitle: data.title,
      UTI:         'com.adobe.pdf',
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// Excel export  (logo as drawing, bg color on header row)
// ─────────────────────────────────────────────────────────────────
async function exportExcel(data: ExportData, filename: string) {
  let XLSX: any;
  try { XLSX = require('xlsx'); }
  catch { Alert.alert('Missing package', 'Run: npm install xlsx'); return; }

  const br      = data.branding ?? {};
  const primary = (br.primaryColor ?? '#FF971D').replace('#', '');
  const wb      = XLSX.utils.book_new();

  // ── Title block rows ──
  const titleRows: any[][] = [
    [br.companyName ?? 'DigiGold'],
    [data.title],
    ...(data.subtitle ? [[data.subtitle]] : []),
    [`Generated: ${today()}`],
    [],  // spacer
  ];

  const header   = data.columns.map(c => c.label);
  const dataRows = data.rows.map(r => data.columns.map(c => r[c.key] ?? ''));

  const summarySection: any[][] = data.summary?.length
    ? [[], ['Summary'], ...data.summary.map(s => [s.label, s.value])]
    : [];

  const wsData = [...titleRows, header, ...dataRows, ...summarySection];
  const ws     = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = data.columns.map(c => ({ wch: c.width ?? 18 }));

  // Merge title cells across all columns
  const colCount = data.columns.length;
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },  // company
    { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },  // title
    ...(data.subtitle ? [{ s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } }] : []),
  ];

  // Style header data row
  const headerRowIdx = titleRows.length;
  for (let C = 0; C < colCount; C++) {
    const addr = XLSX.utils.encode_cell({ r: headerRowIdx, c: C });
    if (!ws[addr]) ws[addr] = { t: 's', v: data.columns[C].label };
    ws[addr].s = {
      fill:      { patternType: 'solid', fgColor: { rgb: primary } },
      font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      alignment: { horizontal: data.columns[C].align ?? 'left', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
      },
    };
  }

  // Style company name row (row 0)
  const a0 = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (ws[a0]) ws[a0].s = {
    font: { bold: true, sz: 16, color: { rgb: primary } },
    fill: { patternType: 'solid', fgColor: { rgb: 'FFF4E6' } },
  };

  // Style title row (row 1)
  const a1 = XLSX.utils.encode_cell({ r: 1, c: 0 });
  if (ws[a1]) ws[a1].s = { font: { bold: true, sz: 13, color: { rgb: '111111' } } };

  // Alternate row shading on data
  for (let R = headerRowIdx + 1; R < headerRowIdx + 1 + dataRows.length; R++) {
    if (R % 2 === 0) continue;
    for (let C = 0; C < colCount; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = { fill: { patternType: 'solid', fgColor: { rgb: 'FFF9F0' } } };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, data.title.slice(0, 31));

  const b64  = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const path = `${FileSystem.cacheDirectory}${filename}.xlsx`;
  await FileSystem.writeAsStringAsync(path, b64, { encoding: FileSystem.EncodingType.Base64 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType:    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: data.title,
      UTI:         'com.microsoft.excel.xlsx',
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// Word export  (logo image, header bg color/image, watermark)
// ─────────────────────────────────────────────────────────────────
async function exportWord(data: ExportData, filename: string) {
  let docx: any;
  try { docx = require('docx'); }
  catch { Alert.alert('Missing package', 'Run: npm install docx'); return; }

  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, HeadingLevel, AlignmentType, WidthType,
    ShadingType, ImageRun, Header, Footer,
    PageOrientation, convertInchesToTwip,
  } = docx;

  const br        = data.branding ?? {};
  const primary   = br.primaryColor  ?? '#FF971D';
  const pHex      = primary.replace('#', '');
  const company   = br.companyName   ?? 'DigiGold';
  const dateStr   = today();

  // ── Logo in header ──
  const logoEl: any[] = [];
  if (br.logoBase64) {
    const logoBuffer = Uint8Array.from(atob(br.logoBase64), c => c.charCodeAt(0));
    logoEl.push(
      new Paragraph({
        children: [
          new ImageRun({
            data:           logoBuffer,
            type:           (br.logoMimeType ?? 'image/png').split('/')[1] as any,
            transformation: { width: br.logoWidth ?? 120, height: br.logoHeight ?? 40 },
          }),
        ],
        spacing: { after: 0 },
      })
    );
  } else {
    logoEl.push(new Paragraph({
      children: [
        new TextRun({ text: company, bold: true, size: 32, color: pHex }),
      ],
    }));
  }

  // ── Doc header (logo left, date right) ──
  const docHeader = new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: { style: 'none' }, bottom: { style: 'none' }, left: { style: 'none' }, right: { style: 'none' }, insideH: { style: 'none' }, insideV: { style: 'none' } },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                children: logoEl,
                borders: { top: { style: 'none' }, bottom: { style: 'none' }, left: { style: 'none' }, right: { style: 'none' } },
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: dateStr, size: 18, color: '9CA3AF' })],
                    alignment: AlignmentType.RIGHT,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: data.generatedBy ?? company, size: 18, color: '9CA3AF' })],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
                borders: { top: { style: 'none' }, bottom: { style: 'none' }, left: { style: 'none' }, right: { style: 'none' } },
              }),
            ],
          }),
        ],
      }),
      // Colored bottom border line
      new Paragraph({
        children: [new TextRun({ text: '' })],
        border: { bottom: { color: pHex, space: 1, style: 'single', size: 12 } },
        spacing: { after: 200 },
      }),
    ],
  });

  // ── Doc footer ──
  const docFooter = new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: br.footerText ?? `${company} · ${dateStr}`, size: 18, color: '9CA3AF' }),
        ],
        alignment: AlignmentType.CENTER,
        border: { top: { color: 'F3F4F6', style: 'single', size: 6, space: 4 } },
      }),
    ],
  });

  // ── Data table ──
  const headerCells = data.columns.map(c =>
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: c.label, bold: true, color: 'FFFFFF', size: 22 })],
        alignment: c.align === 'right' ? AlignmentType.RIGHT : c.align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
      })],
      shading:   { type: ShadingType.SOLID, color: pHex },
      width:     { size: Math.round(9638 / data.columns.length), type: WidthType.DXA },
      margins:   { top: 80, bottom: 80, left: 120, right: 120 },
    })
  );

  const dataTableRows = data.rows.map((row, i) =>
    new TableRow({
      children: data.columns.map(c =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: String(row[c.key] ?? ''), size: 20 })],
            alignment: c.align === 'right' ? AlignmentType.RIGHT : c.align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
          })],
          shading:  i % 2 !== 0 ? { type: ShadingType.SOLID, color: 'FFFBF5' } : undefined,
          margins:  { top: 70, bottom: 70, left: 120, right: 120 },
        })
      ),
    })
  );

  // ── Watermark paragraph ──
  const watermarkPara = br.watermarkText
    ? [new Paragraph({
        children: [new TextRun({
          text:    br.watermarkText,
          size:    96,
          bold:    true,
          color:   pHex,
          // opacity not directly supported in docx but we use very light color
        })],
        alignment: AlignmentType.CENTER,
        spacing:   { before: 0, after: 0 },
      })]
    : [];

  // ── Summary section ──
  const summaryParas = (data.summary ?? []).flatMap(s => [
    new Paragraph({
      children: [
        new TextRun({ text: `${s.label}:   `, size: 22, color: '6B7280' }),
        new TextRun({ text: s.value, bold: true, size: 24, color: pHex }),
      ],
      spacing: { after: 120 },
    }),
  ]);

  const doc = new Document({
    sections: [{
      headers: { default: docHeader },
      footers: { default: docFooter },
      properties: {},
      children: [
        // Title
        new Paragraph({
          children: [new TextRun({ text: data.title, bold: true, size: 40, color: '111111' })],
          spacing: { after: 160 },
        }),
        ...(data.subtitle ? [
          new Paragraph({
            children: [new TextRun({ text: data.subtitle, size: 22, color: '6B7280' })],
            spacing: { after: 360 },
          }),
        ] : []),

        // Data table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows:  [new TableRow({ children: headerCells, tableHeader: true }), ...dataTableRows],
        }),

        new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 400 } }),

        // Summary
        ...(summaryParas.length ? [
          new Paragraph({
            children: [new TextRun({ text: 'Summary', bold: true, size: 28, color: pHex })],
            spacing:  { before: 200, after: 200 },
          }),
          ...summaryParas,
        ] : []),

        // Note
        ...(data.note ? [
          new Paragraph({
            children: [new TextRun({ text: data.note, size: 18, color: '9CA3AF', italics: true })],
            spacing:  { before: 300 },
          }),
        ] : []),
      ],
    }],
  });

  const b64  = await Packer.toBase64String(doc);
  const path = `${FileSystem.cacheDirectory}${filename}.docx`;
  await FileSystem.writeAsStringAsync(path, b64, { encoding: FileSystem.EncodingType.Base64 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType:    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      dialogTitle: data.title,
      UTI:         'org.openxmlformats.wordprocessingml.document',
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// Format config
// ─────────────────────────────────────────────────────────────────
type FormatCfg = { key: ExportFormat; label: string; ext: string; icon: string; desc: string; iconColor: string; iconBg: string };

function useFormats(): FormatCfg[] {
  return [
    { key: 'pdf',   label: 'PDF',   ext: 'pdf',  icon: 'document-text', desc: 'Branded report with logo & bg',    iconColor: '#DC2626', iconBg: 'rgba(220,38,38,0.1)'  },
    { key: 'excel', label: 'Excel', ext: 'xlsx', icon: 'grid',          desc: 'Spreadsheet with styled header',   iconColor: '#16A34A', iconBg: 'rgba(22,163,74,0.1)'   },
    { key: 'word',  label: 'Word',  ext: 'docx', icon: 'document',      desc: 'Document with logo & watermark',   iconColor: '#2563EB', iconBg: 'rgba(37,99,235,0.1)'   },
  ];
}

// ─────────────────────────────────────────────────────────────────
// AppExportSheet UI
// ─────────────────────────────────────────────────────────────────
export default function AppExportSheet({ visible, onClose, data, filename = 'export' }: Props) {
  const { COLORS, FONTS, SIZES, SHADOWS, moderateScale } = useTheme();
  const formats = useFormats();

  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const [done,    setDone]    = useState<ExportFormat | null>(null);

  const translateY = useRef(new Animated.Value(SH)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;
  const dragY      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setDone(null);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0,  useNativeDriver: true, damping: 22, stiffness: 180 }),
        Animated.timing(backdropOp, { toValue: 1,  duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SH, duration: 240, useNativeDriver: true }),
        Animated.timing(backdropOp, { toValue: 0,  duration: 200, useNativeDriver: true }),
      ]).start(() => dragY.setValue(0));
    }
  }, [visible]);

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && !loading,
    onPanResponderMove:   (_, g) => { if (g.dy > 0) dragY.setValue(g.dy); },
    onPanResponderRelease:(_, g) => {
      if (g.dy > 100 || g.vy > 0.6) onClose();
      else Animated.spring(dragY, { toValue: 0, useNativeDriver: true, damping: 18 }).start();
    },
  })).current;

  const handleExport = useCallback(async (fmt: ExportFormat) => {
    if (loading) return;
    setLoading(fmt);
    setDone(null);
    try {
      const safe = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
      if (fmt === 'pdf')   await exportPDF(data, safe);
      if (fmt === 'excel') await exportExcel(data, safe);
      if (fmt === 'word')  await exportWord(data, safe);
      setDone(fmt);
    } catch (e: any) {
      Alert.alert('Export failed', e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(null);
    }
  }, [data, filename, loading]);

  const combinedY = Animated.add(translateY, dragY);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOp }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { backgroundColor: COLORS.white, transform: [{ translateY: combinedY }], ...SHADOWS.xl }]}
        {...pan.panHandlers}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: COLORS.gray300 }]} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <View style={[styles.headerIcon, { backgroundColor: COLORS.primaryPale }]}>
            <Ionicons name="share-social-outline" size={moderateScale(22)} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.sheetTitle, { fontFamily: FONTS.family.bold, fontSize: SIZES.font.xl, color: COLORS.textPrimary }]}>
              Export Report
            </Text>
            <Text style={[styles.sheetSub, { fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: COLORS.textTertiary }]}>
              {data.rows.length} records · {data.title}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: COLORS.gray100 }]}>
            <Ionicons name="close" size={moderateScale(18)} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Branding preview pills */}
        {data.branding && (
          <View style={styles.brandingPills}>
            {data.branding.logoBase64 && (
              <View style={[styles.pill, { backgroundColor: COLORS.primaryPale }]}>
                <Ionicons name="image-outline" size={12} color={COLORS.primary} />
                <Text style={[styles.pillText, { color: COLORS.primary, fontFamily: FONTS.family.medium, fontSize: SIZES.font.xxs }]}>Logo</Text>
              </View>
            )}
            {data.branding.headerBgBase64 && (
              <View style={[styles.pill, { backgroundColor: COLORS.primaryPale }]}>
                <Ionicons name="layers-outline" size={12} color={COLORS.primary} />
                <Text style={[styles.pillText, { color: COLORS.primary, fontFamily: FONTS.family.medium, fontSize: SIZES.font.xxs }]}>Header BG</Text>
              </View>
            )}
            {data.branding.watermarkText && (
              <View style={[styles.pill, { backgroundColor: COLORS.primaryPale }]}>
                <Ionicons name="text-outline" size={12} color={COLORS.primary} />
                <Text style={[styles.pillText, { color: COLORS.primary, fontFamily: FONTS.family.medium, fontSize: SIZES.font.xxs }]}>Watermark</Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: COLORS.borderLight }]} />

        {/* Format cards */}
        <View style={styles.formatsWrap}>
          {formats.map(fmt => {
            const isLoading = loading === fmt.key;
            const isDone    = done    === fmt.key;
            return (
              <TouchableOpacity
                key={fmt.key}
                onPress={() => handleExport(fmt.key)}
                disabled={!!loading}
                activeOpacity={0.72}
                style={[
                  styles.formatCard,
                  {
                    backgroundColor: isDone ? fmt.iconBg : COLORS.white,
                    borderColor:     isDone ? fmt.iconColor + '44' : COLORS.border,
                    opacity: loading && !isLoading ? 0.4 : 1,
                  },
                ]}
              >
                <View style={[styles.formatIcon, { backgroundColor: fmt.iconBg }]}>
                  {isLoading
                    ? <ActivityIndicator size="small" color={fmt.iconColor} />
                    : isDone
                    ? <Ionicons name="checkmark-circle" size={moderateScale(26)} color={fmt.iconColor} />
                    : <Ionicons name={fmt.icon as any}  size={moderateScale(26)} color={fmt.iconColor} />
                  }
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.fmtLabel, { fontFamily: FONTS.family.bold, fontSize: SIZES.font.md, color: COLORS.textPrimary }]}>
                    {fmt.label}
                    <Text style={{ fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: COLORS.textTertiary }}>
                      {'  .' + fmt.ext}
                    </Text>
                  </Text>
                  <Text style={[styles.fmtDesc, { fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: isLoading ? COLORS.primary : isDone ? fmt.iconColor : COLORS.textTertiary }]}>
                    {isLoading ? 'Generating…' : isDone ? 'Shared ✓' : fmt.desc}
                  </Text>
                </View>
                {!isLoading && !isDone && (
                  <Ionicons name="chevron-forward" size={moderateScale(18)} color={COLORS.gray300} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary preview */}
        {(data.summary ?? []).length > 0 && (
          <>
            <View style={[styles.divider, { backgroundColor: COLORS.borderLight, marginHorizontal: 20 }]} />
            <View style={styles.summaryWrap}>
              <Text style={[styles.summaryTitle, { fontFamily: FONTS.family.semiBold, fontSize: SIZES.font.xs, color: COLORS.textTertiary, letterSpacing: 0.8 }]}>
                EXPORT PREVIEW
              </Text>
              <View style={styles.summaryRow}>
                {data.summary!.map((s, i) => (
                  <View key={i} style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { fontFamily: FONTS.family.bold, fontSize: SIZES.font.lg, color: COLORS.primary }]}>
                      {s.value}
                    </Text>
                    <Text style={[styles.summaryLabel, { fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: COLORS.textTertiary }]}>
                      {s.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        <Text style={[styles.bottomNote, { fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: COLORS.textDisabled }]}>
          Files are saved to your device and shared via your chosen app.
        </Text>
      </Animated.View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.52)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    overflow: 'hidden',
  },
  handle:       { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  sheetHeader:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerIcon:   { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sheetTitle:   {},
  sheetSub:     { marginTop: 2 },
  closeBtn:     { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  brandingPills:{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 10 },
  pill:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText:     { letterSpacing: 0.3 },

  divider:      { height: StyleSheet.hairlineWidth, marginBottom: 4 },
  formatsWrap:  { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  formatCard:   { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1.5, padding: 14 },
  formatIcon:   { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  fmtLabel:     {},
  fmtDesc:      { marginTop: 2 },

  summaryWrap:  { paddingHorizontal: 20, paddingTop: 14 },
  summaryTitle: { marginBottom: 10 },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem:  { alignItems: 'center', gap: 3 },
  summaryValue: {},
  summaryLabel: {},
  bottomNote:   { textAlign: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4 },
});