import { createContext, useContext, useState } from 'react'

const PageTitleContext = createContext({})

export function PageTitleProvider({ children }) {
  const [pageTitle, setPageTitle] = useState({ title: '', subtitle: '', showBack: false })
  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export const usePageTitle = () => useContext(PageTitleContext)
