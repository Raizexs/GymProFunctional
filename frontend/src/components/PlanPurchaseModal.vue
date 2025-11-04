<script setup>
import { computed } from "vue";

const props = defineProps({
  open: Boolean,
  plan: Object,
});

const emit = defineEmits(["cancel", "confirm"]);

const formatCurrency = (cents) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents);
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
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click.self="emit('cancel')"
      >
        <div
          class="backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-white/20 rounded-3xl p-8 shadow-2xl max-w-lg w-full transform transition-all"
        >
          <!-- Header con ícono -->
          <div class="flex items-center gap-4 mb-6">
            <div
              class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <span class="text-3xl">💎</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white">Confirmar Compra</h3>
              <p class="text-slate-400 text-sm">
                Estás a punto de adquirir un plan
              </p>
            </div>
          </div>

          <!-- Detalles del Plan -->
          <div
            v-if="plan"
            class="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10"
          >
            <!-- Nombre y tipo -->
            <div class="flex items-start justify-between mb-4">
              <div>
                <h4 class="text-xl font-bold text-white mb-1">
                  {{ plan.name }}
                </h4>
                <p class="text-sm text-slate-400">
                  {{ getPlanTypeLabel(plan.type) }}
                </p>
              </div>
              <div
                v-if="plan.isFeatured"
                class="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold"
              >
                ⭐ POPULAR
              </div>
            </div>

            <!-- Descripción -->
            <p class="text-slate-300 text-sm mb-4">{{ plan.description }}</p>

            <!-- Detalles clave -->
            <div
              class="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-white/10"
            >
              <div>
                <p class="text-slate-400 text-xs mb-1">Clases</p>
                <p class="text-white font-bold text-lg">
                  {{ plan.credits === 999 ? "Ilimitadas" : plan.credits }}
                </p>
              </div>
              <div>
                <p class="text-slate-400 text-xs mb-1">Validez</p>
                <p class="text-white font-bold text-lg">
                  {{ plan.validityDays }} días
                </p>
              </div>
              <div>
                <p class="text-slate-400 text-xs mb-1">Descuento</p>
                <p class="text-emerald-400 font-bold text-lg">
                  {{
                    plan.discountPercentage > 0
                      ? `-${plan.discountPercentage}%`
                      : "N/A"
                  }}
                </p>
              </div>
            </div>

            <!-- Precio destacado -->
            <div
              class="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl p-4 border border-indigo-500/30"
            >
              <p class="text-slate-300 text-sm mb-1">Total a pagar</p>
              <p class="text-3xl font-bold text-white">
                {{ formatCurrency(plan.price) }}
              </p>
              <p class="text-slate-400 text-xs mt-1">
                Pago único - {{ getPlanTypeLabel(plan.type) }}
              </p>
            </div>
          </div>

          <!-- Información adicional -->
          <div
            class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6"
          >
            <div class="flex gap-3">
              <div class="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-blue-400"
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
              </div>
              <div>
                <p class="text-blue-300 text-sm font-semibold mb-1">
                  ¿Qué incluye?
                </p>
                <ul class="text-blue-200 text-xs space-y-1">
                  <li>✓ Activación inmediata</li>
                  <li>✓ Créditos disponibles para usar</li>
                  <li>✓ Descuento automático en reservas</li>
                  <li>✓ Válido por {{ plan?.validityDays }} días</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-4">
            <button
              @click="emit('cancel')"
              class="flex-1 px-6 py-3 rounded-xl bg-white/10 text-slate-300 border border-white/20 font-semibold hover:bg-white/20 transition-all duration-300"
              style="user-select: none; -webkit-user-select: none"
            >
              No, mantener
            </button>
            <button
              @click="emit('confirm')"
              class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-lg"
              style="user-select: none; -webkit-user-select: none"
            >
              ✓ Sí, comprar
            </button>
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
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
