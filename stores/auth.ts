import { jwtDecode } from 'jwt-decode';

export const useAuthStore = () => {
  const user = ref(null)
  const token = ref(null)
  
  const initializeAuth = async () => {
    // Only run on client side
    if (!process.client) return;
    
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken)
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          token.value = storedToken
          user.value = {
            id: decoded.userId,
            email: decoded.email
          }
          
          try {
            const userData = await $fetch('/api/auth/me', {
              headers: {
                Authorization: `Bearer ${storedToken}`
              }
            })
            setUserData(userData)
          } catch (error) {
            console.error('Error fetching user data:', error)
            logout()
          }
        } else {
          localStorage.removeItem('auth_token')
        }
      } catch (e) {
        console.error('Invalid token')
        localStorage.removeItem('auth_token')
      }
    }
  }
  
  // Set auth data
  const setAuth = ({ token: newToken }) => {
    try {
      const decoded = jwtDecode(newToken)
      
      // Only store essential user data
      user.value = {
        id: decoded.userId,
        email: decoded.email
      }
      
      token.value = newToken
      
      if (process.client) {
        localStorage.setItem('auth_token', newToken)
      }
    } catch (e) {
      console.error('Error setting auth:', e)
      logout()
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    if (process.client) {
      localStorage.removeItem('auth_token')
    }
  }

  const isLoggedIn = computed(() => !!token.value)

  const setUserData = (userData) => {
    if (!user.value) return;
    
    // Merge the additional user data with existing basic data
    user.value = {
      ...user.value,
      ...userData
    };
  };

  // Initialize auth state
  if (process.client) {
    initializeAuth()
  }

  return {
    user,
    token,
    setAuth,
    setUserData,
    logout,
    isLoggedIn,
    initializeAuth
  }
}