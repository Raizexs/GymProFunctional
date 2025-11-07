<script setup>
import { ref, computed, onMounted } from "vue";
import { ClassesService } from "@/services/classes";
import { ReservationsService } from "@/services/reservations";
import { TrainerService } from "@/services/trainer";
import { useAuthStore } from "@/stores/auth";
import Toast from "@/components/Toast.vue";

const classes = ref([]);
const selectedClass = ref(null);
const selectedDate = ref("");
const reservations = ref([]);
const loading = ref(false);
const error = ref("");

// Toast
const toast = ref({ show: false, message: "", type: "success" });

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// Fecha por defecto (hoy)
const today = computed(() => {
  const date = new Date();
  return date.toISOString().split("T")[0];
});

onMounted(async () => {
  try {
    // Cargar sesión (si no está cargada en otro lugar)
    const auth = useAuthStore();
    auth.loadFromStorage?.();

    // Si el usuario es TRAINER, obtener solo sus clases con reservas
    if (auth.user && auth.user.role === "TRAINER") {
      const data = await TrainerService.getMyClasses();
      // `data` viene con { trainer, classes }
      // Mapear al formato esperado por el select (id, title, coach)
      classes.value = (data.classes || []).map((c) => ({
        id: c.id,
        title: c.title,
        coach: c.coach || {},
        // mantener reservas localmente para evitar llamadas extra
        reservations: c.reservations || [],
      }));
    } else {
      classes.value = await ClassesService.list();
    }

    selectedDate.value = today.value;
  } catch (e) {
    error.value =
      e?.response?.data?.error || "No se pudieron cargar las clases";
  }
});

