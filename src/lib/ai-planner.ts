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

// ── System prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are a world-class travel planner AI. 
When given a destination and number of days, respond ONLY with a valid JSON object — no markdown, no explanation, no backticks.

The JSON must follow this exact schema:
{
  "days": [
    {
      "day": 1,
      "title": "Short evocative day title",
      "places": [
        {
          "name": "Exact place name",
          "city": "City or area name",
          "emoji": "Single relevant emoji",
          "tag": "One of: Landmark, Museum, Food, Dinner, Lunch, Breakfast, Market, Beach, Hike, Sunset, Nightlife, Shopping, Culture, Temple, Park, Viewpoint, Spa, Tour, Activity",
          "time": "HH:MM (24h format)"
        }
      ]
    }
  ]
}

Rules:
- Include 2–4 places per day (morning, afternoon, evening)
- Places must be REAL and specific to the destination city
- Times must be logical (breakfast 08:00-09:00, lunch 12:30-13:30, dinner 19:30-21:00)
- Day titles must be poetic and descriptive
- Return ONLY the JSON object, nothing else`;
}

// ── Main function ─────────────────────────────────────────────────────────────
export async function generateItinerary(
  destination: string,
  startDate: string,
  endDate: string,
  userPrompt: string = "",
): Promise<Day[]> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) throw new Error("NO_API_KEY");

  const numDays = calcDays(startDate, endDate);

  const userMessage = `Plan a ${numDays}-day trip to ${destination}.
${userPrompt ? `Traveler preferences: ${userPrompt}` : ""}
Start date: ${startDate}
End date: ${endDate}

Respond with ONLY the JSON object.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json() as { content: { type: string; text: string }[] };
  const raw = data.content.find((b) => b.type === "text")?.text ?? "";

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```(?:json)?/g, "").trim();
  const parsed: AIResponse = JSON.parse(cleaned);

  // Map to our Day type, injecting real images
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
