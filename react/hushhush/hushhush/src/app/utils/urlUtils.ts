import sourceIdentifiers from '@/app/data/SourceIdentifiers.json';

export interface PlatformInfo {
	name: string;
	confidence: 'high' | 'low';
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
	confidence: 'high' | 'low';
	queryParams: QueryParamInfo[];
}

export interface UrlValidationResult {
	ok: boolean;
	normalized?: string;
	error?: string;
	protocol?: string;
}

const ALLOWED_PROTOCOLS = ['http:', 'https:'] as const;

class ValidationError extends Error {
	constructor(message?: string | undefined) {
		super(message);
		this.name = "ValidationError";
	}
}

export function getSupportedProtocols(): string[] {
	return ALLOWED_PROTOCOLS.map((p) => p.replace(':', ''));
}

// Ensure a protocol is present; default to https when missing
export function normalizeUrl(input: string): string {
	const trimmed = input.trim();
	if (!trimmed) return trimmed;
	// If it already has a scheme like http:, https:, ftp:, etc.
	if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed))
		return trimmed;
	// Protocol-relative URLs //example.com
	if (trimmed.startsWith('//')) return `https:${trimmed}`;
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
	return isProtocolRelativeUrl(url) ? `${protocol}${url}` : `${protocol}//${url}`
}

export function isProtocolRelativeUrl(url: string): boolean {
	const isProtocolRelativeUrl = /^\/\//;
	return isProtocolRelativeUrl.test(url)
}

export function isUrlMissingProtocol(url: string): boolean {
	const trimmed = url.trim();

	if (trimmed.length === 0)
		return true;

	const hasProtocolRegex = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
	if (hasProtocolRegex.test(trimmed) === false)
		return true;

	if (isProtocolRelativeUrl(trimmed))
		return true;

	return false;
}

export function validateUrl(input: string): string {
	try {

		const urlObj = new URL(input);

		if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol as typeof ALLOWED_PROTOCOLS[number])) {
			throw new ValidationError(`Only the protocols ${ALLOWED_PROTOCOLS.join(', ')} are currently allowed. Detected protocol: ${urlObj.protocol.replace(':', '')}. If you think this should be supported, please report it on our GitHub page.`);
		}

		if (hasPseudonymizedFacebookId(urlObj)) {
			throw new ValidationError(`Pseudonymized Facebook Identifier (PFBID) detected.\nThis link has tracking built-in which can not be removed!\nRead more: [TODO: Insert URL here].`);
		}

		return urlObj.toString();

	} catch (error: any) {

		if (isUrlMissingProtocol(input)) {
			return validateUrl(appendUrlProtocol(input, 'https:'))
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
		for (const [platformName, config] of Object.entries(sourceIdentifiers)) {
			// Skip global
			if (platformName === 'global') continue;

			if (config.domains.some(domain => hostname.includes(domain))) {
				return {
					name: platformName,
					confidence: 'high'
				};
			}
		}

		return undefined;
	} catch {
		return undefined;
	}
}

export function analyzeQueryParams(url: string, platform?: PlatformInfo): QueryParamInfo[] {
	try {
		const urlObj = new URL(normalizeUrl(url));
		const queryParams: QueryParamInfo[] = [];

		// Get global source identifiers (always stripped)
		const globalSourceIdentifiers = sourceIdentifiers.global.sourceidentifiers;

		// Get platform-specific source identifiers
		const platformSourceIdentifiers = platform ? sourceIdentifiers[platform.name as keyof typeof sourceIdentifiers].sourceidentifiers : [];

		// Combine all source identifiers to remove
		const allSourceIdentifiers = [...globalSourceIdentifiers, ...platformSourceIdentifiers];

		// Analyze each query parameter
		urlObj.searchParams.forEach((value, name) => {
			const isSourceIdentifier = allSourceIdentifiers.includes(name);
			queryParams.push({
				name,
				value,
				isActive: true,
				isSourceIdentifier
			});
		});

		return queryParams;
	} catch {
		return [];
	}
}

