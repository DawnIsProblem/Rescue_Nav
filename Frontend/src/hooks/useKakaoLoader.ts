import { useEffect, useState } from 'react'

type KakaoLoaderStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UseKakaoLoaderResult {
  isLoaded: boolean
  status: KakaoLoaderStatus
  error: Error | null
}

const KAKAO_SCRIPT_ID = 'kakao-maps-sdk'
const KAKAO_SCRIPT_TIMEOUT_MS = 10000

let loaderPromise: Promise<void> | null = null
let injectedKey: string | null = null

function loadKakaoMapsScript(appKey: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Kakao Maps can only be loaded in the browser environment.'))
  }

  if (window.kakao?.maps) {
    return Promise.resolve()
  }

  if (loaderPromise) {
    if (injectedKey && injectedKey !== appKey) {
      return Promise.reject(
        new Error('Kakao Maps SDK is already requested with a different JavaScript key.'),
      )
    }
    return loaderPromise
  }

  const normalizedKey = appKey.trim()
  injectedKey = normalizedKey
  const expectedSrc = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${normalizedKey}&autoload=false`

  loaderPromise = new Promise<void>((resolve, reject) => {
    const foundScript = document.getElementById(KAKAO_SCRIPT_ID)
    const existingScript = foundScript instanceof HTMLScriptElement ? foundScript : null

    let script = existingScript
    if (script && script.src !== expectedSrc) {
      script.remove()
      script = null
    }

    if (!script) {
      script = document.createElement('script')
      script.id = KAKAO_SCRIPT_ID
      script.src = expectedSrc
      script.async = true
      document.head.appendChild(script)
    }

    const timeoutId = window.setTimeout(() => {
      cleanScriptEvents()
      loaderPromise = null
      reject(
        new Error(
          'Timed out while loading Kakao Maps SDK. Check key/domain and restart dev server.',
        ),
      )
    }, KAKAO_SCRIPT_TIMEOUT_MS)

    const cleanScriptEvents = () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
      window.clearTimeout(timeoutId)
    }

    const handleLoad = () => {
      if (!window.kakao?.maps) {
        cleanScriptEvents()
        loaderPromise = null
        reject(new Error('Kakao Maps SDK loaded, but window.kakao.maps is not available.'))
        return
      }

      window.kakao.maps.load(() => {
        cleanScriptEvents()
        script.setAttribute('data-kakao-loader-state', 'loaded')
        resolve()
      })
    }

    const handleError = () => {
      cleanScriptEvents()
      script.setAttribute('data-kakao-loader-state', 'error')
      loaderPromise = null
      reject(
        new Error(
          'Failed to load Kakao Maps SDK script. Check JavaScript key and [Platform > Web] domain registration.',
        ),
      )
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    const state = script.getAttribute('data-kakao-loader-state')
    if (state === 'loaded' && window.kakao?.maps) {
      handleLoad()
      return
    }
  })

  return loaderPromise
}

export default function useKakaoLoader(appKey: string): UseKakaoLoaderResult {
  const hasAppKey = appKey.trim().length > 0
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!hasAppKey) {
      return () => {
        cancelled = true
      }
    }

    loadKakaoMapsScript(appKey)
      .then(() => {
        if (cancelled) return
        setError(null)
        setIsReady(true)
      })
      .catch((loadError: unknown) => {
        if (cancelled) return
        if (loadError instanceof Error) {
          setError(loadError)
          return
        }
        setError(new Error('Unknown Kakao Maps loading error.'))
      })

    return () => {
      cancelled = true
    }
  }, [appKey, hasAppKey])

  if (!hasAppKey) {
    return {
      isLoaded: false,
      status: 'error',
      error: new Error('Missing Kakao JavaScript key. Set VITE_KAKAO_MAP_KEY.'),
    }
  }

  const status: KakaoLoaderStatus = error ? 'error' : isReady ? 'ready' : 'loading'

  return {
    isLoaded: isReady,
    status,
    error,
  }
}
