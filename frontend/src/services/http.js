import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

console.log("✅ Axios API configurado con baseURL:", api.defaults.baseURL);

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor para agregar el token de autenticación automáticamente
api.interceptors.request.use(
  (config) => {
    console.log(
      "📤 Request:",
      config.method?.toUpperCase(),
      config.url,
      "| Full URL:",
      config.baseURL + config.url
    );
    // Solo agregar el token si existe en localStorage
    const token = localStorage.getItem("gpf_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación y renovar token automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es la ruta de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      if (isRefreshing) {
        // Si ya se está renovando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("gpf_refresh_token");

      if (!refreshToken) {
        // No hay refresh token, cerrar sesión
        isRefreshing = false;
        localStorage.removeItem("gpf_token");
        localStorage.removeItem("gpf_refresh_token");
        localStorage.removeItem("gpf_user");
        delete api.defaults.headers.common["Authorization"];

        // Redirigir al login si no estamos ya ahí
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        return Promise.reject(error);
      }

      try {
        // Intentar renovar el token
        const { data } = await api.post("/auth/refresh", { refreshToken });

        // Guardar nuevos tokens
        localStorage.setItem("gpf_token", data.token);
        if (data.refreshToken) {
          localStorage.setItem("gpf_refresh_token", data.refreshToken);
        }
        localStorage.setItem("gpf_user", JSON.stringify(data.user));

        // Actualizar header
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        originalRequest.headers["Authorization"] = `Bearer ${data.token}`;

        // Procesar cola de peticiones fallidas
        processQueue(null, data.token);

        console.log("✅ Token renovado automáticamente");

        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Fallo al renovar, cerrar sesión
        processQueue(refreshError, null);
        localStorage.removeItem("gpf_token");
        localStorage.removeItem("gpf_refresh_token");
        localStorage.removeItem("gpf_user");
        delete api.defaults.headers.common["Authorization"];

        console.log("❌ Refresh token expirado, cerrando sesión");

        // Redirigir al login
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
