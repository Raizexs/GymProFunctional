import { defineStore } from "pinia";
import api from "@/services/http";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    refreshToken: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user,
  },

  actions: {
    loadFromStorage() {
      const t = localStorage.getItem("gpf_token");
      const rt = localStorage.getItem("gpf_refresh_token");
      const u = localStorage.getItem("gpf_user");
      if (t && u) {
        this.token = t;
        this.refreshToken = rt;
        this.user = JSON.parse(u);
        api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
      }
    },

    saveSession({ token, refreshToken, user }) {
      this.token = token;
      this.refreshToken = refreshToken;
      this.user = user;
      localStorage.setItem("gpf_token", token);
      if (refreshToken) {
        localStorage.setItem("gpf_refresh_token", refreshToken);
      }
      localStorage.setItem("gpf_user", JSON.stringify(user));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },

    async login(email, password) {
      const { data } = await api.post("/auth/login", { email, password });
      this.saveSession(data);
    },

    async register(name, email, password) {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      this.saveSession(data);
    },

    logout() {
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem("gpf_token");
      localStorage.removeItem("gpf_refresh_token");
      localStorage.removeItem("gpf_user");
      delete api.defaults.headers.common["Authorization"];
    },

    // Método para renovar el token usando refresh token
    async refreshAccessToken() {
      try {
        if (!this.refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await api.post("/auth/refresh", {
          refreshToken: this.refreshToken,
        });

        // Actualizar tokens
        this.saveSession(data);
        return data.token;
      } catch (error) {
        // Si falla el refresh, cerrar sesión
        this.logout();
        throw error;
      }
    },
  },
});
