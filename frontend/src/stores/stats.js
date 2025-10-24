import { defineStore } from "pinia";
import { ref } from "vue";
import { StatsService } from "../services/stats";
import { useAuthStore } from "./auth";

export const useStatsStore = defineStore("stats", () => {
  const stats = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchDashboardStats(options = {}) {
    try {
      loading.value = true;
      error.value = null;

      const authStore = useAuthStore();
      const role = authStore.user?.role || "USER";

      stats.value = await StatsService.getDashboardStats({
        ...options,
        role,
      });
    } catch (err) {
      error.value = err.message || "Error al cargar estadísticas";
      console.error("Error fetching stats:", err);
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    stats.value = null;
    error.value = null;
  }

  return {
    stats,
    loading,
    error,
    fetchDashboardStats,
    reset,
  };
});
