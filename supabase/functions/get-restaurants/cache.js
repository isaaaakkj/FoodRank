// Reuses the inspected production schema. v3 keys never read legacy rows.
export function supabaseCache(db) {
  return {
    async get(key) {
      const { data, error } = await db.from('restaurant_cache')
        .select('restaurants, fetched_at, expires_at').eq('cache_key', key).maybeSingle()
      if (error) throw new Error('Cache indisponível')
      if (!data || Date.parse(data.expires_at) <= Date.now()) return null
      return { version: 3, restaurants: data.restaurants, created_at: data.fetched_at }
    },
    async set(key, payload) {
      const [, city, state] = JSON.parse(key)
      const { error } = await db.from('restaurant_cache').upsert({
        cache_key: key, city, state, restaurants: payload.restaurants,
        fetched_at: payload.created_at,
        expires_at: new Date(Date.parse(payload.created_at) + 24 * 60 * 60 * 1000).toISOString(),
      })
      if (error) throw new Error('Cache indisponível')
    },
  }
}
