<template>
  <section class="space-y-6 select-none">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">
          📊 Reportes y Estadísticas
        </h1>
        <p class="text-slate-400">Panel de análisis para administradores</p>
      </div>
      <button
        @click="refreshData"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2"
        :disabled="loading"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :class="['h-5 w-5', loading ? 'animate-spin' : '']"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Actualizar
      </button>
    </div>

    <!-- Filtros -->
    <div
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-lg font-semibold text-white mb-4">Filtros</h3>
      <div class="grid gap-4 md:grid-cols-4">
        <!-- Fecha Inicio -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2"
            >Fecha Inicio</label
          >
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <!-- Fecha Fin -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2"
            >Fecha Fin</label
          >
          <input
            v-model="endDate"
            type="date"
            class="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <!-- Agrupar por -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2"
            >Agrupar por</label
          >
          <select
            v-model="groupBy"
            class="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>

        <!-- Botón aplicar -->
        <div class="flex items-end">
          <button
            @click="loadRevenueReport"
            class="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all duration-300"
            :disabled="loading"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Cards de Resumen -->
    <div class="grid gap-4 md:grid-cols-4">
      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-slate-300">Ingresos Totales</h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="text-3xl font-bold text-white">
          {{ formatCurrency(revenueReport?.summary?.total || 0) }}
        </p>
        <p class="text-xs text-slate-400 mt-1">
          {{ revenueReport?.summary?.transactions || 0 }} transacciones
        </p>
      </div>

      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-slate-300">
            Promedio por Transacción
          </h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p class="text-3xl font-bold text-white">
          {{ formatCurrency(revenueReport?.summary?.average || 0) }}
        </p>
        <p class="text-xs text-slate-400 mt-1">Por venta</p>
      </div>

      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-slate-300">Período</h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p class="text-2xl font-bold text-white">{{ formatDate(startDate) }}</p>
        <p class="text-xs text-slate-400 mt-1">
          hasta {{ formatDate(endDate) }}
        </p>
      </div>

      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-slate-300">Puntos de Datos</h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p class="text-3xl font-bold text-white">
          {{ revenueReport?.report?.length || 0 }}
        </p>
        <p class="text-xs text-slate-400 mt-1">Registros</p>
      </div>
    </div>

    <!-- Gráfica de Ingresos -->
    <div
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-xl font-bold text-white mb-6">
        📈 Ingresos en el Tiempo
      </h3>

      <div v-if="loading" class="flex items-center justify-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"
        ></div>
      </div>

      <div
        v-else-if="
          !revenueReport ||
          !revenueReport.report ||
          revenueReport.report.length === 0
        "
        class="text-center py-12"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto text-slate-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p class="text-slate-400">No hay datos para el período seleccionado</p>
      </div>

      <!-- Gráfica Simple de Barras -->
      <div v-else class="space-y-3">
        <div
          v-for="item in revenueReport.report"
          :key="item._id"
          class="flex items-center gap-4"
        >
          <div class="w-32 text-sm text-slate-300 font-medium">
            {{ formatChartLabel(item._id) }}
          </div>
          <div class="flex-1">
            <div class="relative h-10 bg-slate-800 rounded-lg overflow-hidden">
              <div
                class="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-end pr-3 transition-all duration-500"
                :style="{ width: `${calculateBarWidth(item.revenue)}%` }"
              >
                <span class="text-white text-sm font-semibold">{{
                  formatCurrency(item.revenue)
                }}</span>
              </div>
            </div>
          </div>
          <div class="w-24 text-right text-sm text-slate-400">
            {{ item.transactions }} txn
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla Detallada -->
    <div
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-xl font-bold text-white mb-6">
        📋 Detalle de Transacciones
      </h3>

      <div v-if="loading" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto"
        ></div>
      </div>

      <div
        v-else-if="
          !revenueReport ||
          !revenueReport.report ||
          revenueReport.report.length === 0
        "
        class="text-center py-8 text-slate-400"
      >
        No hay datos disponibles
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-700">
              <th class="text-left py-3 px-4 text-slate-300 font-semibold">
                Período
              </th>
              <th class="text-right py-3 px-4 text-slate-300 font-semibold">
                Ingresos
              </th>
              <th class="text-right py-3 px-4 text-slate-300 font-semibold">
                Transacciones
              </th>
              <th class="text-right py-3 px-4 text-slate-300 font-semibold">
                Promedio
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in revenueReport.report"
              :key="item._id"
              class="border-b border-slate-700/50 hover:bg-white/5 transition-colors"
            >
              <td class="py-3 px-4 text-white">
                {{ formatChartLabel(item._id) }}
              </td>
              <td class="py-3 px-4 text-right text-green-400 font-semibold">
                {{ formatCurrency(item.revenue) }}
              </td>
              <td class="py-3 px-4 text-right text-slate-300">
                {{ item.transactions }}
              </td>
              <td class="py-3 px-4 text-right text-slate-300">
                {{ formatCurrency(item.avgTransaction) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-slate-600 font-bold">
              <td class="py-3 px-4 text-white">TOTAL</td>
              <td class="py-3 px-4 text-right text-green-400">
                {{ formatCurrency(revenueReport.summary.total) }}
              </td>
              <td class="py-3 px-4 text-right text-white">
                {{ revenueReport.summary.transactions }}
              </td>
              <td class="py-3 px-4 text-right text-white">
                {{ formatCurrency(revenueReport.summary.average) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { StatsService } from "@/services/stats";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const revenueReport = ref(null);

// Configurar fechas por defecto (últimos 30 días)
const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);

const startDate = ref(thirtyDaysAgo.toISOString().split("T")[0]);
const endDate = ref(today.toISOString().split("T")[0]);
const groupBy = ref("day");

// Verificar que el usuario sea admin
onMounted(() => {
  if (authStore.user?.role !== "ADMIN") {
    router.replace("/");
    return;
  }
  loadRevenueReport();
});

async function loadRevenueReport() {
  try {
    loading.value = true;
    revenueReport.value = await StatsService.getRevenueReport(
      startDate.value,
      endDate.value,
      groupBy.value
    );
  } catch (error) {
    console.error("Error loading revenue report:", error);
  } finally {
    loading.value = false;
  }
}

function refreshData() {
  loadRevenueReport();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatChartLabel(label) {
  if (!label) return "";

  if (groupBy.value === "day") {
    return new Date(label).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  } else if (groupBy.value === "week") {
    return `Semana ${label.split("-W")[1]}`;
  } else if (groupBy.value === "month") {
    const [year, month] = label.split("-");
    return new Date(year, month - 1).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  }
  return label;
}

function calculateBarWidth(revenue) {
  if (!revenueReport.value || !revenueReport.value.report) return 0;
  const maxRevenue = Math.max(
    ...revenueReport.value.report.map((r) => r.revenue)
  );
  if (maxRevenue === 0) return 0;
  return Math.min(100, (revenue / maxRevenue) * 100);
}
</script>
