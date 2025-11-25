import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Settings, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { aiClient, AIClient } from '@lib/ai-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for reverse engineering. I can help you:\n\n• Analyze network requests and APIs\n• Generate injection scripts\n• Explain code and find vulnerabilities\n• Discover hidden endpoints\n• Assist with UI replication\n\nWhat would you like to explore?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [serverUrl, setServerUrl] = useState('http://localhost:3000');
  const [showSettings, setShowSettings] = useState(false);
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [site, setSite] = useState('you');
  const [availableSites, setAvailableSites] = useState<Array<{ site: string; models: string[] }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<AIClient>(aiClient);

  useEffect(() => {
    checkConnection();
    loadSettings();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSettings = () => {
    const savedUrl = localStorage.getItem('ai_server_url');
    const savedModel = localStorage.getItem('ai_model');
    const savedSite = localStorage.getItem('ai_site');
    
    if (savedUrl) {
      setServerUrl(savedUrl);
      clientRef.current = new AIClient(savedUrl);
    }
    if (savedModel) setModel(savedModel);
    if (savedSite) setSite(savedSite);
  };

  const saveSettings = () => {
    localStorage.setItem('ai_server_url', serverUrl);
    localStorage.setItem('ai_model', model);
    localStorage.setItem('ai_site', site);
    clientRef.current = new AIClient(serverUrl);
    checkConnection();
    setShowSettings(false);
  };

  const checkConnection = async () => {
    const client = clientRef.current;
    const connected = await client.checkHealth();
    setIsConnected(connected);
    
    if (connected) {
      const supports = await client.getSupports();
      setAvailableSites(supports);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const client = clientRef.current;
      let fullResponse = '';

      // Use streaming for better UX
      for await (const chunk of client.askStream({
        prompt: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: input },
        ],
        model,
        site,
      })) {
        if (chunk.error) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `Error: ${chunk.error}\n\nMake sure the gpt4free-ts server is running on ${serverUrl}`,
              error: true,
            },
          ]);
          setIsLoading(false);
          return;
        }

        if (chunk.content) {
          fullResponse += chunk.content;
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            
            if (lastMessage?.role === 'assistant' && !lastMessage.error) {
              newMessages[newMessages.length - 1] = {
                ...lastMessage,
                content: fullResponse,
              };
            } else {
              newMessages.push({
                role: 'assistant',
                content: fullResponse,
              });
            }
            
            return newMessages;
          });
        }

        if (chunk.done) {
          break;
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nMake sure the gpt4free-ts server is running. See README for setup instructions.`,
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'How do I intercept API calls?',
    'Generate a script to find hidden endpoints',
    'Explain this network request',
    'Find security vulnerabilities',
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="ai-assistant">
      <div className="assistant-header">
        <div className="header-left">
          <Bot size={20} />
          <h2>AI Assistant</h2>
          {isConnected === true && (
            <CheckCircle2 size={16} className="status-icon connected" />
          )}
          {isConnected === false && (
            <AlertCircle size={16} className="status-icon disconnected" />
          )}
        </div>
        <div className="header-actions">
          <button onClick={checkConnection} className="refresh-btn" title="Check connection">
            <Loader size={16} />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-item">
            <label>Server URL</label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:3000"
            />
          </div>
          <div className="setting-item">
            <label>Site</label>
            <select value={site} onChange={(e) => setSite(e.target.value)}>
              {availableSites.map((s) => (
                <option key={s.site} value={s.site}>
                  {s.site}
                </option>
              ))}
              {availableSites.length === 0 && <option value={site}>{site}</option>}
            </select>
          </div>
          <div className="setting-item">
            <label>Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt4">GPT-4</option>
              <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16k</option>
            </select>
          </div>
          <div className="settings-actions">
            <button onClick={saveSettings} className="save-btn primary">
              Save Settings
            </button>
            <button onClick={() => setShowSettings(false)}>Cancel</button>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="connection-warning">
          <AlertCircle size={16} />
          <p>
            AI server not connected. Make sure gpt4free-ts is running on {serverUrl}
          </p>
        </div>
      )}

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.error ? (
                <pre className="error-message">{message.content}</pre>
              ) : (
                <div className="message-text">{message.content}</div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-prompts">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleQuickPrompt(prompt)}
            className="quick-prompt-btn"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about reverse engineering..."
          className="message-input"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="send-btn primary"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

