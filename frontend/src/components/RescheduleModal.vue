<script setup>
import { ref, computed, watch } from "vue";
import { ReservationsService } from "@/services/reservations";

const props = defineProps({
  show: Boolean,
  reservation: Object,
});

const emit = defineEmits(["close", "success"]);

const newDate = ref("");
const loading = ref(false);
const error = ref("");

// Verificar si se puede reagendar (al menos 2 horas antes)
const canReschedule = computed(() => {
  if (!props.reservation?.date || !props.reservation?.klass?.time) return true;

  const classTime = props.reservation.klass.time; // Ejemplo: "08:00"
  const [hours, minutes] = classTime.split(":").map(Number);

  const classDateTime = new Date(props.reservation.date);
  classDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const hoursUntilClass = (classDateTime - now) / (1000 * 60 * 60);

  return hoursUntilClass >= 2;
});

const timeUntilClass = computed(() => {
  if (!props.reservation?.date || !props.reservation?.klass?.time) return "";

  const classTime = props.reservation.klass.time;
  const [hours, minutes] = classTime.split(":").map(Number);

  const classDateTime = new Date(props.reservation.date);
  classDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const hoursUntilClass = (classDateTime - now) / (1000 * 60 * 60);

  if (hoursUntilClass < 0) return "La clase ya ocurrió";
  if (hoursUntilClass < 2)
    return `Faltan ${Math.round(hoursUntilClass * 60)} minutos`;
  return `Faltan ${Math.round(hoursUntilClass)} horas`;
});

// Calcular fecha mínima (mañana)
const minDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
});

// Calcular fecha máxima (3 meses desde hoy)
const maxDate = computed(() => {
  const max = new Date();
  max.setMonth(max.getMonth() + 3);
  return max.toISOString().split("T")[0];
});

// Obtener días válidos de la clase
const validDays = computed(() => {
  if (!props.reservation?.klass?.days) return [];
  if (!Array.isArray(props.reservation.klass.days)) return [];

  const dayMap = {
    Domingo: 0,
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
  };

  return props.reservation.klass.days
    .map((d) => dayMap[d])
    .filter((day) => day !== undefined);
});

// Validar que la fecha seleccionada sea un día válido
const isValidDay = (dateString) => {
  if (!dateString) return false;
  if (!validDays.value || validDays.value.length === 0) return false;

  const date = new Date(dateString + "T00:00:00");
  const dayOfWeek = date.getDay();

  return validDays.value.includes(dayOfWeek);
};

async function handleReschedule() {
  error.value = "";

  if (!canReschedule.value) {
    error.value =
      "No puedes reagendar esta reserva. Debe hacerse con al menos 2 horas de anticipación.";
    return;
  }

  if (!newDate.value) {
    error.value = "Por favor selecciona una nueva fecha";
    return;
  }

  if (!isValidDay(newDate.value)) {
    const validDayNames =
      props.reservation?.klass?.days?.join(", ") || "días válidos";
    error.value = `Esta clase solo está disponible los días: ${validDayNames}`;
    return;
  }

  loading.value = true;

  try {
    // Obtener el classId correcto
    const classId =
      props.reservation.classId ||
      props.reservation.klass?.id ||
      props.reservation.klass?._id;

    if (!classId) {
      throw new Error("No se pudo obtener el ID de la clase");
    }

    // Convertir la fecha a formato ISO con hora del mediodía para evitar problemas de zona horaria
    const localDate = new Date(newDate.value + "T12:00:00");
    const dateISO = localDate.toISOString();

    console.log("Reagendando - classId:", classId, "dateISO:", dateISO);

    // Primero cancelamos la reserva actual
    await ReservationsService.remove(
      props.reservation.id || props.reservation._id
    );

    // Luego creamos una nueva reserva con la nueva fecha
    const newReservation = await ReservationsService.create(classId, dateISO);

    console.log("Nueva reserva creada:", newReservation);

    // Emitir evento de éxito ANTES de cerrar
    emit("success");

    // Emitir evento de cambio global
    window.dispatchEvent(new CustomEvent("reservation:changed"));

    // Pequeño delay para asegurar que se procesen los eventos
    await new Promise((resolve) => setTimeout(resolve, 100));

    emit("close");
  } catch (err) {
    console.error("Error al reagendar:", err);
    error.value =
      err.response?.data?.error ||
      err.message ||
      "Error al reagendar la reserva";
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  if (!loading.value) {
    error.value = "";
    newDate.value = "";
    emit("close");
  }
}

// Limpiar el formulario cuando se abre el modal
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      error.value = "";
      newDate.value = "";
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div
          class="backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-white/20 rounded-3xl shadow-2xl max-w-lg w-full p-8 transform transition-all"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center"
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white">Reagendar Reserva</h3>
            </div>
            <button
              @click="handleClose"
              :disabled="loading"
              class="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Información de la clase -->
          <div class="bg-white/5 rounded-2xl p-4 mb-6">
            <p class="text-white font-semibold text-lg mb-2">
              {{ reservation?.klass?.title }}
            </p>
            <p class="text-slate-300 text-sm mb-1">
              👤 {{ reservation?.klass?.coach?.name }}
            </p>
            <p class="text-slate-400 text-sm mb-3">
              📅 Fecha actual:
              {{ new Date(reservation?.date).toLocaleDateString("es-CL") }}
            </p>
            <p class="text-blue-300 text-sm mb-2">
              📌 Días disponibles: {{ reservation?.klass?.days?.join(", ") }}
            </p>
            <p
              class="text-sm font-semibold"
              :class="canReschedule ? 'text-emerald-400' : 'text-red-400'"
            >
              ⏰ {{ timeUntilClass }}
            </p>
          </div>

          <!-- Alerta si no se puede reagendar -->
          <div
            v-if="!canReschedule"
            class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-red-300 text-sm flex items-start gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              >No puedes reagendar esta reserva porque faltan menos de 2 horas
              para la clase o ya ocurrió.</span
            >
          </div>

          <!-- Formulario -->
          <div class="space-y-4">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Nueva Fecha
              </label>
              <input
                v-model="newDate"
                type="date"
                :min="minDate"
                :max="maxDate"
                :disabled="loading"
                class="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                required
              />
              <p class="text-slate-400 text-xs mt-2">
                * Selecciona un día que corresponda con los días disponibles de
                la clase
              </p>
            </div>

            <!-- Error -->
            <div
              v-if="error"
              class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex items-start gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ error }}</span>
            </div>

            <!-- Botones -->
            <div class="flex gap-3 pt-2">
              <button
                @click="handleClose"
                :disabled="loading"
                class="flex-1 px-6 py-3 rounded-xl bg-slate-700/50 text-slate-300 font-semibold hover:bg-slate-700 transition-all duration-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                @click="handleReschedule"
                :disabled="loading || !newDate || !canReschedule"
                class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:transform-none"
              >
                <span
                  v-if="loading"
                  class="flex items-center justify-center gap-2"
                >
                  <svg
                    class="animate-spin h-5 w-5"
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
                  Reagendando...
                </span>
                <span v-else> 🔄 Reagendar </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
