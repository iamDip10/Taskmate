"use client";

import type { Role } from "@/lib/session";

export type Tab = "home" | "given" | "completed" | "settings";

type Props = {
  role: Role;
  active: Tab;
  onChange: (tab: Tab) => void;
};

export default function BottomNav({ role, active, onChange }: Props) {
  const items: { key: Tab; label: string; icon: string }[] =
    role === "OWNER"
      ? [
          { key: "home", label: "Home", icon: "🏡" },
          { key: "given", label: "Given", icon: "📋" },
          { key: "completed", label: "Completed", icon: "✓" },
          { key: "settings", label: "Settings", icon: "⚙️" },
        ]
      : [
          { key: "home", label: "Home", icon: "🏡" },
          { key: "given", label: "Tasks", icon: "📋" },
          { key: "completed", label: "Completed", icon: "✓" },
        ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-berry-100/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition"
            >
              <span
                className={`text-lg transition-transform ${isActive ? "scale-110" : "opacity-60"}`}
                aria-hidden
              >
                {item.icon}
              </span>
              <span className={isActive ? "font-semibold text-berry-600" : "text-ink-soft"}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
