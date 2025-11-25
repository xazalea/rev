# rev. - Professional Reverse Engineering Tool

A professional reverse engineering tool powered by **agentic AI** that automatically accomplishes your goals through intelligent reasoning and multiple strategies.

## Core Concept

**rev.** is an agentic reverse engineering system. You provide:
1. **Target URL** - The website you want to analyze
2. **Objective** - What you want to accomplish (e.g., "Find all API endpoints", "Extract user data", "Bypass authentication")

The **Agentic Engine** powered by [OpenReason](https://github.com/CaviraOSS/OpenReason) then:
- **Reasons** through the problem using adaptive reasoning
- **Plans** multiple strategies to accomplish your goal
- **Executes** actions using specialized reverse engineering tools
- **Tries different approaches** if one fails
- **Verifies** results and adapts strategies

No chat interface - the agent actively tries different things until it finds a solution.

## Features

### 🤖 Agentic Engine (Powered by OpenReason)
- **Adaptive Reasoning**: Uses OpenReason's classifier → skeleton → solver → verifier → finalizer pipeline
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
- (Optional) gpt4free-ts server for AI features

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start the application
npm start
```

### Agentic Engine Setup

The Agentic Engine uses [OpenReason](https://github.com/CaviraOSS/OpenReason) for adaptive reasoning. You need to configure an LLM provider.

1. **Install OpenReason** (if not already installed):
```bash
npm install openreason
```

2. **Configure API Key**:
   - Open rev. application
   - Go to "Agentic Engine" tab
   - Click settings icon
   - Enter your API key for your preferred provider:
     - OpenAI (recommended)
     - Anthropic
     - Google
     - xAI
   - Select provider and save

3. **Use the Agentic Engine**:
   - Enter target URL
   - Enter your objective (e.g., "Find all API endpoints", "Extract user data")
   - Select specialization (optional)
   - Click "Start Agentic Execution"
   - Watch as the agent tries different strategies

The agent will:
- Reason through the problem
- Plan multiple strategies
- Execute actions using available tools
- Try alternative approaches if needed
- Verify results and provide confidence scores

## Tech Stack

- **Electron** - Desktop application framework
- **React + TypeScript** - Frontend UI
- **Vite** - Build tool
- **OpenReason** - Adaptive reasoning engine for agentic capabilities
- **Specialized RE Tools** - Network monitoring, script injection, DOM analysis, etc.

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

