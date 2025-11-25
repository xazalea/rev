/**
 * Agentic Reasoning Engine powered by OpenRouter
 * Specialized agents for reverse engineering tasks
 */

import { OpenRouterClient } from './openrouter-client';

let openRouterClient: OpenRouterClient | null = null;

export interface AgentGoal {
  url: string;
  objective: string;
  specialization?: AgentSpecialization;
}

export type AgentSpecialization =
  | 'api-discovery'
  | 'vulnerability-scanning'
  | 'script-generation'
  | 'ui-replication'
  | 'authentication-bypass'
  | 'data-extraction'
  | 'endpoint-enumeration'
  | 'general';

export interface AgentAction {
  type: string;
  tool: string;
  parameters: Record<string, any>;
  reasoning: string;
}

export interface AgentStep {
  step: number;
  action: AgentAction;
  result: any;
  success: boolean;
  error?: string;
  nextStrategy?: string;
}

export interface AgentExecution {
  goal: AgentGoal;
  steps: AgentStep[];
  currentStrategy: string;
  status: 'planning' | 'executing' | 'verifying' | 'completed' | 'failed';
  result?: any;
  confidence?: number;
}

class AgenticEngine {
  private initialized = false;
  private currentExecution: AgentExecution | null = null;
  private model: string = 'openai/gpt-4o';

  async initialize(apiKey: string, model?: string) {
    if (this.initialized && openRouterClient) {
      if (model && openRouterClient) {
        openRouterClient.setModel(model);
        this.model = model;
      }
      return;
    }

    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    this.model = model || 'openai/gpt-4o';
    openRouterClient = new OpenRouterClient(apiKey, this.model);
    this.initialized = true;
  }

  /**
   * Create a reasoning prompt for the agent based on goal and specialization
   */
  private createReasoningPrompt(goal: AgentGoal, context: any): string {
    const specialization = goal.specialization || 'general';
    
    const specializationPrompts: Record<AgentSpecialization, string> = {
      'api-discovery': `You are an API discovery agent. Your goal is to find hidden APIs, endpoints, and undocumented functionality on ${goal.url}. 
Objective: ${goal.objective}
Context: ${JSON.stringify(context)}
Reason through: What network requests should I intercept? What scripts should I inject to discover APIs? What patterns indicate hidden endpoints?`,
      
      'vulnerability-scanning': `You are a vulnerability scanning agent. Your goal is to find security vulnerabilities on ${goal.url}.
Objective: ${goal.objective}
Context: ${JSON.stringify(context)}
Reason through: What security issues should I check? What injection points exist? What authentication mechanisms can be bypassed?`,
      
      'script-generation': `You are a script generation agent. Your goal is to create JavaScript code to accomplish ${goal.objective} on ${goal.url}.
Context: ${JSON.stringify(context)}
Reason through: What JavaScript code will accomplish this? What APIs need to be intercepted? What DOM manipulation is needed?`,
      
      'ui-replication': `You are a UI replication agent. Your goal is to extract and replicate UI components from ${goal.url}.
Objective: ${goal.objective}
Context: ${JSON.stringify(context)}
Reason through: What elements should I extract? What CSS is needed? What JavaScript interactions must be replicated?`,
      
      'authentication-bypass': `You are an authentication bypass agent. Your goal is to find ways around authentication on ${goal.url}.
Objective: ${goal.objective}
Context: ${JSON.stringify(context)}
Reason through: What authentication mechanisms exist? What tokens or sessions are used? What endpoints can be accessed without auth?`,
      
      'data-extraction': `You are a data extraction agent. Your goal is to extract specific data from ${goal.url}.
Objective: ${goal.objective}
Context: ${JSON.stringify(context)}
Reason through: Where is the data located? What APIs provide it? What scripts can extract it?`,
      
      'endpoint-enumeration': `You are an endpoint enumeration agent. Your goal is to discover all API endpoints on ${goal.url}.
Objective: ${goal.objective}
Context: ${JSON.stringify(context)}
Reason through: What endpoints exist? How can I discover them? What patterns indicate API routes?`,
      
      'general': `You are a reverse engineering agent. Your goal is to accomplish ${goal.objective} on ${goal.url}.
Context: ${JSON.stringify(context)}
Reason through: What steps are needed? What tools should I use? What strategies might work?`,
    };

    return specializationPrompts[specialization];
  }

