import fetch from 'node-fetch';

async function test() {
    const key = "e6eb939af9210a143459fbdf38262663";
    const url = "https://api.bytez.com/models/v2/meta-llama/Meta-Llama-3-8B-Instruct";
    
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Key ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [{role: "user", content: "Write a 1 sentence prediction for Arsenal vs Chelsea."}]
            })
        });
        const data = await res.json();
        console.log("Llama3:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}
test();