/**
 * Web-compatible tools for browser environment
 * These tools work without Electron APIs
 */

export interface WebTool {
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

class WebTools {
  private tools: Map<string, WebTool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  registerTool(tool: WebTool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): WebTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): WebTool[] {
    return Array.from(this.tools.values());
  }

  private registerDefaultTools() {
    // URL Analyzer Tool (web-compatible)
    this.registerTool({
      name: 'url-analyzer',
      description: 'Analyze URL structure and fetch page information',
      execute: async (params: { url: string }) => {
        try {
          // Use CORS proxy or direct fetch if CORS allows
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(params.url)}`;
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/html',
            },
          });

          if (!response.ok) {
            return {
              success: false,
              error: `Failed to fetch: ${response.status}`,
            };
          }

          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          return {
            success: true,
            data: {
              title: doc.title,
              url: params.url,
              links: Array.from(doc.querySelectorAll('a')).slice(0, 50).map(a => ({
                href: a.href,
                text: a.textContent?.substring(0, 100),
              })),
              scripts: Array.from(doc.querySelectorAll('script')).map(s => ({
                src: s.src,
                type: s.type,
                inline: !s.src ? s.textContent?.substring(0, 500) : null,
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
            },
            metadata: {
              linkCount: doc.querySelectorAll('a').length,
              scriptCount: doc.querySelectorAll('script').length,
              formCount: doc.querySelectorAll('form').length,
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

    // API Endpoint Extractor (web-compatible)
    this.registerTool({
      name: 'endpoint-extractor',
      description: 'Extract API endpoints from page scripts',
      execute: async (params: { url: string }) => {
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(params.url)}`;
          const response = await fetch(proxyUrl);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const scripts = Array.from(doc.querySelectorAll('script'));
          const endpoints: Set<string> = new Set();

          scripts.forEach(script => {
            const text = script.textContent || '';
            const patterns = [
              /['"](https?:\/\/[^'"]+api[^'"]*)['"]/gi,
              /['"](\/api\/[^'"]+)['"]/gi,
              /fetch\(['"]([^'"]+)['"]/gi,
              /axios\.(get|post|put|delete)\(['"]([^'"]+)['"]/gi,
              /\.ajax\([^,]*url:\s*['"]([^'"]+)['"]/gi,
              /url:\s*['"]([^'"]+)['"]/gi,
            ];

            patterns.forEach(pattern => {
              let match;
              while ((match = pattern.exec(text)) !== null) {
                const endpoint = match[1] || match[2];
                if (endpoint && !endpoint.startsWith('javascript:')) {
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

    // DOM Structure Analyzer (web-compatible)
    this.registerTool({
      name: 'dom-structure-analyzer',
      description: 'Analyze DOM structure from fetched HTML',
      execute: async (params: { url: string; selectors?: string[] }) => {
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(params.url)}`;
          const response = await fetch(proxyUrl);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const analysis: any = {
            title: doc.title,
            metaTags: Array.from(doc.querySelectorAll('meta')).map(m => ({
              name: m.getAttribute('name') || m.getAttribute('property'),
              content: m.getAttribute('content'),
            })),
            headings: {
              h1: Array.from(doc.querySelectorAll('h1')).map(h => h.textContent),
              h2: Array.from(doc.querySelectorAll('h2')).map(h => h.textContent),
            },
            interactiveElements: {
              buttons: Array.from(doc.querySelectorAll('button')).length,
              links: Array.from(doc.querySelectorAll('a')).length,
              inputs: Array.from(doc.querySelectorAll('input')).length,
              forms: Array.from(doc.querySelectorAll('form')).length,
            },
          };

          if (params.selectors) {
            analysis.selected = {};
            params.selectors.forEach(selector => {
              const elements = doc.querySelectorAll(selector);
              analysis.selected[selector] = Array.from(elements).map((el: any) => ({
                tag: el.tagName,
                text: el.textContent?.substring(0, 200),
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
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });

    // Network Request Simulator (web-compatible)
    this.registerTool({
      name: 'request-simulator',
      description: 'Simulate and test API requests',
      execute: async (params: { url: string; method?: string; headers?: Record<string, string> }) => {
        try {
          const method = params.method || 'GET';
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(params.url)}`;
          
          const response = await fetch(proxyUrl, {
            method,
            headers: params.headers || {},
          });

          const data = await response.text();
          
          return {
            success: true,
            data: {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              body: data.substring(0, 10000), // Limit response size
            },
            metadata: {
              url: params.url,
              method,
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
  }
}

export const webTools = new WebTools();

