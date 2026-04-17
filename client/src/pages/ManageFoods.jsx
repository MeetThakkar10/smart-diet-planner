import { useState, useEffect } from "react";
import { getFoods, getDiseases, createFood, updateFood, deleteFood } from "../api";

export default function ManageFoods() {
    const [foods, setFoods] = useState([]);
    const [diseases, setDiseases] = useState([]);
    const [form, setForm] = useState({ name: "", calories: "", disease: "", type: "recommended" });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = () => {
        Promise.all([getFoods(), getDiseases()])
            .then(([foodsRes, diseasesRes]) => {
                setFoods(foodsRes.data.data);
                setDiseases(diseasesRes.data.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const payload = { ...form, calories: Number(form.calories) };
            if (editId) {
                await updateFood(editId, payload);
            } else {
                await createFood(payload);
            }
            setForm({ name: "", calories: "", disease: "", type: "recommended" });
            setEditId(null);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || "Error saving food");
        }
    };

    const handleEdit = (f) => {
        setEditId(f._id);
        setForm({
            name: f.name,
            calories: String(f.calories),
            disease: f.disease?._id || f.disease || "",
            type: f.type,
        });
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this food item?")) return;
        try {
            await deleteFood(id);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || "Error deleting");
        }
    };

    if (loading) return <div className="spinner">Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>🍽️ Manage Foods</h1>
                <p>Admin — Add, edit, or remove food items</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
                <h2>{editId ? "Edit Food" : "Add New Food"}</h2>
                <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Brown Rice" />
                        </div>
                        <div className="form-group">
                            <label>Calories</label>
                            <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} required placeholder="215" min="0" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Disease</label>
                            <select value={form.disease} onChange={(e) => setForm({ ...form, disease: e.target.value })}>
                                <option value="">— None —</option>
                                {diseases.map((d) => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                <option value="recommended">Recommended</option>
                                <option value="avoid">Avoid</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary btn-sm">{editId ? "Update" : "Add Food"}</button>
                        {editId && (
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditId(null); setForm({ name: "", calories: "", disease: "", type: "recommended" }); }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="card">
                <h2>All Food Items ({foods.length})</h2>
                <div className="table-wrap" style={{ marginTop: 12 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Calories</th>
                                <th>Disease</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {foods.map((f) => (
                                <tr key={f._id}>
                                    <td><strong>{f.name}</strong></td>
                                    <td>{f.calories} kcal</td>
                                    <td style={{ color: "var(--text-secondary)" }}>{f.disease?.name || "—"}</td>
                                    <td>
                                        <span className={`badge ${f.type === "recommended" ? "badge-success" : "badge-danger"}`}>
                                            {f.type}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(f)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
