/** Prefix public asset paths for the configured Vite base URL. */
export function asset(path: string) {
  const clean = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${clean}`
}

/** React Router basename (undefined = site root / custom domain). */
export const routerBasename =
  import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '')
