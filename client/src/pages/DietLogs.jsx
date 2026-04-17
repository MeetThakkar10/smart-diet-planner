import { useState, useEffect } from "react";
import { getMyDietLogs, getFoods, addDietLog } from "../api";

export default function DietLogs() {
    const [logs, setLogs] = useState([]);
    const [foods, setFoods] = useState([]);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");
    const [viewLog, setViewLog] = useState(null);

    const fetchData = () => {
        Promise.all([getMyDietLogs(), getFoods()])
            .then(([logsRes, foodsRes]) => {
                setLogs(logsRes.data.data);
                setFoods(foodsRes.data.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const toggleFood = (id) => {
        setSelectedFoods((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    };

    const calcSelected = () =>
        selectedFoods.reduce((sum, id) => {
            const f = foods.find((fd) => fd._id === id);
            return sum + (f?.calories || 0);
        }, 0);

    const handleLog = async () => {
        if (selectedFoods.length === 0) return;
        setSaving(true);
        setMsg("");
        try {
            await addDietLog({ foods: selectedFoods });
            setMsg("Diet log saved!");
            setSelectedFoods([]);
            setShowForm(false);
            fetchData();
        } catch (err) {
            setMsg(err.response?.data?.error || "Error saving log");
        } finally {
            setSaving(false);
        }
    };

    // Parse AI plan JSON safely
    const parseAiPlan = (planStr) => {
        try { return JSON.parse(planStr); } catch { return null; }
    };

    if (loading) return <div className="spinner">Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>📋 Diet Logs</h1>
                <p>Track your daily food intake</p>
            </div>

            {msg && <div className={`alert ${msg.includes("Error") ? "alert-error" : "alert-success"}`}>{msg}</div>}

            <div className="card">
                <div className="card-header">
                    <h2>Log New Meal</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cancel" : "+ Add Food Log"}
                    </button>
                </div>

                {showForm && (
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 12 }}>
                            Select the foods you ate today — calories are auto-calculated.
                        </p>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th>Food</th>
                                        <th>Calories</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {foods.map((f) => (
                                        <tr key={f._id} style={{ cursor: "pointer" }} onClick={() => toggleFood(f._id)}>
                                            <td>
                                                <input type="checkbox" checked={selectedFoods.includes(f._id)} readOnly />
                                            </td>
                                            <td>{f.name}</td>
                                            <td>{f.calories} kcal</td>
                                            <td>
                                                <span className={`badge ${f.type === "recommended" ? "badge-success" : "badge-danger"}`}>
                                                    {f.type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {selectedFoods.length > 0 && (
                            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16 }}>
                                <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                                    Total: <span style={{ color: "var(--accent)" }}>{calcSelected()} kcal</span>
                                </span>
                                <button className="btn btn-primary" onClick={handleLog} disabled={saving}>
                                    {saving ? "Saving..." : "Save Diet Log"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="card">
                <h2>Past Diet Logs</h2>
                {logs.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", marginTop: 12 }}>No logs yet.</p>
                ) : (
                    <div className="table-wrap" style={{ marginTop: 12 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Foods</th>
                                    <th>Calories</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id}>
                                        <td>{new Date(log.date).toLocaleDateString()}</td>
                                        <td>
                                            {log.foods?.length > 0
                                                ? log.foods.map((f) => f.name).join(", ")
                                                : <em style={{ color: "var(--text-muted)" }}>AI Generated</em>}
                                        </td>
                                        <td><strong>{log.totalCalories}</strong> kcal</td>
                                        <td>
                                            {log.aiGeneratedPlan ? (
                                                <span className="badge badge-info">AI Plan</span>
                                            ) : (
                                                <span className="badge badge-success">Manual</span>
                                            )}
                                        </td>
                                        <td>
                                            <button className="btn btn-outline btn-sm" onClick={() => setViewLog(log)}>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Diet Log Modal */}
            {viewLog && (
                <div className="modal-overlay" onClick={() => setViewLog(null)}>
                    <div className="modal" style={{ maxWidth: 600, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h2 style={{ margin: 0 }}>Diet Log Details</h2>
                            <button className="btn btn-outline btn-sm" onClick={() => setViewLog(null)}>✕ Close</button>
                        </div>

                        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                            <div className="stat-card" style={{ flex: 1, padding: 14 }}>
                                <div className="stat-val" style={{ fontSize: "1.3rem" }}>{viewLog.totalCalories}</div>
                                <div className="stat-label">Total Calories</div>
                            </div>
                            <div className="stat-card" style={{ flex: 1, padding: 14 }}>
                                <div className="stat-val" style={{ fontSize: "1.3rem" }}>{new Date(viewLog.date).toLocaleDateString()}</div>
                                <div className="stat-label">Date</div>
                            </div>
                            <div className="stat-card" style={{ flex: 1, padding: 14 }}>
                                <div className="stat-val" style={{ fontSize: "1.3rem" }}>{viewLog.aiGeneratedPlan ? "🤖" : "✍️"}</div>
                                <div className="stat-label">{viewLog.aiGeneratedPlan ? "AI Plan" : "Manual"}</div>
                            </div>
                        </div>

                        {/* Manual log foods */}
                        {viewLog.foods?.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: "0.95rem", color: "var(--accent)", marginBottom: 8 }}>Foods Logged</h3>
                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr><th>Food</th><th>Calories</th></tr>
                                        </thead>
                                        <tbody>
                                            {viewLog.foods.map((f, i) => (
                                                <tr key={i}>
                                                    <td>{f.name || f}</td>
                                                    <td>{f.calories ? `${f.calories} kcal` : "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* AI Plan details */}
                        {viewLog.aiGeneratedPlan && (() => {
                            const plan = parseAiPlan(viewLog.aiGeneratedPlan);
                            if (!plan) return <p style={{ color: "var(--text-muted)" }}>Could not parse AI plan data.</p>;
                            return (
                                <div>
                                    <div className="diet-plan" style={{ marginTop: 0 }}>
                                        {["breakfast", "lunch", "dinner", "snacks"].map((meal) => (
                                            plan[meal] && (
                                                <div className="meal-card" key={meal}>
                                                    <h3>
                                                        {meal === "breakfast" ? "🌅 Breakfast" :
                                                            meal === "lunch" ? "🍱 Lunch" :
                                                                meal === "dinner" ? "🌙 Dinner" : "🍿 Snacks"}
                                                    </h3>
                                                    <ul>
                                                        {plan[meal]?.items?.map((item, i) => <li key={i}>{item}</li>)}
                                                    </ul>
                                                    <div className="meal-cal">{plan[meal]?.calories} kcal</div>
                                                </div>
                                            )
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
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
