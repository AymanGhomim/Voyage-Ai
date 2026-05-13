/**
 * Fetches real Unsplash photos for a given place/city.
 * Falls back to curated static URLs if the API call fails.
 */

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string;

// In-memory cache: "query" → image URL  (avoids duplicate API calls)
const cache = new Map<string, string>();

// ── Static fallback map (used if no API key or request fails) ─────────────────
const STATIC_MAP: Record<string, string> = {
  santorini:   "photo-1570077188670-e3a8d69ac5ff",
  oia:         "photo-1507525428034-b723cf961d3e",
  greece:      "photo-1555993539-1732b0258235",
  tokyo:       "photo-1540959733332-eab4deabeeaf",
  japan:       "photo-1528360983277-13d401cdc186",
  kyoto:       "photo-1493976040374-85c8e12f0c0e",
  osaka:       "photo-1589452271712-64b8a66c7b71",
  bali:        "photo-1537996194471-e657df975ab4",
  ubud:        "photo-1555400038-63f5ba517a47",
  indonesia:   "photo-1518548419970-58e3b4079ab2",
  iceland:     "photo-1476610182048-b716b8518aae",
  reykjavik:   "photo-1531168556467-80aace0d0144",
  paris:       "photo-1502602898657-3e91760cbb34",
  "eiffel tower": "photo-1543349689-9a4d426bee8e",
  london:      "photo-1513635269975-59663e0ac1ad",
  rome:        "photo-1552832230-c0197dd311b5",
  venice:      "photo-1523906834658-6e24ef2386f9",
  barcelona:   "photo-1539037116277-4db20889f2d4",
  lisbon:      "photo-1558370781-d6196949e317",
  amsterdam:   "photo-1534351590666-13e3e96b5017",
  prague:      "photo-1541849546-216549ae216d",
  istanbul:    "photo-1524231757912-21f4fe3a7200",
  dubai:       "photo-1512453979798-5ea266f8880c",
  maldives:    "photo-1514282401047-d79a71a590e8",
  thailand:    "photo-1506665531195-3566af2b4dfa",
  bangkok:     "photo-1508009603885-50cf7c579365",
  "new york":  "photo-1496442226666-8d4d0e62e6e9",
  cairo:       "photo-1553913861-c0fddf2619ee",
  marrakech:   "photo-1539020140153-e479b8c22e70",
  morocco:     "photo-1489749798305-4fea3ae63d43",
  sydney:      "photo-1506374322094-6021fc3926f1",
  hawaii:      "photo-1542259009477-d625272157b7",
  sunset:      "photo-1516912481808-3406841bd33c",
  beach:       "photo-1507525428034-b723cf961d3e",
  volcano:     "photo-1444464666168-49d633b86797",
  hike:        "photo-1551632811-561732d1e306",
  wine:        "photo-1474722883778-792e7990302f",
  dinner:      "photo-1414235077428-338989a2e8c0",
  restaurant:  "photo-1550966871-3ed3cdb5ed0c",
  museum:      "photo-1518998053901-5348d3961a04",
  temple:      "photo-1528360983277-13d401cdc186",
  market:      "photo-1555400038-63f5ba517a47",
  rooftop:     "photo-1527838832700-5059252407fa",
  spa:         "photo-1544161515-4ab6ce6db874",
  stargazing:  "photo-1446776858070-70c3d5ed6758",
};

function staticUrl(key: string): string {
  return `https://images.unsplash.com/${key}?w=800&q=80&fit=crop&auto=format`;
}

function findStatic(name: string, city: string, tag?: string): string | null {
  for (const candidate of [name.toLowerCase(), city.toLowerCase(), tag?.toLowerCase() ?? ""]) {
    if (STATIC_MAP[candidate]) return staticUrl(STATIC_MAP[candidate]);
    const match = Object.keys(STATIC_MAP).find(
      (k) => candidate.includes(k) || k.includes(candidate),
    );
    if (match) return staticUrl(STATIC_MAP[match]);
  }
  return null;
}

// ── Unsplash API search ───────────────────────────────────────────────────────
async function searchUnsplash(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;
  if (cache.has(query)) return cache.get(query)!;

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as { results: { urls: { regular: string } }[] };
    const imgUrl = data.results[0]?.urls?.regular ?? null;
    if (imgUrl) cache.set(query, imgUrl);
    return imgUrl;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Returns a static fallback immediately, and also returns a Promise
 * that resolves to the real Unsplash photo URL.
 *
 * Components should:
 *   1. Render the fallback src immediately
 *   2. Await fetchPlaceImage() and update src when it resolves
 */
export function getPlaceImageFallback(name: string, city: string, tag?: string): string {
  return (
    findStatic(name, city, tag) ??
    `https://loremflickr.com/800/600/${encodeURIComponent(city + " " + (tag ?? name))}/all`
  );
}

export async function fetchPlaceImage(name: string, city: string, tag?: string): Promise<string> {
  // Try most specific query first, then broader ones
  const queries = [
    `${name} ${city}`,
    `${city} ${tag ?? ""}`.trim(),
    city,
  ];

  for (const q of queries) {
    const result = await searchUnsplash(q);
    if (result) return result;
  }

  // Static curated fallback
  return findStatic(name, city, tag) ??
    `https://loremflickr.com/800/600/${encodeURIComponent(city)}/all`;
}

// Sync version still used during trip-data init (returns static)
export function getPlaceImage(name: string, city: string, tag?: string): string {
  return getPlaceImageFallback(name, city, tag);
}
