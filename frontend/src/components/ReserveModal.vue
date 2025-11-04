<script setup>
import { ref, computed, watch } from "vue";
import { ReservationsService } from "@/services/reservations";

const props = defineProps({
  open: Boolean,
  klass: Object,
  myReservations: Array,
});

const emit = defineEmits(["close", "created", "success"]);

const error = ref("");
const date = ref("");

const daysLabel = computed(() => (props.klass?.days || []).join(", "));

// Obtener fechas canceladas para esta clase específica
const cancelledDates = computed(() => {
  if (!props.klass || !props.myReservations) return [];
  return props.myReservations
    .filter((r) => r.klass?.id === props.klass.id && r.status === "CANCELLED")
    .map((r) => {
      const d = new Date(r.date);
      return d.toISOString().split("T")[0];
    });
});

// Obtener fechas con reserva activa para esta clase
const reservedDates = computed(() => {
  if (!props.klass || !props.myReservations) return [];
  return props.myReservations
    .filter(
      (r) =>
        r.klass?.id === props.klass.id &&
        (r.status === "CONFIRMED" || r.status === "PENDING_PAYMENT")
    )
    .map((r) => {
      const d = new Date(r.date);
      return d.toISOString().split("T")[0];
    });
});

// Mapeo de días en español a números (0 = Domingo, 1 = Lunes, etc.)
const dayNameToNumber = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
};

// Convertir los días de la clase a números
const allowedDayNumbers = computed(() => {
  if (!props.klass?.days) return [];
  return props.klass.days
    .map((day) => dayNameToNumber[day] || -1)
    .filter((n) => n !== -1);
});

// Fecha mínima (hoy)
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

watch(
  () => props.open,
  (v) => {
    if (v) {
      error.value = "";
      date.value = "";
    }
  }
);

function validateDate(dateString) {
  if (!dateString) {
    return "Debes seleccionar una fecha";
  }

  const selectedDate = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Verificar que no sea una fecha pasada
  if (selectedDate < today) {
    return "No puedes reservar en fechas pasadas";
  }

  // Verificar si la fecha está cancelada
  if (cancelledDates.value.includes(dateString)) {
    return "Ya cancelaste una reserva para este día. Por favor selecciona otra fecha.";
  }

  // Verificar si la fecha ya tiene una reserva activa
  if (reservedDates.value.includes(dateString)) {
    return "Ya tienes una reserva activa para este día.";
  }

  // Obtener el día de la semana (0 = Domingo, 1 = Lunes, etc.)
  const dayOfWeek = selectedDate.getDay();

  // Verificar que el día esté en los días permitidos
  if (!allowedDayNumbers.value.includes(dayOfWeek)) {
    const daysNames = props.klass?.days || [];
    return `Esta clase solo está disponible los ${daysNames.join(
      ", "
    )}. Por favor selecciona un día válido.`;
  }

  return null;
}

async function confirm() {
  error.value = "";

  // Validar la fecha antes de enviar
  const validationError = validateDate(date.value);
  if (validationError) {
    error.value = validationError;
    return;
  }

  try {
    // Convertir la fecha a formato ISO con zona horaria local para evitar desfase
    const localDate = new Date(date.value + "T12:00:00");
    const isoDate = localDate.toISOString();

    const reservation = await ReservationsService.create(
      props.klass.id,
      isoDate
    );
    window.dispatchEvent(new CustomEvent("reservation:changed"));

    // Si la reserva tiene estado PENDING_PAYMENT, emitir evento para abrir modal de pago
    if (reservation.status === "PENDING_PAYMENT") {
      emit("pendingPayment", {
        ...reservation,
        klass: props.klass, // Incluir toda la info de la clase
      });
      emit("close");
      return;
    }

    // Si es gratis (CONFIRMED), mostrar mensaje de éxito
    emit("success", {
      message:
        "¡Reserva confirmada! Puedes ver tu reserva en el apartado de Mis Reservas.",
      className: props.klass.title,
    });

    emit("created");
    emit("close");
  } catch (e) {
    error.value = e?.response?.data?.error || "No se pudo reservar";
  }
}
</script>
<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      style="
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 1rem !important;
        z-index: 9999 !important;
        background-color: rgba(0, 0, 0, 0.6) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      "
      @click.self="$emit('close')"
    >
      <div
        class="backdrop-blur-xl bg-slate-900/90 border border-white/20 rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in select-none"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <!-- Header -->
        <div
          class="flex justify-between items-start mb-6 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <div
            class="select-none"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <h3
              class="text-2xl font-bold text-white flex items-center gap-3 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <div
                class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center select-none"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-white"
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
              <span
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
                >Reservar Clase</span
              >
            </h3>
          </div>
          <button
            @click="$emit('close')"
            class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center select-none"
            style="
              user-select: none;
              -webkit-user-select: none;
              pointer-events: auto;
              cursor: pointer;
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
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
        <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <p class="text-white font-semibold text-lg">{{ klass?.title }}</p>
          <p class="text-slate-300 text-sm mt-1 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
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
            con {{ klass?.coach?.name }}
          </p>
        </div>

        <!-- Selección de fecha -->
        <div class="mb-4">
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
            Selecciona una fecha
          </label>
          <input
            type="date"
            :min="minDate"
            class="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
            v-model="date"
          />
          <p
            class="text-xs text-slate-400 mt-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2"
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
            Días disponibles: {{ daysLabel }}
          </p>
          <p
            v-if="cancelledDates.length > 0"
            class="text-xs text-orange-400 mt-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2"
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Tienes {{ cancelledDates.length }} reserva(s) cancelada(s)
            previamente para esta clase. Puedes reservar en una fecha diferente.
          </p>
        </div>

        <!-- Error message -->
        <p
          v-if="error"
          class="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
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
          {{ error }}
        </p>

        <!-- Botones -->
        <div class="flex gap-3">
          <button
            class="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-all duration-300"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <button
            class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            :disabled="!date"
            @click="confirm"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Confirmar Reserva
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
