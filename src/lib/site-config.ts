const LOCAL_SITE_URL = 'http://localhost:1234'
type SiteEnv = Record<string, string | boolean | undefined>

const toAbsoluteSiteUrl = (value: string) => {
  const normalized = value.trim()
  const withProtocol = /^https?:\/\//.test(normalized)
    ? normalized
    : `https://${normalized}`

  return new URL(withProtocol).origin
}

const getStringEnvValue = (value: SiteEnv[string]) =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined

const getConfiguredSiteUrl = (env: SiteEnv) =>
  getStringEnvValue(env.PUBLIC_SITE_URL) ||
  getStringEnvValue(env.SITE_URL) ||
  getStringEnvValue(env.VERCEL_PROJECT_PRODUCTION_URL) ||
  getStringEnvValue(env.VERCEL_URL)

const isDevelopmentEnv = (env: SiteEnv) =>
  env.DEV === true ||
  env.DEV === 'true' ||
  env.MODE === 'development' ||
  env.NODE_ENV === 'development'

// Prefer explicit site env vars first so deployments can override the canonical
// host. Fall back to Vercel's production domain and finally the request URL
// Vercel exposes.
export const resolveSiteUrl = (env: SiteEnv) => {
  const configuredSiteUrl = getConfiguredSiteUrl(env)
  if (configuredSiteUrl) {
    return toAbsoluteSiteUrl(configuredSiteUrl)
  }

  if (isDevelopmentEnv(env)) {
    return LOCAL_SITE_URL
  }

  throw new Error(
    'Missing site URL. Set PUBLIC_SITE_URL or SITE_URL before running a production build.',
  )
}
