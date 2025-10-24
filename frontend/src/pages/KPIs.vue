<script setup>
import { ref, computed, onMounted } from "vue";
import { StatsService } from "@/services/stats";
import Toast from "@/components/Toast.vue";

const kpis = ref(null);
const loading = ref(false);
const error = ref("");

// Rango de fechas (últimos 30 días por defecto)
const endDate = ref(new Date().toISOString().split("T")[0]);
const startDate = ref(
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
);

// Toast
const toast = ref({ show: false, message: "", type: "success" });

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const loadKPIs = async () => {
  loading.value = true;
  error.value = "";

  try {
    kpis.value = await StatsService.getOccupancyAndNoShowKPIs(
      startDate.value,
      endDate.value
    );
  } catch (e) {
    error.value = e?.response?.data?.error || "Error al cargar los KPIs";
    showToast(error.value, "error");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadKPIs();
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  });
};

// Colores para los indicadores
const getOccupancyColor = (rate) => {
  if (rate >= 80) return "text-emerald-400";
  if (rate >= 60) return "text-yellow-400";
  return "text-red-400";
};

const getNoShowColor = (rate) => {
  if (rate <= 10) return "text-emerald-400";
  if (rate <= 25) return "text-yellow-400";
  return "text-red-400";
};
</script>

