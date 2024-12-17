import { useAuthStore } from "~/stores/auth";

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore();
  
  // Add auth header to all requests
  const { public: config } = useRuntimeConfig();
  
  addRouteMiddleware('auth-middleware', () => {
    if (!authStore.isLoggedIn.value) {
      return navigateTo('/login');
    }
  });

  // Add global fetch interceptor
  globalThis.$fetch = $fetch.create({
    onRequest({ options }) {
      const token = authStore.token.value
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      }
    },
    
    onResponseError({ response }) {
      if (response.status === 401) {
        authStore.logout();
        navigateTo('/login');
      }
    }
  });

  // Load full user data if authenticated
  if (authStore.isLoggedIn.value) {
    try {
      const userData = $fetch('/api/auth/me');
      // authStore.setUserData(userData);
    } catch (error) {
      authStore.logout();
    }
  }
})
