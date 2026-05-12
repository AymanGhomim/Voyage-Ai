import { getPlaceImage } from "@/lib/place-image";
import type { Day } from "@/lib/trip-data";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AIPlace {
  name: string;
  city: string;
  emoji: string;
  tag: string;
  time: string;
}

interface AIDay {
  day: number;
  title: string;
  places: AIPlace[];
}

interface AIResponse {
  days: AIDay[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function calcDays(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

export function formatDateLabel(dateStr: string, dayIndex: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Prompt ────────────────────────────────────────────────────────────────────
function buildPrompt(destination: string, numDays: number, startDate: string, userPrompt: string): string {
  return `You are a world-class travel planner.
Plan a ${numDays}-day trip to ${destination} starting ${startDate}.
${userPrompt ? `Traveler preferences: ${userPrompt}` : ""}

Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation.

Schema:
{
  "days": [
    {
      "day": 1,
      "title": "Short evocative day title",
      "places": [
        {
          "name": "Exact real place name",
          "city": "City or district",
          "emoji": "Single emoji",
          "tag": "One of: Landmark, Museum, Food, Dinner, Lunch, Breakfast, Market, Beach, Hike, Sunset, Nightlife, Shopping, Culture, Temple, Park, Viewpoint, Spa, Tour, Activity",
          "time": "HH:MM"
        }
      ]
    }
  ]
}

Rules:
- 2–4 places per day with logical times (breakfast ~08:00, lunch ~13:00, dinner ~20:00)
- Places must be REAL and specific to ${destination}
- Day titles must be poetic and descriptive
- Return ONLY the JSON object`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export async function generateItinerary(
  destination: string,
  startDate: string,
  endDate: string,
  userPrompt = "",
): Promise<Day[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("NO_API_KEY");

  const numDays = calcDays(startDate, endDate);
  const prompt  = buildPrompt(destination, numDays, startDate, userPrompt);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",   // Gemini يرجع JSON مباشرة
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
  };

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  // Strip accidental markdown fences just in case
  const cleaned = raw.replace(/```(?:json)?/g, "").trim();
  const parsed: AIResponse = JSON.parse(cleaned);

  return parsed.days.map((d, i) => ({
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
