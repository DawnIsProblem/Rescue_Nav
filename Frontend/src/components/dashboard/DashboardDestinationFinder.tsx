import { useCallback } from 'react'
import useKakaoPostcode, { type SelectedPostcodeAddress } from '../../hooks/useKakaoPostcode'
import { useRouteStore } from '../../store/useRouteStore'

interface DashboardDestinationFinderProps {
  className?: string
  compact?: boolean
  disabled?: boolean
}

export default function DashboardDestinationFinder({
  className,
  compact = false,
  disabled = false,
}: DashboardDestinationFinderProps) {
  const destination = useRouteStore((state) => state.destination)
  const setDestination = useRouteStore((state) => state.setDestination)
  const clearDestination = useRouteStore((state) => state.clearDestination)

  const handleComplete = useCallback(
    (selection: SelectedPostcodeAddress) => {
      setDestination({
        address: selection.address,
        roadAddress: selection.roadAddress,
        jibunAddress: selection.jibunAddress,
        zonecode: selection.zonecode,
      })
    },
    [setDestination],
  )

  const { containerRef, isOpen, isLoading, error, openPostcode, closePostcode } = useKakaoPostcode({
    onComplete: handleComplete,
  })

  return (
    <section className={['space-y-4', className ?? ''].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">목적지 주소</p>
          <p className={compact ? 'mt-1 text-base font-semibold text-zinc-900' : 'mt-1 text-lg font-semibold text-zinc-900'}>
            카카오 우편번호 서비스에서 목적지를 선택하세요
          </p>
        </div>
        {destination ? (
          <button
            type="button"
            onClick={clearDestination}
            disabled={disabled}
            className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-100"
          >
            초기화
          </button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">현재 선택</p>
            <p className="mt-2 break-words text-sm font-semibold leading-6 text-zinc-900">
              {destination?.address ?? '아직 선택된 목적지가 없습니다.'}
            </p>
            {destination?.zonecode ? (
              <p className="mt-1 text-xs font-medium text-zinc-500">우편번호: {destination.zonecode}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => void openPostcode()}
            disabled={isLoading || disabled}
            className={[
              'inline-flex shrink-0 items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700',
              isLoading || disabled ? 'cursor-not-allowed opacity-70' : '',
            ].join(' ')}
          >
            {disabled ? '출동 중 변경 불가' : isLoading ? '불러오는 중...' : '주소 찾기'}
          </button>
        </div>

        {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 p-4">
          <div
            className={[
              'w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_28px_56px_rgba(15,23,42,0.18)]',
              compact ? 'max-w-md' : 'max-w-2xl',
            ].join(' ')}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">Kakao Postcode</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900">목적지 주소 검색</p>
              </div>
              <button
                type="button"
                onClick={closePostcode}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-100"
              >
                닫기
              </button>
            </div>

            <div className={compact ? 'h-[28rem]' : 'h-[36rem]'}>
              <div ref={containerRef} className="h-full w-full" />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
