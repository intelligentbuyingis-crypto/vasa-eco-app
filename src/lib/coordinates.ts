/**
 * Convert WGS84 (GPS) coordinates to Israeli Transverse Mercator (ITM)
 * Based on the official Israeli grid transformation
 */

const a = 6378137.0; // WGS84 semi-major axis
const f = 1 / 298.257223563; // WGS84 flattening
const b = a * (1 - f);
const e2 = (a * a - b * b) / (a * a);

// ITM parameters
const k0 = 1.0000067; // scale factor
const lat0 = (31 + 44 / 60 + 3.817 / 3600) * Math.PI / 180; // central parallel
const lon0 = 35 * Math.PI / 180; // central meridian
const E0 = 219529.584; // false easting
const N0 = 626907.39; // false northing

export type ITMCoords = {
  E: number; // Easting (מזרח)
  N: number; // Northing (צפון)
};

export type WGS84Coords = {
  lat: number;
  lng: number;
};

export function wgs84ToITM(lat: number, lng: number): ITMCoords {
  const latRad = lat * Math.PI / 180;
  const lngRad = lng * Math.PI / 180;

  const n = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
  const t = Math.tan(latRad) ** 2;
  const c = (e2 / (1 - e2)) * Math.cos(latRad) ** 2;
  const A = Math.cos(latRad) * (lngRad - lon0);

  const e4 = e2 * e2;
  const e6 = e4 * e2;

  const M = a * (
    (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * latRad
    - (3 * e2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * latRad)
    + (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * latRad)
    - (35 * e6 / 3072) * Math.sin(6 * latRad)
  );

  const M0 = a * (
    (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * lat0
    - (3 * e2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * lat0)
    + (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * lat0)
    - (35 * e6 / 3072) * Math.sin(6 * lat0)
  );

  const Easting = E0 + k0 * n * (
    A + (1 - t + c) * A ** 3 / 6
    + (5 - 18 * t + t ** 2 + 72 * c - 58 * (e2 / (1 - e2))) * A ** 5 / 120
  );

  const Northing = N0 + k0 * (
    M - M0 + n * Math.tan(latRad) * (
      A ** 2 / 2
      + (5 - t + 9 * c + 4 * c ** 2) * A ** 4 / 24
      + (61 - 58 * t + t ** 2 + 600 * c - 330 * (e2 / (1 - e2))) * A ** 6 / 720
    )
  );

  return {
    E: Math.round(Easting),
    N: Math.round(Northing),
  };
}

export function formatITM(coords: ITMCoords): string {
  return `${coords.E.toLocaleString()} / ${coords.N.toLocaleString()}`;
}

export async function getCurrentITM(): Promise<{ itm: ITMCoords; wgs84: WGS84Coords; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GPS אינו נתמך בדפדפן זה"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const itm = wgs84ToITM(latitude, longitude);
        resolve({ itm, wgs84: { lat: latitude, lng: longitude }, accuracy });
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error("הגישה ל-GPS נדחתה — אפשר גישה למיקום בהגדרות הדפדפן"));
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error("לא ניתן לקבל מיקום GPS — נסה באזור פתוח"));
            break;
          case err.TIMEOUT:
            reject(new Error("תם הזמן לקבלת מיקום GPS — נסה שוב"));
            break;
          default:
            reject(new Error("שגיאת GPS לא ידועה"));
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}
