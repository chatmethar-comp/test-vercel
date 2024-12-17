import whitelist from '~/config/whitelist.json';
import { useAuthStore } from '@/stores/auth';

export function isAdmin() {
  const authStore = useAuthStore();
  const userId = authStore.user.value !== null ? authStore.user.value.id : "";
  return whitelist.adminIds.includes(userId);
}