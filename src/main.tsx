import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './i18n'
import { resolveLegacyHashRedirect } from './seo/routes'

// Clean up legacy HashRouter URLs before hydration:
// If a valid legacy HashRouter route is recognized (e.g. /#/pt, /#/en, /#/projects/milan),
// execute full navigation via window.location.replace to load the canonical SSR HTML
// and strictly DO NOT execute hydration while redirection is pending.
const redirectTarget =
    typeof window !== 'undefined'
        ? resolveLegacyHashRedirect(window.location.hash, window.location.search)
        : null;

if (redirectTarget && typeof window !== 'undefined') {
    window.location.replace(redirectTarget);
} else {
    const rootElement = document.getElementById('root')!;

    const app = (
        <StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StrictMode>
    );

    if (rootElement.hasChildNodes()) {
        hydrateRoot(rootElement, app);
    } else {
        createRoot(rootElement).render(app);
    }
}
