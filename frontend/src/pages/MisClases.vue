<script setup>
import { ref, onMounted, computed } from "vue";
import { TrainerService } from "@/services/trainer";
import Toast from "@/components/Toast.vue";

const loading = ref(true);
const trainerInfo = ref(null);
const classes = ref([]);
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success");
const selectedClass = ref(null);
const expandedClasses = ref(new Set());

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("es-CL", options);
}

// Formatear hora de creación
function formatCreatedAt(dateString) {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("es-CL", options);
}

// Formatear precio en CLP
function formatPrice(amount) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Obtener color según status
function getStatusColor(status) {
  const colors = {
    CONFIRMED: "bg-green-500/20 border-green-500/30 text-green-300",
    PENDING_PAYMENT: "bg-amber-500/20 border-amber-500/30 text-amber-300",
    CANCELLED: "bg-red-500/20 border-red-500/30 text-red-300",
  };
  return colors[status] || "bg-gray-500/20 border-gray-500/30 text-gray-300";
}

// Obtener texto del status
function getStatusText(status) {
  const texts = {
    CONFIRMED: "✅ Confirmada",
    PENDING_PAYMENT: "⏳ Pendiente de Pago",
    CANCELLED: "❌ Cancelada",
  };
  return texts[status] || status;
}

// Toggle expandir/contraer clase
function toggleClass(classId) {
  if (expandedClasses.value.has(classId)) {
    expandedClasses.value.delete(classId);
  } else {
    expandedClasses.value.add(classId);
  }
}

// Cargar datos
async function loadData() {
  try {
    loading.value = true;
    const data = await TrainerService.getMyClasses();
    trainerInfo.value = data.trainer;
    classes.value = data.classes;
  } catch (error) {
    console.error("Error al cargar clases:", error);
    toastMessage.value = "Error al cargar tus clases. Intenta nuevamente.";
    toastType.value = "error";
    showToast.value = true;
  } finally {
    loading.value = false;
  }
}

// Estadísticas totales
const totalReservations = computed(() => {
  return classes.value.reduce((sum, cls) => sum + cls.totalReservations, 0);
});

const totalConfirmed = computed(() => {
  return classes.value.reduce((sum, cls) => sum + cls.confirmedReservations, 0);
});

const totalPending = computed(() => {
  return classes.value.reduce(
    (sum, cls) => sum + cls.pendingPaymentReservations,
    0
  );
});

onMounted(loadData);
</script>

<template>
  <section class="space-y-6">
    <!-- Encabezado -->
    <div class="flex items-center gap-3 select-none">
      <div
        class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center"
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div>
        <h2 class="text-3xl font-bold text-white">Mis Clases</h2>
        <p class="text-slate-300 text-sm mt-1">
          Gestiona tus clases y revisa las reservas
        </p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"
      ></div>
    </div>

    <!-- Contenido principal -->
    <div v-else class="space-y-6">
      <!-- Tarjetas de estadísticas -->
      <div class="grid gap-4 md:grid-cols-3">
        <!-- Total de reservas -->
        <div
          class="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-white/20 rounded-2xl p-6 shadow-2xl"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-blue-300"
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
            <div>
              <p class="text-slate-300 text-sm">Total Reservas</p>
              <p class="text-3xl font-bold text-white">
                {{ totalReservations }}
              </p>
            </div>
          </div>
        </div>

        <!-- Confirmadas -->
        <div
          class="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-white/20 rounded-2xl p-6 shadow-2xl"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-green-300"
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
            <div>
              <p class="text-slate-300 text-sm">Confirmadas</p>
              <p class="text-3xl font-bold text-white">{{ totalConfirmed }}</p>
            </div>
          </div>
        </div>

        <!-- Pendientes -->
        <div
          class="backdrop-blur-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-white/20 rounded-2xl p-6 shadow-2xl"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-amber-500/30 rounded-xl flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-amber-300"
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
              <p class="text-slate-300 text-sm">Pendientes Pago</p>
              <p class="text-3xl font-bold text-white">{{ totalPending }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de clases -->
      <div v-if="classes.length === 0" class="text-center py-12">
        <p class="text-slate-300 text-lg">
          No tienes clases asignadas todavía.
        </p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="cls in classes"
          :key="cls.id"
          class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        >
          <!-- Header de la clase (clickeable para expandir) -->
          <div
            @click="toggleClass(cls.id)"
            class="p-6 cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-white mb-2">
                  {{ cls.title }}
                </h3>
                <p class="text-slate-300 mb-4">{{ cls.description }}</p>

                <div class="flex flex-wrap gap-3 text-sm">
                  <span
                    class="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg"
                  >
                    📅 {{ cls.days.join(", ") }}
                  </span>
                  <span
                    class="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg"
                  >
                    ⏰ {{ cls.time }} ({{ cls.durationMin }} min)
                  </span>
                  <span
                    class="px-3 py-1 bg-pink-500/20 border border-pink-500/30 text-pink-300 rounded-lg"
                  >
                    👥 {{ cls.totalReservations }}/{{ cls.capacity }}
                  </span>
                  <span
                    class="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg"
                  >
                    💰 {{ formatPrice(cls.price) }}
                  </span>
                </div>
              </div>

              <!-- Indicador de expansión -->
              <div class="ml-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-white transition-transform"
                  :class="{ 'rotate-180': expandedClasses.has(cls.id) }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <!-- Badge con estadísticas rápidas -->
            <div class="flex gap-2 mt-4">
              <span
                class="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-xs font-semibold"
              >
                ✅ {{ cls.confirmedReservations }} confirmadas
              </span>
              <span
                v-if="cls.pendingPaymentReservations > 0"
                class="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold"
              >
                ⏳ {{ cls.pendingPaymentReservations }} pendientes
              </span>
            </div>
          </div>

          <!-- Lista de reservas (expandible) -->
          <div
            v-show="expandedClasses.has(cls.id)"
            class="border-t border-white/10 bg-black/20"
          >
            <div v-if="cls.reservations.length === 0" class="p-6 text-center">
              <p class="text-slate-400">No hay reservas para esta clase.</p>
            </div>

            <div v-else class="divide-y divide-white/10">
              <div
                v-for="reservation in cls.reservations"
                :key="reservation.id"
                class="p-6 hover:bg-white/5 transition-colors"
              >
                <div class="flex items-start gap-4">
                  <!-- Avatar del usuario -->
                  <div
                    class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <span class="text-white font-bold text-lg">
                      {{ reservation.user.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>

                  <!-- Información del usuario y reserva -->
                  <div class="flex-1">
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h4 class="text-white font-semibold text-lg">
                          {{ reservation.user.name }}
                        </h4>
                        <p class="text-slate-400 text-sm">
                          {{ reservation.user.email }}
                        </p>
                        <p class="text-slate-400 text-sm">
                          📱 {{ reservation.user.phone }}
                        </p>
                      </div>

                      <!-- Estado de la reserva -->
                      <span
                        class="px-3 py-1 rounded-lg border text-sm font-semibold"
                        :class="getStatusColor(reservation.status)"
                      >
                        {{ getStatusText(reservation.status) }}
                      </span>
                    </div>

                    <!-- Detalles de la reserva -->
                    <div class="flex flex-wrap gap-3 mt-3 text-sm">
                      <span class="text-slate-300">
                        📅 <strong>Fecha clase:</strong>
                        {{ formatDate(reservation.date) }}
                      </span>
                      <span class="text-slate-300">
                        🕐 <strong>Reservado el:</strong>
                        {{ formatCreatedAt(reservation.createdAt) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Toast
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </section>
</template>
