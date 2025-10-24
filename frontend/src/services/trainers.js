import api from "./http";

export const TrainersService = {
  async list() {
    const { data } = await api.get("/trainers");
    return data;
  },
};
