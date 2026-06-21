// src/lib/location.ts

export const INDONESIA_KEYWORDS = [
  "indonesia", "jakarta", "bandung", "surabaya", "medan",
  "yogyakarta", "semarang", "bali", "depok", "tangerang",
  "malang", "bekasi", "bogor", "banten", "solok", "padang"
];

export function isLocationIndonesian(location: string | null | undefined): boolean {
  if (!location) return false;
  const lowercase = location.toLowerCase().trim();
  if (INDONESIA_KEYWORDS.some(k => lowercase.includes(k))) {
    return true;
  }
  const tokens = lowercase.split(/[\s,./\-\(\)]+/);
  
  // If the location has token "id", check if it's Idaho (US state) instead of Indonesia
  if (tokens.includes("id")) {
    const usIndicators = ["usa", "us", "united states", "idaho", "boise", "coeur", "alene", "pocatello", "idaho falls", "nampa", "meridian", "twin falls", "lewiston", "moscow"];
    if (usIndicators.some(k => lowercase.includes(k))) {
      return false;
    }
    return true;
  }

  if (tokens.includes("idn") || tokens.includes("indonesien")) {
    return true;
  }
  return false;
}
