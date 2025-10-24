import api from "./http";

export const SummaryService = {
  async me() {
    const { data } = await api.get("/me/summary");
    return data;
  },
};
