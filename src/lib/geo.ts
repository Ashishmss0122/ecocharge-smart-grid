/** Default map centre used when the browser gives us no geolocation: Hyderabad. */
export const HYDERABAD = { lat: 17.4401, lng: 78.3489 };

/** Great-circle distance in kilometres. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Project lat/lng into a 0-100 percentage box for the map-style visualisation.
 * Swapping this out for a real Google Maps overlay later only touches this file.
 */
export function projectToBox(
  point: { lat: number; lng: number },
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
  const padding = 8;
  const span = (v: number, min: number, max: number) =>
    max === min ? 50 : padding + ((v - min) / (max - min)) * (100 - padding * 2);
  return {
    x: span(point.lng, bounds.minLng, bounds.maxLng),
    y: 100 - span(point.lat, bounds.minLat, bounds.maxLat),
  };
}

export function boundsOf(points: Array<{ lat: number; lng: number }>) {
  if (points.length === 0) {
    return { minLat: 17.3, maxLat: 17.5, minLng: 78.3, maxLng: 78.55 };
  }
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}
