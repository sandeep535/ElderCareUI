import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    // restore from localStorage on refresh
    const token    = localStorage.getItem('token')
    const userStr  = localStorage.getItem('user')
    return token && userStr ? { token, user: JSON.parse(userStr) } : null
  })

  const login = (responseData) => {
    const user = {
      username: responseData.username,
      roles:    responseData.roles,
      // derive display name & role label from response
      name:     responseData.username.charAt(0).toUpperCase() + responseData.username.slice(1),
      role:     responseData.roles?.[0]?.replace('ROLE_', '').replace('_', ' ') || 'User',
    }
    localStorage.setItem('token', responseData.token)
    localStorage.setItem('user',  JSON.stringify(user))
    setAuth({ token: responseData.token, user })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth(null)
  }

  return (
    <AuthContext.Provider value={{ auth, user: auth?.user, token: auth?.token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
