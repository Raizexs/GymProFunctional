import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

console.log("✅ Axios API configurado con baseURL:", api.defaults.baseURL);

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

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (no autorizado), limpiar sesión y redirigir
    if (error.response?.status === 401) {
      localStorage.removeItem("gpf_token");
      localStorage.removeItem("gpf_user");
      delete api.defaults.headers.common["Authorization"];
    }
    return Promise.reject(error);
  }
);

export default api;
