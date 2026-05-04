import { useCallback, useState } from 'react'
import { searchPlaces, type PlaceSearchItem } from '../api/places'

interface UseDestinationSearchResult {
  query: string
  results: PlaceSearchItem[]
  loading: boolean
  error: string | null
  hasSearched: boolean
  setQuery: (value: string) => void
  search: () => Promise<void>
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '목적지 검색에 실패했습니다.'
}

export default function useDestinationSearch(): UseDestinationSearchResult {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async () => {
    const keyword = query.trim()

    if (!keyword) {
      setError('목적지 키워드를 입력하세요.')
      setResults([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const nextResults = await searchPlaces(keyword)
      setResults(nextResults)
    } catch (searchError: unknown) {
      setResults([])
      setError(toErrorMessage(searchError))
    } finally {
      setLoading(false)
    }
  }, [query])

  return {
    query,
    results,
    loading,
    error,
    hasSearched,
    setQuery,
    search,
  }
}
