"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/session";

export default function RoleSelect() {
  const router = useRouter();
  const [pending, setPending] = useState<Role | null>(null);

  async function choose(role: Role) {
    setPending(role);
    await fetch("/api/auth/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-3">
      <button
        onClick={() => choose("OWNER")}
        disabled={pending !== null}
        className="flex w-full items-center gap-4 rounded-2xl border border-berry-100 bg-white px-5 py-5 text-left shadow-soft transition active:scale-[0.98] disabled:opacity-60"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-berry-50 text-xl">
          🧑‍💻
        </span>
        <span>
          <span className="block font-semibold text-ink">I'm Dip</span>
          <span className="block text-sm text-ink-soft">Give tasks, review, and react</span>
        </span>
        {pending === "OWNER" && <span className="ml-auto text-sm text-ink-soft">…</span>}
      </button>

      <button
        onClick={() => choose("WORKER")}
        disabled={pending !== null}
        className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-soft transition active:scale-[0.98] disabled:opacity-60"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl">
          💐
        </span>
        <span>
          <span className="block font-semibold text-ink">I'm Wife</span>
          <span className="block text-sm text-ink-soft">See tasks and mark them done</span>
        </span>
        {pending === "WORKER" && <span className="ml-auto text-sm text-ink-soft">…</span>}
      </button>
    </div>
  );
}
