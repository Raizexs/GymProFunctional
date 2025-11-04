import api from "./http";

export const TrainerService = {
  /**
   * Obtiene las clases del entrenador con todas sus reservas
   */
  async getMyClasses() {
    console.log("🔍 API Base URL:", api.defaults.baseURL);
    console.log("🔍 Request URL:", "/trainer/my-classes");
    const { data } = await api.get("/trainer/my-classes");
    return data;
  },
};
