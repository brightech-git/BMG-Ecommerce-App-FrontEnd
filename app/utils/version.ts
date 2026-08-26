/** True when `current` is an older semver-style version than `latest` (e.g. "1.0.9" < "1.1.0"). */
export const isVersionOlder = (current: string, latest: string): boolean => {
  const c = current.split('.').map((n) => parseInt(n, 10) || 0);
  const l = latest.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(c.length, l.length);
  for (let i = 0; i < len; i++) {
    const cv = c[i] ?? 0;
    const lv = l[i] ?? 0;
    if (cv < lv) return true;
    if (cv > lv) return false;
  }
  return false;
};
