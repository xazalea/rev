import React from 'react';
import { Navigation, Play } from 'lucide-react';

interface HeaderProps {
  url: string;
  setUrl: (url: string) => void;
}

export function Header({ url, setUrl }: HeaderProps) {
  const [inputUrl, setInputUrl] = React.useState(url);

  const handleNavigate = () => {
    if (inputUrl.trim()) {
      const finalUrl = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;
      setUrl(finalUrl);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  return (
    <div className="header">
      <div className="header-content">
        <div className="logo">
          <Navigation size={20} />
          <span>rev.</span>
        </div>
        <div className="url-bar">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter URL to analyze..."
            className="url-input"
          />
          <button onClick={handleNavigate} className="navigate-btn">
            <Play size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

