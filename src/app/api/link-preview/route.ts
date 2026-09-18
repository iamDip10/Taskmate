import { NextRequest, NextResponse } from "next/server";
import { requireRole, withAuthError } from "@/lib/auth";

/**
 * Turns a URL typed into a task's description into a small preview
 * (title, site name, thumbnail) — the same idea as how Slack or iMessage
 * unfurl a link, done ourselves with a plain server-side fetch so we don't
 * need a third-party API key.
 *
 * GET /api/link-preview?url=<encoded url>
 */

type Preview = {
  url: string;
  title: string;
  description: string | null;
  image: string | null;
  siteName: string;
};

const FETCH_TIMEOUT_MS = 6000;
const MAX_BYTES = 500_000; // stop reading a page well before the closing </html>
const CACHE_TTL_MS = 1000 * 60 * 30;

// Simple in-memory cache. Resets on cold start, which is fine — this is a
// nice-to-have speedup, not a source of truth.
const cache = new Map<string, { at: number; data: Preview | null }>();

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h === "::1") return true;
  if (h.startsWith("127.")) return true;
  if (h.startsWith("10.")) return true;
  if (h.startsWith("192.168.")) return true;
  if (h.startsWith("169.254.")) return true; // cloud metadata endpoint
  const privateRange = /^172\.(1[6-9]|2\d|3[0-1])\./;
  if (privateRange.test(h)) return true;
  return false;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMeta(html: string, ...keys: string[]): string | null {
  for (const key of keys) {
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${key}["']`, "i"),
    ];
    for (const re of patterns) {
      const match = html.match(re);
      if (match?.[1]) return decodeEntities(match[1]);
    }
  }
  return null;
}

async function fetchYouTubePreview(url: string): Promise<Preview | null> {
  try {
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembed, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      url,
      title: data.title ?? "YouTube video",
      description: data.author_name ? `by ${data.author_name}` : null,
      image: data.thumbnail_url ?? null,
      siteName: "YouTube",
    };
  } catch {
    return null;
  }
}

async function fetchGenericPreview(url: string): Promise<Preview | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        // Some sites only render OG tags for something resembling a browser / crawler.
        "User-Agent":
          "Mozilla/5.0 (compatible; TaskMateLinkPreview/1.0; +https://example.com)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;

    const reader = res.body?.getReader();
    if (!reader) return null;

    let html = "";
    let bytes = 0;
    const decoder = new TextDecoder();
    while (bytes < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) break;
    }
    reader.cancel().catch(() => {});

    const title =
      extractMeta(html, "og:title", "twitter:title") ??
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ??
      null;
    const description = extractMeta(html, "og:description", "twitter:description", "description");
    let image = extractMeta(html, "og:image", "twitter:image");
    if (image && !image.startsWith("http")) {
      try {
        image = new URL(image, url).toString();
      } catch {
        image = null;
      }
    }
    const siteName = extractMeta(html, "og:site_name") ?? new URL(url).hostname.replace(/^www\./, "");

    if (!title) return null;

    return { url, title: decodeEntities(title.trim()), description, image, siteName };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  return withAuthError(async () => {
    // Anyone signed in can preview a link — it's read-only and has no
    // side effects beyond a server-side fetch.
    requireRole();

    const raw = req.nextUrl.searchParams.get("url");
    if (!raw) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
    }
    if (isBlockedHost(parsed.hostname)) {
      return NextResponse.json({ error: "That host can't be previewed" }, { status: 400 });
    }

    const cacheKey = parsed.toString();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.data
        ? NextResponse.json({ preview: cached.data })
        : NextResponse.json({ preview: null }, { status: 404 });
    }

    const isYouTube = /(^|\.)youtube\.com$/.test(parsed.hostname) || parsed.hostname === "youtu.be";
    const preview = isYouTube ? await fetchYouTubePreview(cacheKey) : await fetchGenericPreview(cacheKey);

    cache.set(cacheKey, { at: Date.now(), data: preview });

    if (!preview) {
      return NextResponse.json({ preview: null }, { status: 404 });
    }
    return NextResponse.json({ preview });
  });
}
