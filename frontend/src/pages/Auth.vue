<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import GymLogo from "@/components/GymLogo.vue";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const tab = ref("login");
const name = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const cursorX = ref(0);
const cursorY = ref(0);

const go = (p = "/") => router.replace(route.query.redirect || p);

// Seguimiento del cursor
const handleMouseMove = (e) => {
  cursorX.value = e.clientX;
  cursorY.value = e.clientY;
};

async function submitLogin() {
  error.value = "";
  try {
    await auth.login(email.value, password.value);
    go("/");
  } catch (e) {
    error.value = e?.response?.data?.error || "No se pudo iniciar sesión";
  }
}

async function submitRegister() {
  error.value = "";
  try {
    await auth.register(name.value, email.value, password.value);
    go("/");
  } catch (e) {
    error.value = e?.response?.data?.error || "No se pudo registrar";
  }
}

onMounted(() => {
  auth.loadFromStorage?.();
  if (auth.isAuthenticated) go("/");
  window.addEventListener("mousemove", handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
});
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 select-none"
    style="user-select: none; -webkit-user-select: none"
    unselectable="on"
  >
    <!-- Efecto de cursor que sigue el ratón -->
    <div
      class="cursor-glow"
      style="user-select: none; -webkit-user-select: none; pointer-events: none"
      :style="{
        left: cursorX + 'px',
        top: cursorY + 'px',
      }"
    ></div>

    <!-- Ondas animadas de fondo -->
    <div
      class="absolute inset-0 overflow-hidden select-none"
      style="user-select: none; -webkit-user-select: none; pointer-events: none"
      unselectable="on"
    >
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>
    </div>

    <!-- Imagen de fondo desenfocada del gimnasio -->
    <div
      class="absolute inset-0 opacity-20 select-none"
      style="user-select: none; -webkit-user-select: none; pointer-events: none"
      unselectable="on"
    >
      <div
        class="absolute inset-0 bg-cover bg-center blur-2xl"
        style="
          background-image: linear-gradient(
              rgba(0, 0, 0, 0.5),
              rgba(0, 0, 0, 0.5)
            ),
            url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200');
          user-select: none;
          -webkit-user-select: none;
          pointer-events: none;
        "
      ></div>
    </div>

    <!-- Contenedor principal con flexbox -->
    <div
      class="relative z-10 flex min-h-screen select-none"
      style="user-select: none; -webkit-user-select: none"
      unselectable="on"
    >
      <!-- Formulario de login (Izquierda/Centro) -->
      <div
        class="flex-1 flex items-center justify-center px-8 py-12 select-none"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <div class="w-full max-w-md">
          <!-- Logo y título -->
          <div
            class="text-center mb-8 select-none"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <div
              class="flex items-center justify-center mb-4 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <GymLogo size="medium" />
            </div>
            <h1
              class="text-3xl font-bold text-white mb-1 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              Gimnasio Pro
            </h1>
            <p
              class="text-slate-400 text-sm select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              Funcional & Fitness
            </p>
          </div>

          <!-- Tarjeta de login/registro -->
          <div
            class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 select-none"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <!-- Tabs -->
            <div
              class="bg-slate-800/50 rounded-2xl p-2 mb-8 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <div
                class="grid grid-cols-2 gap-2 select-none"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                <button
                  class="px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 select-none"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: auto;
                    cursor: pointer;
                  "
                  :class="
                    tab === 'login'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-slate-400 hover:text-white'
                  "
                  @click="tab = 'login'"
                >
                  <span
                    style="
                      user-select: none;
                      -webkit-user-select: none;
                      pointer-events: none;
                    "
                    >Iniciar Sesión</span
                  >
                </button>
                <button
                  class="px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 select-none"
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: auto;
                    cursor: pointer;
                  "
                  :class="
                    tab === 'register'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-slate-400 hover:text-white'
                  "
                  @click="tab = 'register'"
                >
                  <span
                    style="
                      user-select: none;
                      -webkit-user-select: none;
                      pointer-events: none;
                    "
                    >Registrarse</span
                  >
                </button>
              </div>
            </div>

            <!-- Formulario de Login -->
            <form
              v-if="tab === 'login'"
              class="space-y-5"
              @submit.prevent="submitLogin"
            >
              <div>
                <label
                  class="block text-sm font-medium text-slate-200 mb-2 select-none"
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 inline mr-2"
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
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                  <span
                    style="
                      user-select: none;
                      -webkit-user-select: none;
                      pointer-events: none;
                    "
                    >Email</span
                  >
                </label>
                <input
                  v-model="email"
                  type="email"
                  class="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-500"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-200 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 inline mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Contraseña
                </label>
                <input
                  v-model="password"
                  type="password"
                  class="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <p
                v-if="error"
                class="text-red-400 text-sm flex items-center gap-2 select-none"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                  >{{ error }}</span
                >
              </p>
              <button
                type="submit"
                class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 inline mr-2"
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
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Iniciar Sesión</span
                >
              </button>
              <div
                class="text-center pt-2 select-none"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                <p
                  class="text-xs text-slate-400 bg-slate-900/30 rounded-lg p-3 backdrop-blur-sm select-none"
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 inline mr-1"
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span
                    style="user-select: none; -webkit-user-select: none"
                    unselectable="on"
                    >Demo:</span
                  >
                  <span
                    class="text-indigo-400 font-semibold"
                    style="user-select: none; -webkit-user-select: none"
                    unselectable="on"
                    >admin@gym.com</span
                  >
                  <span
                    style="user-select: none; -webkit-user-select: none"
                    unselectable="on"
                  >
                    / </span
                  ><span
                    class="text-indigo-400 font-semibold"
                    style="user-select: none; -webkit-user-select: none"
                    unselectable="on"
                    >admin123</span
                  >
                </p>
              </div>
            </form>

            <!-- Formulario de Registro -->
            <form v-else class="space-y-5" @submit.prevent="submitRegister">
              <div>
                <label
                  class="block text-sm font-medium text-slate-200 mb-2 select-none"
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 inline mr-2"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span
                    style="
                      user-select: none;
                      -webkit-user-select: none;
                      pointer-events: none;
                    "
                    >Nombre Completo</span
                  >
                </label>
                <input
                  v-model="name"
                  type="text"
                  class="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-500"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-200 mb-2 select-none"
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 inline mr-2"
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
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                  <span
                    style="
                      user-select: none;
                      -webkit-user-select: none;
                      pointer-events: none;
                    "
                    >Email</span
                  >
                </label>
                <input
                  v-model="email"
                  type="email"
                  class="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-500"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-200 mb-2 select-none"
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 inline mr-2"
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span
                    style="
                      user-select: none;
                      -webkit-user-select: none;
                      pointer-events: none;
                    "
                    >Contraseña</span
                  >
                </label>
                <input
                  v-model="password"
                  type="password"
                  class="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <p
                v-if="error"
                class="text-red-400 text-sm flex items-center gap-2 select-none"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                  >{{ error }}</span
                >
              </p>
              <button
                type="submit"
                class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl select-none"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: auto;
                  cursor: pointer;
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 inline mr-2"
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span
                  style="
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                  "
                  >Crear Cuenta</span
                >
              </button>
              <div
                class="text-center pt-2 select-none"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                <p
                  class="text-xs text-slate-400 bg-slate-900/30 rounded-lg p-3 backdrop-blur-sm select-none"
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 inline mr-1"
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
                  Demo:
                  <span class="text-indigo-400 font-semibold"
                    >admin@gym.com</span
                  >
                  / <span class="text-indigo-400 font-semibold">admin123</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Barra lateral derecha con iconos -->
      <div
        class="hidden lg:flex w-96 items-center justify-center p-8 select-none"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <div
          class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl h-[600px] flex flex-col justify-between select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <!-- Título de características -->
          <div
            class="select-none"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <h3
              class="text-2xl font-bold text-white mb-2 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              Bienvenido
            </h3>
            <p
              class="text-slate-400 text-sm mb-8 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              Descubre todas las funciones
            </p>
          </div>

          <!-- Iconos flotantes con características -->
          <div
            class="space-y-6 flex-1 flex flex-col justify-center select-none"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <div
              class="floating-icon flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <div
                class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform select-none"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-white"
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
              </div>
              <div
                class="flex-1 select-none"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                <h4
                  class="text-white font-semibold text-sm mb-1 select-none"
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                >
                  Reserva Clases
                </h4>
                <p
                  class="text-slate-400 text-xs select-none"
                  style="user-select: none; -webkit-user-select: none"
                  unselectable="on"
                >
                  Gestiona tus entrenamientos fácilmente
                </p>
              </div>
            </div>

            <div
              class="floating-icon flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
            >
              <div
                class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-white"
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
              <div class="flex-1">
                <h4 class="text-white font-semibold text-sm mb-1">
                  Entrenadores
                </h4>
                <p class="text-slate-400 text-xs">
                  Conoce a nuestro equipo profesional
                </p>
              </div>
            </div>

            <div
              class="floating-icon flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300 cursor-pointer group"
            >
              <div
                class="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-white"
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
              <div class="flex-1">
                <h4 class="text-white font-semibold text-sm mb-1">Dashboard</h4>
                <p class="text-slate-400 text-xs">
                  Visualiza tu progreso y estadísticas
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center pt-8 border-t border-white/10">
            <p class="text-slate-400 text-xs">© 2025 Gimnasio Pro Funcional</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos del componente si es necesario */
</style>
