<script setup>
import { useAuthStore } from "@/stores/auth";
import { useRouter, useRoute } from "vue-router";
import GymLogo from "@/components/GymLogo.vue";
import NotificationBell from "@/components/NotificationBell.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

function logout() {
  auth.logout();
  router.replace("/auth");
}

function isActive(path) {
  return route.path === path;
}
</script>
<template>
  <div
    class="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden"
  >
    <!-- Ondas animadas de fondo -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>
    </div>

    <!-- Imagen de fondo desenfocada del gimnasio -->
    <div class="fixed inset-0 opacity-10 pointer-events-none z-0">
      <div
        class="absolute inset-0 bg-cover bg-center blur-3xl"
        style="
          background-image: linear-gradient(
              rgba(0, 0, 0, 0.7),
              rgba(0, 0, 0, 0.7)
            ),
            url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200');
        "
      ></div>
    </div>

    <!-- Contenido con z-index superior -->
    <div class="relative z-10">
      <!-- Navegación moderna - Solo mostrar si NO estamos en /auth -->
      <nav
        v-if="route.path !== '/auth'"
        class="backdrop-blur-xl bg-slate-900/80 border-b border-white/10 sticky top-0 z-50 shadow-2xl select-none"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <div
          class="max-w-7xl mx-auto px-6 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <div
            class="flex items-center justify-between h-16 select-none"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <!-- Logo -->
            <div
              class="flex items-center gap-3 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <GymLogo size="small" />
              <div
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                <div
                  class="font-bold text-white text-lg"
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                >
                  Gimnasio Pro
                </div>
                <div
                  class="text-xs text-slate-400 -mt-1"
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                >
                  Funcional
                </div>
              </div>
            </div>

            <!-- Links de navegación -->
            <div
              class="flex items-center gap-2 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <router-link
                to="/dashboard"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
                :class="
                  isActive('/dashboard')
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1.5 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Dashboard</span
                >
              </router-link>

              <!-- Mis Clases (Solo Trainers y Admin) -->
              <router-link
                v-if="
                  auth.user?.role === 'TRAINER' || auth.user?.role === 'ADMIN'
                "
                to="/mis-clases"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
                :class="
                  isActive('/mis-clases')
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1.5 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Mis Clases</span
                >
              </router-link>

              <!-- Clases (Solo para USER y ADMIN) -->
              <router-link
                v-if="auth.user?.role === 'USER' || auth.user?.role === 'ADMIN'"
                to="/clases"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
                :class="
                  isActive('/clases')
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1.5 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Clases</span
                >
              </router-link>

              <!-- Mis Reservas (Solo para USER y ADMIN) -->
              <router-link
                v-if="auth.user?.role === 'USER' || auth.user?.role === 'ADMIN'"
                to="/reservas"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
                :class="
                  isActive('/reservas')
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1.5 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Mis Reservas</span
                >
              </router-link>

              <!-- Entrenadores (Solo para USER y ADMIN) -->
              <router-link
                v-if="auth.user?.role === 'USER' || auth.user?.role === 'ADMIN'"
                to="/entrenadores"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
                :class="
                  isActive('/entrenadores')
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1.5 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Entrenadores</span
                >
              </router-link>

              <!-- Planes (Solo para USER y ADMIN) -->
              <router-link
                v-if="auth.user?.role === 'USER' || auth.user?.role === 'ADMIN'"
                to="/planes"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
                :class="
                  isActive('/planes')
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1.5 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Planes</span
                >
              </router-link>

              <!-- Asistencia (Solo Trainer y Admin) -->
              <router-link
                v-if="
                  auth.user?.role === 'TRAINER' || auth.user?.role === 'ADMIN'
                "
                to="/asistencia"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
                :class="
                  isActive('/asistencia')
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1.5 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Asistencia</span
                >
              </router-link>

              <!-- KPIs (Solo Admin) -->
              <router-link
                v-if="auth.user?.role === 'ADMIN'"
                to="/kpis"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
                :class="
                  isActive('/kpis')
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1.5 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >KPIs</span
                >
              </router-link>

              <!-- Stats (Solo Admin) -->
              <router-link
                v-if="auth.user?.role === 'ADMIN'"
                to="/stats"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
                :class="
                  isActive('/stats')
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1.5 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Reportes</span
                >
              </router-link>

              <!-- Notificaciones -->
              <NotificationBell v-if="auth.isAuthenticated" />

              <!-- Botón de logout -->
              <button
                v-if="auth.isAuthenticated"
                @click="logout"
                class="ml-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline mr-1.5 -mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Salir</span
                >
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenido principal -->
      <main
        class="max-w-7xl mx-auto px-6 py-8"
        :class="{ 'max-w-full px-0 py-0': route.path === '/auth' }"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>
