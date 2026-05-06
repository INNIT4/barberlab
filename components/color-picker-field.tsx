"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";

const PRESETS: { value: string; label: string }[] = [
  { value: "#7B1E2B", label: "Oxblood" },
  { value: "#B8860B", label: "Latón" },
  { value: "#1F3A5F", label: "Marina" },
  { value: "#2F4F2F", label: "Bosque" },
  { value: "#C8553D", label: "Terracota" },
  { value: "#1A1A1A", label: "Carbón" },
  { value: "#D4A574", label: "Arena" },
  { value: "#5D2E5F", label: "Vino" },
];

function isHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value.trim());
}

export function ColorPickerField({
  name,
  defaultValue,
  disabled,
}: {
  name: string;
  defaultValue: string | null;
  disabled?: boolean;
}) {
  const initial = defaultValue?.trim() ?? "";
  const [value, setValue] = useState<string>(initial);

  const safeHexForPicker = isHex(value) ? value : "#7B1E2B";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = value.toLowerCase() === p.value.toLowerCase();
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => setValue(p.value)}
              disabled={disabled}
              title={p.label}
              aria-label={p.label}
              aria-pressed={active}
              className="relative h-9 w-9 rounded-full border-2 transition hover:scale-110"
              style={{
                background: p.value,
                borderColor: active ? "var(--ink)" : "transparent",
              }}
            >
              {active ? (
                <Check
                  className="absolute inset-0 m-auto h-4 w-4"
                  style={{ color: "white" }}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <label className="relative h-10 w-12 cursor-pointer overflow-hidden rounded-md border border-[color:var(--border)]">
          <span
            className="block h-full w-full"
            style={{
              background:
                value && (isHex(value) || value.startsWith("oklch"))
                  ? value
                  : "var(--paper-deep)",
            }}
          />
          <input
            type="color"
            value={safeHexForPicker}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Selector de color personalizado"
          />
        </label>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#7B1E2B"
          maxLength={60}
          disabled={disabled}
          className="flex-1 font-mono text-sm"
        />
      </div>

      <input type="hidden" name={name} value={value} />

      <p className="text-xs text-[color:var(--muted-foreground)]">
        Usa un preset, la ruedita de color, o pega un hex/oklch personalizado.
      </p>
    </div>
  );
}
