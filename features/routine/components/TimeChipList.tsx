"use client";

import { useState, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Plus, X, Clock, Star, AlertCircle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type ChipRole = "min" | "rec" | "max" | null;
export type FixedRole = Exclude<ChipRole, null>;

export type TimeChip = {
  value: number;
  role: ChipRole;
  custom: boolean;
  /**
   * Previous min/rec/max role, shown as "ex: X" when the chip no longer
   * holds that role.
   */
  previousRole?: ChipRole;
};

const ROLES: { key: FixedRole; label: string }[] = [
  { key: "min", label: "Mín" },
  { key: "rec", label: "Rec" },
  { key: "max", label: "Máx" },
];

const HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

// Máximo permitido para una actividad: 8h 59min (539 min).
const MAX_MINUTES = 8 * 60 + 59;
const MAX_ERROR = "No podemos usar tiempos que excedan las 8h 59min para una actividad.";

function formatValue(value: number): string {
  if (value >= 60) {
    const h = Math.floor(value / 60);
    const m = value % 60;
    return m === 0 ? `${h} h` : `${h}h ${m}m`;
  }
  return `${value} min`;
}

function roleLabel(role: ChipRole, prefix = false): string {
  const label =
    role === "min" ? "Mín" : role === "rec" ? "Rec" : role === "max" ? "Máx" : "";
  return prefix && label ? `ex: ${label}` : label;
}

// Valida coherencia estricta min < rec < max (los valores no pueden repetirse
// entre roles, o se duplicarían chips). Devuelve mensaje de error o null.
function validateBalance(list: TimeChip[]): string | null {
  const min = list.find((c) => c.role === "min");
  const rec = list.find((c) => c.role === "rec");
  const max = list.find((c) => c.role === "max");
  if (min && rec && min.value >= rec.value) return "El mínimo debe ser menor al recomendado.";
  if (rec && max && rec.value >= max.value) return "El recomendado debe ser menor al máximo.";
  if (min && max && min.value >= max.value) return "El mínimo debe ser menor al máximo.";
  return null;
}

export function TimeChipList({
  chips,
  onChange,
}: {
  chips: TimeChip[];
  onChange: (chips: TimeChip[]) => void;
}) {
  // We operate on the chip's unique value (no duplicates allowed), not on the
  // list index. `sorted` reorders chips, so index-based edits would hit the
  // wrong chip and corrupt the list.
  const [editingValue, setEditingValue] = useState<number | null>(null);
  const [taggingValue, setTaggingValue] = useState<number | null>(null);
  const [panel, setPanel] = useState<"none" | "menu" | "add" | "replace" | "custom">("none");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(15);
  const [pickedRole, setPickedRole] = useState<FixedRole>("rec");
  const [replaceTarget, setReplaceTarget] = useState<FixedRole>("rec");
  const [error, setError] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState<"pick" | "type">("pick");
  const [freeHours, setFreeHours] = useState(0);
  const [freeMinutes, setFreeMinutes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimationControls();

  function replaceChipByValue(list: TimeChip[], value: number, patch: Partial<TimeChip>): TimeChip[] {
    return list.map((c) => (c.value === value ? { ...c, ...patch } : c));
  }

  function removeChipByValue(list: TimeChip[], value: number): TimeChip[] {
    return list.filter((c) => c.value !== value);
  }

  const hasRole = (role: FixedRole) => chips.some((c) => c.role === role);
  const missingRoles = ROLES.filter((r) => !hasRole(r.key));
  const allRolesPresent = missingRoles.length === 0;

  const currentValue = hours * 60 + minutes;

  function triggerError(msg: string) {
    setError(msg);
    controls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
  }

  function clearError() {
    setError(null);
  }

  function startEdit(value: number) {
    setEditingValue(value);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitEdit(originalValue: number, raw: string) {
    const value = parseInt(raw, 10);
    if (Number.isNaN(value) || value < 1 || value > MAX_MINUTES) {
      setEditingValue(null);
      return;
    }
    if (value === originalValue) {
      setEditingValue(null);
      return;
    }
    if (chips.some((c) => c.value === value)) {
      triggerError("Este tiempo ya existe, agregue otro.");
      setEditingValue(null);
      return;
    }
    const next = replaceChipByValue(chips, originalValue, { value });
    const err = validateBalance(next);
    if (err) {
      triggerError(err);
      setEditingValue(null);
      return;
    }
    onChange(next.sort((a, b) => a.value - b.value));
    clearError();
    setEditingValue(null);
  }

  function removeChip(value: number) {
    const chip = chips.find((c) => c.value === value);
    if (!chip) return;
    if (chip.role !== null) {
      triggerError(
        "No se pueden eliminar tiempos con etiqueta Mín, Rec o Máx. Asigna la etiqueta a otro tiempo primero.",
      );
      return;
    }
    onChange(removeChipByValue(chips, value));
    clearError();
  }

  // Re-etiqueta un chip como min/rec/max. El chip que tenía ese rol pierde la
  // etiqueta activa y pasa a mostrar "ex: X" con su última etiqueta.
  function setRole(value: number, role: FixedRole) {
    const target = chips.find((c) => c.value === value);
    if (!target) return;
    if (target.role === role) {
      setTaggingValue(null);
      return;
    }
    const next = chips.map((c) => {
      if (c.value === value) return { ...c, role, previousRole: null as ChipRole };
      if (c.role === role) return { ...c, role: null as ChipRole, previousRole: role };
      return c;
    });
    const err = validateBalance(next);
    if (err) {
      triggerError(err);
      setTaggingValue(null);
      return;
    }
    onChange(next.sort((a, b) => a.value - b.value));
    setTaggingValue(null);
    clearError();
  }

  function openAdd() {
    setHours(0);
    setMinutes(15);
    setPickedRole(missingRoles[0]?.key ?? "rec");
    setPanel("add");
    clearError();
  }

  function openReplace() {
    setHours(0);
    setMinutes(15);
    setReplaceTarget("rec");
    setPanel("replace");
    clearError();
  }

  function openCustom() {
    setCustomMode("pick");
    setFreeHours(0);
    setFreeMinutes(0);
    setPanel("custom");
    clearError();
  }

  function confirmAdd() {
    if (currentValue < 1 || currentValue > MAX_MINUTES) return;
    if (chips.some((c) => c.value === currentValue)) {
      triggerError("Este tiempo ya existe, agregue otro.");
      return;
    }
    // Adding with a role that already exists evicts the previous holder to
    // "ex: X" so there is only one active min/rec/max at a time.
    const next = chips.map((c) =>
      c.role === pickedRole ? { ...c, role: null as ChipRole, previousRole: pickedRole } : c,
    );
    next.push({ value: currentValue, role: pickedRole, custom: true, previousRole: null as ChipRole });
    const err = validateBalance(next);
    if (err) {
      triggerError(err);
      return;
    }
    onChange(next.sort((a, b) => a.value - b.value));
    setPanel("none");
    clearError();
  }

  function confirmReplace() {
    if (currentValue < 1 || currentValue > MAX_MINUTES) return;
    if (chips.some((c) => c.role !== replaceTarget && c.value === currentValue)) {
      triggerError("Este tiempo ya existe, agregue otro.");
      return;
    }
    const next = chips.map((c) =>
      c.role === replaceTarget ? { ...c, value: currentValue } : c,
    );
    // Reject if the new value breaks min <= rec <= max or duplicates a value
    // after the replacement.
    const err = validateBalance(next);
    if (err) {
      triggerError(err);
      return;
    }
    if (next.some((c) => c.value === currentValue) && next.filter((c) => c.value === currentValue).length > 1) {
      triggerError("Este tiempo ya existe, agregue otro.");
      return;
    }
    onChange(next.sort((a, b) => a.value - b.value));
    setPanel("none");
    clearError();
  }

  function confirmCustom() {
    if (customMode === "type") {
      const total = freeHours * 60 + freeMinutes;
      if (total > MAX_MINUTES) {
        triggerError(MAX_ERROR);
        setFreeHours(0);
        setFreeMinutes(0);
        return;
      }
      if (total < 1) return;
      if (chips.some((c) => c.value === total)) {
        triggerError("Este tiempo ya existe, agregue otro.");
        return;
      }
      onChange(
        [...chips, { value: total, role: null, custom: true, previousRole: null as ChipRole }].sort(
          (a, b) => a.value - b.value,
        ),
      );
      setPanel("none");
      clearError();
      return;
    }
    const value = hours * 60 + minutes;
    if (value > MAX_MINUTES) {
      triggerError(MAX_ERROR);
      setHours(0);
      setMinutes(0);
      return;
    }
    if (value < 1) return;
    const exists = chips.some((c) => c.value === value);
    if (exists) {
      triggerError("Este tiempo ya existe, agregue otro.");
      return;
    }
    onChange(
      [...chips, { value, role: null, custom: true, previousRole: null as ChipRole }].sort(
        (a, b) => a.value - b.value,
      ),
    );
    setPanel("none");
    clearError();
  }

  const sorted = [...chips].sort((a, b) => a.value - b.value);

  function clockPicker() {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Clock className="size-4 text-accent-aprender" />
        <div className="flex items-center gap-1">
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            aria-label="Horas"
            className="cursor-pointer rounded-lg border border-border bg-surface px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">h</span>
        </div>
        <div className="flex items-center gap-1">
          <select
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            aria-label="Minutos"
            className="cursor-pointer rounded-lg border border-border bg-surface px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">min</span>
        </div>
      </div>
    );
  }

  function rolePicker(value: FixedRole, onPick: (r: FixedRole) => void, options: FixedRole[]) {
    return (
      <div className="flex items-center gap-0.5">
        {ROLES.filter((r) => options.includes(r.key)).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onPick(key)}
            aria-pressed={value === key}
            className={cn(
              "cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
              value === key
                ? "bg-accent-aprender text-white"
                : "bg-surface-hover text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <motion.div animate={controls} className="flex flex-wrap items-center gap-2">
        {sorted.map((chip) => {
          const editing = editingValue === chip.value;
          const showRoleBadge = chip.role !== null;
          const showExBadge = !showRoleBadge && chip.previousRole !== null && chip.previousRole !== undefined;
          const showAddedBadge = !showRoleBadge && !showExBadge && chip.custom;
          return (
            <div
              key={chip.value}
              className={cn(
                "flex items-center gap-1 rounded-2xl border px-2.5 py-2 transition-colors",
                showRoleBadge
                  ? "border-accent-aprender/60 bg-accent-aprender/10"
                  : "border-border bg-surface",
              )}
            >
              {editing ? (
                <input
                  ref={inputRef}
                  type="number"
                  defaultValue={chip.value}
                  className="w-12 bg-transparent text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  onBlur={(e) => commitEdit(chip.value, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(chip.value, (e.target as HTMLInputElement).value);
                    if (e.key === "Escape") setEditingValue(null);
                  }}
                  min={1}
                  max={MAX_MINUTES}
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit(chip.value)}
                  className={cn(
                    "cursor-pointer text-sm font-semibold tabular-nums",
                    showRoleBadge ? "text-accent-aprender" : "text-foreground",
                  )}
                  title="Editar valor"
                >
                  {formatValue(chip.value)}
                </button>
              )}

              {showRoleBadge && (
                <span className="rounded-full bg-accent-aprender px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {roleLabel(chip.role)}
                </span>
              )}

              {showExBadge && chip.previousRole && (
                <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {roleLabel(chip.previousRole, true)}
                </span>
              )}

              {showAddedBadge && (
                <span className="flex items-center gap-1 rounded-full bg-surface-hover px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                  <Star className="size-2.5" />
                  Agregado
                </span>
              )}

              <button
                type="button"
                onClick={() => setTaggingValue(taggingValue === chip.value ? null : chip.value)}
                aria-label={`Etiquetar ${formatValue(chip.value)}`}
                title="Etiquetar como Mín, Rec o Máx"
                className="cursor-pointer text-muted-foreground transition-colors hover:text-accent-aprender focus-visible:outline-none"
              >
                <Pencil className="size-3" />
              </button>

              <button
                type="button"
                onClick={() => removeChip(chip.value)}
                aria-label="Eliminar tiempo"
                title="Eliminar tiempo"
                className="cursor-pointer text-muted-foreground transition-colors hover:text-red-500 focus-visible:outline-none"
              >
                <X className="size-3.5" />
              </button>

              {taggingValue === chip.value && (
                <div className="flex items-center gap-0.5 rounded-full border border-border bg-surface px-1 py-0.5">
                  {ROLES.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRole(chip.value, key)}
                      className={cn(
                        "cursor-pointer rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors focus-visible:outline-none",
                        chip.role === key
                          ? "bg-accent-aprender text-white"
                          : "text-muted-foreground hover:bg-accent-aprender hover:text-white",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Botón / paneles */}
        {panel === "none" && (
          <button
            type="button"
            onClick={() => (allRolesPresent ? setPanel("menu") : openAdd())}
            className="flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent-aprender/40 hover:text-accent-aprender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <Plus className="size-3" />
            Agregar tiempo
          </button>
        )}

        {panel === "menu" && (
          <div className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-surface-muted p-3">
            <p className="text-xs text-muted-foreground">
              Las 3 categorías de tiempo (mínimo, recomendado y máximo) ya existen.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openReplace}
                className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
              >
                Reemplazar una existente
              </button>
              <button
                type="button"
                onClick={openCustom}
                className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
              >
                Agregar una nueva
              </button>
              <button
                type="button"
                onClick={() => setPanel("none")}
                aria-label="Cerrar"
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {panel === "add" && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-accent-aprender/60 bg-surface p-3 shadow-sm">
            {clockPicker()}
            {rolePicker(pickedRole, setPickedRole, missingRoles.map((r) => r.key))}
            <button
              type="button"
              onClick={confirmAdd}
              disabled={currentValue < 1}
              className="cursor-pointer rounded-full bg-accent-aprender px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-accent-aprender-hover disabled:opacity-50"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => setPanel("none")}
              aria-label="Cancelar"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {panel === "replace" && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-accent-aprender/60 bg-surface p-3 shadow-sm">
            <span className="text-xs text-muted-foreground">Reemplazar:</span>
            {rolePicker(replaceTarget, setReplaceTarget, ["min", "rec", "max"])}
            {clockPicker()}
            <button
              type="button"
              onClick={confirmReplace}
              disabled={currentValue < 1}
              className="cursor-pointer rounded-full bg-accent-aprender px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-accent-aprender-hover disabled:opacity-50"
            >
              Reemplazar
            </button>
            <button
              type="button"
              onClick={() => setPanel("none")}
              aria-label="Cancelar"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {panel === "custom" && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-accent-aprender/60 bg-surface p-3 shadow-sm">
            {customMode === "pick" ? (
              <button
                type="button"
                onClick={() => {
                  setCustomMode("type");
                  setFreeHours(0);
                  setFreeMinutes(0);
                  clearError();
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-accent-aprender/50 bg-accent-aprender/5 px-3 py-1.5 text-xs font-medium text-accent-aprender transition-colors hover:bg-accent-aprender/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                <Star className="size-3.5" />
                Mi tiempo
              </button>
            ) : (
              <>
                <Clock className="size-4 text-accent-aprender" />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={freeHours}
                    min={0}
                    max={8}
                    onChange={(e) => {
                      const v = Math.max(0, Number(e.target.value));
                      if (v > 8) {
                        triggerError(MAX_ERROR);
                        setFreeHours(0);
                        setFreeMinutes(0);
                        return;
                      }
                      setFreeHours(v);
                      clearError();
                    }}
                    aria-label="Horas"
                    className="w-14 rounded-lg border border-border bg-surface px-2 py-1 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                  />
                  <span className="text-xs text-muted-foreground">h</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={freeMinutes}
                    min={0}
                    max={59}
                    onChange={(e) => {
                      const v = Math.max(0, Number(e.target.value));
                      if (v > 59) {
                        setFreeMinutes(59);
                        return;
                      }
                      setFreeMinutes(v);
                      clearError();
                    }}
                    aria-label="Minutos"
                    className="w-14 rounded-lg border border-border bg-surface px-2 py-1 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                  />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={confirmCustom}
              disabled={customMode === "type" ? freeHours * 60 + freeMinutes < 1 : currentValue < 1}
              className="cursor-pointer rounded-full bg-accent-aprender px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-accent-aprender-hover disabled:opacity-50"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => setPanel("none")}
              aria-label="Cancelar"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs font-medium text-red-500"
          role="alert"
        >
          <AlertCircle className="size-3.5" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
