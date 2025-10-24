<script setup>
const props = defineProps({
  open: Boolean,
  title: String,
  message: String,
});

const emit = defineEmits(["cancel", "confirm"]);
</script>
<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/60 backdrop-blur-md grid place-items-center z-50 p-4 select-none"
    style="user-select: none; -webkit-user-select: none"
    @click.self="$emit('cancel')"
  >
    <div
      class="backdrop-blur-xl bg-slate-900/90 border border-white/20 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in select-none"
      style="user-select: none; -webkit-user-select: none"
      unselectable="on"
    >
      <!-- Icono de advertencia -->
      <div
        class="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 select-none"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-red-400"
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <!-- Título -->
      <h3
        class="text-2xl font-bold text-white text-center mb-3 select-none"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        {{ title }}
      </h3>

      <!-- Mensaje -->
      <p
        class="text-slate-300 text-center leading-relaxed mb-8 select-none"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        {{ message }}
      </p>

      <!-- Botones -->
      <div class="flex gap-3">
        <button
          class="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-all duration-300 select-none"
          style="
            user-select: none;
            -webkit-user-select: none;
            pointer-events: auto;
            cursor: pointer;
          "
          @click="$emit('cancel')"
        >
          <span
            style="
              user-select: none;
              -webkit-user-select: none;
              pointer-events: none;
            "
            >No, mantener</span
          >
        </button>
        <button
          class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg select-none"
          style="
            user-select: none;
            -webkit-user-select: none;
            pointer-events: auto;
            cursor: pointer;
          "
          @click="$emit('confirm')"
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
            "
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span
            style="
              user-select: none;
              -webkit-user-select: none;
              pointer-events: none;
            "
            >Sí, cancelar</span
          >
        </button>
      </div>
    </div>
  </div>
</template>
