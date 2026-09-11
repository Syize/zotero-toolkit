const ZOTERO_API_BASE = 'http://localhost:23119/api'

export type ZoteroArticle = {
	title: string
	author: string
	year: string
	publisher: string
	doi: string
	collection: string
}

type ZoteroItem = {
	data?: {
		title?: string
		creators?: ZoteroCreator[]
		date?: string
		publicationTitle?: string
		publisher?: string
		DOI?: string
		collections?: string[]
	}
}

type ZoteroCreator = {
	creatorType?: string
	firstName?: string
	lastName?: string
	name?: string
}

type ZoteroCollection = {
	key: string
	data?: { name?: string }
}

export class ZoteroApiError extends Error {
	readonly status: number

	constructor(message: string, status = 0) {
		super(message)
		this.name = 'ZoteroApiError'
		this.status = status
	}
}

function normalizeDoi(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\/doi\.org\//, '')
		.replace(/^doi:\s*/, '')
		.replace(/[.。,，;；]+$/, '')
}

function getErrorMessage(status: number) {
	if (status === 403) return 'Enable the local API in Zotero Settings → Advanced.'
	if (status === 404 || status === 400) return 'The Zotero API request was invalid.'
	if (status === 500 || status === 503) return 'Zotero is temporarily unavailable.'
	return 'Zotero could not complete the request.'
}

async function zoteroFetch<T>(path: string): Promise<T> {
	let response: Response
	try {
		response = await fetch(`${ZOTERO_API_BASE}${path}`, {
			headers: {
				'Zotero-API-Version': '3',
				'Zotero-Allowed-Request': '1',
			},
		})
	} catch {
		throw new ZoteroApiError('Zotero is not running or cannot be reached.')
	}

	if (!response.ok) {
		throw new ZoteroApiError(getErrorMessage(response.status), response.status)
	}

	return response.json() as Promise<T>
}

function formatCreators(creators?: ZoteroCreator[]) {
	if (!Array.isArray(creators)) return ''

	return creators
		.filter((creator) => creator.creatorType === 'author' || !creator.creatorType)
		.map((creator) => creator.name || [creator.firstName, creator.lastName].filter(Boolean).join(' '))
		.filter(Boolean)
		.join(', ')
}

export async function findArticleByDoi(doi: string): Promise<ZoteroArticle | null> {
	const normalizedDoi = normalizeDoi(doi)
	if (!normalizedDoi) return null

	const query = new URLSearchParams({
		format: 'json',
		itemType: '-attachment',
		q: normalizedDoi,
		qmode: 'everything',
		limit: '100',
	})
	const items = await zoteroFetch<ZoteroItem[]>(`/users/0/items?${query}`)
	const item = items.find((candidate) => normalizeDoi(candidate.data?.DOI ?? '') === normalizedDoi)

	if (!item?.data) return null

	const collectionNames = new Map<string, string>()
	await Promise.all(
		(item.data.collections ?? []).map(async (collectionKey) => {
			try {
				const collection = await zoteroFetch<ZoteroCollection>(
					`/users/0/collections/${encodeURIComponent(collectionKey)}?format=json`,
				)
				collectionNames.set(collectionKey, collection.data?.name ?? collectionKey)
			} catch {
				// Keep the key visible if a collection cannot be resolved.
				collectionNames.set(collectionKey, collectionKey)
			}
		}),
	)

	return {
		title: item.data.title ?? '',
		author: formatCreators(item.data.creators),
		year: item.data.date?.match(/\b\d{4}\b/)?.[0] ?? '',
		publisher: item.data.publicationTitle ?? item.data.publisher ?? '',
		doi: item.data.DOI ?? normalizedDoi,
		collection: (item.data.collections ?? []).map((key) => collectionNames.get(key) ?? key).join(', '),
	}
}
