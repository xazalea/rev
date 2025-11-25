# AI Assistant Setup Guide

The AI Assistant feature in rev. uses [gpt4free-ts](https://github.com/xiangsx/gpt4free-ts) to provide AI-powered assistance for reverse engineering tasks.

## Quick Start

### 1. Install and Run gpt4free-ts Server

```bash
# Clone the repository
git clone https://github.com/xiangsx/gpt4free-ts.git
cd gpt4free-ts

# Install dependencies
yarn install

# Start the server
yarn start
```

The server will start on `http://localhost:3000` by default.

### 2. Configure in rev.

1. Open rev. application
2. Click on the "AI Assistant" tab in the sidebar
3. Click the settings icon (⚙️) in the header
4. Verify the server URL (default: `http://localhost:3000`)
5. Select your preferred:
   - **Site**: Choose from available providers (you, fakeopen, better, forefront, etc.)
   - **Model**: Select GPT model (gpt-3.5-turbo, gpt4, etc.)
6. Click "Save Settings"

### 3. Start Using AI Assistant

The AI Assistant can help you with:
- **Network Analysis**: "Explain this API endpoint" or "What does this request do?"
- **Script Generation**: "Generate a script to intercept fetch calls"
- **Security Analysis**: "Find vulnerabilities in this code"
- **API Discovery**: "How can I find hidden endpoints?"
- **Code Explanation**: "Explain how this JavaScript works"

## Available Sites and Models

Query available options:
```bash
curl http://localhost:3000/supports
```

Common sites:
- `you` - You.com (GPT-3.5 Turbo)
- `fakeopen` - FakeOpen provider
- `better` - Better provider
- `forefront` - Forefront AI
- `phind` - Phind search
- `vita` - Vita provider

## API Endpoints

The gpt4free-ts server provides these endpoints:

- **GET** `/ask?prompt=...&model=...&site=...` - Get complete response
- **GET** `/ask/stream?prompt=...&model=...&site=...` - Stream response (used by rev.)
- **GET** `/supports` - Get available sites and models
- **POST** `/v1/chat/completions` - OpenAI-compatible endpoint

## Troubleshooting

### Server Not Connecting

1. Verify gpt4free-ts is running:
   ```bash
   curl http://localhost:3000/supports
   ```

2. Check firewall settings - port 3000 should be accessible

3. Try a different server URL in settings

### No Response from AI

1. Check the selected site is available (some sites may be down)
2. Try a different site/provider
3. Check server logs for errors
4. Verify model is supported by selected site

### Rate Limiting

Some providers have rate limits. If you hit limits:
- Switch to a different site
- Wait before retrying
- Consider using multiple sites

## Advanced Configuration

### Environment Variables (for gpt4free-ts)

Some sites require additional configuration:

- **forefront**: Requires `rapid_api_key` and email configuration
- **phind**: Supports `PHIND_POOL_SIZE` for concurrency

See [gpt4free-ts documentation](https://github.com/xiangsx/gpt4free-ts) for full configuration options.

## Features

- **Streaming Responses**: Real-time AI responses as they're generated
- **Conversation History**: Maintains context across messages
- **Quick Prompts**: Pre-built prompts for common tasks
- **Connection Status**: Visual indicator of server connection
- **Settings Persistence**: Your preferences are saved locally

## Example Prompts

- "How do I intercept and modify API requests?"
- "Generate a script to find all fetch calls on this page"
- "What security vulnerabilities should I look for in this network request?"
- "Explain how this authentication flow works"
- "Help me reverse engineer this API endpoint"

