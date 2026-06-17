const BACKEND_BASE = 'https://app.bmgjewellers.com';

/**
 * Resolve a single image value (string | object) to a full URL string.
 */
export const getImage = (imageData, fallback = null) => {
  try {
    if (!imageData) return fallback;

    let raw = imageData;

    // JSON string array → take first item
    if (typeof raw === 'string' && raw.trim().startsWith('[')) {
      const parsed = JSON.parse(raw);
      raw = Array.isArray(parsed) ? parsed[0] : null;
    }

    // Array → take first item
    if (Array.isArray(raw)) raw = raw[0];

    // Responsive object { desktop, mobile }
    if (raw && typeof raw === 'object' && (raw.desktop || raw.mobile)) {
      raw = raw.mobile || raw.desktop;
    }

    // Object with url key
    if (raw && typeof raw === 'object' && raw.url) {
      raw = raw.url;
    }

    if (!raw || typeof raw !== 'string') return fallback;

    // Backend-relative path
    if (raw.startsWith('/uploads') || raw.startsWith('/images')) {
      return `${BACKEND_BASE}${raw}`;
    }

    return raw; // already absolute (https://... or ImageKit)
  } catch {
    return fallback;
  }
};

/**
 * Resolve image object → { uri, link, alt, filterId }
 * Works with string, plain {url,link,alt}, responsive {desktop,mobile} forms.
 */
export const resolveImageMeta = (image, isMobile = true, defaultRatio = null) => {
  if (!image)
    return {uri: null, link: null, alt: '', filterId: null, ratio: defaultRatio};

  if (typeof image === 'string') {
    return {
      uri: getImage(image),
      link: null,
      alt: '',
      filterId: null,
      ratio: defaultRatio,
    };
  }

  if (typeof image === 'object') {
    // Responsive form ({ desktop, mobile })
    if (image.desktop || image.mobile) {
      const source = isMobile
        ? image.mobile || image.desktop
        : image.desktop || image.mobile;
      return {
        uri: getImage(source?.url),
        link: source?.link || null,
        alt: image.alt || '',
        filterId:
          source?.filterId != null ? source.filterId : image.filterId ?? null,
        ratio: source?.ratio || image.ratio || defaultRatio,
      };
    }
    // Flat / single form ({ url, link, ratio, filterId, isSingle })
    return {
      uri: getImage(image.url),
      link: image.link || null,
      alt: image.alt || '',
      filterId: image.filterId ?? null,
      ratio: image.ratio || defaultRatio,
    };
  }

  return {uri: null, link: null, alt: '', filterId: null, ratio: defaultRatio};
};

/**
 * Convert a ratio string ("16/9", "16/7.5") to a height-fraction (h / w).
 * Returns null for invalid input so callers can fall back gracefully.
 */
export const ratioToFraction = (ratio, fallback = 0.5625) => {
  if (!ratio || typeof ratio !== 'string') return fallback;
  const [w, h] = ratio.split('/').map(Number);
  if (!w || !h || Number.isNaN(w) || Number.isNaN(h)) return fallback;
  return h / w;
};

/**
 * Parse a link string like "itemName=Rings&page=1" → { itemName: 'Rings', page: '1' }
 */
export const parseLinkParams = linkStr => {
  if (!linkStr) return {};
  try {
    const params = {};
    linkStr.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
  } catch {
    return {};
  }
};
