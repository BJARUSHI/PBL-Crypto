import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, QrCode, ShieldCheck, Github } from 'lucide-react';
import Home from './pages/Home';
import Issuer from './pages/Issuer';
import Scanner from './pages/Scanner';
import './styles/index.css';
import './styles/layout.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar glass-card">
          <Link to="/" className="nav-brand">
            <Shield className="text-accent-primary" size={28} />
            <span className="font-bold gradient-text">QSecR</span>
          </Link>
          <div className="nav-links">
            <Link to="/issuer" className="nav-link">
              <QrCode size={18} /> Generate
            </Link>
            <Link to="/scanner" className="nav-link">
              <ShieldCheck size={18} /> Scan
            </Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/issuer" element={<Issuer />} />
            <Route path="/scanner" element={<Scanner />} />
          </Routes>
        </main>
        
        <footer className="footer">
          <p>© 2026 QSecR Authentication System. Built for PBL.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
