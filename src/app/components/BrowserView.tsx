import React, { useState, useEffect } from 'react';
import { isElectron } from '@lib/web-shim';

interface BrowserViewProps {
  url: string;
}

export function BrowserView({ url }: BrowserViewProps) {
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (url) {
      setIframeKey(prev => prev + 1);
    }
  }, [url]);

  if (isElectron) {
    // In Electron, BrowserView is handled by main process
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
          key={iframeKey}
          src={url}
          className="browser-iframe"
          title="Browser View"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: 'white',
          }}
        />
      ) : (
        <div className="browser-placeholder">
          <p>Enter a URL to start analyzing</p>
        </div>
      )}
    </div>
  );
}

