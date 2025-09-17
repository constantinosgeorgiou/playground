import sourceIdentifiers from "@/app/data/SourceIdentifiers.json";

export interface PlatformInfo {
  name: string;
  slug: string;
  confidence: "exact" | "approximate";
}

export interface QueryParamInfo {
  name: string;
  value: string;
  isActive: boolean;
  isSourceIdentifier: boolean;
}

export interface CleanUrlResult {
  url: string;
  platform?: PlatformInfo;
  confidence: "exact" | "approximate";
  queryParams: QueryParamInfo[];
}

export interface UrlValidationResult {
  ok: boolean;
  normalized?: string;
  error?: string;
  protocol?: string;
}

const ALLOWED_PROTOCOLS = ["http:", "https:"] as const;

class ValidationError extends Error {
  constructor(message?: string | undefined) {
    super(message);
    this.name = "ValidationError";
  }
}

export function getSupportedProtocols(): string[] {
  return ALLOWED_PROTOCOLS.map((p) => p.replace(":", ""));
}

// Ensure a protocol is present; default to https when missing
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  // If it already has a scheme like http:, https:, ftp:, etc.
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) return trimmed;
  // Protocol-relative URLs //example.com
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

/**
 * Check whether the URL contains a Pseudonymized Facebook Identifier (PFBID).
 *
 * @link https://about.fb.com/news/2022/09/deterring-scraping-by-protecting-facebook-identifiers/
 *
 * @param url URL.
 * @returns {boolean} true if the URL is a Pseudonymized Facebook Identifier (PFBID) link, otherwise false.
 */
export function hasPseudonymizedFacebookId(url: URL): boolean {
  const isPFbId = /facebook\.com\/share\/p\/[a-zA-Z0-9]+/;
  return isPFbId.test(url.toString());
}

export function appendUrlProtocol(url: string, protocol: string): string {
  return isProtocolRelativeUrl(url)
    ? `${protocol}${url}`
    : `${protocol}//${url}`;
}

export function isProtocolRelativeUrl(url: string): boolean {
  const isProtocolRelativeUrl = /^\/\//;
  return isProtocolRelativeUrl.test(url);
}

export function isUrlMissingProtocol(url: string): boolean {
  const trimmed = url.trim();

  if (trimmed.length === 0) return true;

  const hasProtocolRegex = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
  if (hasProtocolRegex.test(trimmed) === false) return true;

  if (isProtocolRelativeUrl(trimmed)) return true;

  return false;
}

export function validateUrl(input: string): string {
  try {
    const urlObj = new URL(input);

    if (
      !ALLOWED_PROTOCOLS.includes(
        urlObj.protocol as (typeof ALLOWED_PROTOCOLS)[number],
      )
    ) {
      throw new ValidationError(
        `Only the protocols ${ALLOWED_PROTOCOLS.join(", ")} are currently allowed. Detected protocol: ${urlObj.protocol.replace(":", "")}. If you think this should be supported, please report it on our GitHub page.`,
      );
    }

    if (hasPseudonymizedFacebookId(urlObj)) {
      throw new ValidationError(
        `Pseudonymized Facebook Identifier (PFBID) detected.\nThis link has tracking built-in which can not be removed!\nRead more: [TODO: Insert URL here].`,
      );
    }

    return urlObj.toString();
  } catch (error: any) {
    if (isUrlMissingProtocol(input)) {
      return validateUrl(appendUrlProtocol(input, "https:"));
    }

    throw new ValidationError(error.message);
  }
}

export function identifyPlatform(url: URL | string): PlatformInfo | undefined {
  try {
    if (typeof url === "string") {
      url = new URL(url);
    }

    const hostname = url.hostname.toLowerCase();

    // Check platform-specific domains (excluding global)
    for (const [platformSlug, config] of Object.entries(sourceIdentifiers)) {
      // Skip global
      if (platformSlug === "global") continue;

      if (config.domains.some((domain) => hostname.includes(domain))) {

        return {
          name: config.name,
          slug: platformSlug,
          confidence: "exact",
        };
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

export function analyzeQueryParams(
  url: URL,
  platform?: PlatformInfo,
): QueryParamInfo[] {
  try {
    const queryParams: QueryParamInfo[] = [];

    const globalSourceIdentifiers = sourceIdentifiers.global.sourceidentifiers;
    const platformSourceIdentifiers = platform
      ? sourceIdentifiers[platform.slug as keyof typeof sourceIdentifiers]
        .sourceidentifiers
      : [];
    const allSourceIdentifiers = [
      ...globalSourceIdentifiers,
      ...platformSourceIdentifiers,
    ];

    url.searchParams.forEach((value, name) => {
      const isSourceIdentifier = allSourceIdentifiers.includes(name);
      queryParams.push({
        name,
        value,
        isActive: true,
        isSourceIdentifier,
      });
    });

    return queryParams;
  } catch {
    return [];
  }
}

function generatePowerSet(array: Array<string>) {
  const elements = array.sort().reverse();

  const powerset = [];
  for (let i = 0; i < Math.pow(2, elements.length); i++) {
    const subset = [];
    for (let j = 0; j < elements.length; j++) {
      if (i & (1 << j)) {
        subset.push(elements[j]);
      }
    }
    subset.sort();
    powerset.push(subset);
    powerset.sort((a, b) => b.length - a.length);
  }
  return powerset;
}

export function generateResultsList(url: URL): CleanUrlResult[] {
  console.log("URL:", url);

  const results: CleanUrlResult[] = [];

  const scrubbedUrl = new URL(url);

  sourceIdentifiers.global.sourceidentifiers.forEach((identifier) => {
    scrubbedUrl.searchParams.delete(identifier);
  });
  console.log("URL:", scrubbedUrl);

  const platform = identifyPlatform(scrubbedUrl);
  console.log("platform:", platform);
  if (platform) {
    const platformConfig =
      sourceIdentifiers[platform.slug as keyof typeof sourceIdentifiers];
    console.log('platformConfig', platformConfig);

    if (platformConfig && "sourceidentifiers" in platformConfig) {
      platformConfig.sourceidentifiers.forEach((identifier: string) => {
        scrubbedUrl.searchParams.delete(identifier);
      });
    }
    console.log("URL:", scrubbedUrl);

    results.push({
      url: scrubbedUrl.toString(),
      platform,
      confidence: "exact",
      queryParams: analyzeQueryParams(url, platform),
    });

    return results;
  }

  const searchParamsPowerSet = generatePowerSet(
    Array.from(scrubbedUrl.searchParams.keys()),
  );

  console.log("searchParamsPowerSet", searchParamsPowerSet);

  searchParamsPowerSet.forEach((combination) => {
    // Create a new URL object for this combination
    const combinationUrl = new URL(scrubbedUrl.toString());

    // Clear all existing search params
    combinationUrl.search = "";

    // Add only the query parameters from this combination
    combination.forEach((paramKey) => {
      const originalValue = scrubbedUrl.searchParams.get(paramKey);
      if (originalValue) {
        combinationUrl.searchParams.set(paramKey, originalValue);
      }
    });

    // Create the CleanUrlResult
    const cleanUrlResult: CleanUrlResult = {
      url: combinationUrl.toString(),
      platform,
      confidence: platform ? "exact" : "approximate",
      queryParams: analyzeQueryParams(url, platform),
    };

    results.push(cleanUrlResult);
  });

  return results;
}
