import React, { useState } from 'react';
import { Copy, Code, Download, Check } from 'lucide-react';

export function UICopier() {
  const [copiedElement, setCopiedElement] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [cssContent, setCssContent] = useState<string>('');

  const copyElement = async () => {
    if (!window.electronAPI) return;

    try {
      const result = await window.electronAPI.getPageContent();
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.html, 'text/html');
      
      // Extract styles
      const styles = Array.from(doc.querySelectorAll('style'))
        .map((style) => style.textContent)
        .join('\n');
      
      // Extract inline styles from elements
      const inlineStyles = Array.from(doc.querySelectorAll('[style]'))
        .map((el) => (el as HTMLElement).outerHTML)
        .slice(0, 10); // Limit to first 10 for preview
      
      setHtmlContent(result.html);
      setCssContent(styles);
      setCopiedElement('full-page');
    } catch (error) {
      console.error('Failed to copy element:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedElement('clipboard');
    setTimeout(() => setCopiedElement(null), 2000);
  };

  const downloadHTML = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copied-page-${Date.now()}.html`;
    a.click();
  };

  return (
    <div className="ui-copier">
      <div className="copier-header">
        <h2>
          <Copy size={20} />
          UI Copier
        </h2>
        <div className="copier-actions">
          <button onClick={copyElement} className="copy-btn">
            <Copy size={16} />
            Copy Page HTML
          </button>
        </div>
      </div>
      <div className="copier-content">
        {htmlContent ? (
          <div className="copied-content">
            <div className="content-section">
              <div className="section-header">
                <h3>
                  <Code size={16} />
                  HTML Content
                </h3>
                <div className="section-actions">
                  <button
                    onClick={() => copyToClipboard(htmlContent)}
                    className="icon-btn"
                    title="Copy HTML"
                  >
                    {copiedElement === 'clipboard' ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <button
                    onClick={downloadHTML}
                    className="icon-btn"
                    title="Download HTML"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              <pre className="content-preview">
                <code>{htmlContent.substring(0, 5000)}...</code>
              </pre>
            </div>
            {cssContent && (
              <div className="content-section">
                <div className="section-header">
                  <h3>
                    <Code size={16} />
                    CSS Styles
                  </h3>
                  <button
                    onClick={() => copyToClipboard(cssContent)}
                    className="icon-btn"
                    title="Copy CSS"
                  >
                    {copiedElement === 'clipboard' ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                <pre className="content-preview">
                  <code>{cssContent.substring(0, 5000)}...</code>
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <Copy size={48} />
            <p>Click "Copy Page HTML" to extract the current page's HTML and CSS.</p>
            <small>This will copy the entire page structure including styles.</small>
          </div>
        )}
      </div>
    </div>
  );
}

