import { createContext, useContext, useState, type ReactNode } from 'react'

interface IAuthContext {
  isAuthenticated: boolean
  user: { email: string } | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<IAuthContext | null>(null)

function getInitialUser(): { email: string } | null {
  const stored = localStorage.getItem('auth_user')
  return stored ? JSON.parse(stored) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(getInitialUser)
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getInitialUser())

  const login = async (email: string, password: string): Promise<boolean> => {
    const storedUser = localStorage.getItem('admin_user')
    const admin = storedUser ? JSON.parse(storedUser) : { email: 'admin@servicentro.cu', password: 'admin123' }
    
    if (email === admin.email && password === admin.password) {
      const userObj = { email }
      localStorage.setItem('auth_user', JSON.stringify(userObj))
      setUser(userObj)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('auth_user')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}