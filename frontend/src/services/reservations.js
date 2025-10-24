import api from "./http";

export const ReservationsService = {
  /**
   * Obtener mis reservas
   */
  async mine() {
    const { data } = await api.get("/reservations/me");
    return data;
  },

  /**
   * Crear una reserva (puede quedar PENDING_PAYMENT si la clase tiene costo)
   */
  async create(classId, dateISO) {
    const { data } = await api.post("/reservations", {
      classId,
      dateISO,
    });
    return data;
  },

  /**
   * Cancelar una reserva
   */
  async remove(id, cancellationReason = null) {
    const { data } = await api.delete(`/reservations/${id}`, {
      data: { cancellationReason },
    });
    return data;
  },

  /**
   * Enviar feedback de una clase completada
   */
  async submitFeedback(id, rating, comment) {
    const { data } = await api.post(`/reservations/${id}/feedback`, {
      rating,
      comment,
    });
    return data;
  },

  /**
   * Marcar asistencia (solo admin/trainer)
   */
  async markAttendance(id, attended) {
    const { data } = await api.patch(`/reservations/${id}/attendance`, {
      attended,
    });
    return data;
  },

  /**
   * Obtener reservas de una clase en una fecha específica (solo admin/trainer)
   */
  async getClassReservations(classId, date) {
    const { data } = await api.get(
      `/reservations/class/${classId}/date/${date}`
    );
    return data;
  },
};
