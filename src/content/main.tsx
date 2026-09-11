import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { extractDoisFromPage } from '@/lib/doi'
import App from './views/App.tsx'

console.log('[CRXJS] Hello world from content script!')

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message?.type !== 'detect-dois') return false

	sendResponse({ dois: extractDoisFromPage() })
	return false
})

const container = document.createElement('div')
container.id = 'crxjs-app'
document.body.appendChild(container)
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
