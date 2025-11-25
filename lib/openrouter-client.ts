/**
 * OpenRouter API Client for Agentic Reasoning
 * https://openrouter.ai
 */

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterStreamChunk {
  id: string;
  model: string;
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason?: string;
  }>;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private defaultModel = 'openai/gpt-4o';
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || this.defaultModel;
  }

  setModel(model: string) {
    this.model = model;
  }

  /**
   * Send a chat completion request
   */
  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'rev. - Reverse Engineering Tool',
      },
      body: JSON.stringify({
        model: request.model || this.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${error}`);
    }

    return await response.json();
  }

  /**
   * Send a streaming chat completion request
   */
  async *chatStream(request: OpenRouterRequest): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'rev. - Reverse Engineering Tool',
      },
      body: JSON.stringify({
        model: request.model || this.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${error}`);
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
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          
          if (data === '[DONE]') {
            return;
          }

          try {
            const chunk: OpenRouterStreamChunk = JSON.parse(data);
            const content = chunk.choices[0]?.delta?.content;
            
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Reason about a problem (wrapper for chat)
   */
  async reason(prompt: string, context?: string): Promise<{
    verdict: string;
    content: string;
    confidence: number;
  }> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are an expert reverse engineering agent. Analyze the problem and provide structured reasoning with a clear verdict, detailed content, and confidence score (0-1).`,
      },
      {
        role: 'user',
        content: context 
          ? `Context: ${context}\n\nProblem: ${prompt}\n\nProvide reasoning with verdict, content, and confidence.`
          : `Problem: ${prompt}\n\nProvide reasoning with verdict, content, and confidence.`,
      },
    ];

    const response = await this.chat({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Parse the response to extract verdict, content, and confidence
    // Try to extract structured data, fallback to parsing
    let verdict = content;
    let confidence = 0.7;
    
    // Try to extract JSON if present
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        verdict = parsed.verdict || parsed.answer || content;
        confidence = parsed.confidence || 0.7;
      } catch {
        // Not valid JSON, use content as-is
      }
    }

    // Extract confidence if mentioned
    const confidenceMatch = content.match(/confidence[:\s]+([0-9.]+)/i);
    if (confidenceMatch) {
      confidence = parseFloat(confidenceMatch[1]);
      if (confidence > 1) confidence = confidence / 100;
    }

    return {
      verdict: verdict.substring(0, 500),
      content,
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  }
}

