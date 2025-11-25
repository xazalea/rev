/**
 * Agentic Reasoning Engine powered by OpenReason
 * Specialized agents for reverse engineering tasks
 */

let openreason: any = null;

// Dynamic import to handle cases where openreason might not be installed
// Support both Node.js require and ES modules
const loadOpenReason = async () => {
  if (openreason) return openreason;
  
  try {
    // Try CommonJS require first (Node.js/Electron)
    if (typeof require !== 'undefined') {
      openreason = require('openreason');
      return openreason;
    }
  } catch (e) {
    // Continue to try other methods
  }
  
  try {
    // Try dynamic import for ES modules (browser/Vite)
    if (typeof window !== 'undefined') {
      // In browser, OpenReason needs to run server-side
      // For now, use enhanced fallback
      console.warn('OpenReason: Using browser-compatible fallback mode');
    }
  } catch (e) {
    // Fallback will be used
  }
  
  return null;
};

// Load on module init (non-blocking)
if (typeof window === 'undefined') {
  // Node.js environment - try to load
  loadOpenReason().catch(() => {});
}

// Enhanced fallback reasoning that mimics OpenReason's structure
const fallbackReason = async (prompt: string) => {
  const promptLower = prompt.toLowerCase();
  let verdict = 'I should analyze the target systematically.';
  let steps: string[] = [];
  let confidence = 0.6;
  
  if (promptLower.includes('api') || promptLower.includes('endpoint')) {
    verdict = 'I should monitor network traffic and analyze JavaScript to find API endpoints.';
    steps = [
      'Monitor network requests using Performance API',
      'Analyze JavaScript for fetch/axios calls',
      'Extract endpoint patterns from code',
      'Test discovered endpoints',
    ];
    confidence = 0.7;
  } else if (promptLower.includes('vulnerability') || promptLower.includes('security')) {
    verdict = 'I should check for common security vulnerabilities and test authentication mechanisms.';
    steps = [
      'Analyze authentication flow',
      'Check for XSS injection points',
      'Test CSRF protection',
      'Examine input validation',
    ];
    confidence = 0.65;
  } else if (promptLower.includes('extract') || promptLower.includes('data')) {
    verdict = 'I should analyze the DOM structure and identify data sources.';
    steps = [
      'Analyze DOM structure',
      'Identify data containers',
      'Extract visible data',
      'Check for API endpoints',
    ];
    confidence = 0.7;
  } else if (promptLower.includes('bypass') || promptLower.includes('auth')) {
    verdict = 'I should analyze authentication mechanisms and test for bypass opportunities.';
    steps = [
      'Analyze login mechanism',
      'Check token handling',
      'Test session management',
      'Look for unprotected endpoints',
    ];
    confidence = 0.65;
  } else {
    steps = [
      'Analyze target structure',
      'Identify key components',
      'Execute discovery tools',
      'Verify results',
    ];
  }
  
  return {
    verdict: verdict,
    content: `Reasoning: ${verdict}\nSteps: ${steps.join(' → ')}\nGoal: ${prompt.substring(0, 200)}`,
    confidence: confidence,
    steps: steps,
  };
};

const reason = async (prompt: string) => {
  // Try to use OpenReason if available
  if (openreason?.reason) {
    try {
      return await openreason.reason(prompt);
    } catch (e) {
      console.warn('OpenReason error, using fallback:', e);
    }
  }
  
  // Use enhanced fallback
  return await fallbackReason(prompt);
};

const init = async (config: any) => {
  // Try to load OpenReason if not already loaded
  const loaded = await loadOpenReason();
  
  if (loaded?.init) {
    try {
      await loaded.init(config);
      openreason = loaded;
      return;
    } catch (e) {
      console.warn('OpenReason init failed, using fallback:', e);
    }
  }
  
  // Fallback mode - still works
  if (process.env.NODE_ENV === 'development') {
    console.warn('OpenReason not available. Using enhanced fallback mode.');
  }
  return Promise.resolve();
};

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

  async initialize(provider: string = 'openai', apiKey?: string) {
    if (this.initialized) return;

    const config: any = {
      provider: provider || 'openai',
      model: 'gpt-4o',
      simpleModel: 'gpt-3.5-turbo',
      complexModel: 'gpt-4o',
      memory: {
        enabled: true,
        path: './data/agent-memory.db',
      },
      graph: {
        enabled: true,
        checkpoint: true,
        threadPrefix: 'rev-agent',
      },
    };

    if (apiKey) {
      config.apiKey = apiKey;
    }

    await init(config);
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
    if (!this.initialized) {
      await this.initialize();
    }

    const prompt = this.createReasoningPrompt(goal, context);
    
    try {
      const reasoning = await reason(prompt);
      
      // Parse the reasoning result to extract actions
      // OpenReason returns structured reasoning, we extract actionable steps
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
        if (attempts < maxAttempts) {
          // Use OpenReason to determine next strategy
          const nextStrategyPrompt = `Previous attempts failed. Goal: ${goal.objective}. 
Previous steps: ${JSON.stringify(this.currentExecution.steps.slice(-3))}.
What alternative strategy should I try?`;
          
          try {
            const nextStrategy = await reason(nextStrategyPrompt);
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
   * Verify results using OpenReason
   */
  private async verifyResults(goal: AgentGoal, steps: AgentStep[]): Promise<{
    success: boolean;
    result?: any;
    confidence?: number;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const verificationPrompt = `Goal: ${goal.objective}
Steps taken: ${JSON.stringify(steps.map(s => ({ action: s.action.type, success: s.success })))}
Has the goal been accomplished? What is the confidence level?`;

    try {
      const verification = await reason(verificationPrompt);
      const verdict = verification.verdict || '';
      const success = verdict.toLowerCase().includes('yes') || verdict.toLowerCase().includes('accomplished');
      
      return {
        success,
        result: steps[steps.length - 1]?.result,
        confidence: verification.confidence || 0.5,
      };
    } catch {
      return {
        success: false,
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

