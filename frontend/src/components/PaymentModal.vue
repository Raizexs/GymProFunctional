<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed flex items-center justify-center p-4"
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
    >
      <div
        class="bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full border border-white/10"
      >
        <!-- Header -->
        <div class="p-6 border-b border-white/10">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-white">💳 Confirmar Pago</h3>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          <!-- Información de la clase (solo para reservas) -->
          <div
            v-if="!isPlanPayment && reservation"
            class="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <h4 class="font-semibold text-white mb-2">
              {{ reservation.klass?.title || reservation.classId?.title }}
            </h4>
            <div class="text-sm text-gray-400 space-y-1">
              <p>📅 {{ formatDate(reservation.date) }}</p>
              <p>
                🕐 {{ reservation.klass?.time || reservation.classId?.time }}
              </p>
              <p>
                👤
                {{
                  reservation.klass?.coach?.name ||
                  reservation.classId?.coachId?.name
                }}
              </p>
            </div>
          </div>

          <!-- Información del plan (solo para planes) -->
          <div
            v-if="isPlanPayment"
            class="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <h4 class="font-semibold text-white mb-2">
              💎 {{ payment.planName }}
            </h4>
            <p class="text-sm text-gray-400">{{ payment.description }}</p>
          </div>

          <!-- Monto -->
          <div
            class="flex items-center justify-between py-4 border-y border-white/10"
          >
            <span
              class="text-gray-400"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              Total a pagar:
            </span>
            <span
              class="text-2xl font-bold text-emerald-400"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              {{ formatPrice(getPrice()) }}
            </span>
          </div>

          <!-- Estado del pago -->
          <div v-if="paymentStatus === 'processing'" class="text-center py-4">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"
            ></div>
            <p
              class="mt-2 text-gray-400"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              Procesando pago...
            </p>
          </div>

          <div v-if="paymentStatus === 'success'" class="text-center py-4">
            <div class="text-5xl mb-2">✅</div>
            <p
              class="text-emerald-400 font-semibold"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              ¡Pago exitoso!
            </p>
            <p
              class="text-sm text-gray-400 mt-1"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              {{
                isPlanPayment
                  ? "Tu plan ha sido adquirido"
                  : "Tu reserva ha sido confirmada"
              }}
            </p>
          </div>

          <div v-if="paymentStatus === 'error'" class="text-center py-4">
            <div class="text-5xl mb-2">❌</div>
            <p
              class="text-red-400 font-semibold"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              Error en el pago
            </p>
            <p
              class="text-sm text-gray-400 mt-1"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              {{ errorMessage }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-white/10 flex gap-3">
          <button
            v-if="paymentStatus === 'idle'"
            @click="processPayment"
            class="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            style="
              user-select: none;
              -webkit-user-select: none;
              pointer-events: auto;
            "
            unselectable="on"
          >
            Confirmar Pago
          </button>

          <button
            v-if="paymentStatus === 'error'"
            @click="resetPayment"
            class="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            style="
              user-select: none;
              -webkit-user-select: none;
              pointer-events: auto;
            "
            unselectable="on"
          >
            Reintentar
          </button>

          <button
            v-if="paymentStatus === 'success' || paymentStatus === 'error'"
            @click="closeModal"
            class="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            style="
              user-select: none;
              -webkit-user-select: none;
              pointer-events: auto;
            "
            unselectable="on"
          >
            Cerrar
          </button>

          <button
            v-if="paymentStatus === 'idle'"
            @click="$emit('close')"
            class="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            style="
              user-select: none;
              -webkit-user-select: none;
              pointer-events: auto;
            "
            unselectable="on"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from "vue";
import { PaymentsService } from "../services/payments";

const props = defineProps({
  show: Boolean,
  reservation: Object,
  payment: Object, // Para pagos de planes
});

const emit = defineEmits(["close", "success"]);

const paymentStatus = ref("idle"); // idle, processing, success, error
const errorMessage = ref("");

const isPlanPayment = computed(() => !!props.payment?.isPlan);

const getTitle = () => {
  return isPlanPayment.value
    ? props.payment?.planName || "Plan"
    : props.reservation?.klass?.title || props.reservation?.classId?.title;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getPrice = () => {
  // Si es un pago de plan, usar el monto del payment
  if (isPlanPayment.value) {
    return Number(props.payment?.amount || 0);
  }

  // Si es una reserva, obtener el precio de la clase
  const price =
    props.reservation?.klass?.price || props.reservation?.classId?.price || 0;

  console.log("Reservation data:", props.reservation);
  console.log("Price found:", price);

  return Number(price);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const processPayment = async () => {
  try {
    paymentStatus.value = "processing";
    errorMessage.value = "";

    // Simular procesamiento de pago
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Si es un pago de plan, solo emitir success (el padre maneja la confirmación)
    if (isPlanPayment.value) {
      paymentStatus.value = "success";
      setTimeout(() => {
        emit("success");
        closeModal();
      }, 1500);
      return;
    }

    // Si es una reserva, procesar normalmente
    const price = getPrice();

    // Crear payment intent
    const paymentIntent = await PaymentsService.createPaymentIntent(
      props.reservation.id || props.reservation._id,
      price
    );

    // Confirmar el pago
    await PaymentsService.confirmPayment(paymentIntent.stripePaymentIntentId);

    paymentStatus.value = "success";

    // Emitir evento de éxito después de 1.5 segundos
    setTimeout(() => {
      emit("success");
      closeModal();
    }, 1500);
  } catch (error) {
    paymentStatus.value = "error";
    errorMessage.value =
      error.response?.data?.error || "Ocurrió un error al procesar el pago";
  }
};

const resetPayment = () => {
  paymentStatus.value = "idle";
  errorMessage.value = "";
};

const closeModal = () => {
  resetPayment();
  emit("close");
};
</script>
