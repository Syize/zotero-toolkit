import { useMemo, useState } from 'react'

type Status = 'idle' | 'checking' | 'no-doi' | 'found' | 'not-found' | 'error'
type Article = {
	title: string
	author: string
	year: string
	publisher: string
	doi: string
	collection: string
}

const mockDetectedDois = [
	'10.1038/s41586-020-2649-2',
	'10.1145/3368089.3409741',
]
const mockArticle: Article = {
	title: 'A general framework for checking whether a scholarly article is already available in a personal library',
	author: 'Jane Doe, Alex Smith',
	year: '2024',
	publisher: 'Nature Portfolio',
	doi: '10.1038/s41586-020-2649-2',
	collection: 'Research / Literature Review',
}
const statusCopy: Record<
	Status,
	{ label: string; detail: string; tone: string }
> = {
	idle: {
		label: 'Ready to check',
		detail: 'Detect a DOI or enter one below to check your Zotero library.',
		tone: 'border-slate-200 bg-slate-50 text-slate-600',
	},
	checking: {
		label: 'Checking article...',
		detail: 'Looking for this article in your Zotero library.',
		tone: 'border-blue-200 bg-blue-50 text-blue-700',
	},
	'no-doi': {
		label: 'No DOI found',
		detail: 'No DOI was detected on this page. Try entering a DOI manually.',
		tone: 'border-amber-200 bg-amber-50 text-amber-800',
	},
	found: {
		label: 'Article found in Zotero',
		detail: 'This article is already saved in your Zotero library.',
		tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
	},
	'not-found': {
		label: 'Article not found in Zotero',
		detail: 'This article is not in your Zotero library yet.',
		tone: 'border-slate-200 bg-slate-50 text-slate-700',
	},
	error: {
		label: 'Request failed',
		detail: 'The article could not be checked. Please try again.',
		tone: 'border-red-200 bg-red-50 text-red-700',
	},
}
const fields: Array<{ label: string; key: keyof Article }> = [
	{ label: 'Title', key: 'title' },
	{ label: 'Author', key: 'author' },
	{ label: 'Year', key: 'year' },
	{ label: 'Publisher', key: 'publisher' },
	{ label: 'DOI', key: 'doi' },
	{ label: 'Collection Location', key: 'collection' },
]

export default function App() {
	const [status, setStatus] = useState<Status>('idle')
	const [detectedDois, setDetectedDois] = useState<string[]>([])
	const [selectedDoi, setSelectedDoi] = useState('')
	const [customDoi, setCustomDoi] = useState('')
	const [article, setArticle] = useState<Article | null>(null)
	const isBusy = status === 'checking'
	const currentDoi = customDoi.trim() || selectedDoi
	const copy = useMemo(() => statusCopy[status], [status])

	const detectDoi = () => {
		setStatus('checking')
		setArticle(null)
		window.setTimeout(() => {
			const uniqueDois = [...new Set(mockDetectedDois)]
			setDetectedDois(uniqueDois)
			setSelectedDoi(uniqueDois[0] ?? '')
			setStatus(uniqueDois.length ? 'idle' : 'no-doi')
		}, 500)
	}
	const checkArticle = () => {
		setArticle(null)
		if (!currentDoi) {
			setStatus('no-doi')
			return
		}
		setStatus('checking')
		window.setTimeout(() => {
			if (currentDoi === mockArticle.doi) {
				setArticle(mockArticle)
				setStatus('found')
			} else setStatus('not-found')
		}, 700)
	}

	return (
		<main className="min-h-screen bg-white px-6 py-7 text-[15px] text-slate-900">
			<div className="mx-auto w-full max-w-140">
				<header className="border-b border-[#9d8e8e] pb-4 text-center">
					<h1 className="font-mono text-[32px] leading-none tracking-[-0.04em]">
						Zotero Toolkit
					</h1>
				</header>
				<section className="space-y-5 border-b border-[#9d8e8e] py-6">
					<label className="block text-slate-500">
						<span className="mb-2 block">Detected DOIs</span>
						<select
							value={selectedDoi}
							onChange={(e) => setSelectedDoi(e.target.value)}
							disabled={isBusy}
							className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
						>
							{detectedDois.length === 0 && (
								<option value="">
									Detect a DOI on the current page
								</option>
							)}
							{detectedDois.map((doi) => (
								<option key={doi} value={doi}>
									{doi}
								</option>
							))}
						</select>
					</label>
					<label className="block text-slate-500">
						<span className="mb-2 block">
							Input Custom DOI Here
						</span>
						<input
							value={customDoi}
							onChange={(e) => setCustomDoi(e.target.value)}
							disabled={isBusy}
							placeholder="Custom DOI"
							className="h-10 w-full rounded-lg border border-slate-200 px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
						/>
					</label>
					<div className="grid grid-cols-2 gap-6 pt-1">
						<button
							type="button"
							onClick={detectDoi}
							disabled={isBusy}
							className="h-10 rounded-lg border border-slate-900 bg-white px-3 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
						>
							Detect DOI
						</button>
						<button
							type="button"
							onClick={checkArticle}
							disabled={isBusy}
							className="h-10 rounded-lg border border-slate-900 bg-white px-3 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
						>
							Check Article
						</button>
					</div>
				</section>
				<section
					className={`mt-6 rounded-lg border px-4 py-3 ${copy.tone}`}
					aria-live="polite"
				>
					<div className="flex items-center gap-2">
						{isBusy && (
							<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
						)}
						<h2 className="font-medium">{copy.label}</h2>
					</div>
					<p className="mt-1 text-sm leading-5 opacity-85">
						{copy.detail}
					</p>
				</section>
				<section className="mt-5">
					<h2 className="mb-2 text-center text-[22px] leading-7">
						Results
					</h2>
					<dl className="overflow-hidden rounded-lg border border-slate-900">
						{fields.map(({ label, key }) => (
							<div
								key={key}
								className="grid grid-cols-[105px_minmax(0,1fr)] border-b border-slate-900 last:border-b-0"
							>
								<dt className="flex min-h-11.25 items-center justify-center px-2 py-3 text-center leading-5">
									{label}
								</dt>
								<dd className="min-h-11.25 min-w-0 border-l border-slate-900 px-3 py-3 leading-5 wrap-break-word">
									{article?.[key] ?? ''}
								</dd>
							</div>
						))}
					</dl>
				</section>
			</div>
		</main>
	)
}
