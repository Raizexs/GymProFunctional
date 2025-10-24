<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { SummaryService } from "@/services/summary";
import { useAuthStore } from "@/stores/auth";
import { useStatsStore } from "@/stores/stats";

const router = useRouter();
const authStore = useAuthStore();
const statsStore = useStatsStore();

const loading = ref(false);
const summary = ref({
  reservedCount: 0,
  classesCount: 0,
  trainersCount: 0,
  nextReservation: null,
});

const userRole = computed(() => authStore.user?.role || "USER");
const dashboardStats = computed(() => statsStore.stats);
const statsLoading = computed(() => statsStore.loading);

function fmt(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yy = d.getUTCFullYear();
  return `${dd}-${mm}-${yy}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

async function load() {
  loading.value = true;
  try {
    summary.value = await SummaryService.me();
  } catch (error) {
    console.error("Error loading summary:", error);
  } finally {
    loading.value = false;
  }

  // Cargar stats en paralelo sin bloquear
  statsStore.fetchDashboardStats().catch((err) => {
    console.error("Error loading stats:", err);
  });
}

function goClases() {
  router.push("/clases");
}

function onChanged() {
  load();
}

onMounted(() => {
  load();
  window.addEventListener("reservation:changed", onChanged);
});

onBeforeUnmount(() => {
  window.removeEventListener("reservation:changed", onChanged);
});
</script>
<template>
  <section class="space-y-6 select-none">
    <!-- Tarjetas de estadísticas -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <!-- Tarjeta 1: Mis Reservas -->
      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-300">Mis Reservas</h3>
          <div
            class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-white"
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
        </div>
        <p class="text-4xl font-bold text-white">
          {{ loading ? "…" : summary.reservedCount }}
        </p>
        <p class="text-slate-400 text-xs mt-2">Clases reservadas</p>
      </div>

      <!-- Tarjeta 2: Clases Disponibles -->
      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-300">Clases Disponibles</h3>
          <div
            class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        </div>
        <p class="text-4xl font-bold text-white">
          {{ loading ? "…" : summary.classesCount }}
        </p>
        <p class="text-slate-400 text-xs mt-2">Para reservar</p>
      </div>

      <!-- Tarjeta 3: Entrenadores -->
      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-300">Entrenadores</h3>
          <div
            class="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
        <p class="text-4xl font-bold text-white">
          {{ loading ? "…" : summary.trainersCount }}
        </p>
        <p class="text-slate-400 text-xs mt-2">Profesionales certificados</p>
      </div>

      <!-- Tarjeta 4: Próxima Clase -->
      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-300">Próxima Clase</h3>
          <div
            class="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <div class="min-h-[48px]">
          <template v-if="!loading && summary.nextReservation">
            <p class="font-semibold text-white text-sm">
              {{ summary.nextReservation.klass?.title || "-" }}
            </p>
            <p class="text-slate-400 text-xs mt-1">
              {{ fmt(summary.nextReservation.date) }}
            </p>
          </template>
          <template v-else>
            <p class="text-slate-400 text-sm">Sin clases</p>
          </template>
        </div>
      </div>
    </div>

    <!-- Banner hero -->
    <div
      class="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border border-white/20 shadow-2xl"
    >
      <div
        class="absolute inset-0 bg-cover bg-center opacity-10"
        style="
          background-image: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200');
        "
      ></div>
      <div class="relative p-12 md:p-16">
        <h2 class="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
          Transforma Tu Vida
        </h2>
        <p class="mt-3 text-white/90 max-w-2xl text-lg">
          Entrena con los mejores profesionales y alcanza tus metas
        </p>
        <button
          class="mt-8 px-8 py-3.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-slate-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
          @click="goClases"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 inline mr-2 -mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          Ver Clases Disponibles
        </button>
      </div>
    </div>

    <!-- Tarjeta de próxima reserva -->
    <div
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl"
    >
      <template v-if="summary.nextReservation">
        <h3 class="text-xl font-bold text-white mb-6">Tu próxima clase</h3>
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="font-bold text-white text-lg">
                {{ summary.nextReservation.klass?.title }}
              </p>
              <p class="text-slate-300 text-sm mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                con {{ summary.nextReservation.klass?.coach?.name || "—" }}
              </p>
              <p class="text-slate-400 text-sm mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1 -mt-0.5"
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
                {{ fmt(summary.nextReservation.date) }}
              </p>
            </div>
          </div>
          <button
            class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap select-none"
            @click="goClases"
          >
            Reservar otra clase
          </button>
        </div>
      </template>
      <template v-else>
        <div class="py-12 text-center">
          <div
            class="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 text-indigo-400"
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
          <p class="text-slate-300 text-lg mb-6">No tienes reservas próximas</p>
          <button
            class="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg select-none"
            @click="goClases"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 inline mr-2 -mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Reservar una Clase
          </button>
        </div>
      </template>
    </div>

    <!-- Estadísticas Avanzadas según Rol -->
    <div v-if="!statsLoading && dashboardStats" class="space-y-4">
      <!-- Para TRAINER -->
      <template v-if="userRole === 'TRAINER' || userRole === 'ADMIN'">
        <div
          class="backdrop-blur-xl bg-gradient-to-r from-emerald-600/40 to-green-600/40 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-2xl font-bold text-white mb-2">
                ✓ Control de Asistencia
              </h3>
              <p class="text-emerald-100">
                Gestiona la asistencia de tus clases
              </p>
            </div>
            <div
              class="w-16 h-16 bg-emerald-500/30 rounded-2xl flex items-center justify-center"
            >
              <span class="text-4xl">📋</span>
            </div>
          </div>
          <button
            @click="router.push('/asistencia')"
            class="w-full md:w-auto px-8 py-3.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 inline mr-2 -mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Ir a Control de Asistencia
          </button>
        </div>
      </template>

      <!-- Para ADMIN -->
      <template v-if="userRole === 'ADMIN'">
        <h3 class="text-2xl font-bold text-white mb-4">
          📊 Panel de Administración
        </h3>

        <!-- Revenue Stats -->
        <div class="grid gap-4 md:grid-cols-3">
          <div
            class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-slate-300">
                Ingresos Totales
              </h4>
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
              {{ formatCurrency(dashboardStats.revenue?.total || 0) }}
            </p>
            <p class="text-xs text-slate-400 mt-1">
              {{ dashboardStats.revenue?.count || 0 }} transacciones
            </p>
          </div>

          <div
            class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-slate-300">
                Ocupación Promedio
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p class="text-3xl font-bold text-white">
              {{ Math.round(dashboardStats.classes?.occupancyRate || 0) }}%
            </p>
            <p class="text-xs text-slate-400 mt-1">De las plazas ocupadas</p>
          </div>

          <div
            class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-slate-300">
                Nuevos Usuarios
              </h4>
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <p class="text-3xl font-bold text-white">
              {{ dashboardStats.users?.new || 0 }}
            </p>
            <p class="text-xs text-slate-400 mt-1">
              Total: {{ dashboardStats.users?.total || 0 }} usuarios
            </p>
          </div>
        </div>

        <!-- Popular Classes -->
        <div
          v-if="dashboardStats.classes?.popular?.length"
          class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
        >
          <h4 class="text-lg font-bold text-white mb-4">
            🔥 Clases Más Populares
          </h4>
          <div class="space-y-3">
            <div
              v-for="item in dashboardStats.classes.popular"
              :key="item._id"
              class="flex items-center justify-between p-3 bg-white/5 rounded-xl"
            >
              <div>
                <p class="font-semibold text-white">
                  {{ item.class?.title || "Clase" }}
                </p>
                <p class="text-xs text-slate-400">
                  {{ item.class?.duration || 60 }} min
                </p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-amber-400">
                  {{ item.count }}
                </p>
                <p class="text-xs text-slate-400">reservas</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Para TRAINER -->
      <template v-else-if="userRole === 'TRAINER'">
        <h3 class="text-2xl font-bold text-white mb-4">
          👨‍🏫 Panel del Entrenador
        </h3>

        <div class="grid gap-4 md:grid-cols-3">
          <div
            class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-slate-300">Mis Clases</h4>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p class="text-3xl font-bold text-white">
              {{ dashboardStats.classes?.total || 0 }}
            </p>
            <p class="text-xs text-slate-400 mt-1">
              {{ dashboardStats.classes?.reservations || 0 }} reservas
            </p>
          </div>

          <div
            class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-slate-300">
                Estudiantes Únicos
              </h4>
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <p class="text-3xl font-bold text-white">
              {{ dashboardStats.students?.unique || 0 }}
            </p>
            <p class="text-xs text-slate-400 mt-1">Alumnos activos</p>
          </div>

          <div
            class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-slate-300">
                Ingresos Generados
              </h4>
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
              {{ formatCurrency(dashboardStats.earnings?.total || 0) }}
            </p>
            <p class="text-xs text-slate-400 mt-1">Por tus clases</p>
          </div>
        </div>
      </template>

      <!-- Para USER -->
      <template v-else>
        <h3 class="text-2xl font-bold text-white mb-4">📈 Tus Estadísticas</h3>

        <div class="grid gap-4 md:grid-cols-3">
          <div
            class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-slate-300">
                Tasa de Asistencia
              </h4>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p class="text-3xl font-bold text-white">
              {{ Math.round(dashboardStats.attendance?.rate || 0) }}%
            </p>
            <p class="text-xs text-slate-400 mt-1">
              {{ dashboardStats.attendance?.total || 0 }} asistencias
            </p>
          </div>

          <div
            class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-slate-300">Total Gastado</h4>
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
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p class="text-3xl font-bold text-white">
              {{ formatCurrency(dashboardStats.spending?.total || 0) }}
            </p>
            <p class="text-xs text-slate-400 mt-1">En clases</p>
          </div>

          <div
            v-if="dashboardStats.favorite?.class"
            class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-slate-300">Clase Favorita</h4>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-pink-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <p class="text-lg font-bold text-white">
              {{ dashboardStats.favorite.class.title }}
            </p>
            <p class="text-xs text-slate-400 mt-1">
              {{ dashboardStats.favorite.count }} veces reservada
            </p>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
