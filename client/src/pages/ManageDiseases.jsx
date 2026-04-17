import { useState, useEffect } from "react";
import { getDiseases, createDisease, updateDisease, deleteDisease } from "../api";

export default function ManageDiseases() {
    const [diseases, setDiseases] = useState([]);
    const [form, setForm] = useState({ name: "", description: "" });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDiseases = () => {
        getDiseases()
            .then((res) => setDiseases(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchDiseases(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (editId) {
                await updateDisease(editId, form);
            } else {
                await createDisease(form);
            }
            setForm({ name: "", description: "" });
            setEditId(null);
            fetchDiseases();
        } catch (err) {
            setError(err.response?.data?.error || "Error saving disease");
        }
    };

    const handleEdit = (d) => {
        setEditId(d._id);
        setForm({ name: d.name, description: d.description || "" });
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this disease?")) return;
        try {
            await deleteDisease(id);
            fetchDiseases();
        } catch (err) {
            setError(err.response?.data?.error || "Error deleting");
        }
    };

    if (loading) return <div className="spinner">Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>🦠 Manage Diseases</h1>
                <p>Admin — Add, edit, or remove disease entries</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
                <h2>{editId ? "Edit Disease" : "Add New Disease"}</h2>
                <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Diabetes" />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary btn-sm">{editId ? "Update" : "Add Disease"}</button>
                        {editId && (
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditId(null); setForm({ name: "", description: "" }); }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="card">
                <h2>All Diseases ({diseases.length})</h2>
                <div className="table-wrap" style={{ marginTop: 12 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {diseases.map((d) => (
                                <tr key={d._id}>
                                    <td><strong>{d.name}</strong></td>
                                    <td style={{ color: "var(--text-secondary)" }}>{d.description || "—"}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(d)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)}>Delete</button>
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