  /**
   * Execute agentic reasoning to plan actions
   */
  async plan(goal: AgentGoal, context: any): Promise<AgentAction[]> {
    if (!this.initialized || !openRouterClient) {
      throw new Error('Agentic engine not initialized. Call initialize() with OpenRouter API key first.');
    }

    const prompt = this.createReasoningPrompt(goal, context);
    
    try {
      const reasoning = await openRouterClient.reason(prompt, JSON.stringify(context));
      
      // Parse the reasoning result to extract actions
      const actions = this.parseReasoningToActions(reasoning, goal);
      return actions;
    } catch (error) {
      console.error('Reasoning error:', error);
      return this.getFallbackActions(goal);
    }
  }

  /**
   * Parse OpenReason output into actionable steps
   */
  private parseReasoningToActions(reasoning: any, goal: AgentGoal): AgentAction[] {
    // OpenReason returns structured reasoning with verdict and steps
    // We convert this into agent actions
    const actions: AgentAction[] = [];
    
    // Extract the reasoning content
    const content = reasoning.verdict || reasoning.content || JSON.stringify(reasoning);
    
    // Use regex and heuristics to extract actions from reasoning
    // This is a simplified parser - in production, you'd want more sophisticated parsing
    
    // Strategy 1: Network interception
    if (content.includes('network') || content.includes('API') || content.includes('endpoint')) {
      actions.push({
        type: 'intercept',
        tool: 'network-monitor',
        parameters: { url: goal.url },
        reasoning: 'Monitor network traffic to discover APIs',
      });
    }

    // Strategy 2: Script injection
    if (content.includes('script') || content.includes('inject') || content.includes('JavaScript')) {
      actions.push({
        type: 'inject',
        tool: 'script-injector',
        parameters: { url: goal.url },
        reasoning: 'Inject scripts to discover functionality',
      });
    }

    // Strategy 3: DOM analysis
    if (content.includes('DOM') || content.includes('element') || content.includes('extract')) {
      actions.push({
        type: 'analyze',
        tool: 'dom-analyzer',
        parameters: { url: goal.url },
        reasoning: 'Analyze DOM structure',
      });
    }

    // Strategy 4: API key discovery
    if (content.includes('key') || content.includes('token') || content.includes('auth')) {
      actions.push({
        type: 'discover',
        tool: 'api-key-finder',
        parameters: { url: goal.url },
        reasoning: 'Find API keys and tokens',
      });
    }

    // If no specific actions found, use general strategy
    if (actions.length === 0) {
      actions.push({
        type: 'explore',
        tool: 'general-explorer',
        parameters: { url: goal.url, objective: goal.objective },
        reasoning: content,
      });
    }

    return actions;
  }

  /**
   * Fallback actions if reasoning fails
   */
  private getFallbackActions(goal: AgentGoal): AgentAction[] {
    return [
      {
        type: 'intercept',
        tool: 'network-monitor',
        parameters: { url: goal.url },
        reasoning: 'Default: Start with network monitoring',
      },
      {
        type: 'analyze',
        tool: 'dom-analyzer',
        parameters: { url: goal.url },
        reasoning: 'Default: Analyze page structure',
      },
    ];
  }

  /**
   * Execute an agent action using available tools
   */
  async executeAction(action: AgentAction, tools: any): Promise<any> {
    const tool = tools[action.tool];
    if (!tool) {
      throw new Error(`Tool ${action.tool} not available`);
    }

    return await tool.execute(action.parameters);
  }

