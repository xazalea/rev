import React, { useState } from 'react';
import { Search, Filter, Download, X } from 'lucide-react';
import { NetworkRequest } from '@lib/types';
import clsx from 'clsx';

interface NetworkInspectorProps {
  requests: NetworkRequest[];
}

export function NetworkInspector({ requests }: NetworkInspectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'requests' && req.type === 'request') ||
      (filter === 'responses' && req.type === 'response');
    return matchesSearch && matchesFilter;
  });

  const exportData = () => {
    const dataStr = JSON.stringify(requests, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-requests-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="network-inspector">
      <div className="inspector-header">
        <h2>Network Inspector</h2>
        <div className="inspector-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="requests">Requests</option>
            <option value="responses">Responses</option>
          </select>
          <button onClick={exportData} className="export-btn">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
      <div className="inspector-content">
        <div className="requests-list">
          <div className="requests-header">
            <div className="col-method">Method</div>
            <div className="col-url">URL</div>
            <div className="col-status">Status</div>
            <div className="col-time">Time</div>
          </div>
          <div className="requests-items">
            {filteredRequests.map((req) => (
              <div
                key={`${req.id}-${req.timestamp}`}
                className={clsx('request-item', {
                  selected: selectedRequest?.id === req.id,
                  request: req.type === 'request',
                  response: req.type === 'response',
                })}
                onClick={() => setSelectedRequest(req)}
              >
                <div className="col-method">{req.method || '-'}</div>
                <div className="col-url" title={req.url}>
                  {req.url.length > 60 ? `${req.url.substring(0, 60)}...` : req.url}
                </div>
                <div className="col-status">
                  {req.statusCode ? (
                    <span className={clsx('status-code', {
                      success: req.statusCode >= 200 && req.statusCode < 300,
                      error: req.statusCode >= 400,
                    })}>
                      {req.statusCode}
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
                <div className="col-time">
                  {new Date(req.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
        {selectedRequest && (
          <div className="request-details">
            <div className="details-header">
              <h3>Request Details</h3>
              <button onClick={() => setSelectedRequest(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="details-content">
              <div className="detail-section">
                <h4>URL</h4>
                <code>{selectedRequest.url}</code>
              </div>
              <div className="detail-section">
                <h4>Method</h4>
                <code>{selectedRequest.method || 'N/A'}</code>
              </div>
              {selectedRequest.statusCode && (
                <div className="detail-section">
                  <h4>Status</h4>
                  <code>{selectedRequest.statusCode} {selectedRequest.statusLine}</code>
                </div>
              )}
              {selectedRequest.requestHeaders && (
                <div className="detail-section">
                  <h4>Request Headers</h4>
                  <pre>
                    <code>
                      {JSON.stringify(selectedRequest.requestHeaders, null, 2)}
                    </code>
                  </pre>
                </div>
              )}
              {selectedRequest.responseHeaders && (
                <div className="detail-section">
                  <h4>Response Headers</h4>
                  <pre>
                    <code>
                      {JSON.stringify(selectedRequest.responseHeaders, null, 2)}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

