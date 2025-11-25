# rev. - Professional Reverse Engineering Tool

A professional reverse engineering tool powered by **agentic AI** that automatically accomplishes your goals through intelligent reasoning and multiple strategies.

## Core Concept

**rev.** is an agentic reverse engineering system. You provide:
1. **Target URL** - The website you want to analyze
2. **Objective** - What you want to accomplish (e.g., "Find all API endpoints", "Extract user data", "Bypass authentication")

The **Agentic Engine** powered by [OpenRouter](https://openrouter.ai) then:
- **Reasons** through the problem using AI models
- **Plans** multiple strategies to accomplish your goal
- **Executes** actions using specialized reverse engineering tools
- **Tries different approaches** if one fails
- **Verifies** results and adapts strategies

No chat interface - the agent actively tries different things until it finds a solution.

## Features

### 🤖 Agentic Engine (Powered by OpenRouter)
- **AI-Powered Reasoning**: Uses OpenRouter to access multiple AI models (GPT-4, Claude, Gemini, etc.)
- **Multiple Strategies**: Automatically tries different approaches if one fails
- **Specialized Agents**: 
  - API Discovery
  - Vulnerability Scanning
  - Script Generation
  - UI Replication
  - Authentication Bypass
  - Data Extraction
  - Endpoint Enumeration
- **Self-Aware**: Uses reasoning to determine next steps and verify results

### 🛠️ Reverse Engineering Tools
- **Network Inspector**: Monitor all network requests, responses, and headers
- **Script Injector**: Inject custom JavaScript into any page
- **API Key Finder**: Automatically detect API keys in requests and responses
- **DOM Analyzer**: Analyze page structure and extract information
- **Iframe Detector**: Identify and inspect embedded iframes
- **UI Extractor**: Extract UI components with their styles
- **Endpoint Enumerator**: Discover API endpoints from scripts and network traffic
- **Hex Analyzer**: Analyze binary data in hex format

### 🎯 Goal-Oriented Interface
- Enter URL and objective
- Select specialization (or use general)
- Watch the agent try different strategies
- See step-by-step execution with reasoning
- Get final results with confidence scores

## Setup

### Prerequisites

- Node.js 18+ and npm
- (Optional) OpenReason for enhanced agentic reasoning

### Installation

```bash
# Install dependencies
npm install

# Optional: Install OpenReason for enhanced reasoning
# The app works without it, but with basic fallback reasoning
npm install github:CaviraOSS/OpenReason

# Run in development mode
npm run dev

# Build for production
npm run build

# Start the application
npm start
```

**Note**: OpenReason is optional. The agentic engine includes fallback reasoning that works without OpenReason, though with reduced capabilities. See [INSTALL.md](INSTALL.md) for more details.

### Agentic Engine Setup

The Agentic Engine uses [OpenRouter](https://openrouter.ai) to access multiple AI models. You need an OpenRouter API key.

1. **Get OpenRouter API Key**:
   - Visit [openrouter.ai](https://openrouter.ai)
   - Sign up and get your API key
   - Add credits to your account

2. **Configure in rev.**:
   - Open rev. application (web or Electron)
   - Go to "Agentic Engine" tab
   - Click settings icon (⚙️)
   - Enter your OpenRouter API key
   - Select your preferred model:
     - GPT-4o (recommended for best results)
     - Claude 3.5 Sonnet
     - GPT-4 Turbo
     - Gemini Pro
     - Or any other model on OpenRouter
   - Save settings

3. **Use the Agentic Engine**:
   - Enter target URL
   - Enter your objective (e.g., "Find all API endpoints", "Extract user data")
   - Select specialization (optional)
   - Click "Start Agentic Execution"
   - Watch as the agent tries different strategies

The agent will:
- Reason through the problem using AI
- Plan multiple strategies
- Execute actions using available tools
- Try alternative approaches if needed
- Verify results and provide confidence scores

## Tech Stack

- **Electron** - Desktop application framework (optional)
- **React + TypeScript** - Frontend UI
- **Vite** - Build tool
- **OpenRouter** - AI model gateway for agentic reasoning
- **Web Tools** - Browser-compatible reverse engineering tools
- **Specialized RE Tools** - Network monitoring, script injection, DOM analysis, etc.

## Deployment

### Vercel (Web)

The app is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variable `OPENROUTER_API_KEY` (optional - users can also enter it in UI)
3. Deploy!

The web version works in browsers and uses web-compatible tools.

### Electron (Desktop)

For desktop deployment:

```bash
npm run build
npm start
```

The Electron version has access to more powerful tools like network interception.

## How It Works

1. **You provide**: URL + Objective
2. **OpenReason reasons**: Classifies the problem, creates a skeleton plan, solves it step-by-step
3. **Agent executes**: Uses specialized tools (network monitor, script injector, DOM analyzer, etc.)
4. **Verification**: OpenReason verifies if the goal is accomplished
5. **Adaptation**: If not successful, tries alternative strategies
6. **Result**: Returns findings with confidence scores

## Example Objectives

- "Find all API endpoints on this site"
- "Extract all user data from the page"
- "Bypass the authentication mechanism"
- "Discover hidden admin endpoints"
- "Replicate the login UI"
- "Find XSS vulnerabilities"
- "Extract API keys and tokens"

