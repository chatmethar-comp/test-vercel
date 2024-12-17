import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server side
  if (process.server) {
    return;
  }

  const authStore = useAuthStore();
  await authStore.initializeAuth();

  if (!authStore.isLoggedIn.value) {
    return navigateTo("/login");
  }
});