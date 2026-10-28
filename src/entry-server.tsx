import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import i18n from './i18n';
import { getLanguageFromPathname } from './seo/routes';
import { getPageMetadata, type PageMetadata } from './seo/metadata';

export interface RenderResult {
    html: string;
    metadata: PageMetadata;
}

export async function render(url: string): Promise<RenderResult> {
    const lang = getLanguageFromPathname(url);
    await i18n.changeLanguage(lang);

    const html = renderToString(
        <StaticRouter location={url}>
            <App />
        </StaticRouter>
    );

    const metadata = getPageMetadata(url, lang);
    return { html, metadata };
}
