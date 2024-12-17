<template>
    <div class="login-page flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 class="text-4xl font-bold mb-8 text-center">Login</h1>
  
      <div v-if="!authStore.isLoggedIn.value">
        <GoogleLogin />
      </div>
      <div v-else class="flex flex-col items-center">
        <p class="text-lg font-semibold mb-4">Welcome, {{ authStore.user.value.email }}!</p>
        <button
          @click="authStore.logout()"
          class="mt-4 w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import GoogleLogin from '~/components/GoogleLogin.vue';
  import {useAuthStore} from '~/stores/auth';

  const authStore = useAuthStore();
  </script>
  