<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  show: Boolean,
  message: String,
  type: {
    type: String,
    default: "success", // success, error, info
  },
});

const emit = defineEmits(["close"]);

// Auto cerrar después de 5 segundos
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        emit("close");
      }, 5000);
    }
  }
);
</script>

<template>
  <Transition
    enter-active-class="transform transition duration-300 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed top-4 right-4 z-[100] max-w-md select-none"
      style="user-select: none; -webkit-user-select: none"
      unselectable="on"
    >
      <div
        class="backdrop-blur-xl border rounded-2xl p-4 shadow-2xl flex items-start gap-3 select-none"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
        :class="{
          'bg-green-500/20 border-green-500/30': type === 'success',
          'bg-red-500/20 border-red-500/30': type === 'error',
          'bg-blue-500/20 border-blue-500/30': type === 'info',
        }"
      >
        <!-- Icono -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
          :class="{
            'bg-green-500': type === 'success',
            'bg-red-500': type === 'error',
            'bg-blue-500': type === 'info',
          }"
        >
          <!-- Icono de éxito -->
          <svg
            v-if="type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-white"
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
              d="M5 13l4 4L19 7"
            />
          </svg>

          <!-- Icono de error -->
          <svg
            v-else-if="type === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-white"
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

          <!-- Icono de info -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-white"
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Mensaje -->
        <div
          class="flex-1 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <p
            class="text-white font-semibold text-sm leading-relaxed select-none"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            {{ message }}
          </p>
        </div>

        <!-- Botón cerrar -->
        <button
          @click="$emit('close')"
          class="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center flex-shrink-0 select-none"
          style="
            user-select: none;
            -webkit-user-select: none;
            pointer-events: auto;
            cursor: pointer;
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
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
        </button>
      </div>
    </div>
  </Transition>
</template>
