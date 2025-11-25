import React, { useState } from 'react';
import { NetworkInspector } from './components/NetworkInspector';
import { ScriptInjector } from './components/ScriptInjector';
import { APIKeyFinder } from './components/APIKeyFinder';
import { IframeDetector } from './components/IframeDetector';
import { UICopier } from './components/UICopier';
import { AgenticEngine } from './components/AgenticEngine';
import { BrowserView } from './components/BrowserView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NetworkRequest } from '@lib/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('agentic');
  const [url, setUrl] = useState<string>('https://example.com');
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);

  const handleNetworkRequest = (data: any) => {
    setNetworkRequests((prev) => [...prev, data]);
  };

  const handleNetworkResponse = (data: any) => {
    setNetworkRequests((prev) =>
      prev.map((req) =>
        req.id === data.id ? { ...req, ...data } : req
      )
    );
  };

  React.useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onNetworkRequest(handleNetworkRequest);
      window.electronAPI.onNetworkResponse(handleNetworkResponse);

      return () => {
        window.electronAPI.removeNetworkListeners();
      };
    }
  }, []);

  React.useEffect(() => {
    if (url && window.electronAPI) {
      window.electronAPI.navigateTo(url);
    }
  }, [url]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'agentic':
        return <AgenticEngine />;
      case 'network':
        return <NetworkInspector requests={networkRequests} />;
      case 'injector':
        return <ScriptInjector />;
      case 'api-keys':
        return <APIKeyFinder />;
      case 'iframes':
        return <IframeDetector />;
      case 'ui-copier':
        return <UICopier />;
      default:
        return <AgenticEngine />;
    }
  };

  return (
    <div className="app">
      <Header url={url} setUrl={setUrl} />
      <div className="app-content">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="main-panel">
          <BrowserView url={url} />
          <div className="tools-panel">{renderActiveTab()}</div>
        </div>
      </div>
    </div>
  );
}

