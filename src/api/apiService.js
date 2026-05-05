import axiosInstance from './axiosInstance'

// ─── Generic Methods ──────────────────────────────────────────────────────────
export const apiGet = (url, params = {}) =>
  axiosInstance.get(url, { params })

export const apiPost = (url, data = {}) =>
  axiosInstance.post(url, data)

export const apiPut = (url, data = {}) =>
  axiosInstance.put(url, data)

export const apiPatch = (url, data = {}) =>
  axiosInstance.patch(url, data)

export const apiDelete = (url) =>
  axiosInstance.delete(url)
