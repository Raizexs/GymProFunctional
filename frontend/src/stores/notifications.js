import { defineStore } from "pinia";
import { ref } from "vue";
import { NotificationsService } from "../services/notifications";

export const useNotificationsStore = defineStore("notifications", () => {
  const notifications = ref([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const hasMore = ref(false);

  async function fetchNotifications(unreadOnly = false) {
    try {
      loading.value = true;
      const data = await NotificationsService.getNotifications(20, 0);
      notifications.value = data.notifications || [];
      unreadCount.value = data.unreadCount || 0;
      hasMore.value = data.hasMore || false;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      notifications.value = [];
      unreadCount.value = 0;
      hasMore.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function markAsRead(notificationId) {
    try {
      await NotificationsService.markAsRead(notificationId);

      // Actualizar localmente
      const notification = notifications.value.find(
        (n) => n._id === notificationId
      );
      if (notification && !notification.read) {
        notification.read = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  async function markAllAsRead() {
    try {
      await NotificationsService.markAllAsRead();

      // Actualizar localmente
      notifications.value.forEach((n) => (n.read = true));
      unreadCount.value = 0;
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }

  async function deleteNotification(notificationId) {
    try {
      await NotificationsService.deleteNotification(notificationId);

      // Eliminar localmente
      const index = notifications.value.findIndex(
        (n) => n._id === notificationId
      );
      if (index !== -1) {
        const wasUnread = !notifications.value[index].read;
        notifications.value.splice(index, 1);
        if (wasUnread) {
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }

  function reset() {
    notifications.value = [];
    unreadCount.value = 0;
    hasMore.value = false;
  }

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reset,
  };
});
