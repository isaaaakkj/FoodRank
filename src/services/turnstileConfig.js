export const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
export const isTurnstileConfigured = Boolean(turnstileSiteKey)
