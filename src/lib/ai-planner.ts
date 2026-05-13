import { getPlaceImage } from "@/lib/place-image";
import type { Day } from "@/lib/trip-data";

interface AIPlace { name: string; city: string; emoji: string; tag: string; time: string; }
interface AIDay   { day: number; title: string; places: AIPlace[]; }
interface AIResp  { days: AIDay[]; }

export function calcDays(start: string, end: string): number {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1);
}

export function formatDateLabel(dateStr: string, dayIndex: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildPrompt(destination: string, numDays: number, startDate: string, userPrompt: string): string {
  return `You are a world-class travel planner.
Plan a ${numDays}-day trip to ${destination} starting ${startDate}.
${userPrompt ? `Traveler preferences: ${userPrompt}` : ""}

Return ONLY a JSON object, no markdown, no backticks.

{
  "days": [
    {
      "day": 1,
      "title": "Evocative day title",
      "places": [
        {
          "name": "Exact real place name in ${destination}",
          "city": "District or city",
          "emoji": "single emoji",
          "tag": "Landmark|Museum|Food|Dinner|Lunch|Breakfast|Market|Beach|Hike|Sunset|Nightlife|Shopping|Culture|Temple|Park|Viewpoint|Spa|Tour|Activity",
          "time": "HH:MM"
        }
      ]
    }
  ]
}

Rules:
- 2–4 real places per day with logical times
- ALL places must be REAL and exist in ${destination}
- Return ONLY the JSON`;
}

async function callGemini(model: string, body: object, apiKey: string): Promise<Response> {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
}

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
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  };

  // Try models in order — most capable first, fallback to lighter ones
  const models = [
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-8b-latest",
  ];

  let lastError = "";
  for (const model of models) {
    try {
      const res = await callGemini(model, body, apiKey);
      if (!res.ok) {
        const err = await res.text();
        lastError = `${model}: ${res.status} ${err.slice(0, 200)}`;
        continue; // try next model
      }
      const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] };
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      // Strip accidental markdown fences
      const cleaned = raw.replace(/```(?:json)?/g, "").trim();
      const parsed: AIResp = JSON.parse(cleaned);

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
    } catch (e) {
      lastError = String(e);
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}
