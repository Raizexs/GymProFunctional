import { createRouter, createWebHistory } from "vue-router";
import Auth from "@/pages/Auth.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Clases from "@/pages/Clases.vue";
import Reservas from "@/pages/Reservas.vue";
import Entrenadores from "@/pages/Entrenadores.vue";
import Stats from "@/pages/Stats.vue";
import Asistencia from "@/pages/Asistencia.vue";
import KPIs from "@/pages/KPIs.vue";
import { useAuthStore } from "@/stores/auth";

const routes = [
  { path: "/auth", component: Auth },
  { path: "/", component: Dashboard },
  { path: "/clases", component: Clases },
  { path: "/reservas", component: Reservas },
  { path: "/entrenadores", component: Entrenadores },
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
    return next("/");
  }

  // Verificar si la ruta requiere permisos de admin
  if (to.meta.requiresAdmin && auth.user?.role !== "ADMIN") {
    return next("/");
  }

  // Verificar si la ruta requiere permisos de trainer o admin
  if (
    to.meta.requiresTrainer &&
    auth.user?.role !== "TRAINER" &&
    auth.user?.role !== "ADMIN"
  ) {
    return next("/");
  }

  next();
});

export default router;
