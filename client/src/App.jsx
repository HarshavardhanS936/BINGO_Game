import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import ManualBoard from './components/ManualBoard';
import Leaderboard from './pages/Leaderboard';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)]">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    return children;
};
function App() {
    const { userData } = useAuth();
    const themeClass = userData?.theme === 'light' ? 'light-theme' : '';

    return (
        <Router>
            <div className={`h-screen bg-[var(--bg-deep)] text-[var(--text-main)] font-sans selection:bg-cyan-500/30 flex flex-col relative ${themeClass}`}>
                {/* Unique Background Layers */}
                <div className="bg-layer">
                    <div className="cyber-dust"></div>
                </div>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1a1a1a',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '12px',
                            fontWeight: '900',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase'
                        }
                    }}
                />
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/auto-fill" element={<Game mode="auto" />} />
                    <Route path="/manual-fill" element={
                        <ProtectedRoute>
                            <ManualBoard />
                        </ProtectedRoute>
                    } />
                    <Route path="/game/:roomId" element={<Game />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/friends" element={
                        <ProtectedRoute>
                            <Friends />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

