export interface PlaceSearchItem {
  name: string
  address: string
  lat: number
  lng: number
}

interface PlaceSearchResponse {
  success: boolean
  code: string
  message: string
  data: PlaceSearchItem[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPlaceSearchItem(value: unknown): value is PlaceSearchItem {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.name === 'string' &&
    typeof value.address === 'string' &&
    typeof value.lat === 'number' &&
    typeof value.lng === 'number'
  )
}

function isPlaceSearchResponse(value: unknown): value is PlaceSearchResponse {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    return false
  }

  return (
    typeof value.success === 'boolean' &&
    typeof value.code === 'string' &&
    typeof value.message === 'string' &&
    value.data.every(isPlaceSearchItem)
  )
}

export async function searchPlaces(query: string): Promise<PlaceSearchItem[]> {
  const keyword = query.trim()

  if (!keyword) {
    return []
  }

  const response = await fetch(`/api/places/search?query=${encodeURIComponent(keyword)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isPlaceSearchResponse(payload)) {
      throw new Error(payload.message)
    }

    throw new Error('목적지 검색에 실패했습니다.')
  }

  if (!isPlaceSearchResponse(payload)) {
    throw new Error('목적지 검색 응답 형식이 올바르지 않습니다.')
  }

  if (!payload.success) {
    throw new Error(payload.message || '목적지 검색에 실패했습니다.')
  }

  return payload.data
}
