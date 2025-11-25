import React, { useState, useEffect } from 'react';
import { Frame, RefreshCw, ExternalLink } from 'lucide-react';
import { IframeInfo } from '@lib/types';

export function IframeDetector() {
  const [iframes, setIframes] = useState<IframeInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const scanForIframes = async () => {
    if (!window.electronAPI) return;
    
    setIsScanning(true);
    try {
      const result = await window.electronAPI.findIframes();
      setIframes(result.iframes);
    } catch (error) {
      console.error('Failed to scan for iframes:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanForIframes();
    // Rescan periodically
    const interval = setInterval(scanForIframes, 5000);
    return () => clearInterval(interval);
  }, []);

  const openIframe = (src: string) => {
    if (src && window.electronAPI) {
      window.electronAPI.navigateTo(src);
    }
  };

  return (
    <div className="iframe-detector">
      <div className="detector-header">
        <h2>
          <Frame size={20} />
          Iframe Detector
        </h2>
        <button onClick={scanForIframes} disabled={isScanning} className="scan-btn">
          <RefreshCw size={16} className={isScanning ? 'spinning' : ''} />
          {isScanning ? 'Scanning...' : 'Scan Again'}
        </button>
      </div>
      <div className="detector-content">
        {iframes.length === 0 ? (
          <div className="empty-state">
            <Frame size={48} />
            <p>No iframes detected on the current page.</p>
          </div>
        ) : (
          <div className="iframes-list">
            {iframes.map((iframe, index) => (
              <div key={index} className="iframe-item">
                <div className="iframe-info">
                  <div className="iframe-src">
                    <strong>Source:</strong>
                    <code>{iframe.src || '(empty)'}</code>
                  </div>
                  {iframe.id && (
                    <div className="iframe-id">
                      <strong>ID:</strong> <code>{iframe.id}</code>
                    </div>
                  )}
                  {iframe.name && (
                    <div className="iframe-name">
                      <strong>Name:</strong> <code>{iframe.name}</code>
                    </div>
                  )}
                  {(iframe.width || iframe.height) && (
                    <div className="iframe-dimensions">
                      <strong>Dimensions:</strong>{' '}
                      <code>
                        {iframe.width || 'auto'} × {iframe.height || 'auto'}
                      </code>
                    </div>
                  )}
                </div>
                {iframe.src && (
                  <button
                    onClick={() => openIframe(iframe.src)}
                    className="open-btn"
                    title="Open in browser"
                  >
                    <ExternalLink size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

