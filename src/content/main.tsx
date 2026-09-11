import { extractDoisFromPage } from '@/lib/doi'

console.log('[CRXJS] Hello world from content script!')

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message?.type !== 'detect-dois') return false

	sendResponse({ dois: extractDoisFromPage() })
	return false
})
