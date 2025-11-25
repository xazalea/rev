import React from 'react';

interface BrowserViewProps {
  url: string;
}

export function BrowserView({ url }: BrowserViewProps) {
  // BrowserView is handled by Electron's BrowserView API in the main process
  // This component just provides a placeholder/container
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

