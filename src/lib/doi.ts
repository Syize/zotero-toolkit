const DOI_PATTERN = /(?:https?:\/\/(?:dx\.)?doi\.org\/|doi\s*:\s*)?(10\.\d{4,9}\/[\-._;()/:A-Z0-9]+)/gi

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

export function extractDoisFromPage() {
	const sources = [document.body?.innerText ?? '']

	for (const element of document.querySelectorAll('meta[content], a[href]')) {
		const value = element.getAttribute('content') ?? element.getAttribute('href')
		if (value) sources.push(value)
	}

	const dois: string[] = []
	const seen = new Set<string>()
	for (const doi of extractDoisFromText(sources.join('\n'))) {
		const key = doi.toLowerCase()
		if (!seen.has(key)) {
			seen.add(key)
			dois.push(doi)
		}
	}

	return dois
}
