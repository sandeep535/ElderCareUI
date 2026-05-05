import { useState, useEffect, useCallback } from 'react'

/**
 * useApi - generic hook for API calls with loading / error / data state
 * @param {Function} apiFn  - the API function to call
 * @param {Array}    deps   - dependency array (re-fetches when changed)
 * @param {boolean}  immediate - call on mount (default true)
 */
export function useApi(apiFn, deps = [], immediate = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(...args)
      // handle both: mock returns { data, success } | real API returns data directly
      const result = res?.data !== undefined ? res.data : res
      setData(result)
      return result
    } catch (err) {
      setError(err?.message || 'Something went wrong')
      return null
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (immediate) execute(...deps)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps])

  return { data, loading, error, execute, setData }
}

/**
 * useMutation - for POST / PUT / DELETE calls (no auto-fetch)
 */
export function useMutation(apiFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(...args)
      // handle both: mock returns { data, success } | real API returns data directly
      return res?.data !== undefined ? res.data : res
    } catch (err) {
      setError(err?.message || 'Something went wrong')
      return null
    } finally {
      setLoading(false)
    }
  }, [apiFn])

  return { mutate, loading, error }
}
