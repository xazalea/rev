/**
 * Web shim for Electron APIs
 * Provides web-compatible implementations when running in browser
 */

export const isElectron = typeof window !== 'undefined' && (window as any).electronAPI !== undefined;

export const webShim = {
  // Mock Electron API for web environment
  electronAPI: isElectron ? (window as any).electronAPI : {
    injectScript: async (script: string) => {
      // In web mode, we can inject into an iframe or use eval (with caution)
      try {
        // Try to inject into the current page context
        if (typeof eval !== 'undefined') {
          eval(script);
          return { success: true };
        }
        return { success: false, error: 'Script injection not available in web mode' };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },
    
    navigateTo: async (url: string) => {
      // In web mode, open in new window or iframe
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
        return { success: true };
      }
      return { success: false };
    },
    
    getPageContent: async () => {
      // In web mode, get current page content
      if (typeof document !== 'undefined') {
        return { html: document.documentElement.outerHTML };
      }
      return { html: '' };
    },
    
    findAPIKeys: async () => {
      // In web mode, search current page
      if (typeof document !== 'undefined') {
        const keys: any[] = [];
        const patterns = [
          /api[_-]?key["'\s:=]+([a-zA-Z0-9_\-]{20,})/gi,
          /apikey["'\s:=]+([a-zA-Z0-9_\-]{20,})/gi,
          /secret[_-]?key["'\s:=]+([a-zA-Z0-9_\-]{20,})/gi,
          /access[_-]?token["'\s:=]+([a-zA-Z0-9_\-]{20,})/gi,
        ];
        
        const text = document.body.innerText + ' ' + document.documentElement.innerHTML;
        patterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(text)) !== null) {
            keys.push({ type: pattern.source, value: match[1] });
          }
        });
        
        return { keys };
      }
      return { keys: [] };
    },
    
    findIframes: async () => {
      // In web mode, find iframes in current page
      if (typeof document !== 'undefined') {
        const iframes = Array.from(document.querySelectorAll('iframe')).map(iframe => ({
          src: iframe.src,
          id: iframe.id,
          name: iframe.name,
          width: iframe.width,
          height: iframe.height,
        }));
        return { iframes };
      }
      return { iframes: [] };
    },
    
    onNetworkRequest: (callback: (data: any) => void) => {
      // In web mode, use Performance API or Service Worker
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        // Monitor resource timing
        try {
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry: any) => {
              if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
                callback({
                  id: Date.now(),
                  url: entry.name,
                  method: 'GET',
                  timestamp: entry.startTime,
                  type: 'request',
                });
              }
            });
          });
          observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
          console.warn('PerformanceObserver not available');
        }
      }
    },
    
    onNetworkResponse: (callback: (data: any) => void) => {
      // Similar to onNetworkRequest
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry: any) => {
              if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
                callback({
                  id: Date.now(),
                  url: entry.name,
                  statusCode: 200,
                  timestamp: entry.responseEnd,
                  type: 'response',
                });
              }
            });
          });
          observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
          console.warn('PerformanceObserver not available');
        }
      }
    },
    
    removeNetworkListeners: () => {
      // Cleanup if needed
    },
  },
};

// Inject web shim if not in Electron
if (typeof window !== 'undefined' && !isElectron) {
  (window as any).electronAPI = webShim.electronAPI;
}

