import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="logo">Diet Planner</div>
                <div className="logo-sub">AI-Powered Health Platform</div>
                <nav>
                    <NavLink to="/" end> Dashboard</NavLink>
                    {user?.role !== "admin" && (
                        <NavLink to="/ai-planner">AI Planner</NavLink>
                    )}
                    <NavLink to="/diet-logs">Diet Logs</NavLink>
                    {user?.role === "admin" && (
                        <>
                            <div style={{ marginTop: 16, marginBottom: 4, fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", padding: "0 14px" }}>
                                Admin
                            </div>
                            <NavLink to="/admin/diet-logs">User Diet Logs</NavLink>
                            <NavLink to="/admin/diseases">Diseases</NavLink>
                            <NavLink to="/admin/foods">Foods</NavLink>
                        </>
                    )}
                    <button onClick={handleLogout} style={{ marginTop: "auto" }}>Logout</button>
                </nav>
                <div className="user-info">
                    <strong>{user?.name}</strong>
                    {user?.email} • {user?.role}
                </div>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
