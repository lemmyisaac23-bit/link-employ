/** Bust CDN/browser cache on each deploy (public/ files keep stable paths). */
const ASSET_VERSION =
  (import.meta.env.VITE_ASSET_VERSION as string | undefined)?.trim() || '1'

/** Prefix public asset paths for the configured Vite base URL. */
export function asset(path: string) {
  const clean = path.replace(/^\//, '')
  const base = `${import.meta.env.BASE_URL}${clean}`
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}v=${encodeURIComponent(ASSET_VERSION)}`
}

/** React Router basename (undefined = site root / custom domain). */
export const routerBasename =
  import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '')