  /**
   * Run full agentic execution with multiple strategies
   */
  async execute(goal: AgentGoal, tools: any, maxAttempts: number = 5): Promise<AgentExecution> {
    this.currentExecution = {
      goal,
      steps: [],
      currentStrategy: 'initial',
      status: 'planning',
    };

    let attempts = 0;
    let strategies = ['primary', 'alternative-1', 'alternative-2', 'brute-force', 'deep-analysis'];

    while (attempts < maxAttempts && this.currentExecution.status !== 'completed') {
      const strategy = strategies[attempts] || 'fallback';
      this.currentExecution.currentStrategy = strategy;

      try {
        // Get context from previous steps
        const context = {
          previousSteps: this.currentExecution.steps,
          currentStrategy: strategy,
          attempts,
        };

        // Plan actions using OpenReason
        this.currentExecution.status = 'planning';
        const actions = await this.plan(goal, context);

        // Execute actions
        this.currentExecution.status = 'executing';
        for (const action of actions) {
          try {
            const result = await this.executeAction(action, tools);
            
            this.currentExecution.steps.push({
              step: this.currentExecution.steps.length + 1,
              action,
              result,
              success: true,
            });

            // Check if goal is accomplished
            if (this.checkGoalAccomplished(goal, result)) {
              this.currentExecution.status = 'completed';
              this.currentExecution.result = result;
              this.currentExecution.confidence = this.calculateConfidence();
              return this.currentExecution;
            }
          } catch (error) {
            this.currentExecution.steps.push({
              step: this.currentExecution.steps.length + 1,
              action,
              result: null,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        // Verify results
        this.currentExecution.status = 'verifying';
        const verification = await this.verifyResults(goal, this.currentExecution.steps);
        
        if (verification.success) {
          this.currentExecution.status = 'completed';
          this.currentExecution.result = verification.result;
          this.currentExecution.confidence = verification.confidence;
          return this.currentExecution;
        }

        // If not successful, try next strategy
        attempts++;
        if (attempts < maxAttempts && openRouterClient) {
          // Use OpenRouter to determine next strategy
          const nextStrategyPrompt = `Previous attempts failed. Goal: ${goal.objective}. 
Previous steps: ${JSON.stringify(this.currentExecution.steps.slice(-3))}.
What alternative strategy should I try?`;
          
          try {
            const nextStrategy = await openRouterClient.reason(nextStrategyPrompt);
            strategies[attempts] = nextStrategy.verdict || `strategy-${attempts}`;
          } catch {
            // Continue with default strategies
          }
        }

      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          this.currentExecution.status = 'failed';
          break;
        }
      }
    }

    if (this.currentExecution.status !== 'completed') {
      this.currentExecution.status = 'failed';
    }

    return this.currentExecution;
  }

  /**
   * Check if goal has been accomplished
   */
  private checkGoalAccomplished(goal: AgentGoal, result: any): boolean {
    // Use OpenReason to verify if goal is accomplished
    const verificationPrompt = `Goal: ${goal.objective}
Result: ${JSON.stringify(result)}
Has the goal been accomplished? Answer yes or no with reasoning.`;
    
    // Simplified check - in production, use OpenReason for verification
    return result && (result.success || result.data || result.found);
  }

  /**
   * Verify results using OpenRouter
   */
  private async verifyResults(goal: AgentGoal, steps: AgentStep[]): Promise<{
    success: boolean;
    result?: any;
    confidence?: number;
  }> {
    if (!this.initialized || !openRouterClient) {
      return {
        success: false,
        confidence: 0,
      };
    }

    const verificationPrompt = `Goal: ${goal.objective}
Steps taken: ${JSON.stringify(steps.map(s => ({ action: s.action.type, success: s.success })))}
Has the goal been accomplished? What is the confidence level?`;

    try {
      const verification = await openRouterClient.reason(verificationPrompt);
      const verdict = verification.verdict || '';
      const success = verdict.toLowerCase().includes('yes') || 
                     verdict.toLowerCase().includes('accomplished') ||
                     verdict.toLowerCase().includes('success');
      
      return {
        success,
        result: steps[steps.length - 1]?.result,
        confidence: verification.confidence || 0.5,
      };
    } catch {
      return {
        success: false,
        confidence: 0,
      };
    }
  }

  /**
   * Calculate confidence based on steps
   */
  private calculateConfidence(): number {
    if (!this.currentExecution) return 0;
    
    const successfulSteps = this.currentExecution.steps.filter(s => s.success).length;
    const totalSteps = this.currentExecution.steps.length;
    
    if (totalSteps === 0) return 0;
    
    return Math.min(0.95, 0.5 + (successfulSteps / totalSteps) * 0.45);
  }

  getCurrentExecution(): AgentExecution | null {
    return this.currentExecution;
  }
}

export const agenticEngine = new AgenticEngine();

