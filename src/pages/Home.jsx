import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, QrCode, ArrowRight } from 'lucide-react';
import '../styles/home.css';

export default function Home() {
  return (
    <div className="home-container animate-fade-in">
      <div className="hero-section">
        <h1 className="hero-title">
          Secure QR Verification <br />
          <span className="gradient-text">Reimagined</span>
        </h1>
        <p className="hero-subtitle">
          Protecting against QR phishing and physical tampering using ECDSA signatures and heuristic URL analysis.
        </p>
        
        <div className="hero-actions">
          <Link to="/scanner" className="btn btn-primary btn-large">
            <ShieldCheck size={20} /> Start Scanning
          </Link>
          <Link to="/issuer" className="btn btn-secondary btn-large">
            <QrCode size={20} /> Generate Secure QR
          </Link>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card glass-card animate-fade-in animate-delay-1">
          <div className="feature-icon bg-safe">
            <ShieldCheck className="text-success" size={24} />
          </div>
          <h3>ECDSA Authentication</h3>
          <p>Verifies the authenticity and integrity of QR code data using digital signatures.</p>
        </div>
        
        <div className="feature-card glass-card animate-fade-in animate-delay-2">
          <div className="feature-icon bg-warning">
            <QrCode className="text-warning" size={24} />
          </div>
          <h3>Tamper Detection</h3>
          <p>Detects unauthorized replacement or modification of physical QR codes instantly.</p>
        </div>

        <div className="feature-card glass-card animate-fade-in animate-delay-3">
          <div className="feature-icon bg-danger">
            <ShieldCheck className="text-danger" size={24} />
          </div>
          <h3>URL Threat Analysis</h3>
          <p>Analyzes decoded URLs using heuristics to identify phishing or suspicious links before access.</p>
        </div>
      </div>
    </div>
  );
}
