import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle, Key, Camera, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { importPublicKey, verifySignature } from '../utils/crypto';
import { analyzeURL } from '../utils/heuristics';
import '../styles/scanner.css';

export default function Scanner() {
  const [pubKeyString, setPubKeyString] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null); // 'valid', 'invalid', 'pending'
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const scannerRef = useRef(null);

  const startScanner = () => {
    if (!pubKeyString) {
      setError('Please provide the Issuer Public Key first.');
      return;
    }
    setError('');
    setScanResult(null);
    setVerificationStatus(null);
    setAnalysisResult(null);
    setIsScanning(true);

    setTimeout(() => {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          { fps: 10 },
          /* verbose= */ false
        );
        scannerRef.current.render(onScanSuccess, onScanFailure);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    stopScanner();
    
    try {
      const payload = JSON.parse(decodedText);
      if (!payload.data || !payload.signature) {
        throw new Error("Invalid QR format. Missing data or signature.");
      }
      
      setScanResult(payload);
      setVerificationStatus('pending');
      
      // 1. Verify Signature
      const jwk = JSON.parse(pubKeyString);
      const publicKey = await importPublicKey(jwk);
      
      const isValid = await verifySignature(publicKey, payload.data, payload.signature);
      
      if (isValid) {
        setVerificationStatus('valid');
        // 2. Proceed to URL Analysis
        const analysis = analyzeURL(payload.data);
        setAnalysisResult(analysis);
      } else {
        setVerificationStatus('invalid');
      }
      
    } catch (err) {
      console.error(err);
      setError('Failed to parse or verify QR code: ' + err.message);
      setVerificationStatus('invalid');
    }
  };

  const onScanFailure = (error) => {
    // Ignore frequent scan failures
  };

  const getRiskIcon = (level) => {
    switch(level) {
      case 'Safe': return <ShieldCheck className="text-success" size={48} />;
      case 'Suspicious': return <AlertTriangle className="text-warning" size={48} />;
      case 'Dangerous': return <XCircle className="text-danger" size={48} />;
      default: return null;
    }
  };

  return (
    <div className="scanner-container animate-fade-in">
      <div className="scanner-header">
        <h2>Secure Scanner</h2>
        <p>Scan and verify QR codes before accessing their content.</p>
      </div>

      <div className="scanner-content">
        <div className="setup-panel glass-card">
          <div className="panel-header">
            <Key className="text-accent-primary" size={24} />
            <h3>1. Setup Verifier</h3>
          </div>
          <div className="panel-body">
            <label className="input-label">Issuer Public Key (JWK JSON)</label>
            <textarea 
              className="input-field key-textarea" 
              placeholder='{"kty":"EC","crv":"P-256",...}'
              value={pubKeyString}
              onChange={(e) => setPubKeyString(e.target.value)}
            />
            {error && <div className="error-text">{error}</div>}
          </div>
        </div>

        <div className="scan-panel glass-card">
          <div className="panel-header">
            <Camera className="text-accent-secondary" size={24} />
            <h3>2. Scan QR Code</h3>
          </div>
          <div className="panel-body flex-center">
            {!isScanning && !scanResult && (
              <button className="btn btn-primary btn-large" onClick={startScanner}>
                <Camera size={20} /> Start Camera
              </button>
            )}

            {isScanning && (
              <div className="scanner-active">
                <div id="reader" className="qr-reader"></div>
                <button className="btn btn-secondary mt-4" onClick={stopScanner}>
                  Cancel Scan
                </button>
              </div>
            )}

            {scanResult && (
              <div className="result-card animate-fade-in">
                <div className="result-step">
                  <h4>Authentication Check</h4>
                  {verificationStatus === 'pending' && <p>Verifying signature...</p>}
                  {verificationStatus === 'valid' && (
                    <div className="status-badge bg-safe text-success">
                      <ShieldCheck size={20} /> Authentic (Signature Valid)
                    </div>
                  )}
                  {verificationStatus === 'invalid' && (
                    <div className="status-badge bg-dangerous text-danger">
                      <ShieldAlert size={20} /> Tampered or Fake QR Code
                    </div>
                  )}
                </div>

                {verificationStatus === 'valid' && analysisResult && (
                  <div className="result-step animate-fade-in animate-delay-1">
                    <h4>URL Threat Analysis</h4>
                    <div className={`analysis-box border-${analysisResult.riskLevel.toLowerCase()}`}>
                      <div className="analysis-header">
                        {getRiskIcon(analysisResult.riskLevel)}
                        <div className="analysis-score">
                          <span className={`risk-text text-${analysisResult.riskLevel.toLowerCase()}`}>
                            {analysisResult.riskLevel}
                          </span>
                          <span className="score-text">Risk Score: {analysisResult.score}/100</span>
                        </div>
                      </div>
                      
                      <div className="url-display">
                        <LinkIcon size={16} />
                        <span>{analysisResult.url}</span>
                      </div>

                      {analysisResult.reasons.length > 0 && (
                        <ul className="reasons-list">
                          {analysisResult.reasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      )}

                      <div className="action-buttons">
                        {analysisResult.riskLevel === 'Safe' ? (
                          <a href={analysisResult.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
                            <ExternalLink size={18} /> Proceed Safely
                          </a>
                        ) : analysisResult.riskLevel === 'Suspicious' ? (
                          <a href={analysisResult.url} target="_blank" rel="noopener noreferrer" className="btn btn-warning w-full">
                            <AlertTriangle size={18} /> Proceed with Caution
                          </a>
                        ) : (
                          <button className="btn btn-danger w-full" disabled>
                            <XCircle size={18} /> Blocked for Security
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <button className="btn btn-secondary mt-4 w-full" onClick={() => setScanResult(null)}>
                  Scan Another Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
