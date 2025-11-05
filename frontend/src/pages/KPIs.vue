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
    const data = await StatsService.getOccupancyAndNoShowKPIs(
      startDate.value,
      endDate.value
    );

    // Asegurar que todos los arrays existan
    kpis.value = {
      overview: data.overview || {},
      occupancyByClass: data.occupancyByClass || [],
      dailyTrend: data.dailyTrend || [],
      usersWithMostNoShows: data.usersWithMostNoShows || [],
      bestAttendanceClasses: data.bestAttendanceClasses || [],
    };
  } catch (e) {
    error.value = e?.response?.data?.error || "Error al cargar los KPIs";
    showToast(error.value, "error");
    kpis.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadKPIs();
});

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  });
};

// Colores para los indicadores
const getOccupancyColor = (rate) => {
  if (!rate && rate !== 0) return "text-slate-400";
  if (rate >= 80) return "text-emerald-400";
  if (rate >= 60) return "text-yellow-400";
  return "text-red-400";
};

const getNoShowColor = (rate) => {
  if (!rate && rate !== 0) return "text-slate-400";
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
          {{ kpis.overview?.totalReservations || 0 }}
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
          :class="getOccupancyColor(kpis.overview?.attendanceRate)"
        >
          {{ kpis.overview?.attendanceRate || 0 }}%
        </p>
        <p class="text-slate-400 text-sm mt-2">
          {{ kpis.overview?.totalAttended || 0 }} de
          {{ kpis.overview?.totalReservations || 0 }}
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
          :class="getOccupancyColor(kpis.overview?.avgOccupancyRate)"
        >
          {{ kpis.overview?.avgOccupancyRate || 0 }}%
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
          :class="getNoShowColor(kpis.overview?.avgNoShowRate)"
        >
          {{ kpis.overview?.avgNoShowRate || 0 }}%
        </p>
        <p class="text-slate-400 text-sm mt-2">
          {{ kpis.overview?.totalNoShow || 0 }} ausencias
        </p>
      </div>
    </div>

    <!-- Gráfica de tendencia diaria -->
    <div
      v-if="kpis && kpis.dailyTrend && kpis.dailyTrend.length > 0"
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
        📊 Tendencia Diaria
      </h3>
      <div class="overflow-x-auto">
        <div class="min-w-full">
          <div class="flex gap-3 items-end h-72 px-4">
            <div
              v-for="(day, index) in kpis.dailyTrend"
              :key="day.date"
              class="flex-1 flex flex-col items-center gap-3"
            >
              <!-- Barra animada con gradiente y sombra -->
              <div
                class="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 rounded-t-xl relative group cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/50 animate-grow"
                :style="{
                  height: `${
                    (day.attended /
                      Math.max(
                        ...kpis.dailyTrend.map((d) => d.reservations || 0),
                        1
                      )) *
                    100
                  }%`,
                  minHeight: (day.attended || 0) > 0 ? '12px' : '4px',
                  animationDelay: `${index * 100}ms`,
                }"
              >
                <!-- Valor en la parte superior de la barra -->
                <div
                  class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-500/90 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {{ day.attended || 0 }}
                </div>

                <!-- Tooltip mejorado -->
                <div
                  class="absolute -top-28 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white text-xs px-4 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 pointer-events-none border border-white/20 shadow-2xl"
                >
                  <p class="font-bold text-emerald-400 mb-2">
                    {{ formatDate(day.date) }}
                  </p>
                  <div class="space-y-1">
                    <p class="flex items-center justify-between gap-4">
                      <span class="text-slate-400">Reservas:</span>
                      <span class="font-semibold">{{
                        day.reservations || 0
                      }}</span>
                    </p>
                    <p class="flex items-center justify-between gap-4">
                      <span class="text-emerald-400">✓ Asistieron:</span>
                      <span class="font-semibold text-emerald-400">{{
                        day.attended || 0
                      }}</span>
                    </p>
                    <p class="flex items-center justify-between gap-4">
                      <span class="text-red-400">✗ No Show:</span>
                      <span class="font-semibold text-red-400">{{
                        day.noShow || 0
                      }}</span>
                    </p>
                    <p
                      class="flex items-center justify-between gap-4 pt-1 border-t border-white/10"
                    >
                      <span class="text-slate-400">Tasa:</span>
                      <span class="font-semibold text-white">
                        {{
                          day.reservations > 0
                            ? Math.round(
                                (day.attended / day.reservations) * 100
                              )
                            : 0
                        }}%
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Fecha con icono -->
              <div class="flex flex-col items-center">
                <span class="text-xs font-semibold text-slate-300">
                  {{ formatDate(day.date).split(" ")[0] }}
                </span>
                <span class="text-[10px] text-slate-500">
                  {{ formatDate(day.date).split(" ")[1] }}
                </span>
              </div>
            </div>
          </div>

          <!-- Leyenda -->
          <div
            class="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/10"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded"
              ></div>
              <span class="text-xs text-slate-400">Asistencias</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-xs text-slate-400"
                >Pasa el cursor para ver detalles</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ocupación por Clase -->
    <div
      v-if="kpis && kpis.occupancyByClass && kpis.occupancyByClass.length > 0"
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
                {{ cls.capacity || 0 }}
              </td>
              <td class="py-3 px-4 text-center text-slate-300">
                {{ cls.reservations || 0 }}
              </td>
              <td class="py-3 px-4 text-center text-emerald-400">
                {{ cls.attended || 0 }}
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  class="font-bold"
                  :class="getOccupancyColor(cls.occupancyRate)"
                >
                  {{ cls.occupancyRate || 0 }}%
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="font-bold" :class="getNoShowColor(cls.noShowRate)">
                  {{ cls.noShowRate || 0 }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Clases con Mejor Asistencia -->
    <div
      v-if="
        kpis &&
        kpis.bestAttendanceClasses &&
        kpis.bestAttendanceClasses.length > 0
      "
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
              {{ cls.attendanceRate || 0 }}%
            </p>
            <p class="text-xs text-slate-300">
              {{ cls.attended || 0 }}/{{ cls.reservations || 0 }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Usuarios con Más No-Shows -->
    <div
      v-if="
        kpis &&
        kpis.usersWithMostNoShows &&
        kpis.usersWithMostNoShows.length > 0
      "
      class="backdrop-blur-xl bg-gradient-to-r from-red-600/40 to-orange-600/40 border border-red-500/30 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-xl font-bold text-white mb-2 flex items-center gap-2">
        ⚠️ Usuarios con Más No-Shows
      </h3>
      <p class="text-red-200 text-sm mb-4">
        💡 Los usuarios con 3+ ausencias en 30 días reciben penalización de 1
        crédito adicional por cada nuevo no-show.
      </p>
      <div class="space-y-3">
        <div
          v-for="user in kpis.usersWithMostNoShows"
          :key="user._id"
          class="flex items-center justify-between bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors"
        >
          <div>
            <p class="font-bold text-white flex items-center gap-2">
              {{ user.userName }}
              <span
                v-if="user.noShowCount >= 3"
                class="text-xs bg-red-600 px-2 py-1 rounded-full"
              >
                🚫 PENALIZADO
              </span>
            </p>
            <p class="text-sm text-slate-300">{{ user.userEmail }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-red-400">
              {{ user.noShowCount || 0 }}
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

    <!-- Mensaje cuando no hay datos -->
    <div
      v-if="
        !loading &&
        kpis &&
        (!kpis.dailyTrend || kpis.dailyTrend.length === 0) &&
        (!kpis.occupancyByClass || kpis.occupancyByClass.length === 0)
      "
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-2xl text-center"
    >
      <div
        class="w-20 h-20 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4"
      >
        <span class="text-4xl">📊</span>
      </div>
      <p class="text-slate-300 text-lg mb-2">No hay datos disponibles</p>
      <p class="text-slate-400 text-sm">
        No se encontraron reservas en el rango de fechas seleccionado.
      </p>
    </div>

    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </section>
</template>

<style scoped>
@keyframes grow {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

.animate-grow {
  transform-origin: bottom;
  animation: grow 0.8s ease-out forwards;
}
</style>
