import { useAuth } from '@/contexts/AuthContext'

export function useStorage() {
  return {
    isAuthenticated: useAuth().isAuthenticated,
  }
}