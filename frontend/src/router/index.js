import { createRouter, createWebHistory } from "vue-router";
import Auth from "@/pages/Auth.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Clases from "@/pages/Clases.vue";
import Reservas from "@/pages/Reservas.vue";
import Entrenadores from "@/pages/Entrenadores.vue";
import Stats from "@/pages/Stats.vue";
import Asistencia from "@/pages/Asistencia.vue";
import KPIs from "@/pages/KPIs.vue";
import Planes from "@/pages/Planes.vue";
import MisClases from "@/pages/MisClases.vue";
import { useAuthStore } from "@/stores/auth";

const routes = [
  { path: "/auth", component: Auth },
  { path: "/dashboard", component: Dashboard },
  { path: "/clases", component: Clases },
  { path: "/reservas", component: Reservas },
  { path: "/entrenadores", component: Entrenadores },
  { path: "/planes", component: Planes },
  {
    path: "/stats",
    component: Stats,
    meta: { requiresAdmin: true },
  },
  {
    path: "/asistencia",
    component: Asistencia,
    meta: { requiresTrainer: true },
  },
  {
    path: "/kpis",
    component: KPIs,
    meta: { requiresTrainer: true },
  },
  {
    path: "/mis-clases",
    component: MisClases,
    meta: { requiresTrainer: true },
  },
  // Redirección de la raíz
  {
    path: "/",
    redirect: (to) => {
      const auth = useAuthStore();
      return auth.isAuthenticated ? "/dashboard" : "/auth";
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();

  if (to.path !== "/auth" && !auth.isAuthenticated) {
    return next("/auth");
  }

  if (to.path === "/auth" && auth.isAuthenticated) {
    return next("/dashboard");
  }

  // Verificar si la ruta requiere permisos de admin
  if (to.meta.requiresAdmin && auth.user?.role !== "ADMIN") {
    return next("/dashboard");
  }

  // Verificar si la ruta requiere permisos de trainer o admin
  if (
    to.meta.requiresTrainer &&
    auth.user?.role !== "TRAINER" &&
    auth.user?.role !== "ADMIN"
  ) {
    return next("/dashboard");
  }

  next();
});

export default router;
