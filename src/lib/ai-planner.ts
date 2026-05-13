import { getPlaceImage } from "@/lib/place-image";
import type { Day } from "@/lib/trip-data";

export function calcDays(start: string, end: string): number {
  return Math.max(1, Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000
  ) + 1);
}

export function formatDateLabel(dateStr: string, dayIndex: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function generateItinerary(
  destination: string,
  startDate: string,
  endDate: string,
  userPrompt = "",
): Promise<Day[]> {
  // Call our own Vercel serverless function — no CORS or key restriction issues
  const res = await fetch("/api/generate-itinerary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destination, startDate, endDate, userPrompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    if (err.error === "NO_API_KEY") throw new Error("NO_API_KEY");
    throw new Error(err.error ?? `Server error ${res.status}`);
  }

  const data = await res.json() as { days: { day: number; title: string; places: { name: string; city: string; emoji: string; tag: string; time: string }[] }[] };

  return data.days.map((d, i) => ({
    day: d.day,
    title: d.title,
    date: formatDateLabel(startDate, i),
    places: d.places.map((p, pi) => ({
      id: `ai-${d.day}-${pi}`,
      name: p.name,
      city: p.city,
      emoji: p.emoji,
      tag: p.tag,
      time: p.time,
      image: getPlaceImage(p.name, p.city, p.tag),
    })),
  }));
}
