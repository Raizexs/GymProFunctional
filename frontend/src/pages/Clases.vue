<script setup>
import { ref, onMounted, computed } from "vue";
import { ClassesService } from "@/services/classes";
import { ReservationsService } from "@/services/reservations";
import ReserveModal from "@/components/ReserveModal.vue";
import PaymentModal from "@/components/PaymentModal.vue";
import Toast from "@/components/Toast.vue";

const items = ref([]);
const myReservations = ref([]);
const selected = ref(null);
const open = ref(false);
const showToast = ref(false);
const toastMessage = ref("");
const showPaymentModal = ref(false);
const reservationToPay = ref(null);

// Obtener el estado de reserva para una clase
function getReservationStatus(classId) {
  // Buscar reservas confirmadas para esta clase
  const confirmedReservations = myReservations.value.filter(
    (r) => r.klass?.id === classId && r.status === "CONFIRMED"
  );

  // Buscar reservas pendientes de pago para esta clase
  const pendingPaymentReservations = myReservations.value.filter(
    (r) => r.klass?.id === classId && r.status === "PENDING_PAYMENT"
  );

  // Buscar reservas canceladas para esta clase
  const cancelledReservations = myReservations.value.filter(
    (r) => r.klass?.id === classId && r.status === "CANCELLED"
  );

  return {
    hasConfirmedReservation: confirmedReservations.length > 0,
    hasPendingPayment: pendingPaymentReservations.length > 0,
    hasCancelledReservation: cancelledReservations.length > 0,
    confirmedCount: confirmedReservations.length,
    pendingCount: pendingPaymentReservations.length,
    cancelledCount: cancelledReservations.length,
    pendingReservation: pendingPaymentReservations[0] || null,
  };
}

async function load() {
  items.value = await ClassesService.list();
  await loadMyReservations();
}

async function loadMyReservations() {
  try {
    myReservations.value = await ReservationsService.mine();
  } catch (e) {
    console.error("Error al cargar reservas:", e);
    myReservations.value = [];
  }
}

function openReserve(k) {
  selected.value = k;
  open.value = true;
}

function handleSuccess(data) {
  toastMessage.value = data.message;
  showToast.value = true;
  // Recargar las reservas después de confirmar
  load();
}

function handlePendingPayment(reservation) {
  reservationToPay.value = reservation;
  showPaymentModal.value = true;
  // Recargar las reservas para mostrar la pendiente
  load();
}

function closePayment() {
  showPaymentModal.value = false;
  reservationToPay.value = null;
}

function onPaymentSuccess() {
  toastMessage.value =
    "¡Pago procesado exitosamente! Tu reserva ha sido confirmada.";
  showToast.value = true;
  load(); // Recargar las clases y reservas
}

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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
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
        Clases Disponibles
      </h2>
    </div>

    <!-- Grid de clases -->
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="k in items"
        :key="k.id"
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 hover:bg-white/15 transition-all duration-300 group"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <!-- Encabezado de la tarjeta -->
        <div
          class="flex items-start justify-between mb-4 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <div
            class="flex-1"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <h3
              class="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              {{ k.title }}
            </h3>
            <p
              class="text-slate-300 text-sm mt-2 line-clamp-2"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              {{ k.description }}
            </p>
          </div>
        </div>

        <!-- Detalles de la clase -->
        <div
          class="space-y-3 mt-4 mb-5 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <div
            class="flex items-center gap-3 text-slate-200 text-sm"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <div
              class="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-indigo-400"
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
              >{{ (k.days || []).join(", ") }}</span
            >
          </div>

          <div
            class="flex items-center gap-3 text-slate-200 text-sm"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <div
              class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-purple-400"
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
              >{{ k.time }} ({{ k.durationMin }} min)</span
            >
          </div>

          <div
            class="flex items-center gap-3 text-slate-200 text-sm"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <div
              class="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-pink-400"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <span
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
              >{{ k.reservedCount || 0 }}/{{ k.capacity }} personas</span
            >
          </div>
        </div>

        <!-- Botón de reserva -->
        <button
          v-if="
            !getReservationStatus(k.id).hasConfirmedReservation &&
            !getReservationStatus(k.id).hasPendingPayment
          "
          class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg select-none"
          @click="openReserve(k)"
          style="
            user-select: none;
            -webkit-user-select: none;
            pointer-events: auto;
            cursor: pointer;
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 inline mr-2 -mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style="
              user-select: none;
              -webkit-user-select: none;
              pointer-events: none;
              cursor: pointer;
            "
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span
            style="
              user-select: none;
              -webkit-user-select: none;
              pointer-events: none;
              cursor: pointer;
            "
            >Reservar Clase</span
          >
        </button>

        <!-- Estado: Pendiente de Pago -->
        <button
          v-else-if="getReservationStatus(k.id).hasPendingPayment"
          @click="
            handlePendingPayment({
              ...getReservationStatus(k.id).pendingReservation,
              klass: k,
            })
          "
          class="w-full py-3 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold rounded-xl flex items-center justify-center gap-2 select-none hover:bg-amber-500/30 transition-all duration-300 cursor-pointer"
          style="
            user-select: none;
            -webkit-user-select: none;
            pointer-events: auto;
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
            >⏳ Pendiente de Pago ({{
              getReservationStatus(k.id).pendingCount
            }})</span
          >
        </button>

        <!-- Estado: Confirmada -->
        <div
          v-else
          class="w-full py-3 bg-green-500/20 border border-green-500/30 text-green-300 font-semibold rounded-xl flex items-center justify-center gap-2 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
            >✅ Ya Reservada ({{
              getReservationStatus(k.id).confirmedCount
            }})</span
          >
        </div>
      </article>
    </div>

    <!-- Mensaje cuando no hay clases disponibles -->
    <div
      v-if="items.length === 0"
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <p
        class="text-slate-300 text-lg"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        No hay clases disponibles en este momento.
      </p>
      <p
        class="text-slate-400 text-sm mt-2"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        Vuelve pronto para ver las nuevas clases
      </p>
    </div>

    <ReserveModal
      :open="open"
      :klass="selected"
      :myReservations="myReservations"
      @close="open = false"
      @created="load"
      @success="handleSuccess"
      @pendingPayment="handlePendingPayment"
    />

    <PaymentModal
      v-if="reservationToPay"
      :show="showPaymentModal"
      :reservation="reservationToPay"
      @close="closePayment"
      @success="onPaymentSuccess"
    />

    <!-- Toast de éxito -->
    <Toast
      :show="showToast"
      :message="toastMessage"
      type="success"
      @close="showToast = false"
    />
  </section>
</template>
