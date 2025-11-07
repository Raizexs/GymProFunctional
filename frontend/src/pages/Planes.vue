<script setup>
import { ref, computed, onMounted } from "vue";
import { PlansService } from "@/services/plans";
import Toast from "@/components/Toast.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import PlanPurchaseModal from "@/components/PlanPurchaseModal.vue";
import PaymentModal from "@/components/PaymentModal.vue";

const plans = ref([]);
const myPlans = ref([]);
const loading = ref(false);
const error = ref("");

// Modales
const showPurchaseModal = ref(false);
const planToPurchase = ref(null);
const showCancelModal = ref(false);
const planToCancel = ref(null);

// Modal de pago
const showPaymentModal = ref(false);
const pendingPayment = ref(null);

// Toast
const toast = ref({ show: false, message: "", type: "success" });

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const loadPlans = async () => {
  loading.value = true;
  error.value = "";

  try {
    const [plansData, myPlansData] = await Promise.all([
      PlansService.list().catch((err) => {
        console.error("Error loading plans:", err);
        return [];
      }),
      PlansService.myPlans().catch((err) => {
        console.error("Error loading my plans:", err);
        return [];
      }),
    ]);

    plans.value = plansData || [];
    myPlans.value = myPlansData || [];
  } catch (e) {
    console.error("Error in loadPlans:", e);
    error.value = e?.response?.data?.error || "Error al cargar los planes";
    showToast(error.value, "error");
    plans.value = [];
    myPlans.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    await loadPlans();
  } catch (e) {
    console.error("Error in onMounted:", e);
  }
});

const activePlan = computed(() => {
  return myPlans.value.find(
    (p) => p.status === "ACTIVE" && new Date(p.expiryDate) > new Date()
  );
});

const formatCurrency = (cents) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getPlanTypeLabel = (type) => {
  const labels = {
    MONTHLY: "Mensual",
    QUARTERLY: "Trimestral",
    ANNUAL: "Anual",
    CREDITS_PACK: "Pack de Clases",
  };
  return labels[type] || type;
};

const getStatusLabel = (status) => {
  const labels = {
    ACTIVE: "Activo",
    EXPIRED: "Expirado",
    CANCELLED: "Cancelado",
    PENDING_PAYMENT: "Pago Pendiente",
  };
  return labels[status] || status;
};

const openPurchase = (plan) => {
  planToPurchase.value = plan;
  showPurchaseModal.value = true;
};

const confirmPurchase = async () => {
  if (!planToPurchase.value) return;

  try {
    loading.value = true;
    const response = await PlansService.purchase(planToPurchase.value._id);

    // Cerrar modal de confirmación
    showPurchaseModal.value = false;
    planToPurchase.value = null;

    // Si requiere pago, abrir modal de pago
    if (response.requiresPayment && response.payment) {
      pendingPayment.value = {
        ...response.payment,
        planName: response.userPlan.planId.name,
        isPlan: true,
      };
      showPaymentModal.value = true;
    } else {
      showToast("¡Plan adquirido exitosamente! 🎉", "success");
      await loadPlans();
    }
  } catch (e) {
    showToast(e?.response?.data?.error || "Error al comprar el plan", "error");
  } finally {
    loading.value = false;
  }
};

const openCancel = (userPlan) => {
  planToCancel.value = userPlan;
  showCancelModal.value = true;
};

const confirmCancel = async () => {
  if (!planToCancel.value) return;

  try {
    loading.value = true;
    await PlansService.cancel(
      planToCancel.value._id,
      "Cancelación por el usuario"
    );
    showToast("Plan cancelado correctamente", "success");
    await loadPlans();
  } catch (e) {
    showToast(e?.response?.data?.error || "Error al cancelar el plan", "error");
  } finally {
    loading.value = false;
    showCancelModal.value = false;
    planToCancel.value = null;
  }
};

const handlePaymentSuccess = async () => {
  try {
    console.log(
      "💳 handlePaymentSuccess - pendingPayment:",
      pendingPayment.value
    );

    if (pendingPayment.value?.isPlan) {
      console.log(
        "📋 Confirmando pago de plan con ID:",
        pendingPayment.value._id
      );
      await PlansService.confirmPayment(pendingPayment.value._id);
      showToast("¡Pago confirmado! Tu plan está activo 🎉", "success");
    }
    showPaymentModal.value = false;
    pendingPayment.value = null;

    console.log("🔄 Recargando planes...");
    await loadPlans();
    console.log("✅ Planes recargados");
  } catch (e) {
    console.error("❌ Error en handlePaymentSuccess:", e);
    showToast(
      e?.response?.data?.error || "Error al confirmar el pago",
      "error"
    );
  }
};

