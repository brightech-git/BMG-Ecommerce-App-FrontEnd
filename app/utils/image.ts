// app/utils/image.ts
// Build absolute image URLs from the backend's ImagePath field (a JSON array string).
// Mirrors the website's image utils (parse JSON, encode, prefix IMAGE_BASE_URL).
import { IMAGE_BASE_URL } from '@env';

/** Parse a raw ImagePath ("[\"/path/a.jpg\",...]") into absolute, encoded URLs. */
export const parseImages = (imagePath?: string | null): string[] => {
  if (!imagePath) return [];
  try {
    const parsed = JSON.parse(imagePath);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr
      .filter(Boolean)
      .map((p: string) => `${IMAGE_BASE_URL}${encodeURI(p)}`);
  } catch {
    // Not JSON — treat as a single relative path
    return [`${IMAGE_BASE_URL}${encodeURI(imagePath)}`];
  }
};

/** First image (or undefined) from an ImagePath field. */
export const firstImage = (imagePath?: string | null): string | undefined =>
  parseImages(imagePath)[0];

/** Prefix a plain relative path with the image host. */
export const absUrl = (path?: string | null): string | undefined =>
  path ? `${IMAGE_BASE_URL}${path.startsWith('http') ? '' : encodeURI(path)}` : undefined;
