import React, { useState, useRef, useEffect } from 'react';
import { Zap, Target, Play, Pause, RotateCcw, CheckCircle2, XCircle, Loader, Settings } from 'lucide-react';
import { agenticEngine, AgentGoal, AgentSpecialization, AgentExecution } from '@lib/agentic-engine';
import { reTools } from '@lib/re-tools';
import { webTools } from '@lib/web-tools';

export function AgenticEngine() {
  const [url, setUrl] = useState('');
  const [objective, setObjective] = useState('');
  const [specialization, setSpecialization] = useState<AgentSpecialization>('general');
  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-4o');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    const savedModel = localStorage.getItem('openrouter_model');
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedModel) setModel(savedModel);
    
    // Try to get from environment variable (for Vercel)
    if (!savedApiKey && typeof window !== 'undefined') {
      const envKey = (window as any).__OPENROUTER_API_KEY__ || process.env.OPENROUTER_API_KEY;
      if (envKey) setApiKey(envKey);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('openrouter_api_key', apiKey);
    localStorage.setItem('openrouter_model', model);
    setShowSettings(false);
  };

  const initializeEngine = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your OpenRouter API key in settings');
      return false;
    }
    
    try {
      await agenticEngine.initialize(apiKey, model);
      return true;
    } catch (error) {
      console.error('Failed to initialize engine:', error);
      alert('Failed to initialize agentic engine: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return false;
    }
  };

  const handleStart = async () => {
    if (!url.trim() || !objective.trim()) {
      alert('Please enter both URL and objective');
      return;
    }

    const initialized = await initializeEngine();
    if (!initialized) {
      alert('Failed to initialize agentic engine. Check your API key settings.');
      return;
    }

    setIsRunning(true);
    setExecution(null);

    const goal: AgentGoal = {
      url: url.trim(),
      objective: objective.trim(),
      specialization,
    };

    // For web version, we can't navigate directly, but we can analyze the URL
    // In Electron mode, navigate to URL
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      await (window as any).electronAPI.navigateTo(goal.url);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
      // Get available tools (Electron tools if available, otherwise web tools)
      const availableTools = typeof window !== 'undefined' && (window as any).electronAPI
        ? reTools.getAllTools()
        : webTools.getAllTools();
      
      const toolsMap = availableTools.reduce((acc, tool) => {
        acc[tool.name] = tool;
        return acc;
      }, {} as any);

      // Execute agentic reasoning
      const result = await agenticEngine.execute(goal, toolsMap, 5);

      setExecution(result);
    } catch (error) {
      console.error('Execution error:', error);
      setExecution({
        goal,
        steps: [],
        currentStrategy: 'failed',
        status: 'failed',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setExecution(null);
    setIsRunning(false);
  };

  const specializations: { value: AgentSpecialization; label: string; description: string }[] = [
    { value: 'general', label: 'General', description: 'General reverse engineering' },
    { value: 'api-discovery', label: 'API Discovery', description: 'Find hidden APIs and endpoints' },
    { value: 'vulnerability-scanning', label: 'Vulnerability Scanning', description: 'Find security vulnerabilities' },
    { value: 'script-generation', label: 'Script Generation', description: 'Generate injection scripts' },
    { value: 'ui-replication', label: 'UI Replication', description: 'Extract and replicate UI' },
    { value: 'authentication-bypass', label: 'Auth Bypass', description: 'Find authentication bypasses' },
    { value: 'data-extraction', label: 'Data Extraction', description: 'Extract specific data' },
    { value: 'endpoint-enumeration', label: 'Endpoint Enumeration', description: 'Enumerate all API endpoints' },
  ];

  return (
    <div className="agentic-engine">
      <div className="engine-header">
        <div className="header-left">
          <Zap size={20} />
          <h2>Agentic Reverse Engineering Engine</h2>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
          <Settings size={16} />
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-item">
            <label>Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="openai/gpt-4o">GPT-4o (OpenAI)</option>
              <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
              <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
              <option value="google/gemini-pro">Gemini Pro</option>
              <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
            </select>
            <small>Get your API key at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">openrouter.ai</a></small>
          </div>
          <div className="setting-item">
            <label>OpenRouter API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
            />
            <small>Your API key is stored locally in your browser</small>
          </div>
          <div className="settings-actions">
            <button onClick={saveSettings} className="save-btn primary">
              Save
            </button>
            <button onClick={() => setShowSettings(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="engine-content">
        <div className="goal-input">
          <div className="input-group">
            <label>
              <Target size={16} />
              Target URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isRunning}
            />
          </div>

          <div className="input-group">
            <label>
              <Target size={16} />
              Objective
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="What do you want to accomplish? (e.g., 'Find all API endpoints', 'Extract user data', 'Bypass authentication')"
              rows={3}
              disabled={isRunning}
            />
          </div>

          <div className="input-group">
            <label>Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value as AgentSpecialization)}
              disabled={isRunning}
            >
              {specializations.map((spec) => (
                <option key={spec.value} value={spec.value}>
                  {spec.label} - {spec.description}
                </option>
              ))}
            </select>
          </div>

          <div className="action-buttons">
            {!isRunning ? (
              <button onClick={handleStart} className="start-btn primary" disabled={!url.trim() || !objective.trim()}>
                <Play size={16} />
                Start Agentic Execution
              </button>
            ) : (
              <button onClick={handleStop} className="stop-btn">
                <Pause size={16} />
                Stop
              </button>
            )}
            <button onClick={handleReset} className="reset-btn" disabled={isRunning}>
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {execution && (
          <div className="execution-view">
            <div className="execution-header">
              <h3>Execution Status</h3>
              <div className={`status-badge ${execution.status}`}>
                {execution.status === 'completed' && <CheckCircle2 size={16} />}
                {execution.status === 'failed' && <XCircle size={16} />}
                {(execution.status === 'planning' || execution.status === 'executing' || execution.status === 'verifying') && <Loader size={16} className="spinning" />}
                <span>{execution.status.toUpperCase()}</span>
              </div>
            </div>

            <div className="execution-info">
              <div className="info-item">
                <strong>Strategy:</strong> {execution.currentStrategy}
              </div>
              <div className="info-item">
                <strong>Steps:</strong> {execution.steps.length}
              </div>
              {execution.confidence && (
                <div className="info-item">
                  <strong>Confidence:</strong> {Math.round(execution.confidence * 100)}%
                </div>
              )}
            </div>

            <div className="steps-list">
              <h4>Execution Steps</h4>
              {execution.steps.map((step, index) => (
                <div key={index} className={`step-item ${step.success ? 'success' : 'failed'}`}>
                  <div className="step-header">
                    <div className="step-number">{step.step}</div>
                    <div className="step-action">
                      <strong>{step.action.type}</strong> - {step.action.tool}
                    </div>
                    {step.success ? (
                      <CheckCircle2 size={16} className="step-icon success" />
                    ) : (
                      <XCircle size={16} className="step-icon failed" />
                    )}
                  </div>
                  <div className="step-reasoning">
                    <small>{step.action.reasoning}</small>
                  </div>
                  {step.result && (
                    <div className="step-result">
                      <pre>{JSON.stringify(step.result, null, 2).substring(0, 500)}</pre>
                    </div>
                  )}
                  {step.error && (
                    <div className="step-error">
                      <small>Error: {step.error}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {execution.result && (
              <div className="execution-result">
                <h4>Final Result</h4>
                <pre>{JSON.stringify(execution.result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {isRunning && !execution && (
          <div className="loading-state">
            <Loader size={32} className="spinning" />
            <p>Initializing agentic engine...</p>
          </div>
        )}
      </div>
    </div>
  );
}

