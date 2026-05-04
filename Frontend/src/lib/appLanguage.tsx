/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type AppLanguage = 'ko' | 'en'

interface AppLanguageContextValue {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

const APP_LANGUAGE_STORAGE_KEY = 'rescue-nav-language'

const AppLanguageContext = createContext<AppLanguageContextValue | null>(null)

function getInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return 'ko'
  }

  const storedLanguage = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY)
  return storedLanguage === 'en' ? 'en' : 'ko'
}

export function AppLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(getInitialLanguage)

  useEffect(() => {
    window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language)
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language],
  )

  return <AppLanguageContext.Provider value={value}>{children}</AppLanguageContext.Provider>
}

export function useAppLanguage(): AppLanguageContextValue {
  const context = useContext(AppLanguageContext)

  if (!context) {
    throw new Error('useAppLanguage must be used within AppLanguageProvider.')
  }

  return context
}
