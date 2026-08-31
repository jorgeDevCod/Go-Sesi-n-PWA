"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { ICON_GROUPS } from "@/lib/constants/icon-options";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "gosession-custom-colors";

export const COLOR_SWATCHES = [
  "#6366F1",
  "#0EA5E9",
  "#8B5CF6",
  "#22C55E",
  "#0284C7",
  "#06B6D4",
  "#F59E0B",
  "#14B8A6",
  "#F97316",
  "#64748B",
  "#10B981",
  "#EC4899",
];

function loadCustomColors(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveCustomColors(colors: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  } catch {
    // Storage unavailable
  }
}

export function IconColorPicker({
  icon,
  onIconChange,
  color,
  onColorChange,
}: {
  icon: string;
  onIconChange: (icon: string) => void;
  color: string;
  onColorChange: (color: string) => void;
}) {
  const [customColors, setCustomColors] = useState<string[]>(loadCustomColors);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerValue, setPickerValue] = useState("#6366F1");
  const pickerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    if (pickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  function addCustomColor() {
    const hex = pickerValue.toUpperCase();
    if (customColors.includes(hex)) return;
    const next = [...customColors, hex];
    setCustomColors(next);
    saveCustomColors(next);
    onColorChange(hex);
    setPickerOpen(false);
  }

  function removeCustomColor(hex: string) {
    const next = customColors.filter((c) => c !== hex);
    setCustomColors(next);
    saveCustomColors(next);
    if (color === hex) {
      onColorChange(COLOR_SWATCHES[0]);
    }
  }

  return (
    <>
      <div>
        <Label>Icono</Label>
        <div className="flex max-h-64 flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-surface p-3">
          {ICON_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                {group.icons.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onIconChange(option)}
                    aria-label={option}
                    title={option}
                    aria-pressed={icon === option}
                    className={cn(
                      "flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                      icon === option && "border-accent-aprender bg-surface-muted",
                    )}
                  >
                    <DynamicIcon name={option} className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => onColorChange(swatch)}
              aria-label={`Color ${swatch}`}
              title={`Color ${swatch}`}
              aria-pressed={color === swatch}
              style={{ backgroundColor: swatch }}
              className={cn(
                "size-8 cursor-pointer rounded-full border-2 border-transparent transition-transform duration-200 focus-visible:outline-none",
                color === swatch && "scale-110 border-foreground",
              )}
            />
          ))}
        </div>

        <div className="mt-2">
          {customColors.length > 0 && (
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Personalizados</p>
          )}
          <div className="flex flex-wrap gap-2">
            {customColors.map((swatch) => (
              <div key={swatch} className="relative group/swatch">
                <button
                  type="button"
                  onClick={() => onColorChange(swatch)}
                  aria-label={`Color ${swatch}`}
                  title={`Color ${swatch}`}
                  aria-pressed={color === swatch}
                  style={{ backgroundColor: swatch }}
                  className={cn(
                    "size-8 cursor-pointer rounded-full border-2 border-transparent transition-transform duration-200 focus-visible:outline-none",
                    color === swatch && "scale-110 border-foreground",
                  )}
                />
                <button
                  type="button"
                  onClick={() => removeCustomColor(swatch)}
                  aria-label={`Eliminar color ${swatch}`}
                  title="Eliminar color"
                  className="absolute -top-1 -right-1 flex size-4 cursor-pointer items-center justify-center rounded-full bg-surface text-muted-foreground opacity-0 shadow-sm transition-opacity duration-200 group-hover/swatch:opacity-100 hover:text-red-500 focus-visible:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setPickerOpen((v) => !v);
                  setPickerValue("#6366F1");
                }}
                aria-label="Añadir color personalizado"
                title="Añadir color personalizado"
                className="size-8 cursor-pointer rounded-full border-2 border-border transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #6366f1, #a855f7)",
                }}
              />

              {pickerOpen && (
                <div
                  ref={pickerRef}
                  className="absolute bottom-[calc(100%+0.5rem)] left-0 z-10 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xl min-w-44"
                >
                  <p className="text-sm font-medium text-foreground">Elige un color</p>
                  <button
                    type="button"
                    onClick={() => colorInputRef.current?.click()}
                    className="size-20 cursor-pointer rounded-full border-4 border-border shadow-md transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                    style={{ backgroundColor: pickerValue }}
                    aria-label="Seleccionar color"
                  />
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={pickerValue}
                    onChange={(e) => setPickerValue(e.target.value)}
                    className="sr-only"
                  />
                  <Button type="button" size="md" onClick={addCustomColor}>
                    Añadir color
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
