import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const toggleTheme = () => setTheme(current => (current === 'light' ? 'dark' : 'light'))
  const value = { theme, toggleTheme }
  return (
    <ThemeContext.Provider value={value}>
      <div className={`app theme-${theme}`}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme phải được dùng trong ThemeProvider')
  return context
}
