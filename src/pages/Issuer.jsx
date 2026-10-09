import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Key, Link as LinkIcon, Download, RefreshCw, QrCode } from 'lucide-react';
import { generateKeyPair, exportPublicKey, exportPrivateKey, signData } from '../utils/crypto';
import '../styles/issuer.css';

export default function Issuer() {
  const [keys, setKeys] = useState({ publicKey: null, privateKey: null });
  const [keyStrings, setKeyStrings] = useState({ pub: '', priv: '' });
  const [urlData, setUrlData] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateKeys = async () => {
    try {
      setIsGenerating(true);
      const keyPair = await generateKeyPair();
      const pub = await exportPublicKey(keyPair.publicKey);
      const priv = await exportPrivateKey(keyPair.privateKey);
      
      setKeys({ publicKey: keyPair.publicKey, privateKey: keyPair.privateKey });
      setKeyStrings({ 
        pub: JSON.stringify(pub), 
        priv: JSON.stringify(priv) 
      });
      setError('');
    } catch (err) {
      setError('Failed to generate keys.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!urlData) {
      setError('Please enter a URL or data.');
      return;
    }
    if (!keys.privateKey) {
      setError('Please generate keys first.');
      return;
    }

    try {
      // 1. Sign data
      const signature = await signData(keys.privateKey, urlData);
      
      // 2. Prepare payload
      const payload = {
        data: urlData,
        signature: signature
      };
      
      // 3. Generate QR code
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
        width: 200,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
      setError('');
    } catch (err) {
      setError('Failed to generate secure QR code.');
      console.error(err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = 'secure-qr.png';
    a.click();
  };

  return (
    <div className="issuer-container animate-fade-in">
      <div className="issuer-header">
        <h2>Issuer Dashboard</h2>
        <p>Generate cryptographic keys and create verifiable QR codes.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="issuer-content">
        <div className="panel glass-card">
          <div className="panel-header">
            <Key className="text-accent-primary" size={24} />
            <h3>Key Management</h3>
          </div>
          <div className="panel-body">
            <button 
              className="btn btn-primary w-full" 
              onClick={handleGenerateKeys}
              disabled={isGenerating}
            >
              <RefreshCw size={18} className={isGenerating ? 'spin' : ''} />
              {isGenerating ? 'Generating...' : 'Generate New Key Pair'}
            </button>

            {keyStrings.pub && (
              <div className="keys-display animate-fade-in">
                <div className="key-box">
                  <label className="input-label">Public Key (Share with verifiers)</label>
                  <textarea 
                    className="input-field key-textarea" 
                    readOnly 
                    value={keyStrings.pub}
                  />
                </div>
                <div className="key-box">
                  <label className="input-label">Private Key (Keep secret!)</label>
                  <textarea 
                    className="input-field key-textarea text-danger" 
                    readOnly 
                    value={keyStrings.priv}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel glass-card">
          <div className="panel-header">
            <QrCode className="text-accent-secondary" size={24} />
            <h3>Secure QR Generator</h3>
          </div>
          <div className="panel-body">
            <div className="input-group">
              <label className="input-label">Target URL / Data</label>
              <div className="input-with-icon">
                <LinkIcon size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="input-field with-icon" 
                  placeholder="https://example.com"
                  value={urlData}
                  onChange={(e) => setUrlData(e.target.value)}
                />
              </div>
            </div>

            <button 
              className="btn btn-primary w-full"
              onClick={handleGenerateQR}
            >
              Generate Secure QR
            </button>

            {qrCodeUrl && (
              <div className="qr-result animate-fade-in">
                <img src={qrCodeUrl} alt="Secure QR Code" className="qr-image" />
                <button className="btn btn-secondary" onClick={handleDownloadQR}>
                  <Download size={18} /> Download QR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
