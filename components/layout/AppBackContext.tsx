"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

type AppBackHandler = (() => void) | null;
type RegisterAppBack = (handler: AppBackHandler) => void;

const AppBackContext = createContext<RegisterAppBack | null>(null);

export function AppBackProvider({
  register,
  children,
}: {
  register: RegisterAppBack;
  children: ReactNode;
}) {
  return <AppBackContext.Provider value={register}>{children}</AppBackContext.Provider>;
}

/**
 * Permite que una vista interna (por ejemplo, el configurador de una
 * recomendación) indique qué debe hacer el botón "atrás" de la app.
 */
export function useRegisterAppBack(handler: AppBackHandler) {
  const register = useContext(AppBackContext);

  useEffect(() => {
    if (!register) return;
    register(handler);
    return () => register(null);
  }, [handler, register]);
}
