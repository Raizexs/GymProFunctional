import api from "./http";

export const ClassesService = {
  async list() {
    const { data } = await api.get("/classes");
    return data;
  },
};
