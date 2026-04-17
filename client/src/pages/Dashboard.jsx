import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { getMyDietLogs, getDiseases } from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [diseaseCount, setDiseaseCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getMyDietLogs(), getDiseases()])
            .then(([logsRes, diseasesRes]) => {
                setLogs(logsRes.data.data);
                setDiseaseCount(diseasesRes.data.count);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const totalCals = logs.reduce((sum, l) => sum + (l.totalCalories || 0), 0);

    if (loading) return <div className="spinner">Loading dashboard...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Welcome back, {user?.name} 👋</h1>
                <p>Here's your health overview</p>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-val">{logs.length}</div>
                    <div className="stat-label">Diet Logs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-val">{totalCals}</div>
                    <div className="stat-label">Total Calories Tracked</div>
                </div>
                <div className="stat-card">
                    <div className="stat-val">{diseaseCount}</div>
                    <div className="stat-label">Diseases in DB</div>
                </div>
                <div className="stat-card">
                    <div className="stat-val">{logs.filter(l => l.aiGeneratedPlan).length}</div>
                    <div className="stat-label">AI Plans Generated</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Recent Diet Logs</h2>
                    <Link to="/diet-logs" className="btn btn-outline btn-sm">View All →</Link>
                </div>
                {logs.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        No diet logs yet. <Link to="/ai-planner">Generate your first AI diet plan</Link> or <Link to="/diet-logs">log food manually</Link>.
                    </p>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Calories</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.slice(0, 5).map((log) => (
                                    <tr key={log._id}>
                                        <td>{new Date(log.date).toLocaleDateString()}</td>
                                        <td><strong>{log.totalCalories}</strong> kcal</td>
                                        <td>
                                            {log.aiGeneratedPlan ? (
                                                <span className="badge badge-info">AI Plan</span>
                                            ) : (
                                                <span className="badge badge-success">Manual</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