const handlePaymentClose = () => {
  showPaymentModal.value = false;
  pendingPayment.value = null;
};
</script>

<template>
  <section class="space-y-6">
    <!-- Título -->
    <div
      class="flex items-center gap-3"
      style="user-select: none; -webkit-user-select: none"
    >
      <div
        class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center"
      >
        <span class="text-2xl">💎</span>
      </div>
      <h2 class="text-3xl font-bold text-white">Planes y Bonos</h2>
    </div>

    <!-- Plan Activo -->
    <div
      v-if="activePlan"
      class="backdrop-blur-xl bg-gradient-to-r from-emerald-600/40 to-green-600/40 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-4xl">✨</span>
            <div>
              <h3 class="text-2xl font-bold text-white">
                {{ activePlan.planId.name }}
              </h3>
              <p class="text-emerald-200 text-sm">
                {{ getPlanTypeLabel(activePlan.planId.type) }}
              </p>
            </div>
          </div>
          <p class="text-emerald-100 mb-4">
            {{ activePlan.planId.description }}
          </p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-emerald-200 text-sm">Créditos Restantes</p>
              <p class="text-3xl font-bold text-white">
                {{ activePlan.creditsRemaining }}
              </p>
            </div>
            <div>
              <p class="text-emerald-200 text-sm">Créditos Totales</p>
              <p class="text-2xl font-bold text-emerald-300">
                {{ activePlan.creditsTotal }}
              </p>
            </div>
            <div>
              <p class="text-emerald-200 text-sm">Fecha de Inicio</p>
              <p class="text-white font-semibold">
                {{ formatDate(activePlan.startDate) }}
              </p>
            </div>
            <div>
              <p class="text-emerald-200 text-sm">Vence</p>
              <p class="text-white font-semibold">
                {{ formatDate(activePlan.expiryDate) }}
              </p>
            </div>
          </div>
        </div>
        <button
          @click="openCancel(activePlan)"
          class="px-6 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 font-semibold hover:bg-red-500/30 hover:scale-105 transition-all duration-300"
          style="user-select: none; -webkit-user-select: none"
        >
          Cancelar Plan
        </button>
      </div>
    </div>

    <!-- Mensaje cuando no hay plan activo -->
    <div
      v-if="!activePlan && !loading"
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl text-center"
    >
      <div
        class="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4"
      >
        <span class="text-4xl">💳</span>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">
        No tienes un plan activo
      </h3>
      <p class="text-slate-300">
        Elige el plan perfecto para ti y comienza a entrenar
      </p>
    </div>

    <!-- Grid de Planes Disponibles -->
    <div>
      <h3 class="text-2xl font-bold text-white mb-4">Planes Disponibles</h3>

      <!-- Mensaje cuando no hay planes disponibles -->
      <div
        v-if="plans.length === 0 && !loading"
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-2xl text-center"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <div
          class="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <span class="text-4xl">💳</span>
        </div>
        <p
          class="text-slate-300 text-lg"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          No hay planes disponibles en este momento.
        </p>
        <p
          class="text-slate-400 text-sm mt-2"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          Vuelve pronto para ver las nuevas opciones
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="plan in plans"
          :key="plan._id"
          class="backdrop-blur-xl bg-white/10 border rounded-2xl p-6 shadow-2xl hover:scale-105 transition-all duration-300 relative"
          :class="
            plan.isFeatured
              ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
              : 'border-white/20'
          "
          style="user-select: none; -webkit-user-select: none"
        >
          <!-- Badge de destacado -->
          <div
            v-if="plan.isFeatured"
            class="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg"
          >
            ⭐ POPULAR
          </div>

          <!-- Badge de descuento -->
          <div
            v-if="plan.discountPercentage > 0"
            class="absolute -top-3 -left-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg"
          >
            -{{ plan.discountPercentage }}%
          </div>

          <!-- Nombre y tipo -->
          <div class="mb-4">
            <h4 class="text-2xl font-bold text-white mb-1">{{ plan.name }}</h4>
            <p class="text-sm text-slate-400">
              {{ getPlanTypeLabel(plan.type) }}
            </p>
          </div>

          <!-- Precio -->
          <div class="mb-4">
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-bold text-white">
                {{ formatCurrency(plan.price) }}
              </span>
              <span class="text-slate-400 text-sm">
                {{
                  plan.type === "CREDITS_PACK"
                    ? "por pack"
                    : "por " + getPlanTypeLabel(plan.type).toLowerCase()
                }}
              </span>
            </div>
          </div>

          <!-- Descripción -->
          <p class="text-slate-300 text-sm mb-4">{{ plan.description }}</p>

          <!-- Créditos y validez -->
          <div class="flex gap-4 mb-4 pb-4 border-b border-white/10">
            <div>
              <p class="text-slate-400 text-xs">Clases</p>
              <p class="text-white font-bold text-lg">
                {{ plan.credits === 999 ? "Ilimitadas" : plan.credits }}
              </p>
            </div>
            <div>
              <p class="text-slate-400 text-xs">Validez</p>
              <p class="text-white font-bold text-lg">
                {{ plan.validityDays }} días
              </p>
            </div>
          </div>

          <!-- Features -->
          <ul class="space-y-2 mb-6">
            <li
              v-for="(feature, idx) in plan.features"
              :key="idx"
              class="flex items-start gap-2 text-slate-300 text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-emerald-400 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <!-- Botón de compra -->
          <button
            @click="openPurchase(plan)"
            :disabled="loading || !!activePlan"
            class="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            :class="
              plan.isFeatured
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
            "
            style="user-select: none; -webkit-user-select: none"
          >
            {{ activePlan ? "Ya tienes un plan activo" : "Comprar Plan" }}
          </button>
        </article>
      </div>
    </div>

    <!-- Historial de Planes -->
    <div
      v-if="myPlans.length > 0"
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      <h3 class="text-xl font-bold text-white mb-4">📋 Historial de Planes</h3>
      <div class="space-y-3">
        <div
          v-for="userPlan in myPlans"
          :key="userPlan._id"
          class="flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
        >
          <div>
            <p class="font-bold text-white">{{ userPlan.planId.name }}</p>
            <p class="text-sm text-slate-300">
              {{ formatDate(userPlan.startDate) }} -
              {{ formatDate(userPlan.expiryDate) }}
            </p>
            <p class="text-xs text-slate-400 mt-1">
              Créditos usados:
              {{ userPlan.creditsTotal - userPlan.creditsRemaining }}/{{
                userPlan.creditsTotal
              }}
            </p>
          </div>
          <div class="text-right">
            <span
              class="px-3 py-1 rounded-lg text-xs font-bold"
              :class="{
                'bg-emerald-500/20 text-emerald-300':
                  userPlan.status === 'ACTIVE',
                'bg-slate-500/20 text-slate-300': userPlan.status === 'EXPIRED',
                'bg-red-500/20 text-red-300': userPlan.status === 'CANCELLED',
                'bg-yellow-500/20 text-yellow-300':
                  userPlan.status === 'PENDING_PAYMENT',
              }"
            >
              {{ getStatusLabel(userPlan.status) }}
            </span>
            <p class="text-white font-semibold mt-2">
              {{ formatCurrency(userPlan.purchasePrice) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-2xl text-center"
    >
      <div class="w-20 h-20 mx-auto mb-4">
        <svg
          class="animate-spin h-20 w-20 text-yellow-400"
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
      <p class="text-slate-300 text-lg font-semibold">⏳ Cargando planes...</p>
      <p class="text-slate-400 text-sm mt-2">
        Obteniendo información de planes disponibles
      </p>
    </div>

    <!-- Modal de confirmación de compra -->
    <PlanPurchaseModal
      :open="showPurchaseModal"
      :plan="planToPurchase"
      @cancel="
        showPurchaseModal = false;
        planToPurchase = null;
      "
      @confirm="confirmPurchase"
    />

    <!-- Modal de confirmación de cancelación -->
    <ConfirmModal
      :open="showCancelModal"
      title="¿Cancelar plan?"
      :message="
        planToCancel
          ? `¿Estás seguro de que deseas cancelar tu plan ${planToCancel.planId?.name}? Perderás los créditos restantes.`
          : ''
      "
      @cancel="
        showCancelModal = false;
        planToCancel = null;
      "
      @confirm="confirmCancel"
    />

    <!-- Modal de pago -->
    <PaymentModal
      :show="showPaymentModal"
      :payment="pendingPayment"
      @success="handlePaymentSuccess"
      @close="handlePaymentClose"
    />

    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </section>
</template>
