import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
console.log("Key starts with:", API_KEY?.substring(0, 12));

// Try v1 API
const configs = [
    { model: "gemini-2.0-flash-lite", api: "v1beta" },
    { model: "gemini-2.0-flash", api: "v1beta" },
    { model: "gemini-2.0-flash-lite", api: "v1" },
    { model: "gemini-2.0-flash", api: "v1" },
];

for (const { model, api } of configs) {
    const url = `https://generativelanguage.googleapis.com/${api}/models/${model}:generateContent?key=${API_KEY}`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Reply only: {"msg":"hello"}' }] }],
            }),
        });
        const data = await res.json();
        if (data.candidates) {
            console.log(`✅ ${api}/${model}: ${data.candidates[0].content.parts[0].text.substring(0, 50)}`);
            process.exit(0);
        } else {
            const status = res.status;
            const code = data.error?.code || "";
            const msg = data.error?.message?.substring(0, 100) || "";
            console.log(`❌ ${api}/${model} [${status}/${code}]: ${msg}`);
        }
    } catch (e) {
        console.log(`❌ ${api}/${model}: ${e.message?.substring(0, 100)}`);
    }
}
process.exit(1);
