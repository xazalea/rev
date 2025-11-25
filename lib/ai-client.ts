/**
 * AI Client for gpt4free-ts integration
 * Make sure gpt4free-ts server is running on http://localhost:3000
 */

export interface AIRequest {
  prompt: string | Array<{ role: string; content: string }>;
  model?: string;
  site?: string;
}

export interface AIResponse {
  content: string;
  error?: string;
}

export interface StreamChunk {
  content?: string;
  error?: string;
  done?: boolean;
}

const DEFAULT_AI_SERVER = 'http://localhost:3000';
const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_SITE = 'you';

export class AIClient {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_AI_SERVER) {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a chat request and get a complete response
   */
  async ask(request: AIRequest): Promise<AIResponse> {
    const { prompt, model = DEFAULT_MODEL, site = DEFAULT_SITE } = request;
    
    const promptParam = typeof prompt === 'string' 
      ? prompt 
      : JSON.stringify(prompt);

    const url = new URL(`${this.baseUrl}/ask`);
    url.searchParams.set('prompt', promptParam);
    url.searchParams.set('model', model);
    url.searchParams.set('site', site);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`AI server error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send a chat request with streaming response
   */
  async *askStream(request: AIRequest): AsyncGenerator<StreamChunk, void, unknown> {
    const { prompt, model = DEFAULT_MODEL, site = DEFAULT_SITE } = request;
    
    const promptParam = typeof prompt === 'string' 
      ? prompt 
      : JSON.stringify(prompt);

    const url = new URL(`${this.baseUrl}/ask/stream`);
    url.searchParams.set('prompt', promptParam);
    url.searchParams.set('model', model);
    url.searchParams.set('site', site);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'text/event-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`AI server error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.substring(7).trim();
            
            if (eventType === 'done') {
              yield { done: true };
              return;
            }
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.error) {
                yield { error: data.error };
                return;
              }
              
              if (data.content) {
                yield { content: data.content };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      yield {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check if the AI server is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/supports`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get available sites and models
   */
  async getSupports(): Promise<Array<{ site: string; models: string[] }>> {
    try {
      const response = await fetch(`${this.baseUrl}/supports`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data;
    } catch {
      return [];
    }
  }
}

export const aiClient = new AIClient();

