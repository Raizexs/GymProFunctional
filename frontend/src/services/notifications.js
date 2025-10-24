import http from "./http";

export const NotificationsService = {
  /**
   * Obtener notificaciones del usuario
   */
  async getNotifications(limit = 20, offset = 0) {
    const { data } = await http.get("/notifications", {
      params: { limit, offset },
    });
    return data;
  },

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId) {
    const { data } = await http.put(`/notifications/${notificationId}/read`);
    return data;
  },

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead() {
    const { data } = await http.put("/notifications/read-all");
    return data;
  },

  /**
   * Eliminar notificación
   */
  async deleteNotification(notificationId) {
    await http.delete(`/notifications/${notificationId}`);
  },
};

export default NotificationsService;