<template>
  <section class="space-y-6">
    <!-- Título -->
    <div
      class="flex items-center gap-3"
      style="user-select: none; -webkit-user-select: none"
    >
      <div
        class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center"
      >
        <span class="text-2xl">📊</span>
      </div>
      <h2 class="text-3xl font-bold text-white">KPIs de Ocupación y No-Show</h2>
    </div>

    <!-- Filtros de fecha -->
    <div
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <label class="block text-white font-semibold mb-2">
            Fecha Inicio
          </label>
          <input
            type="date"
            v-model="startDate"
            class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label class="block text-white font-semibold mb-2">Fecha Fin</label>
          <input
            type="date"
            v-model="endDate"
            class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div class="flex items-end">
          <button
            @click="loadKPIs"
            :disabled="loading"
            class="w-full px-6 py-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold hover:bg-purple-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? "⏳ Cargando..." : "🔍 Actualizar" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300"
    >
      ⚠️ {{ error }}
    </div>

    <!-- KPIs Principales -->
    <div
      v-if="kpis && !loading"
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      <!-- Total Reservas -->
      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-300">Total Reservas</h3>
          <div
            class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"
          >
            <span class="text-xl">📅</span>
          </div>
        </div>
        <p class="text-3xl font-bold text-white">
          {{ kpis.overview.totalReservations }}
        </p>
      </div>

      <!-- Tasa de Asistencia -->
      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-300">Tasa de Asistencia</h3>
          <div
            class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center"
          >
            <span class="text-xl">✅</span>
          </div>
        </div>
        <p
          class="text-3xl font-bold"
          :class="getOccupancyColor(kpis.overview.attendanceRate)"
        >
          {{ kpis.overview.attendanceRate }}%
        </p>
        <p class="text-slate-400 text-sm mt-2">
          {{ kpis.overview.totalAttended }} de
          {{ kpis.overview.totalReservations }}
        </p>
      </div>

      <!-- Tasa de Ocupación -->
      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-300">Ocupación Promedio</h3>
          <div
            class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center"
          >
            <span class="text-xl">📈</span>
          </div>
        </div>
        <p
          class="text-3xl font-bold"
          :class="getOccupancyColor(kpis.overview.avgOccupancyRate)"
        >
          {{ kpis.overview.avgOccupancyRate }}%
        </p>
      </div>

      <!-- Tasa de No-Show -->
      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-300">Tasa de No-Show</h3>
          <div
            class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center"
          >
            <span class="text-xl">❌</span>
          </div>
        </div>
        <p
          class="text-3xl font-bold"
          :class="getNoShowColor(kpis.overview.avgNoShowRate)"
        >
          {{ kpis.overview.avgNoShowRate }}%
        </p>
        <p class="text-slate-400 text-sm mt-2">
          {{ kpis.overview.totalNoShow }} ausencias
        </p>
      </div>
    </div>

    <!-- Gráfica de tendencia diaria -->
    <div
      v-if="kpis && kpis.dailyTrend.length > 0"
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-xl font-bold text-white mb-4">📊 Tendencia Diaria</h3>
      <div class="overflow-x-auto">
        <div class="min-w-full">
          <div class="flex gap-2 items-end h-64 px-4">
            <div
              v-for="day in kpis.dailyTrend"
              :key="day.date"
              class="flex-1 flex flex-col items-center gap-2"
            >
              <!-- Barra de asistencias -->
              <div
                class="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg relative group cursor-pointer hover:opacity-80 transition-opacity"
                :style="{
                  height: `${
                    (day.attended /
                      Math.max(...kpis.dailyTrend.map((d) => d.reservations))) *
                    100
                  }%`,
                  minHeight: day.attended > 0 ? '8px' : '0',
                }"
              >
                <div
                  class="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none"
                >
                  <p class="font-semibold">{{ formatDate(day.date) }}</p>
                  <p>Reservas: {{ day.reservations }}</p>
                  <p class="text-emerald-400">Asistieron: {{ day.attended }}</p>
                  <p class="text-red-400">No Show: {{ day.noShow }}</p>
                </div>
              </div>
              <!-- Fecha -->
              <span class="text-xs text-slate-400 rotate-45 origin-left">
                {{ formatDate(day.date) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ocupación por Clase -->
    <div
      v-if="kpis && kpis.occupancyByClass.length > 0"
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-xl font-bold text-white mb-4">📋 Ocupación por Clase</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/20">
              <th class="text-left text-slate-300 font-semibold py-3 px-4">
                Clase
              </th>
              <th class="text-left text-slate-300 font-semibold py-3 px-4">
                Entrenador
              </th>
              <th class="text-center text-slate-300 font-semibold py-3 px-4">
                Capacidad
              </th>
              <th class="text-center text-slate-300 font-semibold py-3 px-4">
                Reservas
              </th>
              <th class="text-center text-slate-300 font-semibold py-3 px-4">
                Asistieron
              </th>
              <th class="text-center text-slate-300 font-semibold py-3 px-4">
                Ocupación
              </th>
              <th class="text-center text-slate-300 font-semibold py-3 px-4">
                No-Show
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cls in kpis.occupancyByClass"
              :key="cls._id"
              class="border-b border-white/10 hover:bg-white/5 transition-colors"
            >
              <td class="py-3 px-4 text-white font-medium">{{ cls.title }}</td>
              <td class="py-3 px-4 text-slate-300">
                {{ cls.coach?.name || "Sin entrenador" }}
              </td>
              <td class="py-3 px-4 text-center text-slate-300">
                {{ cls.capacity }}
              </td>
              <td class="py-3 px-4 text-center text-slate-300">
                {{ cls.reservations }}
              </td>
              <td class="py-3 px-4 text-center text-emerald-400">
                {{ cls.attended }}
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  class="font-bold"
                  :class="getOccupancyColor(cls.occupancyRate)"
                >
                  {{ cls.occupancyRate }}%
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="font-bold" :class="getNoShowColor(cls.noShowRate)">
                  {{ cls.noShowRate }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Clases con Mejor Asistencia -->
    <div
      v-if="kpis && kpis.bestAttendanceClasses.length > 0"
      class="backdrop-blur-xl bg-gradient-to-r from-emerald-600/40 to-green-600/40 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-xl font-bold text-white mb-4">
        🏆 Top 5 - Mejor Asistencia
      </h3>
      <div class="space-y-3">
        <div
          v-for="(cls, index) in kpis.bestAttendanceClasses"
          :key="cls._id"
          class="flex items-center justify-between bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
              :class="{
                'bg-yellow-500': index === 0,
                'bg-gray-400': index === 1,
                'bg-amber-600': index === 2,
                'bg-emerald-500/30': index > 2,
              }"
            >
              {{ index + 1 }}
            </div>
            <div>
              <p class="font-bold text-white">{{ cls.title }}</p>
              <p class="text-sm text-emerald-200">
                {{ cls.coach?.name || "Sin entrenador" }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-emerald-300">
              {{ cls.attendanceRate }}%
            </p>
            <p class="text-xs text-slate-300">
              {{ cls.attended }}/{{ cls.reservations }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Usuarios con Más No-Shows -->
    <div
      v-if="kpis && kpis.usersWithMostNoShows.length > 0"
      class="backdrop-blur-xl bg-gradient-to-r from-red-600/40 to-orange-600/40 border border-red-500/30 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-xl font-bold text-white mb-4">
        ⚠️ Usuarios con Más No-Shows
      </h3>
      <div class="space-y-3">
        <div
          v-for="user in kpis.usersWithMostNoShows"
          :key="user._id"
          class="flex items-center justify-between bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors"
        >
          <div>
            <p class="font-bold text-white">{{ user.userName }}</p>
            <p class="text-sm text-slate-300">{{ user.userEmail }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-red-400">
              {{ user.noShowCount }}
            </p>
            <p class="text-xs text-slate-400">ausencias</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando está cargando -->
    <div
      v-if="loading"
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-2xl text-center"
    >
      <div
        class="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse"
      >
        <span class="text-4xl">⏳</span>
      </div>
      <p class="text-slate-300 text-lg">Cargando KPIs...</p>
    </div>

    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </section>
</template>
