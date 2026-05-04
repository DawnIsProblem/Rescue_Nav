declare global {
  interface DaumPostcodeData {
    address: string
    addressType: 'R' | 'J'
    apartment: 'Y' | 'N'
    bname: string
    buildingName: string
    jibunAddress: string
    roadAddress: string
    sigungu: string
    sido: string
    zonecode: string
  }

  interface DaumPostcodeSize {
    width: number
    height: number
  }

  interface DaumPostcodeOptions {
    oncomplete: (data: DaumPostcodeData) => void
    onresize?: (size: DaumPostcodeSize) => void
    width?: string | number
    height?: string | number
  }

  interface DaumPostcodeInstance {
    embed: (element: HTMLElement) => void
  }

  interface DaumPostcodeConstructor {
    new (options: DaumPostcodeOptions): DaumPostcodeInstance
  }

  interface DaumNamespace {
    Postcode: DaumPostcodeConstructor
  }

  interface Window {
    daum?: DaumNamespace
  }
}

export {}
