const DOI_PATTERN = /(?:https?:\/\/(?:dx\.)?doi\.org\/|doi\s*:\s*)?(10\.\d{4,9}\/[\-._;()/:A-Z0-9]+)/gi
const ARTICLE_DOI_META_NAMES = ['citation_doi', 'doi', 'prism.doi', 'dc.identifier']

function cleanDoi(value: string) {
	return value
		.trim()
		.replace(/[.,;:!?\]}>'"”’]+$/g, '')
}

export function extractDoisFromText(text: string) {
	const dois: string[] = []
	const seen = new Set<string>()

	for (const match of text.matchAll(DOI_PATTERN)) {
		const doi = cleanDoi(match[1])
		const key = doi.toLowerCase()
		if (!seen.has(key)) {
			seen.add(key)
			dois.push(doi)
		}
	}

	return dois
}

function uniqueDois(dois: string[]) {
	const seen = new Set<string>()
	return dois.filter((doi) => {
		const key = doi.toLowerCase()
		if (seen.has(key)) return false
		seen.add(key)
		return true
	})
}

function extractArticleMetaDois() {
	const metadata = [...document.querySelectorAll('meta[name][content]')]
	const dois: string[] = []

	for (const name of ARTICLE_DOI_META_NAMES) {
		for (const element of metadata) {
			if (element.getAttribute('name')?.toLowerCase() !== name) continue
			dois.push(...extractDoisFromText(element.getAttribute('content') ?? ''))
		}
	}

	return uniqueDois(dois)
}

function isNaturePage() {
	return location.hostname === 'nature.com' || location.hostname.endsWith('.nature.com')
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function extractNatureJsonLdDois() {
	const dois: string[] = []

	for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
		try {
			const parsed: unknown = JSON.parse(script.textContent ?? '')
			const visit = (value: unknown) => {
				if (Array.isArray(value)) {
					value.forEach(visit)
					return
				}
				if (!isRecord(value)) return

				const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']]
				const isArticle = types.some((type) =>
					type === 'Article' || type === 'ScholarlyArticle',
				)
				if (isArticle) {
					for (const field of ['sameAs', 'identifier', 'doi']) {
						const candidate = value[field]
						if (typeof candidate === 'string') dois.push(...extractDoisFromText(candidate))
						if (isRecord(candidate) && typeof candidate.value === 'string') {
							dois.push(...extractDoisFromText(candidate.value))
						}
					}
				}

				Object.values(value).forEach(visit)
			}
			visit(parsed)
		} catch {
			// Ignore malformed structured data and continue with other sources.
		}
	}

	return uniqueDois(dois)
}

export function extractDoisFromPage() {
	const articleDois = extractArticleMetaDois()
	const natureFallbackDois = isNaturePage() ? extractNatureJsonLdDois() : []
	const genericSources = [document.body?.innerText ?? '']

	for (const element of document.querySelectorAll('meta[content], a[href]')) {
		const value = element.getAttribute('content') ?? element.getAttribute('href')
		if (value) genericSources.push(value)
	}

	return uniqueDois([
		...articleDois,
		...natureFallbackDois,
		...extractDoisFromText(genericSources.join('\n')),
	])
}
