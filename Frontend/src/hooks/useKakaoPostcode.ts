import { useCallback, useEffect, useRef, useState } from 'react'

const KAKAO_POSTCODE_SCRIPT_ID = 'kakao-postcode-script'
const KAKAO_POSTCODE_SCRIPT_SRC = '//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

let kakaoPostcodeScriptPromise: Promise<void> | null = null

function loadKakaoPostcodeScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('카카오 우편번호 서비스는 브라우저에서만 사용할 수 있습니다.'))
  }

  if (window.daum?.Postcode) {
    return Promise.resolve()
  }

  if (kakaoPostcodeScriptPromise) {
    return kakaoPostcodeScriptPromise
  }

  kakaoPostcodeScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(KAKAO_POSTCODE_SCRIPT_ID) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('카카오 우편번호 스크립트를 불러오지 못했습니다.')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.id = KAKAO_POSTCODE_SCRIPT_ID
    script.src = KAKAO_POSTCODE_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('카카오 우편번호 스크립트를 불러오지 못했습니다.'))
    document.body.appendChild(script)
  }).catch((error: unknown) => {
    kakaoPostcodeScriptPromise = null

    if (error instanceof Error) {
      throw error
    }

    throw new Error('카카오 우편번호 스크립트를 불러오지 못했습니다.')
  })

  return kakaoPostcodeScriptPromise
}

export interface SelectedPostcodeAddress {
  address: string
  roadAddress?: string
  jibunAddress?: string
  zonecode?: string
}

interface UseKakaoPostcodeOptions {
  onComplete: (selection: SelectedPostcodeAddress) => void
}

interface UseKakaoPostcodeResult {
  containerRef: React.RefObject<HTMLDivElement | null>
  isOpen: boolean
  isLoading: boolean
  error: string | null
  openPostcode: () => Promise<void>
  closePostcode: () => void
}

function getAddressValue(data: DaumPostcodeData): string {
  if (data.roadAddress.trim()) {
    return data.roadAddress
  }

  if (data.address.trim()) {
    return data.address
  }

  return data.jibunAddress
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '주소 검색 창을 열지 못했습니다.'
}

export default function useKakaoPostcode({
  onComplete,
}: UseKakaoPostcodeOptions): UseKakaoPostcodeResult {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const closePostcode = useCallback(() => {
    setIsOpen(false)
    setError(null)
  }, [])

  const openPostcode = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await loadKakaoPostcodeScript()
      setIsOpen(true)
    } catch (loadError: unknown) {
      setError(toErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !containerRef.current || !window.daum?.Postcode) {
      return
    }

    containerRef.current.innerHTML = ''

    const postcode = new window.daum.Postcode({
      oncomplete: (data) => {
        onComplete({
          address: getAddressValue(data),
          roadAddress: data.roadAddress || undefined,
          jibunAddress: data.jibunAddress || undefined,
          zonecode: data.zonecode || undefined,
        })
        setIsOpen(false)
      },
      width: '100%',
      height: '100%',
    })

    postcode.embed(containerRef.current)
  }, [isOpen, onComplete])

  return {
    containerRef,
    isOpen,
    isLoading,
    error,
    openPostcode,
    closePostcode,
  }
}
