/**
 * Rutas canónicas de la aplicación.
 *
 * Centralizar aquí evita literales repartidos y hace que la migración de URLs
 * sea un cambio de valores, no una búsqueda por todo el código.
 */

export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: (token: string) => `/reset-password/${encodeURIComponent(token)}`,
} as const;

const customizeTabPath = (tab: "categorias" | "actividades" | "recomendaciones") =>
  `/app/personalizar?tab=${tab}`;

export const ROUTES = {
  home: "/app/inicio",
  customize: "/app/personalizar",
  customizeTab: customizeTabPath,
  activities: (categoryId?: string) => {
    const params = new URLSearchParams({ tab: "actividades" });
    if (categoryId) params.set("categoria", categoryId);
    return `/app/personalizar?${params.toString()}`;
  },
  activityView: (categoryId?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoria", categoryId);
    const query = params.toString();
    return `/app/actividades${query ? `?${query}` : ""}`;
  },
  history: "/app/historial",
  trash: "/app/papelera",
  account: "/app/cuenta",
  recommend: "/app/recomendaciones",
  sessionNew: (categoryId?: string, activityId?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoria", categoryId);
    if (activityId) params.set("actividad", activityId);
    const query = params.toString();
    return `/app/sesion/nueva${query ? `?${query}` : ""}`;
  },
  session: "/app/sesion",
  sessionFinished: (id: string) => `/app/sesion/finalizada/${encodeURIComponent(id)}`,
} as const;

/** Rutas antiguas que se mantienen con redirección durante la migración. */
export const LEGACY_ROUTES = {
  home: "/app/home",
  customize: "/app/routine",
  activities: "/app/subcategories",
  history: "/app/history",
  trash: "/app/trash",
  account: "/app/account",
  recommend: "/app/session/recommend",
  sessionNew: "/app/session/new",
  session: "/app/session",
} as const;
