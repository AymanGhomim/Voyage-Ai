// Vercel Serverless Function — proxies Unsplash search (no CORS/allowlist issues)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Missing query" });

  const apiKey = process.env.VITE_UNSPLASH_ACCESS_KEY;
  if (!apiKey) return res.status(500).json({ error: "NO_API_KEY" });

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${apiKey}`;
    const unsplashRes = await fetch(url);

    if (!unsplashRes.ok) {
      return res.status(200).json({ url: null });
    }

    const data = await unsplashRes.json();
    const imageUrl = data.results?.[0]?.urls?.regular ?? null;

    // Cache for 1 hour
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json({ url: imageUrl });
  } catch (_) {
    return res.status(200).json({ url: null });
  }
}
