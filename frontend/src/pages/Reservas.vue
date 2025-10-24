<script setup>
import { ref, onMounted, computed } from "vue";
import { ReservationsService } from "@/services/reservations";
import ConfirmModal from "@/components/ConfirmModal.vue";
import PaymentModal from "@/components/PaymentModal.vue";
import RescheduleModal from "@/components/RescheduleModal.vue";

const items = ref([]);
const open = ref(false);
const toDelete = ref(null);
const showPaymentModal = ref(false);
const reservationToPay = ref(null);
const showRescheduleModal = ref(false);
const reservationToReschedule = ref(null);

async function load() {
  items.value = await ReservationsService.mine();
}

function askCancel(it) {
  toDelete.value = it;
  open.value = true;
}

async function confirmCancel() {
  await ReservationsService.remove(toDelete.value.id);
  window.dispatchEvent(new CustomEvent("reservation:changed"));
  open.value = false;
  toDelete.value = null;
  load();
}

function openPayment(reservation) {
  reservationToPay.value = reservation;
  showPaymentModal.value = true;
}

function closePayment() {
  showPaymentModal.value = false;
  reservationToPay.value = null;
}

function onPaymentSuccess() {
  load();
  window.dispatchEvent(new CustomEvent("reservation:changed"));
}

function openReschedule(reservation) {
  reservationToReschedule.value = reservation;
  showRescheduleModal.value = true;
}

function closeReschedule() {
  showRescheduleModal.value = false;
  reservationToReschedule.value = null;
}

function onRescheduleSuccess() {
  load();
  window.dispatchEvent(new CustomEvent("reservation:changed"));
}

// Computed para agrupar reservas por estado
const pendingPaymentReservations = computed(() =>
  items.value.filter((r) => r.status === "PENDING_PAYMENT")
);

const confirmedReservations = computed(() =>
  items.value.filter((r) => r.status === "CONFIRMED")
);

const completedReservations = computed(() =>
  items.value.filter((r) => r.status === "COMPLETED")
);

const cancelledReservations = computed(() =>
  items.value.filter((r) => r.status === "CANCELLED")
);

onMounted(load);
</script>
<template>
  <section class="space-y-6">
    <!-- Título -->
    <div
      class="flex items-center gap-3 select-none"
      style="
        user-select: none;
        -webkit-user-select: none;
        pointer-events: none;
        cursor: default;
      "
    >
      <div
        class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center select-none"
        style="
          user-select: none;
          -webkit-user-select: none;
          pointer-events: none;
          cursor: default;
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-white select-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style="
            user-select: none;
            -webkit-user-select: none;
            pointer-events: none;
            cursor: default;
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
      <h2
        class="text-3xl font-bold text-white select-none"
        style="
          user-select: none;
          -webkit-user-select: none;
          pointer-events: none;
          cursor: default;
        "
      >
        Mis Reservas
      </h2>
    </div>

    <!-- Reservas Pendientes de Pago -->
    <div v-if="pendingPaymentReservations.length > 0" class="space-y-3">
      <h3
        class="text-xl font-semibold text-amber-400 flex items-center gap-2"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        ⏳ Pendientes de Pago
      </h3>
      <article
        v-for="r in pendingPaymentReservations"
        :key="r.id"
        class="backdrop-blur-xl bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-2xl hover:scale-105 hover:bg-amber-500/15 transition-all duration-300"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div class="flex items-start gap-4 flex-1">
            <div
              class="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0"
            >
              <span class="text-2xl">💳</span>
            </div>
            <div class="flex-1">
              <p class="font-bold text-white text-lg">{{ r.klass?.title }}</p>
              <p class="text-slate-300 text-sm mt-1">
                👤 {{ r.klass?.coach?.name }}
              </p>
              <p class="text-slate-400 text-sm mt-1">
                📅 {{ new Date(r.date).toLocaleDateString("es-CL") }}
              </p>
              <p class="text-amber-300 text-sm mt-2 font-semibold">
                💵 Precio: ${{ r.klass?.price?.toFixed(3) || "0.000" }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="openPayment(r)"
              class="px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold hover:bg-emerald-500/30 hover:scale-105 transition-all duration-300"
              style="user-select: none; -webkit-user-select: none"
            >
              💳 Pagar Ahora
            </button>
            <button
              @click="openReschedule(r)"
              class="px-6 py-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold hover:bg-blue-500/30 hover:scale-105 transition-all duration-300"
              style="user-select: none; -webkit-user-select: none"
            >
              🔄 Reagendar
            </button>
            <button
              @click="askCancel(r)"
              class="px-6 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 font-semibold hover:bg-red-500/30 hover:scale-105 transition-all duration-300"
              style="user-select: none; -webkit-user-select: none"
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Reservas Confirmadas -->
    <div v-if="confirmedReservations.length > 0" class="space-y-3">
      <h3
        class="text-xl font-semibold text-emerald-400 flex items-center gap-2"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        ✅ Confirmadas
      </h3>
      <article
        v-for="r in confirmedReservations"
        :key="r.id"
        class="backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl hover:scale-105 hover:bg-emerald-500/15 transition-all duration-300"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div class="flex items-start gap-4 flex-1">
            <div
              class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0"
            >
              <span class="text-2xl">✓</span>
            </div>
            <div class="flex-1">
              <p class="font-bold text-white text-lg">{{ r.klass?.title }}</p>
              <p class="text-slate-300 text-sm mt-1">
                👤 {{ r.klass?.coach?.name }}
              </p>
              <p class="text-slate-400 text-sm mt-1">
                📅 {{ new Date(r.date).toLocaleDateString("es-CL") }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="openReschedule(r)"
              class="px-6 py-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold hover:bg-blue-500/30 hover:scale-105 transition-all duration-300"
              style="user-select: none; -webkit-user-select: none"
            >
              🔄 Reagendar
            </button>
            <button
              @click="askCancel(r)"
              class="px-6 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 font-semibold hover:bg-red-500/30 hover:scale-105 transition-all duration-300"
              style="user-select: none; -webkit-user-select: none"
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Mensaje cuando no hay reservas -->
    <div
      v-if="!items.length"
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-2xl text-center"
      style="user-select: none; -webkit-user-select: none"
      unselectable="on"
    >
      <div
        class="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-10 w-10 text-indigo-400"
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
      <p
        class="text-slate-300 text-lg"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        Aún no tienes reservas.
      </p>
      <p
        class="text-slate-400 text-sm mt-2"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        Reserva tu primera clase para empezar a entrenar
      </p>
    </div>

    <ConfirmModal
      :open="open"
      title="¿Cancelar reserva?"
      :message="
        toDelete
          ? `Esta acción eliminará definitivamente tu cita para ${
              toDelete.klass?.title
            } (${new Date(toDelete.date).toLocaleDateString(
              'es-CL'
            )}). ¿Deseas continuar?`
          : ''
      "
      @cancel="open = false"
      @confirm="confirmCancel"
    />

    <PaymentModal
      v-if="reservationToPay"
      :show="showPaymentModal"
      :reservation="reservationToPay"
      @close="closePayment"
      @success="onPaymentSuccess"
    />

    <RescheduleModal
      v-if="reservationToReschedule"
      :show="showRescheduleModal"
      :reservation="reservationToReschedule"
      @close="closeReschedule"
      @success="onRescheduleSuccess"
    />
  </section>
</template>
