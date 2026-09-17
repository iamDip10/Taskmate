"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "That code isn't right.");
        setLoading(false);
        return;
      }

      router.push("/role");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="code" className="mb-2 block text-sm font-medium text-ink-soft">
          Access code
        </label>
        <input
          id="code"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          placeholder="••••"
          className="w-full rounded-2xl border border-berry-100 bg-white px-5 py-4 text-center text-2xl tracking-[0.4em] text-ink shadow-soft transition focus:border-berry-500 focus:outline-none"
        />
      </div>

      {error && (
        <p role="alert" className="animate-fade-in text-center text-sm text-clay-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="w-full rounded-2xl bg-berry-500 px-5 py-4 text-base font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
