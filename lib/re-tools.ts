/**
 * Reverse Engineering Tools Library
 * Tools that agents can use to accomplish goals
 */

export interface Tool {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

class RETools {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  private registerDefaultTools() {
    // Network Monitor Tool
    this.registerTool({
      name: 'network-monitor',
      description: 'Monitor and intercept network requests',
      execute: async (params: { url: string; duration?: number }) => {
        return new Promise((resolve) => {
          // This will be called from the main process
          if (typeof window !== 'undefined' && (window as any).electronAPI) {
            const requests: any[] = [];
            const handler = (data: any) => {
              requests.push(data);
            };
            
            (window as any).electronAPI.onNetworkRequest(handler);
            
            setTimeout(() => {
              (window as any).electronAPI.removeNetworkListeners();
              resolve({
                success: true,
                data: requests,
                metadata: { count: requests.length },
              });
            }, params.duration || 10000);
          } else {
            resolve({
              success: false,
              error: 'Electron API not available',
            });
          }
        });
      },
    });

    // Script Injector Tool
    this.registerTool({
      name: 'script-injector',
      description: 'Inject JavaScript code into the page',
      execute: async (params: { script: string; url?: string }) => {
        if (typeof window === 'undefined' || !(window as any).electronAPI) {
          return { success: false, error: 'Electron API not available' };
        }

        try {
          await (window as any).electronAPI.injectScript(params.script);
          return {
            success: true,
            data: { injected: true },
            metadata: { scriptLength: params.script.length },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });

    // DOM Analyzer Tool
    this.registerTool({
      name: 'dom-analyzer',
      description: 'Analyze DOM structure and extract information',
      execute: async (params: { url: string; selectors?: string[] }) => {
        if (typeof window === 'undefined' || !(window as any).electronAPI) {
          return { success: false, error: 'Electron API not available' };
        }

        try {
          const content = await (window as any).electronAPI.getPageContent();
          
          // Parse and analyze DOM
          const parser = new DOMParser();
          const doc = parser.parseFromString(content.html, 'text/html');
          
          const analysis: any = {
            title: doc.title,
            links: Array.from(doc.querySelectorAll('a')).map(a => ({
              href: a.href,
              text: a.textContent,
            })),
            scripts: Array.from(doc.querySelectorAll('script')).map(s => ({
              src: s.src,
              type: s.type,
            })),
            forms: Array.from(doc.querySelectorAll('form')).map(f => ({
              action: f.action,
              method: f.method,
              inputs: Array.from(f.querySelectorAll('input')).map(i => ({
                type: i.type,
                name: i.name,
                id: i.id,
              })),
            })),
          };

          if (params.selectors) {
            analysis.selected = {};
            params.selectors.forEach(selector => {
              const elements = doc.querySelectorAll(selector);
              analysis.selected[selector] = Array.from(elements).map((el: any) => ({
                tag: el.tagName,
                text: el.textContent?.substring(0, 100),
                attributes: Array.from(el.attributes).map((attr: any) => ({
                  name: attr.name,
                  value: attr.value,
                })),
              }));
            });
          }

          return {
            success: true,
            data: analysis,
            metadata: {
              linkCount: analysis.links.length,
              scriptCount: analysis.scripts.length,
              formCount: analysis.forms.length,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });

    // API Key Finder Tool
    this.registerTool({
      name: 'api-key-finder',
      description: 'Find API keys, tokens, and secrets',
      execute: async (params: { url: string }) => {
        if (typeof window === 'undefined' || !(window as any).electronAPI) {
          return { success: false, error: 'Electron API not available' };
        }

        try {
          const result = await (window as any).electronAPI.findAPIKeys();
          return {
            success: true,
            data: result.keys,
            metadata: { count: result.keys.length },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });

    // Iframe Detector Tool
    this.registerTool({
      name: 'iframe-detector',
      description: 'Detect and analyze iframes',
      execute: async (params: { url: string }) => {
        if (typeof window === 'undefined' || !(window as any).electronAPI) {
          return { success: false, error: 'Electron API not available' };
        }

        try {
          const result = await (window as any).electronAPI.findIframes();
          return {
            success: true,
            data: result.iframes,
            metadata: { count: result.iframes.length },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });

    // UI Extractor Tool
    this.registerTool({
      name: 'ui-extractor',
      description: 'Extract UI components and styles',
      execute: async (params: { url: string; selector?: string }) => {
        if (typeof window === 'undefined' || !(window as any).electronAPI) {
          return { success: false, error: 'Electron API not available' };
        }

        try {
          const content = await (window as any).electronAPI.getPageContent();
          const parser = new DOMParser();
          const doc = parser.parseFromString(content.html, 'text/html');
          
          const extractor = (element: Element) => {
            const styles = typeof window !== 'undefined' && window.getComputedStyle ? 
              (element as any).getComputedStyle?.() : null;
            
            return {
              tag: element.tagName,
              id: element.id,
              classes: Array.from(element.classList),
              text: element.textContent?.substring(0, 200),
              html: element.outerHTML.substring(0, 1000),
              styles: styles && typeof document !== 'undefined' && document.defaultView ? 
                Object.fromEntries(
                  Array.from(document.defaultView.getComputedStyle(element) || [])
                    .map(prop => [prop, (document.defaultView.getComputedStyle(element) as any)[prop]])
                ) : null,
            };
          };

          if (params.selector) {
            const elements = doc.querySelectorAll(params.selector);
            return {
              success: true,
              data: Array.from(elements).map(extractor),
              metadata: { count: elements.length },
            };
          }

          // Extract all interactive elements
          const interactive = Array.from(doc.querySelectorAll('button, a, input, select, textarea'));
          return {
            success: true,
            data: interactive.map(extractor),
            metadata: { count: interactive.length },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });

    // General Explorer Tool
    this.registerTool({
      name: 'general-explorer',
      description: 'General exploration tool that combines multiple techniques',
      execute: async (params: { url: string; objective: string }) => {
        // Use multiple tools in sequence
        const tools = this.getAllTools();
        const results: any = {};

        for (const tool of tools) {
          if (tool.name !== 'general-explorer') {
            try {
              const result = await tool.execute({ url: params.url });
              results[tool.name] = result;
            } catch (error) {
              results[tool.name] = { error: error instanceof Error ? error.message : 'Unknown' };
            }
          }
        }

        return {
          success: true,
          data: results,
          metadata: { toolsUsed: Object.keys(results).length },
        };
      },
    });

    // Hex Editor Helper Tool
    this.registerTool({
      name: 'hex-analyzer',
      description: 'Analyze binary data in hex format',
      execute: async (params: { data: string | ArrayBuffer }) => {
        let buffer: ArrayBuffer;
        
        if (typeof params.data === 'string') {
          buffer = new TextEncoder().encode(params.data).buffer;
        } else {
          buffer = params.data;
        }

        const view = new Uint8Array(buffer);
        const hex = Array.from(view)
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');

        return {
          success: true,
          data: {
            hex,
            length: buffer.byteLength,
            preview: hex.substring(0, 100),
          },
        };
      },
    });

    // Endpoint Enumerator Tool
    this.registerTool({
      name: 'endpoint-enumerator',
      description: 'Enumerate API endpoints by analyzing network traffic and scripts',
      execute: async (params: { url: string }) => {
        if (typeof window === 'undefined' || !(window as any).electronAPI) {
          return { success: false, error: 'Electron API not available' };
        }

        try {
          // Get page content
          const content = await (window as any).electronAPI.getPageContent();
          const parser = new DOMParser();
          const doc = parser.parseFromString(content.html, 'text/html');

          // Extract endpoints from scripts
          const scripts = Array.from(doc.querySelectorAll('script'));
          const endpoints: Set<string> = new Set();

          scripts.forEach(script => {
            const text = script.textContent || '';
            // Look for common endpoint patterns
            const patterns = [
              /['"](https?:\/\/[^'"]+api[^'"]*)['"]/gi,
              /['"](\/api\/[^'"]+)['"]/gi,
              /fetch\(['"]([^'"]+)['"]/gi,
              /axios\.(get|post|put|delete)\(['"]([^'"]+)['"]/gi,
              /\.ajax\([^,]*url:\s*['"]([^'"]+)['"]/gi,
            ];

            patterns.forEach(pattern => {
              let match;
              while ((match = pattern.exec(text)) !== null) {
                const endpoint = match[1] || match[2];
                if (endpoint) {
                  endpoints.add(endpoint);
                }
              }
            });
          });

          return {
            success: true,
            data: Array.from(endpoints),
            metadata: { count: endpoints.size },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });
  }
}

export const reTools = new RETools();

