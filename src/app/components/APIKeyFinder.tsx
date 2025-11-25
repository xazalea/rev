import React, { useState, useEffect } from 'react';
import { Key, Search, Copy, RefreshCw } from 'lucide-react';
import { APIKey } from '@lib/types';

export function APIKeyFinder() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const scanForKeys = async () => {
    if (!window.electronAPI) return;
    
    setIsScanning(true);
    try {
      const result = await window.electronAPI.findAPIKeys();
      setKeys(result.keys);
    } catch (error) {
      console.error('Failed to scan for API keys:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanForKeys();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const filteredKeys = keys.filter((key) =>
    key.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="api-key-finder">
      <div className="finder-header">
        <h2>
          <Key size={20} />
          API Key Finder
        </h2>
        <div className="finder-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={scanForKeys} disabled={isScanning} className="scan-btn">
            <RefreshCw size={16} className={isScanning ? 'spinning' : ''} />
            {isScanning ? 'Scanning...' : 'Scan Again'}
          </button>
        </div>
      </div>
      <div className="finder-content">
        {filteredKeys.length === 0 ? (
          <div className="empty-state">
            <Key size={48} />
            <p>No API keys found. Click "Scan Again" to search the current page.</p>
          </div>
        ) : (
          <div className="keys-list">
            {filteredKeys.map((key, index) => (
              <div key={index} className="key-item">
                <div className="key-info">
                  <div className="key-type">
                    <code>{key.type}</code>
                  </div>
                  <div className="key-value">
                    <code>{key.value}</code>
                  </div>
                  {key.location && (
                    <div className="key-location">
                      <small>Found in: {key.location}</small>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => copyToClipboard(key.value)}
                  className="copy-btn"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

