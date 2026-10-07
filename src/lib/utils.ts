export { cn } from "cn";

/**
 * Ensures an external URL includes a protocol scheme (defaulting to https://)
 * so that browsers do not treat bare domain strings (e.g. "example.com") as relative URLs.
 */
export function formatExternalUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (/^(?:https?|mailto|tel):/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed}`;
}
