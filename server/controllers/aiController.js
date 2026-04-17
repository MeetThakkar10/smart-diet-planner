import DietLog from "../models/DietLog.js";
import ErrorResponse from "../utils/errorResponse.js";

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

/**
 * Call Mistral AI API to generate diet plan.
 */
async function callMistral(prompt) {
    const apiKey = process.env.MISTRAL_API_KEY;

    const res = await fetch(MISTRAL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "mistral-small-latest",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert Indian nutritionist AI. You respond ONLY with valid JSON — no markdown, no commentary, no explanation.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2048,
        }),
    });

    const data = await res.json();

    if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
    }

    const errorMsg =
        data.message || data.error?.message || JSON.stringify(data);
    throw new Error(errorMsg);
}

// @desc    Generate AI-powered diet plan using Mistral
// @route   POST /api/ai/generate
// @access  Private
export const generateDietPlan = async (req, res) => {
    const { age, weight, height, disease, goal, dietType } = req.body;

    // ---------- Validate inputs ----------
    if (!age || !weight || !height || !disease || !goal || !dietType) {
        throw new ErrorResponse(
            "Please provide age, weight, height, disease, goal, and dietType",
            400
        );
    }

    // ---------- Build prompt ----------
    const prompt = `Generate a personalised daily Indian diet plan.

Patient profile:
- Age: ${age}
- Weight: ${weight} kg
- Height: ${height} cm
- Disease / Condition: ${disease}
- Health Goal: ${goal}
- Diet Preference: ${dietType}

Rules:
1. Indian cuisine only.
2. If disease is "Diabetes", strictly avoid high-sugar foods.
3. If disease is "Hypertension", reduce sodium-rich foods.
4. If disease is "Heart Disease", minimise saturated fats and cholesterol.
5. Calories: weight loss ~1200-1500 kcal, weight gain ~2500-3000 kcal, maintain ~1800-2200 kcal.
6. vegetarian = no non-veg. vegan = no dairy either. non-vegetarian = balanced non-veg.

Respond ONLY with this JSON (no markdown, no wrapping):
{
  "breakfast": { "items": ["item1", "item2"], "calories": 400 },
  "lunch": { "items": ["item1", "item2"], "calories": 500 },
  "dinner": { "items": ["item1", "item2"], "calories": 450 },
  "snacks": { "items": ["item1", "item2"], "calories": 200 },
  "totalEstimatedCalories": 1550,
  "healthTips": ["tip1", "tip2", "tip3"]
}`;

    // ---------- Call Mistral API ----------
    try {
        const responseText = await callMistral(prompt);

        // ---------- Parse & validate JSON ----------
        let dietPlan;
        try {
            const cleaned = responseText
                .replace(/```json\s*/gi, "")
                .replace(/```\s*/gi, "")
                .trim();

            dietPlan = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("Parse error. Raw response:", responseText);
            throw new ErrorResponse(
                "AI returned an invalid response. Please try again.",
                502
            );
        }

        // Basic structure check
        const requiredKeys = [
            "breakfast",
            "lunch",
            "dinner",
            "snacks",
            "totalEstimatedCalories",
            "healthTips",
        ];
        for (const key of requiredKeys) {
            if (!(key in dietPlan)) {
                throw new ErrorResponse(
                    `AI response missing required field: ${key}. Please try again.`,
                    502
                );
            }
        }

        // ---------- Save to DietLog ----------
        const dietLog = await DietLog.create({
            user: req.user._id,
            aiGeneratedPlan: JSON.stringify(dietPlan),
            totalCalories: dietPlan.totalEstimatedCalories || 0,
        });

        res.status(200).json({
            success: true,
            data: {
                dietPlan,
                dietLogId: dietLog._id,
            },
        });
    } catch (apiError) {
        if (apiError instanceof ErrorResponse) {
            throw apiError;
        }
        console.error("Mistral API Error:", apiError.message);

        const msg = apiError.message || "";
        if (msg.includes("Unauthorized") || msg.includes("401")) {
            throw new ErrorResponse("Invalid Mistral API key.", 401);
        }
        if (msg.includes("429") || msg.includes("rate")) {
            throw new ErrorResponse(
                "AI rate limit reached. Please wait and try again.",
                429
            );
        }
        throw new ErrorResponse(
            "Failed to generate diet plan. AI service error: " + msg.substring(0, 100),
            503
        );
    }
};
