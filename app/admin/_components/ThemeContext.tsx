'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'admin-theme'

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Server always renders 'light' (no DOM access). The anti-flash script in
  // app/layout.tsx may have already put '.dark' on <html> before hydration,
  // so this effect re-syncs React state to match — without it the toggle's
  // label/icon would mismatch between SSR and the client on first paint.
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external source (DOM/localStorage) on mount, not a derived-state anti-pattern
    if (document.documentElement.classList.contains('dark')) setTheme('dark')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
