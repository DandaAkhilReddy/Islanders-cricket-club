import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Loader from './components/Loader';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import { useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Squad from './pages/Squad';
import Leadership from './pages/Leadership';
import Matches from './pages/Matches';
import Practice from './pages/Practice';
import Equipment from './pages/Equipment';
import Budget from './pages/Budget';
import Communications from './pages/Communications';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PlayerProfile from './pages/PlayerProfile';
import AdminDashboard from './pages/admin/Dashboard';
import Players from './pages/admin/Players';
import PlayerForm from './pages/admin/PlayerForm';
import MatchForm from './pages/admin/MatchForm';
import ExpenseForm from './pages/admin/ExpenseForm';
import AdminMatches from './pages/admin/AdminMatches';
import AdminPractice from './pages/admin/AdminPractice';
import AdminEquipment from './pages/admin/AdminEquipment';
import AdminBudget from './pages/admin/AdminBudget';
import AdminCommunications from './pages/admin/AdminCommunications';
import AdminRequests from './pages/admin/Requests';
import ScorerHome from './pages/scorer/ScorerHome';
import LiveScoring from './pages/scorer/LiveScoring';
import LiveMatch from './pages/LiveMatch';
import Messenger from './pages/Messenger';
import PlayerDashboard from './pages/player/Dashboard';
import ClaimProfile from './pages/ClaimProfile';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/squad" element={<Squad />} />
        <Route path="/leadership" element={<Leadership />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/communications" element={<Communications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProtectedRoute><PlayerProfile /></ProtectedRoute>} />

        {/* Player Routes */}
        <Route path="/claim-profile" element={<ProtectedRoute><ClaimProfile /></ProtectedRoute>} />
        <Route path="/player/dashboard" element={<ProtectedRoute><PlayerDashboard /></ProtectedRoute>} />
        <Route path="/messenger" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/players" element={<ProtectedRoute requireAdmin><Players /></ProtectedRoute>} />
        <Route path="/admin/players/add" element={<ProtectedRoute requireAdmin><PlayerForm /></ProtectedRoute>} />
        <Route path="/admin/players/edit/:id" element={<ProtectedRoute requireAdmin><PlayerForm /></ProtectedRoute>} />
        <Route path="/admin/matches" element={<ProtectedRoute requireAdmin><AdminMatches /></ProtectedRoute>} />
        <Route path="/admin/matches/add" element={<ProtectedRoute requireAdmin><MatchForm /></ProtectedRoute>} />
        <Route path="/admin/matches/edit/:id" element={<ProtectedRoute requireAdmin><MatchForm /></ProtectedRoute>} />
        <Route path="/admin/practice" element={<ProtectedRoute requireAdmin><AdminPractice /></ProtectedRoute>} />
        <Route path="/admin/equipment" element={<ProtectedRoute requireAdmin><AdminEquipment /></ProtectedRoute>} />
        <Route path="/admin/budget" element={<ProtectedRoute requireAdmin><AdminBudget /></ProtectedRoute>} />
        <Route path="/admin/budget/add" element={<ProtectedRoute requireAdmin><ExpenseForm /></ProtectedRoute>} />
        <Route path="/admin/budget/edit/:id" element={<ProtectedRoute requireAdmin><ExpenseForm /></ProtectedRoute>} />
        <Route path="/admin/communications" element={<ProtectedRoute requireAdmin><AdminCommunications /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute requireAdmin><AdminRequests /></ProtectedRoute>} />

        {/* Scorer Routes */}
        <Route path="/scorer" element={<ScorerHome />} />
        <Route path="/scorer/match/:id" element={<LiveScoring />} />

        {/* Public Live Match View */}
        <Route path="/live/:id" element={<LiveMatch />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <OfflineBanner />
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
