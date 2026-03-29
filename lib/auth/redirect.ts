function getOriginFromHeaders(headerStore: Headers) {
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return "http://localhost:3000";
  }

  return `${protocol}://${host}`;
}

export function getSiteUrl(headerStore: Headers) {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envSiteUrl) {
    return envSiteUrl.endsWith("/") ? envSiteUrl.slice(0, -1) : envSiteUrl;
  }

  return getOriginFromHeaders(headerStore);
}

export function sanitizeNextPath(nextPath: string | null | undefined, fallback = "/") {
  if (!nextPath) {
    return fallback;
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback;
  }

  return nextPath;
}

export function buildAuthCallbackUrl(headerStore: Headers, nextPath: string) {
  const siteUrl = getSiteUrl(headerStore);
  const callbackUrl = new URL("/auth/callback", siteUrl);
  callbackUrl.searchParams.set("next", sanitizeNextPath(nextPath));
  return callbackUrl.toString();
}
