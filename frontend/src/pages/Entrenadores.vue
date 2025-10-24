<script setup>
import { ref, onMounted } from "vue";
import { TrainersService } from "@/services/trainers";

const items = ref([]);
const err = ref("");

onMounted(async () => {
  try {
    items.value = await TrainersService.list();
  } catch (e) {
    err.value =
      e?.response?.data?.error || "No se pudieron cargar los entrenadores";
  }
});
</script>
<template>
  <section class="space-y-6">
    <!-- Título -->
    <div
      class="flex items-center gap-3 select-none"
      style="
        user-select: none;
        -webkit-user-select: none;
        pointer-events: none;
        cursor: default;
      "
    >
      <div
        class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center select-none"
        style="
          user-select: none;
          -webkit-user-select: none;
          pointer-events: none;
          cursor: default;
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-white select-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style="
            user-select: none;
            -webkit-user-select: none;
            pointer-events: none;
            cursor: default;
          "
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h2
        class="text-3xl font-bold text-white select-none"
        style="
          user-select: none;
          -webkit-user-select: none;
          pointer-events: none;
          cursor: default;
        "
      >
        Nuestros Entrenadores
      </h2>
    </div>

    <!-- Mensaje de error si existe -->
    <p
      v-if="err"
      class="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {{ err }}
    </p>

    <!-- Grid de entrenadores -->
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="t in items"
        :key="t.id"
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 hover:bg-white/15 transition-all duration-300 group"
        style="user-select: none; -webkit-user-select: none"
        unselectable="on"
      >
        <!-- Header con avatar y nombre -->
        <div
          class="flex items-center gap-4 mb-4 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <div
            class="w-20 h-20 rounded-2xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform ring-2 ring-indigo-500/50"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <img
              v-if="t.avatarUrl"
              :src="t.avatarUrl"
              :alt="t.name"
              class="w-full h-full object-cover"
              style="
                user-select: none;
                -webkit-user-select: none;
                pointer-events: none;
              "
              draggable="false"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: none;
                "
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <div
            class="flex-1"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <h3
              class="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              {{ t.name }}
            </h3>
            <div
              class="flex items-center gap-1 mt-1 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-amber-400 select-none"
                viewBox="0 0 20 20"
                fill="currentColor"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: none;
                "
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <span
                class="text-amber-400 text-sm font-semibold"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                {{ t.rating?.toFixed?.(1) ?? t.rating ?? "5.0" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Biografía -->
        <p
          class="text-slate-300 text-sm leading-relaxed mb-4 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          {{ t.bio }}
        </p>

        <!-- Especialidades -->
        <div
          class="flex flex-wrap gap-2 mb-5 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <span
            v-for="s in t.specialties"
            :key="s"
            class="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            {{ s }}
          </span>
        </div>

        <!-- Estadísticas -->
        <div
          class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 select-none"
          style="user-select: none; -webkit-user-select: none"
          unselectable="on"
        >
          <div
            class="text-center select-none"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <div
              class="flex items-center justify-center gap-2 mb-1 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: none;
                "
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p
                class="text-2xl font-bold text-white"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                {{ t.classesCount }}
              </p>
            </div>
            <p
              class="text-slate-400 text-xs"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              Clases
            </p>
          </div>
          <div
            class="text-center select-none"
            style="user-select: none; -webkit-user-select: none"
            unselectable="on"
          >
            <div
              class="flex items-center justify-center gap-2 mb-1 select-none"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  pointer-events: none;
                "
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p
                class="text-2xl font-bold text-white"
                style="user-select: none; -webkit-user-select: none"
                unselectable="on"
              >
                {{ t.studentsCount }}
              </p>
            </div>
            <p
              class="text-slate-400 text-xs"
              style="user-select: none; -webkit-user-select: none"
              unselectable="on"
            >
              Estudiantes
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
