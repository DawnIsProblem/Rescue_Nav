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
    return Promise.reject(new Error('카카오 지도는 브라우저 환경에서만 불러올 수 있습니다.'))
  }

  if (window.kakao?.maps) {
    return Promise.resolve()
  }

  if (loaderPromise) {
    if (injectedKey && injectedKey !== appKey) {
      return Promise.reject(
        new Error('카카오 지도 SDK가 이미 다른 자바스크립트 키로 요청되었습니다.'),
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
          '카카오 지도 SDK 로딩 시간이 초과되었습니다. 키와 도메인 설정을 확인한 뒤 개발 서버를 다시 실행하세요.',
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
        reject(new Error('카카오 지도 SDK는 로드됐지만 window.kakao.maps를 사용할 수 없습니다.'))
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
          '카카오 지도 SDK 스크립트를 불러오지 못했습니다. 자바스크립트 키와 [플랫폼 > Web] 도메인 등록을 확인하세요.',
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
        setError(new Error('알 수 없는 카카오 지도 로딩 오류가 발생했습니다.'))
      })

    return () => {
      cancelled = true
    }
  }, [appKey, hasAppKey])

  if (!hasAppKey) {
    return {
      isLoaded: false,
      status: 'error',
      error: new Error('카카오 자바스크립트 키가 없습니다. VITE_KAKAO_MAP_KEY를 설정하세요.'),
    }
  }

  const status: KakaoLoaderStatus = error ? 'error' : isReady ? 'ready' : 'loading'

  return {
    isLoaded: isReady,
    status,
    error,
  }
}
