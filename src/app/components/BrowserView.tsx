import React from 'react';

interface BrowserViewProps {
  url: string;
}

export function BrowserView({ url }: BrowserViewProps) {
  // In Electron mode, BrowserView is handled by Electron's BrowserView API
  // In web mode, show iframe or placeholder
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;
  
  if (isElectron) {
    return (
      <div className="browser-view">
        <div className="browser-placeholder">
          {url ? (
            <>
              <p>Loading: {url}</p>
              <small>Browser view is embedded via Electron</small>
            </>
          ) : (
            <p>Enter a URL to start analyzing</p>
          )}
        </div>
      </div>
    );
  }

  // Web mode: use iframe
  return (
    <div className="browser-view">
      {url ? (
        <iframe
          src={url}
          className="browser-iframe"
          title="Browser View"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      ) : (
        <div className="browser-placeholder">
          <p>Enter a URL to start analyzing</p>
        </div>
      )}
    </div>
  );
}

