import { useEffect } from 'react'
import { usePageTitle } from '../context/PageTitleContext'

export function useSetPageTitle(title, subtitle = '', showBack = false) {
  const { setPageTitle } = usePageTitle()
  useEffect(() => {
    setPageTitle({ title, subtitle, showBack })
  }, [title, subtitle, showBack, setPageTitle])
}
