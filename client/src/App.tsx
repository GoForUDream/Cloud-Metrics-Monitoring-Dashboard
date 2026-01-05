import { Routes, Route, Navigate } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Alerts from './pages/Alerts';

function App() {
  useSocket();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
