<template>
  <nav class="bg-white text-black py-3 px-6 flex justify-between items-center w-full h-[72px]">
    <!-- Logo/Brand Name -->
    <div class="logo flex items-center cursor-pointer" @click="goToHome">
      <img src="/public/Assets/logo.png" alt="Star Survey" class="w-[262px] h-[38px] gap-[30px]" />
    </div>

    <!-- Right Side: User Information or Login Button -->
    <div class="flex items-center">
      <!-- Conditional Rendering Based on User State -->
      <div v-if="isLoggedIn" class="flex items-center">
        <!-- Edit and Create Pages: Eye Icon and Send Button -->
        <div class="flex items-center gap-[30px]">
            <button
              v-if="isEditOrCreatePage"
              @click="preview"
              class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
            >
              <img src="/public/Assets/eye.svg" alt="Preview" class="w-[30px] h-[30px]" />
            </button>
            <button
              v-if="isEditOrCreatePage"
              @click="send"
              class="px-3 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-700 transition w-[63px] h-10"
            >
              Send
            </button>
          <UDropdown :items="dropdownItems" :popper="{ placement: 'bottom-start' }">
            <UChip inset>
              <img
                :src="authStore.user.value.picture || 'https://via.placeholder.com/40'"
                alt="Profile Picture"
                class="w-12 h-12 rounded-full object-cover"
              />
            </UChip>
          </UDropdown>
        </div>
      </div>

      <div v-else>
        <GoogleLogin />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from "~/stores/auth";
import { useRouter, useRoute } from "vue-router";
import GoogleLogin from '~/components/GoogleLogin.vue'

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const user = computed(() => authStore.user.value);
const isLoggedIn = computed(() => authStore.isLoggedIn.value);
const isEditOrCreatePage = computed(() =>
  route.name?.includes('edit-form') || route.name?.includes('create-form')
);

// Dropdown Items for UDropdown
const dropdownItems = computed(() => [
  [
    {
      label: `${user.value.name || "Guest"}`,
      slot: 'account',
      disabled: true,
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: logout,
    },
  ],
]);

// Navigation Functions
const goToHome = () => router.push("/");

// Logout Function
const logout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Button Actions
const preview = () => {
  console.log("Preview clicked");
  // Add your preview functionality here
};

const send = () => {
  console.log("Send clicked");
  // Add your send functionality here
};
</script>