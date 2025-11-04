import api from "./http";

export const PlansService = {
  /**
   * Obtener todos los planes activos
   */
  async list() {
    const { data } = await api.get("/plans");
    return data;
  },

  /**
   * Obtener mis planes (suscripciones)
   */
  async myPlans() {
    const { data } = await api.get("/plans/my");
    return data;
  },

  /**
   * Comprar un plan
   */
  async purchase(planId) {
    const { data } = await api.post(`/plans/${planId}/purchase`);
    return data;
  },

  /**
   * Cancelar mi plan
   */
  async cancel(userPlanId, cancellationReason = null) {
    const { data } = await api.patch(`/plans/my/${userPlanId}/cancel`, {
      cancellationReason,
    });
    return data;
  },

  /**
   * Confirmar pago de un plan
   */
  async confirmPayment(paymentId) {
    const { data } = await api.post(`/plans/payments/${paymentId}/confirm`);
    return data;
  },
};

export default PlansService;