export function removeSourceIdentifiers(url: string): CleanUrlResult[] {
	try {
		const normalized = normalizeUrl(url);
		const urlObj = new URL(normalized);
		const platform = identifyPlatform(normalized);
		const results: CleanUrlResult[] = [];

		console.log('urlObj', urlObj);

		// TODO: Remove global source identifiers
		// TODO: Remove platform-specific source identifiers
		// TODO: Generate all searchParamsPowerSet of URLs using the query parameters that are left.

		// Add the clean URL (without query parameters) as the first result
		const cleanUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
		results.push({
			url: cleanUrl,
			platform,
			confidence: platform ? 'high' : 'low',
			queryParams: [] // No query parameters
		});

		console.log('1 results', results);

		// Generate combinations with different query parameters
		const queryParams = new URLSearchParams(urlObj.search);

		console.log('queryParams', queryParams);

		sourceIdentifiers.global.sourceidentifiers.forEach(identifier => {
			queryParams.delete(identifier);
		});

		if (platform) {
			const a = sourceIdentifiers['facebook'];
			const platformSourceIdentifiers = sourceIdentifiers[platform.name].sourceidentifiers;
			platformSourceIdentifiers.forEach(identifier => {
				queryParams.delete(identifier);
			});
		}

		// Add URL with cleaned query parameters
		if (queryParams.toString()) {
			const cleanedUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}?${queryParams.toString()}`;
			const cleanedQueryParams = analyzeQueryParams(cleanedUrl, platform);
			results.push({
				url: cleanedUrl,
				platform,
				confidence: platform ? 'high' : 'low',
				queryParams: cleanedQueryParams
			});
		}
		console.log('2 results', results);

		// Add original (normalized) URL as last option
		const originalQueryParams = analyzeQueryParams(normalized, platform);
		results.push({
			url: normalized,
			platform,
			confidence: 'low',
			queryParams: originalQueryParams
		});
		console.log('3 results', results);

		return results;
	} catch {
		return [{
			url: normalizeUrl(url),
			confidence: 'low',
			queryParams: []
		}];
	}
}

function generatePowerSet(array: Array<string>) {
	const powerset = [];
	for (let i = 0; i < Math.pow(2, array.length); i++) {
		const subset = [];
		for (let j = 0; j < array.length; j++) {
			if (i & (1 << j)) {
				subset.push(array[j]);
			}
		}
		powerset.push(subset);
		powerset.sort()
	}
	return powerset;
}

export function generateResultsList(url: URL): CleanUrlResult[] {
	console.log("URL:", url)

	const results: CleanUrlResult[] = [];

	sourceIdentifiers.global.sourceidentifiers.forEach(identifier => {
		url.searchParams.delete(identifier);
	});
	console.log("URL:", url)

	const platform = identifyPlatform(url);
	console.log('platform:', platform)
	if (platform) {
		const platformConfig = sourceIdentifiers[platform.name as keyof typeof sourceIdentifiers];
		if (platformConfig && 'sourceidentifiers' in platformConfig) {
			platformConfig.sourceidentifiers.forEach((identifier: string) => {
				url.searchParams.delete(identifier);
			});
		}
		console.log("URL:", url)

		results.push({
			url: url.toString(),
			platform,
			confidence: 'high',
			queryParams: analyzeQueryParams(url.toString(), platform)
		});

		return results;
	}

	const searchParamsPowerSet = generatePowerSet(Array.from(url.searchParams.keys()))

	console.log('searchParamsPowerSet', searchParamsPowerSet);

	searchParamsPowerSet.forEach(combination => {
		// Create a new URL object for this combination
		const combinationUrl = new URL(url.toString());

		// Clear all existing search params
		combinationUrl.search = '';

		// Add only the query parameters from this combination
		combination.forEach(paramKey => {
			const originalValue = url.searchParams.get(paramKey);
			if (originalValue) {
				combinationUrl.searchParams.set(paramKey, originalValue);
			}
		});

		// Create the CleanUrlResult
		const cleanUrlResult: CleanUrlResult = {
			url: combinationUrl.toString(),
			platform,
			confidence: platform ? 'high' : 'low',
			queryParams: analyzeQueryParams(combinationUrl.toString(), platform)
		};

		results.push(cleanUrlResult);
	});

	return results;
}
