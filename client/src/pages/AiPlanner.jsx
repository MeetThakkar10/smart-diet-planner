import { useState, useEffect } from "react";
import { getDiseases, generateDietPlan } from "../api";

export default function AiPlanner() {
    const [diseases, setDiseases] = useState([]);
    const [form, setForm] = useState({
        age: "", weight: "", height: "", disease: "", goal: "weight loss", dietType: "vegetarian",
    });
    const [plan, setPlan] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getDiseases().then((res) => setDiseases(res.data.data)).catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setPlan(null);
        setLoading(true);
        try {
            const { data } = await generateDietPlan({
                ...form,
                disease: diseases.find((d) => d._id === form.disease)?.name || form.disease,
            });
            setPlan(data.data.dietPlan);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to generate plan");
        } finally {
            setLoading(false);
        }
    };

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    return (
        <div>
            <div className="page-header">
                <h1>🤖 AI Diet Planner</h1>
                <p>Generate a personalized Indian diet plan</p>
            </div>

            <div className="card">
                <h2>Your Health Profile</h2>
                {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
                    <div className="form-row-3">
                        <div className="form-group">
                            <label>Age</label>
                            <input type="number" placeholder="25" value={form.age} onChange={set("age")} required min="1" max="120" />
                        </div>
                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input type="number" placeholder="70" value={form.weight} onChange={set("weight")} required min="20" max="300" />
                        </div>
                        <div className="form-group">
                            <label>Height (cm)</label>
                            <input type="number" placeholder="170" value={form.height} onChange={set("height")} required min="100" max="250" />
                        </div>
                    </div>
                    <div className="form-row-3">
                        <div className="form-group">
                            <label>Disease / Condition</label>
                            <select value={form.disease} onChange={set("disease")} required>
                                <option value="">Select disease</option>
                                {diseases.map((d) => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Health Goal</label>
                            <select value={form.goal} onChange={set("goal")}>
                                <option value="weight loss">Weight Loss</option>
                                <option value="weight gain">Weight Gain</option>
                                <option value="maintain">Maintain Weight</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Diet Type</label>
                            <select value={form.dietType} onChange={set("dietType")}>
                                <option value="vegetarian">Vegetarian</option>
                                <option value="non-vegetarian">Non-Vegetarian</option>
                                <option value="vegan">Vegan</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-primary" disabled={loading}>
                        {loading ? "⏳ Generating with AI..." : "✨ Generate Diet Plan"}
                    </button>
                </form>
            </div>

            {plan && (
                <div className="card" style={{ marginTop: 20 }}>
                    <h2>Your Personalized Diet Plan</h2>
                    <div className="total-cal">
                        {plan.totalEstimatedCalories} kcal <span>/ day</span>
                    </div>
                    <div className="diet-plan">
                        {["breakfast", "lunch", "dinner", "snacks"].map((meal) => (
                            <div className="meal-card" key={meal}>
                                <h3>{meal === "snacks" ? "🍿 Snacks" : meal === "breakfast" ? "🌅 Breakfast" : meal === "lunch" ? "🍱 Lunch" : "🌙 Dinner"}</h3>
                                <ul>
                                    {plan[meal]?.items?.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                                <div className="meal-cal">{plan[meal]?.calories} kcal</div>
                            </div>
                        ))}
                        {plan.healthTips && (
                            <div className="tips-card">
                                <h3>Health Tips</h3>
                                <ul>
                                    {plan.healthTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
