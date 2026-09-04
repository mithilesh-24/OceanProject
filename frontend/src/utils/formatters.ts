export function formatCoordinate(val: number, isLat: boolean): string {
  const absolute = Math.abs(val);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
  
  let card = '';
  if (isLat) {
    card = val >= 0 ? 'N' : 'S';
  } else {
    card = val >= 0 ? 'E' : 'W';
  }

  return `${degrees}°${minutes}'${seconds}"${card}`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} km`;
  }
  return `${meters.toFixed(1)} m`;
}

export function formatArea(squareMeters: number): string {
  if (squareMeters >= 1000000) {
    return `${(squareMeters / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })} km²`;
  }
  return `${squareMeters.toLocaleString(undefined, { maximumFractionDigits: 1 })} m²`;
}

export function formatAltitude(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
  }
  return `${Math.round(meters)} m`;
}
