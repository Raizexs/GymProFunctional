<script setup>
defineProps({
  size: {
    type: String,
    default: "medium", // small, medium, large
  },
});
</script>

<template>
  <div
    class="gym-logo"
    :class="{
      'w-10 h-10': size === 'small',
      'w-16 h-16': size === 'medium',
      'w-24 h-24': size === 'large',
    }"
  >
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gymGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #6366f1; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #a855f7; stop-opacity: 1" />
        </linearGradient>
      </defs>

      <!-- Barra principal -->
      <rect
        x="40"
        y="95"
        width="120"
        height="10"
        rx="5"
        fill="url(#gymGradient)"
      />

      <!-- Disco izquierdo grande -->
      <circle cx="50" cy="100" r="35" fill="url(#gymGradient)" opacity="0.9" />
      <circle
        cx="50"
        cy="100"
        r="25"
        fill="none"
        stroke="white"
        stroke-width="3"
      />

      <!-- Disco derecho grande -->
      <circle cx="150" cy="100" r="35" fill="url(#gymGradient)" opacity="0.9" />
      <circle
        cx="150"
        cy="100"
        r="25"
        fill="none"
        stroke="white"
        stroke-width="3"
      />

      <!-- Disco izquierdo pequeño -->
      <circle cx="50" cy="100" r="15" fill="url(#gymGradient)" />

      <!-- Disco derecho pequeño -->
      <circle cx="150" cy="100" r="15" fill="url(#gymGradient)" />

      <!-- Agarres -->
      <rect
        x="85"
        y="90"
        width="8"
        height="20"
        rx="4"
        fill="#ffffff"
        opacity="0.8"
      />
      <rect
        x="107"
        y="90"
        width="8"
        height="20"
        rx="4"
        fill="#ffffff"
        opacity="0.8"
      />

      <!-- Rayo de energía -->
      <path
        d="M100 60 L95 80 L105 80 L100 95"
        stroke="#ffffff"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.gym-logo {
  display: inline-block;
}
</style>
