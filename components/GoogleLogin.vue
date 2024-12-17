<script setup lang="ts">
import {
  GoogleSignInButton,
  type CredentialResponse,
} from "vue3-google-signin";
// ??? nuxt-vue3-google-signin ???

import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";

const router = useRouter();

const handleLoginSuccess = async (response: CredentialResponse) => {
  const { credential } = response;

  try {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    const data = await res.json();

    if (data.success) {
      // Save the user in the auth store
      const authStore = useAuthStore();
      authStore.setAuth({user: data.user, token: data.token});

      router.push("/");
    } else {
      console.error("Login failed:", data.message);
    }
  } catch (error) {
    console.error("Error logging in:", error);
  }
};

// handle an error event
const handleLoginError = () => {
  console.error("Login failed");
};
</script>

<template>
  <GoogleSignInButton
    @success="handleLoginSuccess"
    @error="handleLoginError"
  ></GoogleSignInButton>
</template>