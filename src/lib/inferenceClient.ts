import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { getApiKey } from "./api";
import { useSettingsStore } from "../stores/settingsStore";
import { CreateMLCEngine } from "@mlc-ai/web-llm";

let sharedWebLlmEngine: any = null;

export async function generateInferenceContent(
    promptOrContents: string | any[], 
    systemInstruction?: string, 
    attemptJsonParse: boolean = true
): Promise<{ text: string, data?: any }> {
    const { inferenceProvider, localApiUrl, webLlmModel } = useSettingsStore.getState();

    let responseText = "";

    let usedWebLlmFallback = false;
    if (inferenceProvider === 'gemini') {
        try {
            const apiKey = getApiKey("VITE_GEMINI_API_KEY");
            const contents = Array.isArray(promptOrContents) ? promptOrContents : [promptOrContents];
            const finalContents = systemInstruction ? [{role: 'user', parts: [{text: systemInstruction}, ...contents.map(c => typeof c === 'string' ? {text: c} : c)]}] : contents;

            const response = await fetch('/api/gemini/generate', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
                },
                body: JSON.stringify({
                    model: "gemini-flash-latest",
                    contents: finalContents,
                    config: {}
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                let errStr = "";
                try {
                    const errObj = JSON.parse(errText);
                    errStr = JSON.stringify(errObj);
                    if (errStr.includes("API_KEY_INVALID")) {
                        if (typeof window !== 'undefined') localStorage.removeItem('VITE_GEMINI_API_KEY');
                    }
                    throw new Error(`Gemini proxy failed: ${errObj.error || response.statusText}`);
                } catch(e) {
                    if (e instanceof Error && e.message.includes("Gemini proxy failed")) throw e;
                    throw new Error(`Gemini proxy failed (${response.status}): ${errText.slice(0, 100)}`);
                }
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                const textResponse = await response.text();
                throw new Error(`Gemini proxy returned non-JSON (${contentType}): ${textResponse.slice(0, 50)}...`);
            }

            const data = await response.json();
            responseText = data.text || "";
        } catch (gemeniError) {
            console.warn("Primary agent failed (tokens/quota/auth). Falling back to local agent...", gemeniError);
            usedWebLlmFallback = true;
        }
    } 
    
    if (inferenceProvider === 'local_api') {
        const url = `${localApiUrl.replace(/\/$/, '')}/chat/completions`;
        const messages = [];
        if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
        
        const promptString = Array.isArray(promptOrContents) 
            ? promptOrContents.map(c => typeof c === 'string' ? c : '[Image Data]').join(' ')
            : promptOrContents;

        messages.push({ role: 'user', content: promptString });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer dummy-token`
            },
            body: JSON.stringify({
                model: "gemma-2-9b-it", // Often ignored by local servers anyway
                messages: messages,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Local API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        responseText = data.choices[0]?.message?.content || "";
    } 
    else if (inferenceProvider === 'web_llm' || usedWebLlmFallback) {
        try {
            if (!sharedWebLlmEngine) {
                // Lazy load engine, this will take some time and download weights on first run
                sharedWebLlmEngine = await CreateMLCEngine(webLlmModel, {
                    initProgressCallback: (progress) => {
                        console.log('WebLLM Loading:', progress);
                    }
                });
            }
            
            const messages = [];
            if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
            
            const promptString = Array.isArray(promptOrContents) 
                ? promptOrContents.map(c => typeof c === 'string' ? c : '[Image Data]').join(' ')
                : promptOrContents;

            messages.push({ role: 'user', content: promptString });

            const reply = await sharedWebLlmEngine.chat.completions.create({
                messages,
                response_format: attemptJsonParse ? { type: "json_object" } : undefined
            });

            responseText = reply.choices[0]?.message?.content || "";
        } catch (webLlmError) {
            console.warn("Local agent fallback failed, returning generic mock output.", webLlmError);
            if (attemptJsonParse) {
                 responseText = "{}"; // minimal valid JSON
            } else {
                 responseText = "⚠️ Local agent fallback active. Target data currently unavailable.";
            }
        }
    }

    // Try to parse JSON if requested
    let parsedData = undefined;
    if (attemptJsonParse) {
        try {
            const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse model JSON response", e);
        }
    }

    return { text: responseText, data: parsedData };
}

// Minimal stream abstraction to mock Google GenAI stream loops
export async function* generateAIContentStream(
    prompt: string, 
    systemInstruction?: string,
    useThinking: boolean = false
): AsyncGenerator<{ text: string }> {
    const { inferenceProvider, localApiUrl, webLlmModel } = useSettingsStore.getState();

    let fullPrompt = prompt;
    if (systemInstruction) {
        fullPrompt = `${systemInstruction}\n\n${prompt}`;
    }

    let usedWebLlmFallback = false;
    if (inferenceProvider === 'gemini') {
        try {
            const apiKey = getApiKey("VITE_GEMINI_API_KEY");
            const response = await fetch('/api/gemini/stream', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
                },
                body: JSON.stringify({
                    model: "gemini-flash-latest",
                    contents: fullPrompt,
                    config: {}
                })
            });

            if (!response.ok || !response.body) {
                const errText = await response.text();
                let errStr = "";
                try {
                    const errObj = JSON.parse(errText);
                    errStr = JSON.stringify(errObj);
                    if (errStr.includes("API_KEY_INVALID")) {
                        if (typeof window !== 'undefined') localStorage.removeItem('VITE_GEMINI_API_KEY');
                    }
                    throw new Error(`Gemini stream proxy failed: ${errObj.error || response.statusText}`);
                } catch(e) {
                    if (e instanceof Error && e.message.includes("Gemini stream proxy failed")) throw e;
                    throw new Error(`Gemini stream proxy failed (${response.status}): ${errText.slice(0, 100)}`);
                }
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (line === 'data: [DONE]') return;
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.text) {
                                yield { text: data.text };
                            }
                        } catch (e) {
                             console.error("Gemini stream parse error", e);
                        }
                    }
                }
            }
        } catch (gemeniError) {
            console.warn("Primary agent stream failed (tokens/quota/auth). Falling back to local agent...", gemeniError);
            usedWebLlmFallback = true;
        }
    } 
    
    if (inferenceProvider === 'local_api') {
        const url = `${localApiUrl.replace(/\/$/, '')}/chat/completions`;
        const messages = [];
        if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
        messages.push({ role: 'user', content: prompt });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer dummy-token`
            },
            body: JSON.stringify({
                model: "gemma-2-9b-it",
                messages: messages,
                temperature: 0.7,
                stream: true // Enable streaming for local API
            })
        });

        // Simple stream parsing
        if (!response.body) throw new Error("No response body");
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                if (line === 'data: [DONE]') return;
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6);
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.choices[0].delta?.content) {
                            yield { text: data.choices[0].delta.content };
                        }
                    } catch (e) {
                         console.error("Local stream parse error", e);
                    }
                }
            }
        }
    } 
    else if (inferenceProvider === 'web_llm' || usedWebLlmFallback) {
        try {
            if (!sharedWebLlmEngine) {
                sharedWebLlmEngine = await CreateMLCEngine(webLlmModel, {
                    initProgressCallback: (progress) => {
                        console.log('WebLLM Loading:', progress);
                    }
                });
            }
            
            const messages = [];
            if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
            messages.push({ role: 'user', content: prompt });

            const responseStream = await sharedWebLlmEngine.chat.completions.create({
                messages,
                stream: true
            });

            for await (const chunk of responseStream) {
                 if (chunk.choices[0]?.delta?.content) {
                     yield { text: chunk.choices[0]?.delta?.content };
                 }
            }
        } catch (webLlmError) {
            console.warn("Local stream fallback failed...", webLlmError);
            yield { text: "⚠️ Agents are currently unavailable (tokens exhausted or network error) and local agent fallback could not load.\n" };
        }
    }
}
