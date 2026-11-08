import { SITE_URL } from "../config/site";

export function withBase(path: string): string {
  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${baseUrl}${path.replace(/^\/+/, "")}`;
}

export function absoluteUrl(path: string): string {
  return new URL(withBase(path), SITE_URL).href;
}
