const NAV_STACK_KEY = "gosession-navigation-stack";
const MAX_ENTRIES = 24;

function readStack(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(NAV_STACK_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

function writeStack(stack: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(NAV_STACK_KEY, JSON.stringify(stack));
  } catch {
    // Storage unavailable.
  }
}

/**
 * Registra la vista actual en una pila por pestaña. Si el usuario vuelve a la
 * vista inmediatamente anterior, se elimina la actual para que un nuevo
 * "atrás" siga retrocediendo en lugar de rebotar.
 */
export function recordAppPath(path: string) {
  if (!path) return;
  const stack = readStack();
  const last = stack[stack.length - 1];
  if (last === path) return;

  if (stack[stack.length - 2] === path) {
    stack.pop();
  } else {
    stack.push(path);
    if (stack.length > MAX_ENTRIES) stack.splice(0, stack.length - MAX_ENTRIES);
  }

  writeStack(stack);
}

export function previousAppPath(path: string): string | null {
  const stack = readStack();
  if (stack.length === 0) return null;

  if (stack[stack.length - 1] === path) {
    return stack.length > 1 ? stack[stack.length - 2] : null;
  }

  return stack[stack.length - 1];
}

export function clearAppNavigationHistory() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(NAV_STACK_KEY);
  } catch {
    // Storage unavailable.
  }
}
