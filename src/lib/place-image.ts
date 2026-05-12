/**
 * Returns a real Unsplash photo URL based on place name / city / tag.
 * Uses a curated keyword map for common destinations,
 * falls back to loremflickr for unknown places.
 */

// Curated Unsplash photo IDs for popular destinations & themes
// Format: https://images.unsplash.com/photo-{id}?w=800&q=80&fit=crop
const UNSPLASH_MAP: Record<string, string> = {
  // ── Cities & Countries ──────────────────────────────────
  santorini:   "photo-1570077188670-e3a8d69ac5ff",
  oia:         "photo-1507525428034-b723cf961d3e",
  fira:        "photo-1533104816931-20fa691ff6ca",
  greece:      "photo-1555993539-1732b0258235",
  pyrgos:      "photo-1570077188670-e3a8d69ac5ff",

  tokyo:       "photo-1540959733332-eab4deabeeaf",
  japan:       "photo-1528360983277-13d401cdc186",
  osaka:       "photo-1589452271712-64b8a66c7b71",
  kyoto:       "photo-1493976040374-85c8e12f0c0e",

  bali:        "photo-1537996194471-e657df975ab4",
  ubud:        "photo-1555400038-63f5ba517a47",
  indonesia:   "photo-1518548419970-58e3b4079ab2",

  iceland:     "photo-1476610182048-b716b8518aae",
  reykjavik:   "photo-1531168556467-80aace0d0144",

  marrakech:   "photo-1539020140153-e479b8c22e70",
  morocco:     "photo-1489749798305-4fea3ae63d43",

  paris:       "photo-1502602898657-3e91760cbb34",
  france:      "photo-1499856871958-5b9627545d1a",
  "eiffel tower": "photo-1543349689-9a4d426bee8e",

  barcelona:   "photo-1539037116277-4db20889f2d4",
  spain:       "photo-1541544537887-35efa3b8d0bb",

  rome:        "photo-1552832230-c0197dd311b5",
  italy:       "photo-1516483638261-f4dbaf036963",
  venice:      "photo-1523906834658-6e24ef2386f9",
  amalfi:      "photo-1533606688076-b6683a5f3f88",

  lisbon:      "photo-1558370781-d6196949e317",
  portugal:    "photo-1565366896067-9b1701e38e87",

  amsterdam:   "photo-1534351590666-13e3e96b5017",
  netherlands: "photo-1512470876302-972faa2aa9a4",

  prague:      "photo-1541849546-216549ae216d",
  london:      "photo-1513635269975-59663e0ac1ad",
  istanbul:    "photo-1524231757912-21f4fe3a7200",
  dubai:       "photo-1512453979798-5ea266f8880c",
  maldives:    "photo-1514282401047-d79a71a590e8",
  thailand:    "photo-1506665531195-3566af2b4dfa",
  bangkok:     "photo-1508009603885-50cf7c579365",
  "new york":  "photo-1496442226666-8d4d0e62e6e9",
  manhattan:   "photo-1534430480872-3498386e7856",
  cairo:       "photo-1553913861-c0fddf2619ee",
  egypt:       "photo-1539650116574-75c0c6d73f6e",
  hawaii:      "photo-1542259009477-d625272157b7",
  sydney:      "photo-1506374322094-6021fc3926f1",
  australia:   "photo-1529108190281-9a4f620bc2d8",
  "rio de janeiro": "photo-1483729558449-99ef09a8c36c",
  brazil:      "photo-1516306580123-e6e52b1b7b5f",
  mexico:      "photo-1518638150340-f706e86654de",
  cancun:      "photo-1552074284-5e88ef1aef18",

  // ── Themes & Tags ───────────────────────────────────────
  sunset:      "photo-1516912481808-3406841bd33c",
  sunrise:     "photo-1500534314209-a25ddb2bd429",
  beach:       "photo-1507525428034-b723cf961d3e",
  swim:        "photo-1507003211169-0a1dd7228f2d",
  "hot springs": "photo-1544551763-46a013bb70d5",
  volcano:     "photo-1444464666168-49d633b86797",
  hike:        "photo-1551632811-561732d1e306",
  trekking:    "photo-1464822759023-fed622ff2c3b",
  wine:        "photo-1474722883778-792e7990302f",
  tasting:     "photo-1510812431401-41d2bd2722f3",
  dinner:      "photo-1414235077428-338989a2e8c0",
  restaurant:  "photo-1550966871-3ed3cdb5ed0c",
  sushi:       "photo-1617196034183-421b4040d20d",
  culture:     "photo-1587474260584-136574297316",
  ruins:       "photo-1608037521277-154cd1b89191",
  museum:      "photo-1518998053901-5348d3961a04",
  temple:      "photo-1528360983277-13d401cdc186",
  market:      "photo-1555400038-63f5ba517a47",
  stargazing:  "photo-1446776858070-70c3d5ed6758",
  rooftop:     "photo-1527838832700-5059252407fa",
  spa:         "photo-1544161515-4ab6ce6db874",
  shopping:    "photo-1483985988355-763728e1935b",
  adventure:   "photo-1551632811-561732d1e306",
  waterfall:   "photo-1432405972618-c60b0225b8f9",
  forest:      "photo-1448375240586-882707db888b",
  mountain:    "photo-1464822759023-fed622ff2c3b",
  lake:        "photo-1439066615861-d1af74d74000",
  desert:      "photo-1509316785289-025f5b846b35",
  city:        "photo-1477959858617-67f85cf4f1df",
  street:      "photo-1477959858617-67f85cf4f1df",
  "food tour":  "photo-1414235077428-338989a2e8c0",
  nightlife:   "photo-1516450360452-9312f5e86fc7",
  cafe:        "photo-1501339847302-ac426a4a7cbb",
  coffee:      "photo-1495474472287-4d71bcdd2085",
};

function buildUnsplashUrl(id: string, width = 800): string {
  return `https://images.unsplash.com/${id}?w=${width}&q=80&fit=crop&auto=format`;
}

function fallbackUrl(query: string): string {
  const encoded = encodeURIComponent(query.replace(/[^a-zA-Z0-9 ,]/g, "").trim());
  return `https://loremflickr.com/800/600/${encoded}/all`;
}

/**
 * Given a place name, city, and optional tag — returns the best matching image URL.
 * Priority: name match → city match → tag match → loremflickr fallback
 */
export function getPlaceImage(name: string, city: string, tag?: string): string {
  const candidates = [
    name.toLowerCase(),
    city.toLowerCase(),
    tag?.toLowerCase() ?? "",
  ];

  for (const candidate of candidates) {
    // Try direct key match
    if (UNSPLASH_MAP[candidate]) {
      return buildUnsplashUrl(UNSPLASH_MAP[candidate]);
    }
    // Try partial match (e.g. "Oia Village" → "oia")
    const matchedKey = Object.keys(UNSPLASH_MAP).find(
      (key) => candidate.includes(key) || key.includes(candidate),
    );
    if (matchedKey) {
      return buildUnsplashUrl(UNSPLASH_MAP[matchedKey]);
    }
  }

  // Nothing matched — use loremflickr with city + tag as keywords
  const query = [city, tag].filter(Boolean).join(",");
  return fallbackUrl(query || name);
}
