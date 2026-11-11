import { useEffect, useRef } from 'react'

import { turnstileSiteKey } from '../services/turnstileConfig'

const siteKey = turnstileSiteKey
let loader

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve()
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  return loader
}

export default function Turnstile({ onToken }) {
  const container = useRef(null)
  const callbackRef = useRef(onToken)
  useEffect(() => { callbackRef.current = onToken }, [onToken])
  useEffect(() => {
    if (!siteKey) return
    let live = true
    let widgetId
    loadTurnstile().then(() => {
      if (!live || !container.current) return
      widgetId = window.turnstile.render(container.current, {
        sitekey: siteKey,
        callback: token => callbackRef.current(token),
        'expired-callback': () => callbackRef.current(''),
        'error-callback': () => callbackRef.current(''),
      })
    }).catch(() => { if (live) callbackRef.current('') })
    return () => {
      live = false
      if (widgetId !== undefined) window.turnstile?.remove(widgetId)
    }
  }, [])
  if (!siteKey) return <p className="text-sm text-[#6b3434]">Proteção anti-bot ainda não configurada.</p>
  return <div ref={container} aria-label="Verificação anti-bot" />
}
