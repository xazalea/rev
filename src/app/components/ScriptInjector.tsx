import React, { useState } from 'react';
import { Code, Play, Save, FileText } from 'lucide-react';

export function ScriptInjector() {
  const [script, setScript] = useState(`// Example: Log all API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch called:', args);
  return originalFetch.apply(this, args);
};`);
  const [savedScripts, setSavedScripts] = useState<string[]>([]);

  const handleInject = async () => {
    if (window.electronAPI && script.trim()) {
      try {
        await window.electronAPI.injectScript(script);
        alert('Script injected successfully!');
      } catch (error) {
        alert('Failed to inject script: ' + error);
      }
    }
  };

  const handleSave = () => {
    if (script.trim()) {
      setSavedScripts([...savedScripts, script]);
      localStorage.setItem('savedScripts', JSON.stringify([...savedScripts, script]));
    }
  };

  React.useEffect(() => {
    const saved = localStorage.getItem('savedScripts');
    if (saved) {
      setSavedScripts(JSON.parse(saved));
    }
  }, []);

  const loadScript = (savedScript: string) => {
    setScript(savedScript);
  };

  return (
    <div className="script-injector">
      <div className="injector-header">
        <h2>
          <Code size={20} />
          Script Injector
        </h2>
        <div className="injector-actions">
          <button onClick={handleSave} className="save-btn">
            <Save size={16} />
            Save
          </button>
          <button onClick={handleInject} className="inject-btn primary">
            <Play size={16} />
            Inject Script
          </button>
        </div>
      </div>
      <div className="injector-content">
        <div className="script-editor">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Enter JavaScript code to inject..."
            className="script-textarea"
            spellCheck={false}
          />
        </div>
        {savedScripts.length > 0 && (
          <div className="saved-scripts">
            <h3>
              <FileText size={16} />
              Saved Scripts
            </h3>
            <div className="saved-scripts-list">
              {savedScripts.map((savedScript, index) => (
                <div
                  key={index}
                  className="saved-script-item"
                  onClick={() => loadScript(savedScript)}
                >
                  <code>{savedScript.substring(0, 50)}...</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

