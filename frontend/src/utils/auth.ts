import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        try {
          const formData = new FormData()
          formData.append('username', username)
          formData.append('password', password)
          
          const response = await axios.post('/api/token', formData)
          const { access_token } = response.data
          
          set({ token: access_token, isAuthenticated: true })
          
          // Configure le token par défaut pour toutes les requêtes futures
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          return true
        } catch (error) {
          console.error('Login failed:', error)
          return false
        }
      },
      logout: () => {
        set({ token: null, isAuthenticated: false })
        delete axios.defaults.headers.common['Authorization']
      }
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => {
        return (state) => {
          // Réinitialise le token dans les en-têtes Axios si l'utilisateur est authentifié
          if (state?.isAuthenticated && state.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
          }
        }
      }
    }
  )
)