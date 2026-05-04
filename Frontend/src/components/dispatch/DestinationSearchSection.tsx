import type { FormEvent } from 'react'
import CtaButton from '../shared/CtaButton'
import { type PlaceSearchItem } from '../../api/places'
import useDestinationSearch from '../../hooks/useDestinationSearch'
import { useRouteStore } from '../../store/useRouteStore'

interface DestinationSearchSectionProps {
  className?: string
  compact?: boolean
}

function formatCoordinate(value: number): string {
  return value.toFixed(6)
}

export default function DestinationSearchSection({
  className,
  compact = false,
}: DestinationSearchSectionProps) {
  const destination = useRouteStore((state) => state.destination)
  const setDestination = useRouteStore((state) => state.setDestination)
  const clearDestination = useRouteStore((state) => state.clearDestination)
  const { query, results, loading, error, hasSearched, setQuery, search } = useDestinationSearch()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void search()
  }

  const handleSelectDestination = (result: PlaceSearchItem) => {
    setDestination({
      address: result.address,
      lat: result.lat,
      lng: result.lng,
    })
  }

  return (
    <section className={['space-y-4', className ?? ''].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Destination Search</p>
          <p className={compact ? 'mt-1 text-base font-semibold text-zinc-900' : 'mt-1 text-lg font-semibold text-zinc-900'}>
            Search and select the rescue destination
          </p>
        </div>
        {destination ? (
          <button
            type="button"
            onClick={clearDestination}
            className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-100"
          >
            Clear
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className={['gap-2', compact ? 'grid' : 'grid md:grid-cols-[minmax(0,1fr)_auto]'].join(' ')}>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search destination address or place"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
          />
          <CtaButton
            type="submit"
            disabled={loading}
            className={[
              'rounded-xl px-5 py-3 text-sm uppercase tracking-wide',
              loading ? 'cursor-not-allowed opacity-70' : '',
            ].join(' ')}
          >
            {loading ? 'Searching...' : 'Search'}
          </CtaButton>
        </div>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">Results</p>
          {loading ? <span className="text-xs font-semibold text-red-500">Loading</span> : null}
        </div>

        {results.length > 0 ? (
          <ul className={['divide-y divide-zinc-200 overflow-y-auto', compact ? 'max-h-52' : 'max-h-64'].join(' ')}>
            {results.map((result) => {
              const isSelected =
                destination !== null &&
                typeof destination.lat === 'number' &&
                typeof destination.lng === 'number' &&
                destination.address === result.address &&
                destination.lat === result.lat &&
                destination.lng === result.lng

              return (
                <li key={`${result.name}-${result.lat}-${result.lng}`}>
                  <button
                    type="button"
                    onClick={() => handleSelectDestination(result)}
                    className={[
                      'w-full px-4 py-3 text-left transition',
                      isSelected ? 'bg-red-50' : 'bg-white hover:bg-zinc-100',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">{result.name}</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">{result.address}</p>
                      </div>
                      <span
                        className={[
                          'mt-0.5 shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide',
                          isSelected ? 'bg-red-600 text-white' : 'bg-zinc-100 text-zinc-500',
                        ].join(' ')}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}

        {!loading && hasSearched && results.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500">No destinations found for the current keyword.</div>
        ) : null}

        {!loading && !hasSearched && results.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500">Search for a destination to load matching places.</div>
        ) : null}
      </div>

      {destination ? (
        <article className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-500">Selected Destination</p>
              <p className={compact ? 'mt-1 text-sm font-semibold text-zinc-900' : 'mt-1 text-base font-semibold text-zinc-900'}>
                {destination.address}
              </p>
            </div>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
              Saved
            </span>
          </div>
          {typeof destination.lat === 'number' && typeof destination.lng === 'number' ? (
            <p className="mt-3 text-xs font-medium text-zinc-500">
              Lat {formatCoordinate(destination.lat)} / Lng {formatCoordinate(destination.lng)}
            </p>
          ) : destination.zonecode ? (
            <p className="mt-3 text-xs font-medium text-zinc-500">Zonecode {destination.zonecode}</p>
          ) : null}
        </article>
      ) : null}
    </section>
  )
}
