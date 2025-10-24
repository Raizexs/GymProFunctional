<template>
  <div class="relative">
    <!-- Bell Icon Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-300 hover:text-amber-400 transition-colors duration-200"
      :class="{ 'text-amber-400': isOpen }"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>

      <!-- Badge with unread count -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
      >
        {{ unreadCount > 9 ? "9+" : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 z-50 max-h-[32rem] flex flex-col"
    >
      <!-- Header -->
      <div
        class="p-4 border-b border-gray-700 flex items-center justify-between"
      >
        <h3 class="text-lg font-semibold text-white">Notificaciones</h3>
        <button
          v-if="unreadCount > 0"
          @click="handleMarkAllAsRead"
          class="text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          Marcar todas como leídas
        </button>
      </div>

      <!-- Notifications List -->
      <div class="overflow-y-auto flex-1">
        <div v-if="loading" class="p-8 text-center text-gray-400">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto"
          ></div>
          <p class="mt-2">Cargando...</p>
        </div>

        <div
          v-else-if="notifications.length === 0"
          class="p-8 text-center text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-12 h-12 mx-auto mb-2 opacity-50"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.143 17.082a24.248 24.248 0 003.844.148m-3.844-.148a23.856 23.856 0 01-5.455-1.31 8.964 8.964 0 002.3-5.542m3.155 6.852a3 3 0 005.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 003.536-1.003A8.967 8.967 0 0118 9.75V9A6 6 0 006.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"
            />
          </svg>
          <p>No tienes notificaciones</p>
        </div>

        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification._id"
            class="p-4 border-b border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
            :class="{ 'bg-gray-750': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start gap-3">
              <!-- Icon based on type -->
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                :class="getNotificationIconClass(notification.type)"
              >
                <component
                  :is="getNotificationIcon(notification.type)"
                  class="w-5 h-5"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-semibold text-white text-sm">
                    {{ notification.title }}
                  </h4>
                  <button
                    @click.stop="handleDelete(notification._id)"
                    class="text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p class="text-sm text-gray-300 mt-1">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-500 mt-2">
                  {{ formatDate(notification.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with "Ver todas" link if needed -->
      <div v-if="hasMore" class="p-3 border-t border-gray-700 text-center">
        <button
          class="text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from "vue";
import { useNotificationsStore } from "../stores/notifications";

const notificationsStore = useNotificationsStore();
const isOpen = ref(false);

const notifications = computed(() => notificationsStore.notifications);
const unreadCount = computed(() => notificationsStore.unreadCount);
const loading = computed(() => notificationsStore.loading);
const hasMore = computed(() => notificationsStore.hasMore);

onMounted(() => {
  notificationsStore.fetchNotifications();

  // Polling cada 30 segundos para nuevas notificaciones
  setInterval(() => {
    if (!isOpen.value) {
      notificationsStore.fetchNotifications();
    }
  }, 30000);
});

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

async function handleNotificationClick(notification) {
  if (!notification.read) {
    await notificationsStore.markAsRead(notification._id);
  }
}

async function handleMarkAllAsRead() {
  await notificationsStore.markAllAsRead();
}

async function handleDelete(notificationId) {
  await notificationsStore.deleteNotification(notificationId);
}

function getNotificationIconClass(type) {
  const classes = {
    CLASS_REMINDER_24H: "bg-blue-500/20 text-blue-400",
    CLASS_REMINDER_2H: "bg-amber-500/20 text-amber-400",
    PAYMENT_CONFIRMATION: "bg-green-500/20 text-green-400",
    RESERVATION_CONFIRMED: "bg-indigo-500/20 text-indigo-400",
    RESERVATION_CANCELLED: "bg-red-500/20 text-red-400",
    PROMOTION: "bg-purple-500/20 text-purple-400",
    GENERAL: "bg-gray-500/20 text-gray-400",
  };
  return classes[type] || classes.GENERAL;
}

function getNotificationIcon(type) {
  const icons = {
    CLASS_REMINDER_24H: () =>
      h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          "stroke-width": "1.5",
          stroke: "currentColor",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
          }),
        ]
      ),
    CLASS_REMINDER_2H: () =>
      h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          "stroke-width": "1.5",
          stroke: "currentColor",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
          }),
        ]
      ),
    PAYMENT_CONFIRMATION: () =>
      h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          "stroke-width": "1.5",
          stroke: "currentColor",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
          }),
        ]
      ),
    RESERVATION_CONFIRMED: () =>
      h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          "stroke-width": "1.5",
          stroke: "currentColor",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          }),
        ]
      ),
    RESERVATION_CANCELLED: () =>
      h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          "stroke-width": "1.5",
          stroke: "currentColor",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          }),
        ]
      ),
    PROMOTION: () =>
      h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          "stroke-width": "1.5",
          stroke: "currentColor",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z",
          }),
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M6 6h.008v.008H6V6z",
          }),
        ]
      ),
    GENERAL: () =>
      h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          "stroke-width": "1.5",
          stroke: "currentColor",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
          }),
        ]
      ),
  };
  return icons[type] || icons.GENERAL;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Cerrar dropdown al hacer clic fuera
if (typeof window !== "undefined") {
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (isOpen.value && !target.closest(".relative")) {
      isOpen.value = false;
    }
  });
}
</script>