const loadReservations = async () => {
  if (!selectedClass.value || !selectedDate.value) {
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    // Si tenemos reservas embedidas (modo entrenador), usarlas y filtrar por fecha
    const cls = classes.value.find((c) => c.id === selectedClass.value);
    if (cls && Array.isArray(cls.reservations) && cls.reservations.length > 0) {
      // Filtrar por fecha (comparar solo fecha YYYY-MM-DD)
      const target = new Date(selectedDate.value + "T00:00:00");
      reservations.value = cls.reservations
        .filter((r) => {
          const rd = new Date(r.date);
          return (
            rd.getFullYear() === target.getFullYear() &&
            rd.getMonth() === target.getMonth() &&
            rd.getDate() === target.getDate()
          );
        })
        .map((r) => ({
          _id: r.id || r._id,
          userId: r.user,
          attended: r.attended,
          status: r.status,
          date: r.date,
        }));
    } else {
      // Modo normal: pedir al backend
      reservations.value = await ReservationsService.getClassReservations(
        selectedClass.value,
        selectedDate.value
      );
    }
  } catch (e) {
    error.value =
      e?.response?.data?.error || "No se pudieron cargar las reservas";
    reservations.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleAttendance = async (reservation) => {
  try {
    const newAttendedValue = !reservation.attended;
    await ReservationsService.markAttendance(reservation._id, newAttendedValue);

    // Actualizar localmente
    reservation.attended = newAttendedValue;
    reservation.status = newAttendedValue ? "COMPLETED" : "CONFIRMED";

    const message = newAttendedValue
      ? "✅ Asistencia marcada"
      : "❌ No-show registrado. Si el usuario tiene 3+ ausencias en 30 días, se aplicará penalización.";

    showToast(message, "success");
  } catch (e) {
    showToast(
      e?.response?.data?.error || "Error al actualizar asistencia",
      "error"
    );
  }
};

const selectedClassName = computed(() => {
  const cls = classes.value.find((c) => c.id === selectedClass.value);
  return cls?.title || "";
});

const formattedDate = computed(() => {
  if (!selectedDate.value) return "";
  const date = new Date(selectedDate.value + "T00:00:00");
  return date.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const attendedCount = computed(() => {
  return reservations.value.filter((r) => r.attended).length;
});

const noShowCount = computed(() => {
  return reservations.value.filter((r) => !r.attended).length;
});
</script>

<template>
  <section class="space-y-6">
    <!-- Título -->
    <div
      class="flex items-center gap-3"
      style="user-select: none; -webkit-user-select: none"
    >
      <div
        class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center"
      >
        <span class="text-2xl">✓</span>
      </div>
      <h2 class="text-3xl font-bold text-white">Control de Asistencia</h2>
    </div>

    <!-- Filtros -->
    <div
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <!-- Selector de clase -->
        <div>
          <label class="block text-white font-semibold mb-2">
            Seleccionar Clase
          </label>
          <select
            v-model="selectedClass"
            @change="loadReservations"
            class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option :value="null">-- Selecciona una clase --</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.title }} ({{ cls.coach.name }})
            </option>
          </select>
        </div>

        <!-- Selector de fecha -->
        <div>
          <label class="block text-white font-semibold mb-2">
            Seleccionar Fecha
          </label>
          <input
            type="date"
            v-model="selectedDate"
            @change="loadReservations"
            class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <!-- Botón cargar -->
      <button
        v-if="selectedClass && selectedDate"
        @click="loadReservations"
        :disabled="loading"
        class="mt-4 w-full px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold hover:bg-emerald-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? "⏳ Cargando..." : "🔍 Buscar Reservas" }}
      </button>
    </div>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300"
    >
      ⚠️ {{ error }}
    </div>

    <!-- Información de la clase seleccionada -->
    <div
      v-if="
        selectedClass && selectedDate && !loading && reservations.length > 0
      "
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-xl font-bold text-white mb-2">{{ selectedClassName }}</h3>
      <p class="text-slate-300 mb-4">📅 {{ formattedDate }}</p>

      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <p class="text-3xl font-bold text-white">{{ reservations.length }}</p>
          <p class="text-slate-400 text-sm">Total Reservas</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold text-emerald-400">{{ attendedCount }}</p>
          <p class="text-slate-400 text-sm">Asistieron</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold text-red-400">{{ noShowCount }}</p>
          <p class="text-slate-400 text-sm">No Show</p>
        </div>
      </div>
    </div>

    <!-- Lista de reservas -->
    <div
      v-if="loading"
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-2xl text-center"
    >
      <div class="w-20 h-20 mx-auto mb-4">
        <svg
          class="animate-spin h-20 w-20 text-emerald-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      <p class="text-slate-300 text-lg font-semibold">
        ⏳ Cargando reservas...
      </p>
      <p class="text-slate-400 text-sm mt-2">Por favor espera un momento</p>
    </div>

    <div v-else-if="!loading && reservations.length > 0" class="space-y-4">
      <article
        v-for="reservation in reservations"
        :key="reservation._id"
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300"
      >
        <div class="flex items-center justify-between">
          <!-- Info del usuario -->
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center"
              :class="
                reservation.attended
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                  : 'bg-gradient-to-br from-slate-600 to-slate-700'
              "
            >
              <span class="text-2xl">
                {{ reservation.attended ? "✓" : "?" }}
              </span>
            </div>
            <div>
              <p class="font-bold text-white text-lg">
                {{ reservation.userId.name }}
              </p>
              <p class="text-slate-300 text-sm">
                📧 {{ reservation.userId.email }}
              </p>
              <p class="text-slate-400 text-xs mt-1">
                Estado:
                <span
                  :class="
                    reservation.status === 'COMPLETED'
                      ? 'text-emerald-400'
                      : 'text-blue-400'
                  "
                >
                  {{
                    reservation.status === "COMPLETED"
                      ? "COMPLETADO"
                      : "CONFIRMADO"
                  }}
                </span>
              </p>
            </div>
          </div>

          <!-- Botón de asistencia -->
          <button
            @click="toggleAttendance(reservation)"
            class="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            :class="
              reservation.attended
                ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
            "
            style="user-select: none; -webkit-user-select: none"
          >
            {{ reservation.attended ? "❌ Desmarcar" : "✅ Marcar Presente" }}
          </button>
        </div>
      </article>
    </div>

    <!-- Mensaje cuando no hay reservas -->
    <div
      v-if="
        !loading && selectedClass && selectedDate && reservations.length === 0
      "
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-2xl text-center"
    >
      <div
        class="w-20 h-20 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-10 w-10 text-slate-400"
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
      <p class="text-slate-300 text-lg">
        No hay reservas confirmadas para esta clase en esta fecha.
      </p>
    </div>

    <!-- Mensaje inicial -->
    <div
      v-if="!selectedClass || !selectedDate"
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-2xl text-center"
    >
      <div
        class="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4"
      >
        <span class="text-4xl">📋</span>
      </div>
      <p class="text-slate-300 text-lg">
        Selecciona una clase y una fecha para ver las reservas.
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
