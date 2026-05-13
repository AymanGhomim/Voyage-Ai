/**
 * Place image utility
 * - Static fallback map for instant display (no flicker)
 * - Async fetch via /api/place-image (Vercel serverless → Unsplash, no CORS issues)
 * - In-memory cache to avoid duplicate requests
 */

// ── In-memory cache ───────────────────────────────────────────────────────────
const cache = new Map<string, string>();

// ── Static curated fallback map ───────────────────────────────────────────────
const STATIC_MAP: Record<string, string> = {
  santorini:   "photo-1570077188670-e3a8d69ac5ff",
  oia:         "photo-1507525428034-b723cf961d3e",
  greece:      "photo-1555993539-1732b0258235",
  athens:      "photo-1555993539-1732b0258235",
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
  italy:       "photo-1516483638261-f4dbaf036963",
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
  egypt:       "photo-1539650116574-75c0c6d73f6e",
  pyramids:    "photo-1553913861-c0fddf2619ee",
  marrakech:   "photo-1539020140153-e479b8c22e70",
  morocco:     "photo-1489749798305-4fea3ae63d43",
  sydney:      "photo-1506374322094-6021fc3926f1",
  hawaii:      "photo-1542259009477-d625272157b7",
  mexico:      "photo-1518638150340-f706e86654de",
  "rio de janeiro": "photo-1483729558449-99ef09a8c36c",
  singapore:   "photo-1525625293386-3f8f99389edd",
  // Tags
  sunset:      "photo-1516912481808-3406841bd33c",
  sunrise:     "photo-1500534314209-a25ddb2bd429",
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
  landmark:    "photo-1587474260584-136574297316",
  culture:     "photo-1587474260584-136574297316",
  park:        "photo-1448375240586-882707db888b",
  shopping:    "photo-1483985988355-763728e1935b",
  nightlife:   "photo-1516450360452-9312f5e86fc7",
};

function staticUrl(id: string): string {
  return `https://images.unsplash.com/${id}?w=800&q=80&fit=crop&auto=format`;
}

function findStatic(name: string, city: string, tag?: string): string | null {
  for (const raw of [name, city, tag ?? ""]) {
    const c = raw.toLowerCase();
    if (!c) continue;
    if (STATIC_MAP[c]) return staticUrl(STATIC_MAP[c]);
    const key = Object.keys(STATIC_MAP).find((k) => c.includes(k) || k.includes(c));
    if (key) return staticUrl(STATIC_MAP[key]);
  }
  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Instant static fallback — use this as the initial src */
export function getPlaceImage(name: string, city: string, tag?: string): string {
  return (
    findStatic(name, city, tag) ??
    `https://loremflickr.com/800/600/${encodeURIComponent(city)}/all`
  );
}

export function getPlaceImageFallback(name: string, city: string, tag?: string): string {
  return getPlaceImage(name, city, tag);
}

/** Async — fetches a real Unsplash photo via our serverless proxy */
export async function fetchPlaceImage(name: string, city: string, tag?: string): Promise<string> {
  const queries = [
    `${name} ${city}`,
    `${city} ${tag ?? ""}`.trim(),
    city,
  ];

  for (const q of queries) {
    if (cache.has(q)) return cache.get(q)!;

    try {
      const res = await fetch(`/api/place-image?query=${encodeURIComponent(q)}`);
      if (!res.ok) continue;
      const data = await res.json() as { url: string | null };
      if (data.url) {
        cache.set(q, data.url);
        return data.url;
      }
    } catch {
      continue;
    }
  }

  return getPlaceImage(name, city, tag);
}
