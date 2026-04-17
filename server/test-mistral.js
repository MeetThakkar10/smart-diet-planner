import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.MISTRAL_API_KEY;

const prompt = `Generate a personalised daily Indian diet plan.

Patient profile:
- Age: 20
- Weight: 50 kg
- Height: 163 cm
- Disease / Condition: Heart Disease
- Health Goal: weight loss
- Diet Preference: vegetarian

Rules:
1. Indian cuisine only.
2. minimise saturated fats and cholesterol.
3. Calories: weight loss ~1200-1500 kcal.
4. vegetarian = no non-veg.

Respond ONLY with this JSON (no markdown, no wrapping):
{
  "breakfast": { "items": ["item1", "item2"], "calories": 400 },
  "lunch": { "items": ["item1", "item2"], "calories": 500 },
  "dinner": { "items": ["item1", "item2"], "calories": 450 },
  "snacks": { "items": ["item1", "item2"], "calories": 200 },
  "totalEstimatedCalories": 1550,
  "healthTips": ["tip1", "tip2", "tip3"]
}`;

console.log("Calling Mistral API...");
const start = Date.now();

try {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "mistral-small-latest",
            messages: [
                { role: "system", content: "You are an expert Indian nutritionist AI. You respond ONLY with valid JSON — no markdown, no commentary." },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2048,
        }),
    });

    console.log(`Status: ${res.status} (${Date.now() - start}ms)`);
    const data = await res.json();

    if (data.choices?.[0]?.message?.content) {
        const raw = data.choices[0].message.content;
        console.log("\nRaw response:\n", raw);

        const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        const parsed = JSON.parse(cleaned);
        console.log("\n✅ Parsed successfully!");
        console.log("Total Calories:", parsed.totalEstimatedCalories);
        console.log("Breakfast:", parsed.breakfast?.items?.join(", "));
    } else {
        console.log("❌ No content:", JSON.stringify(data, null, 2).substring(0, 500));
    }
} catch (e) {
    console.log("❌ Error:", e.message);
}
process.exit(0);
