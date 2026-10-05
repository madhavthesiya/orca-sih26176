import type {
  FishingArea,
  Language,
  Location,
  MarineAlert,
  PFZZone,
  RouteOption,
  ZoneFeature,
} from "../types";

/**
 * The chart, said in sentences — for screen readers, and for anyone who
 * would rather read the map than look at it. Built from the same props the
 * map draws, so the two can never disagree.
 */

const COMPASS: Record<Language, Record<string, string>> = {
  en: { N: "north", NE: "north-east", E: "east", SE: "south-east", S: "south", SW: "south-west", W: "west", NW: "north-west" },
  hi: { N: "उत्तर", NE: "उत्तर-पूर्व", E: "पूर्व", SE: "दक्षिण-पूर्व", S: "दक्षिण", SW: "दक्षिण-पश्चिम", W: "पश्चिम", NW: "उत्तर-पश्चिम" },
  gu: { N: "ઉત્તર", NE: "ઈશાન", E: "પૂર્વ", SE: "અગ્નિ", S: "દક્ષિણ", SW: "નૈઋત્ય", W: "પશ્ચિમ", NW: "વાયવ્ય" },
};

const SAY: Record<Language, Record<string, string>> = {
  en: {
    region: "Sea chart",
    inWords: "Read this map in words",
    origin: "The chart is centred on {name} ({lat}° N, {lon}° E).",
    noOrigin: "No position has been chosen yet.",
    grounds: "{n} fishing grounds are marked within {r} km.",
    best: "The best is ground {rank}: {d} km to the {dir}, {p}% chance of fish.",
    noGrounds: "No fishing grounds are drawn.",
    closed: "{n} closed or restricted areas lie within {r} km, drawn in red. Do not enter them.",
    noClosed: "No closed areas lie within {r} km.",
    route: "Suggested course: {name}, {d} km, about {m} minutes.",
    warnings: "{n} official warnings are in force for this water.",
  },
  hi: {
    region: "समुद्री नक्शा",
    inWords: "इस नक्शे को शब्दों में पढ़ें",
    origin: "नक्शे का केंद्र {name} ({lat}° उ, {lon}° पू) है।",
    noOrigin: "अभी कोई जगह नहीं चुनी गई है।",
    grounds: "{r} किमी के भीतर मछली की {n} जगहें दिखाई गई हैं।",
    best: "सबसे अच्छी जगह {rank} है: {d} किमी {dir} की ओर, मछली की उम्मीद {p}%।",
    noGrounds: "मछली की कोई जगह नहीं दिखाई गई है।",
    closed: "{r} किमी के भीतर {n} बंद या प्रतिबंधित इलाके लाल रंग में हैं। उनमें न जाएँ।",
    noClosed: "{r} किमी के भीतर कोई बंद इलाका नहीं है।",
    route: "सुझाया रास्ता: {name}, {d} किमी, लगभग {m} मिनट।",
    warnings: "इस पानी के लिए {n} आधिकारिक चेतावनियाँ लागू हैं।",
  },
  gu: {
    region: "દરિયાઈ નકશો",
    inWords: "આ નકશો શબ્દોમાં વાંચો",
    origin: "નકશાનું કેન્દ્ર {name} ({lat}° ઉ, {lon}° પૂ) છે.",
    noOrigin: "હજી કોઈ સ્થાન પસંદ કર્યું નથી.",
    grounds: "{r} કિમીની અંદર માછીમારીની {n} જગ્યાઓ દર્શાવી છે.",
    best: "સૌથી સારી જગ્યા {rank} છે: {d} કિમી {dir} તરફ, માછલીની શક્યતા {p}%.",
    noGrounds: "માછીમારીની કોઈ જગ્યા દર્શાવી નથી.",
    closed: "{r} કિમીની અંદર {n} બંધ અથવા પ્રતિબંધિત વિસ્તારો લાલ રંગમાં છે. તેમાં ન જાઓ.",
    noClosed: "{r} કિમીની અંદર કોઈ બંધ વિસ્તાર નથી.",
    route: "સૂચવેલો માર્ગ: {name}, {d} કિમી, આશરે {m} મિનિટ.",
    warnings: "આ પાણી માટે {n} સત્તાવાર ચેતવણીઓ અમલમાં છે.",
  },
};

export function mapWords(lang: Language) {
  return SAY[lang] ?? SAY.en;
}

function fill(t: string, v: Record<string, string | number>): string {
  return t.replace(/\{(\w+)\}/g, (all, k: string) => (k in v ? String(v[k]) : all));
}

/** Great-circle distance in km. */
function km(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const r = Math.PI / 180;
  const h =
    Math.sin(((bLat - aLat) * r) / 2) ** 2 +
    Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(((bLon - aLon) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/** A zone counts as near when any corner of its outline is within range. */
function zoneNear(z: ZoneFeature, o: Location, rangeKm: number): boolean {
  const ring = z.geometry?.coordinates?.[0] ?? [];
  return ring.some(([lon, lat]) => km(o.latitude, o.longitude, lat, lon) <= rangeKm);
}

export function mapInWords(
  m: {
    origin: Location | null;
    areas: FishingArea[];
    pfz: PFZZone[];
    zones: ZoneFeature[];
    routes: RouteOption[];
    alerts: MarineAlert[];
    radiusKm?: number;
  },
  lang: Language,
): string[] {
  const t = mapWords(lang);
  const dirs = COMPASS[lang] ?? COMPASS.en;
  const r = m.radiusKm ?? 100;
  const lines: string[] = [];

  if (!m.origin) return [t.noOrigin];
  lines.push(
    fill(t.origin, {
      name: m.origin.name,
      lat: m.origin.latitude.toFixed(2),
      lon: m.origin.longitude.toFixed(2),
    }),
  );

  const grounds = m.areas.length || m.pfz.length;
  if (m.areas.length) {
    const top = [...m.areas].sort((a, b) => a.rank - b.rank)[0];
    lines.push(fill(t.grounds, { n: m.areas.length, r }));
    lines.push(
      fill(t.best, {
        rank: top.rank,
        d: Math.round(top.distance_km),
        dir: dirs[top.bearing] ?? top.bearing,
        p: top.probability,
      }),
    );
  } else if (grounds) {
    lines.push(fill(t.grounds, { n: grounds, r }));
  } else {
    lines.push(t.noGrounds);
  }

  const closed = m.zones.filter((z) => zoneNear(z, m.origin!, r)).length;
  lines.push(fill(closed ? t.closed : t.noClosed, { n: closed, r }));

  const course = m.routes.find((x) => x.recommended) ?? m.routes[0];
  if (course)
    lines.push(
      fill(t.route, { name: course.name, d: course.distance_km, m: Math.round(course.eta_minutes) }),
    );

  const official = m.alerts.filter((a) => a.official).length;
  if (official) lines.push(fill(t.warnings, { n: official }));

  return lines;
}
