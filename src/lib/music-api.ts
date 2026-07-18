import type { SearchResult } from "../bot.js";

const DEEZER_API = "https://api.deezer.com";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function searchTracks(
  query: string,
  limit = 5,
): Promise<SearchResult[]> {
  const url = `${DEEZER_API}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { data?: Array<{
    id: number;
    title: string;
    artist: { name: string };
    album: { title: string; cover_medium: string };
    preview: string;
  }> };
  if (!data.data) return [];
  return data.data.map((t) => ({
    trackId: String(t.id),
    trackTitle: escapeHtml(t.title),
    artist: escapeHtml(t.artist.name),
    album: escapeHtml(t.album.title),
    coverArtUrl: t.album.cover_medium,
    previewUrl: t.preview,
  }));
}
