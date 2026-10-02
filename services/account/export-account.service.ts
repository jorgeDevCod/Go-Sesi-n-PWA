import { findUserById } from "@/repositories/user.repository";
import { listCategoriesForUser } from "@/repositories/category.repository";
import { listSubcategoriesByUser } from "@/repositories/subcategory.repository";
import {
  findActiveByUserId,
  listSessionsForUser,
} from "@/repositories/focus-session.repository";
import { listPlansForUser } from "@/repositories/planning.repository";

export class ExportAccountNotFoundError extends Error {
  constructor() {
    super("La cuenta no existe.");
    this.name = "ExportAccountNotFoundError";
  }
}

/**
 * Reúne todos los datos del usuario en JSON serializable.
 * Nunca incluye `passwordHash` ni ningún secreto.
 */
export async function exportAccountData(userId: string) {
  const [user, categories, subcategories, sessions, activeSession, plans] = await Promise.all([
    findUserById(userId),
    listCategoriesForUser(userId),
    listSubcategoriesByUser(userId),
    listSessionsForUser(userId),
    findActiveByUserId(userId),
    listPlansForUser(userId),
  ]);

  if (!user) throw new ExportAccountNotFoundError();

  return {
    exportedAt: new Date().toISOString(),
    app: "go-sesion",
    user: {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    },
    categories: categories.map((c) => ({
      name: c.name,
      icon: c.icon,
      color: c.color,
      order: c.order,
      complexity: c.complexity,
      createdAt: c.createdAt.toISOString(),
    })),
    subcategories: subcategories.map((s) => ({
      name: s.name,
      icon: s.icon,
      color: s.color,
      order: s.order,
      complexity: s.complexity,
      categoryId: s.categoryId,
      createdAt: s.createdAt.toISOString(),
    })),
    sessions: sessions.map((s) => ({
      status: s.status,
      mode: s.mode,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt ? s.endedAt.toISOString() : null,
      plannedMinutes: s.plannedMinutes,
      actualMinutes: s.actualMinutes,
      extendedMinutes: s.extendedMinutes,
      subcategoryName: s.subcategory.name,
      categoryName: s.subcategory.category.name,
    })),
    activeSession: activeSession
      ? {
          startedAt: activeSession.startedAt.toISOString(),
          plannedMinutes: activeSession.plannedMinutes,
          subcategoryName: activeSession.subcategory.name,
          categoryName: activeSession.subcategory.category.name,
        }
      : null,
    plans: plans.map((p) => ({
      date: p.date.toISOString(),
      items: p.items.map((i) => ({
        title: i.title,
        icon: i.icon,
        color: i.color,
        order: i.order,
      })),
    })),
  };
}

export type AccountExport = Awaited<ReturnType<typeof exportAccountData>>;
