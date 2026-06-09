export const getApiKey = (envVar: string, fallback: string = "") => {
    if (typeof window !== 'undefined') {
        const local = localStorage.getItem(envVar);
        // Clear old invalid key if it's stuck in local storage
        if (local === "7e8903b0f86e4bff14b6ba1df2d860a724e2adb3e69d8ae3eaaf4dbdfaae6023") {
            localStorage.removeItem(envVar);
            return fallback;
        }
        if (local) return local;
    }
    // Prevent sharing developer tokens: return fallback instead of import.meta.env
    return fallback;
};

export const API_KEYS = {
    get ODDS() { return getApiKey("VITE_ODDS_API_KEY"); },
    get BYTEZ() { return getApiKey("VITE_BYTEZ_API_KEY"); },
    get WEATHER() { return getApiKey("VITE_OPENWEATHER_KEY"); },
    get ANTHROPIC() { return getApiKey("VITE_ANTHROPIC_API_KEY"); },
    get GEMINI() { return getApiKey("VITE_GEMINI_API_KEY"); },
    get SPORTMONKS() { return getApiKey("VITE_SPORTMONKS_API_KEY"); },
    get API_FOOTBALL() { return getApiKey("VITE_API_FOOTBALL_KEY"); },
    get ACCUWEATHER() { return getApiKey("VITE_ACCUWEATHER_API_KEY"); },
    get WEATHERSTACK() { return getApiKey("VITE_WEATHERSTACK_API_KEY"); },
    get RAPIDAPI() { return getApiKey("VITE_RAPIDAPI_KEY"); },
    get SPORTRADAR() { return getApiKey("VITE_SPORTRADAR_API_KEY"); },
    get PANDASCORE() { return getApiKey("VITE_PANDASCORE_API_KEY"); },
    get MISTRAL() { return getApiKey("VITE_MISTRAL_API_KEY"); },
    get PERPLEXITY() { return getApiKey("VITE_PERPLEXITY_API_KEY"); },
    get GROQ() { return getApiKey("VITE_GROQ_API_KEY"); },
    get NEWSAPI() { return getApiKey("VITE_NEWSAPI_KEY"); },
    get X_API() { return getApiKey("VITE_X_API_KEY"); },
    get OPENROUTER() { return getApiKey("VITE_OPENROUTER_API_KEY"); },
    get TOGETHER() { return getApiKey("VITE_TOGETHER_API_KEY"); },
    get NVIDIA() { return getApiKey("VITE_NVIDIA_API_KEY"); },
    get BETSTACK() { return getApiKey("VITE_BETSTACK_API_KEY"); },
    get BZZOIRO_ML() { return getApiKey("VITE_BZZOIRO_ML_TOKEN"); },
    get FIRECRAWL() { return getApiKey("VITE_FIRECRAWL_API_KEY"); },
};

export async function secureFetch(url: string, options: any = {}, providerName: string = "API") {
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
        try {
            const response = await fetch(url, options);

            // Handle Unauthorized (401)
            if (response.status === 401) {
                if (typeof window !== 'undefined') {
                    if (providerName.includes('Odds API')) localStorage.removeItem('VITE_ODDS_API_KEY');
                    if (providerName.includes('Sportmonks')) localStorage.removeItem('VITE_SPORTMONKS_API_KEY');
                    if (providerName.includes('OpenWeather')) localStorage.removeItem('VITE_OPENWEATHER_KEY');
                }
                throw new Error(`AUTH_ERROR: [${providerName}] API key is not valid.`);
            }

            // Handle Not Found (404) - do not retry
            if (response.status === 404) {
                throw new Error(`NOT_FOUND: [${providerName}] Resource not found.`);
            }

            // Handle Rate Limiting (429 Too Many Requests)
            if (response.status === 429) {
                console.warn(`[${providerName}] Rate limit hit. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries--;
                delay *= 2; // Exponential backoff
                continue;
            }

            // Handle Unprocessable Entity (422) - do not retry
            if (response.status === 422) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`UNPROCESSABLE_ENTITY: [${providerName}] ${errorData.message || 'Invalid request'}`);
            }

            // Handle other 4xx Client Errors - do not retry
            if (response.status >= 400 && response.status < 500) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`CLIENT_ERROR: [${providerName}] (${response.status}) ${errorData.message || 'Client error'}`);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`${providerName} Error (${response.status}): ${errorData.message || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error: any) {
            // Do not retry for certain errors
            if (
                error.message?.includes('AUTH_ERROR') || 
                error.message?.includes('NOT_FOUND') ||
                error.message?.includes('UNPROCESSABLE_ENTITY') ||
                error.message?.includes('CLIENT_ERROR')
            ) {
                throw error;
            }

            if (retries <= 1) throw error;
            console.warn(`[${providerName}] Fetch attempt failed. Retrying in ${delay}ms...`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries--;
            delay *= 2;
        }
    }
    throw new Error(`${providerName} failed after multiple retries.`);
}

export const getActiveServicesCount = () => {
    return Object.values(API_KEYS).filter(k => k && k.length > 10).length;
};

export async function testApiKey(serviceId: string, key: string) {
    try {
        switch (serviceId) {
            case 'odds':
                const oddsRes = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${key}`);
                if (!oddsRes.ok) throw new Error('Invalid Odds API Key');
                return true;
            case 'gemini':
                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
                if (!geminiRes.ok) throw new Error('Invalid Gemini API Key');
                return true;
            default:
                return !!key; // Default to true if we don't have a specific test
        }
    } catch (e) {
        console.error(`Failed to test API key for ${serviceId}:`, e);
        throw e;
    }
}
