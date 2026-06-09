import { API_KEYS } from '../lib/api';

export async function scrapeFootballData(url: string) {
    if (!API_KEYS.FIRECRAWL) {
        console.warn("Firecrawl API key not found. Skipping web scrape.");
        return null;
    }

    try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEYS.FIRECRAWL}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                formats: ['markdown']
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to scrape: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data?.markdown || null;
    } catch (error) {
        console.error("Firecrawl Scrape Error:", error);
        return null;
    }
}

export async function searchFootballNews(query: string) {
    if (!API_KEYS.FIRECRAWL) {
        console.warn("Firecrawl API key not found. Skipping web search.");
        return null;
    }

    try {
        const response = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEYS.FIRECRAWL}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                limit: 3,
                scrapeOptions: {
                    formats: ['markdown']
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to search: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data?.map((result: any) => ({
            title: result.title,
            url: result.url,
            content: result.markdown
        })) || [];
    } catch (error) {
        console.error("Firecrawl Search Error:", error);
        return null;
    }
}
