"use client";

import { useEffect, useState } from "react";

type Preview = {
  url: string;
  title: string;
  description: string | null;
  image: string | null;
  siteName: string;
};

type Status = "loading" | "ready" | "empty";

// One shared cache across every card on the page, so switching tabs or
// re-rendering a task list doesn't re-fetch a preview we already have.
const clientCache = new Map<string, Preview | null>();

export default function LinkPreviewCard({ url, compact }: { url: string; compact?: boolean }) {
  const [status, setStatus] = useState<Status>(clientCache.has(url) ? "ready" : "loading");
  const [preview, setPreview] = useState<Preview | null>(clientCache.get(url) ?? null);

  useEffect(() => {
    let cancelled = false;

    if (clientCache.has(url)) {
      const cached = clientCache.get(url) ?? null;
      setPreview(cached);
      setStatus(cached ? "ready" : "empty");
      return;
    }

    setStatus("loading");
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then(async (res) => {
        if (res.status === 404) return { preview: null };
        if (!res.ok) throw new Error("preview failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        clientCache.set(url, data.preview ?? null);
        setPreview(data.preview ?? null);
        setStatus(data.preview ? "ready" : "empty");
      })
      .catch(() => {
        if (cancelled) return;
        clientCache.set(url, null);
        setStatus("empty");
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (status === "loading") {
    return (
      <div className="flex animate-pulse items-center gap-3 rounded-xl border border-berry-100/70 bg-paper p-2.5">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-berry-100/70" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-2.5 w-3/4 rounded bg-berry-100/70" />
          <div className="h-2 w-1/3 rounded bg-berry-100/50" />
        </div>
      </div>
    );
  }

  if (status === "empty" || !preview) {
    // Not every page can be unfurled (blocked by robots, no OG tags, etc.) —
    // fail quietly rather than showing a broken-looking card.
    return null;
  }

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center gap-3 rounded-xl border border-berry-100/70 bg-paper p-2.5 transition hover:border-berry-300 hover:bg-berry-50 ${
        compact ? "" : "animate-fade-in"
      }`}
    >
      {preview.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.image}
          alt=""
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-berry-100 text-lg">
          🔗
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{preview.title}</p>
        <p className="truncate text-xs text-ink-soft">{preview.siteName}</p>
      </div>
    </a>
  );
}
