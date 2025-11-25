export interface NetworkRequest {
  id: number;
  url: string;
  method: string;
  timestamp: number;
  type: 'request' | 'response';
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  statusCode?: number;
  statusLine?: string;
}

export interface APIKey {
  type: string;
  value: string;
  location?: string;
}

export interface IframeInfo {
  src: string;
  id: string;
  name: string;
  width: string;
  height: string;
}

export interface ElectronAPI {
  injectScript: (script: string) => Promise<{ success: boolean }>;
  navigateTo: (url: string) => Promise<{ success: boolean }>;
  getPageContent: () => Promise<{ html: string }>;
  findAPIKeys: () => Promise<{ keys: APIKey[] }>;
  findIframes: () => Promise<{ iframes: IframeInfo[] }>;
  onNetworkRequest: (callback: (data: NetworkRequest) => void) => void;
  onNetworkResponse: (callback: (data: NetworkRequest) => void) => void;
  removeNetworkListeners: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

