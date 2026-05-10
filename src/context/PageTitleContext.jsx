import { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PageTitleContext = createContext({})

export function PageTitleProvider({ children }) {
  const [pageTitle, setPageTitle] = useState({ title: '', subtitle: '', showBack: false })
  const location = useLocation()

  // Reset title on every route change so stale subtitles don't bleed through
  useEffect(() => {
    setPageTitle({ title: '', subtitle: '', showBack: false })
  }, [location.pathname])

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export const usePageTitle = () => useContext(PageTitleContext)
