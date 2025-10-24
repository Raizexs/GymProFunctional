import http from "./http";

export const PaymentsService = {
  /**
   * Crear un payment intent para una reserva
   */
  async createPaymentIntent(reservationId, amount) {
    const { data } = await http.post("/payments/create-intent", {
      reservationId,
      amount,
    });
    return data;
  },

  /**
   * Confirmar un pago
   */
  async confirmPayment(paymentIntentId) {
    const { data } = await http.post("/payments/confirm", {
      paymentIntentId,
    });
    return data;
  },

  /**
   * Solicitar reembolso
   */
  async refundPayment(paymentId, reason) {
    const { data } = await http.post(`/payments/${paymentId}/refund`, {
      reason,
    });
    return data;
  },

  /**
   * Obtener historial de pagos
   */
  async getHistory(limit = 10, offset = 0) {
    const { data } = await http.get("/payments/history", {
      params: { limit, offset },
    });
    return data;
  },
};
