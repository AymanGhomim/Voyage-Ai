// Vercel Serverless Function — calls Gemini from server side (no CORS/allowlist issues)
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { destination, startDate, endDate, userPrompt = "" } = req.body;
  if (!destination || !startDate || !endDate)
    return res.status(400).json({ error: "Missing required fields" });

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "NO_API_KEY" });

  const numDays = Math.max(1, Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000
  ) + 1);

  const prompt = `You are a world-class travel planner.
Plan a ${numDays}-day trip to ${destination} starting ${startDate}.
${userPrompt ? `Traveler preferences: ${userPrompt}` : ""}

Return ONLY a valid JSON object, no markdown, no backticks, no explanation.

{
  "days": [
    {
      "day": 1,
      "title": "Evocative day title",
      "places": [
        {
          "name": "Exact real place name",
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
- 2-4 real places per day with logical times
- ALL places must REALLY exist in ${destination}
- Return ONLY the JSON object`;

  const models = [
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-8b-latest",
  ];

  for (const model of models) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        }
      );

      if (!geminiRes.ok) continue;

      const data = await geminiRes.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const cleaned = raw.replace(/```(?:json)?/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return res.status(200).json({ days: parsed.days, model });
    } catch (_) {
      continue;
    }
  }

  return res.status(500).json({ error: "All Gemini models failed" });
}
