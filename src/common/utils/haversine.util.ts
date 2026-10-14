/**
 * Calculate the great-circle distance between two GPS coordinates using the Haversine formula.
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate fare based on distance.
 * Formula: baseRate + (distanceKm * perKmRate)
 */
export function calculateFare(
  pickupLat: number,
  pickupLon: number,
  destLat: number,
  destLon: number,
  baseRate = 15,
  perKmRate = 8,
): number {
  const distanceKm = haversineDistance(pickupLat, pickupLon, destLat, destLon);
  return Math.round((baseRate + distanceKm * perKmRate) * 100) / 100;
}
