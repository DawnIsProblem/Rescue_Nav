import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppLanguage } from '../../lib/appLanguage'

export default function SiteFooter() {
  const { language } = useAppLanguage()
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)
  const copy = language === 'ko'
    ? {
        productDescription: '긴급 대응 내비게이션 시스템.',
        privacy: '개인정보 처리방침',
        terms: '이용 약관',
        inquiry: '출동 문의',
        inquiryTitle: '출동 문의',
        inquiryDescription: '문의가 필요하시면 아래 이메일로 연락해 주세요.',
        close: '닫기',
      }
    : {
        productDescription: 'Emergency response navigation system.',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        inquiry: 'Dispatch Contact',
        inquiryTitle: 'Dispatch Contact',
        inquiryDescription: 'If you need assistance, please contact us via the email below.',
        close: 'Close',
      }

  useEffect(() => {
    if (!isInquiryOpen) {
      return
    }

    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInquiryOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      lastFocusedElementRef.current?.focus()
    }
  }, [isInquiryOpen])

  return (
    <>
      <footer className="w-full border-t border-zinc-200 px-5 py-5 md:px-8 md:py-7">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm normal-case tracking-normal text-zinc-700">Rescue_Nav</p>
            <p className="mt-1 text-[10px]">© 2026 Rescue_Nav. {copy.productDescription}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px]">
            <Link to="/privacy" className="transition hover:text-zinc-700">
              {copy.privacy}
            </Link>
            <Link to="/terms" className="transition hover:text-zinc-700">
              {copy.terms}
            </Link>
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              className="cursor-pointer transition hover:text-zinc-700"
              aria-haspopup="dialog"
              aria-controls="dispatch-inquiry-dialog"
            >
              {copy.inquiry}
            </button>
          </div>
        </div>
      </footer>

      {isInquiryOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsInquiryOpen(false)
            }
          }}
        >
          <div
            id="dispatch-inquiry-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dispatch-inquiry-title"
            aria-describedby="dispatch-inquiry-description"
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.2)]"
          >
            <h2 id="dispatch-inquiry-title" className="text-2xl font-bold tracking-tight text-zinc-900">
              {copy.inquiryTitle}
            </h2>
            <p id="dispatch-inquiry-description" className="mt-3 text-sm leading-relaxed text-zinc-600">
              {copy.inquiryDescription}
            </p>
            <a
              href="mailto:qweqwerty12321@gmail.com"
              className="mt-5 inline-block text-base font-semibold text-red-600 underline underline-offset-4"
            >
              qweqwerty12321@gmail.com
            </a>
            <div className="mt-6 flex justify-end">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsInquiryOpen(false)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                {copy.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
