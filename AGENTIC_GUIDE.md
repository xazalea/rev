# Agentic Reverse Engineering Guide

## Overview

rev. uses an **agentic AI system** powered by [OpenReason](https://github.com/CaviraOSS/OpenReason) to automatically accomplish reverse engineering goals. Unlike traditional chat interfaces, the agent actively tries different strategies until it finds a solution.

## How It Works

### 1. Goal Input
You provide:
- **Target URL**: The website to analyze
- **Objective**: What you want to accomplish
- **Specialization** (optional): Focus area (API discovery, vulnerability scanning, etc.)

### 2. Reasoning Phase
OpenReason's adaptive reasoning engine:
- **Classifies** the problem domain and difficulty
- **Creates a skeleton** plan with substeps
- **Solves** each step using appropriate models
- **Verifies** results for correctness
- **Finalizes** with confidence scores

### 3. Execution Phase
The agent executes actions using specialized tools:
- Network monitoring
- Script injection
- DOM analysis
- API key discovery
- Endpoint enumeration
- UI extraction
- And more...

### 4. Adaptation
If a strategy fails:
- Agent reasons about what went wrong
- Tries alternative approaches
- Uses different tools or techniques
- Continues until goal is accomplished or max attempts reached

## Specializations

### API Discovery
Finds hidden APIs, endpoints, and undocumented functionality.
- Monitors network traffic
- Analyzes JavaScript for API calls
- Enumerates endpoints
- Discovers authentication mechanisms

### Vulnerability Scanning
Identifies security vulnerabilities.
- Checks for XSS, CSRF, SQL injection points
- Analyzes authentication mechanisms
- Tests for authorization bypasses
- Identifies insecure data handling

### Script Generation
Creates JavaScript code to accomplish goals.
- Generates injection scripts
- Creates API interceptors
- Builds data extraction scripts
- Develops automation tools

### UI Replication
Extracts and replicates UI components.
- Extracts HTML structure
- Captures CSS styles
- Replicates JavaScript interactions
- Recreates visual design

### Authentication Bypass
Finds ways around authentication.
- Analyzes auth mechanisms
- Discovers token handling
- Tests session management
- Identifies bypass opportunities

### Data Extraction
Extracts specific data from pages.
- Locates data sources
- Identifies API endpoints
- Creates extraction scripts
- Handles pagination and filtering

### Endpoint Enumeration
Discovers all API endpoints.
- Analyzes network traffic
- Parses JavaScript for endpoints
- Tests common endpoint patterns
- Maps API structure

### General
General reverse engineering with adaptive strategy selection.

## Available Tools

The agent has access to these reverse engineering tools:

1. **network-monitor**: Intercept and monitor network requests
2. **script-injector**: Inject JavaScript into pages
3. **dom-analyzer**: Analyze DOM structure and extract information
4. **api-key-finder**: Find API keys, tokens, and secrets
5. **iframe-detector**: Detect and analyze iframes
6. **ui-extractor**: Extract UI components with styles
7. **endpoint-enumerator**: Enumerate API endpoints
8. **hex-analyzer**: Analyze binary data
9. **general-explorer**: Combines multiple tools for exploration

## Example Workflows

### Finding API Endpoints
```
URL: https://example.com
Objective: Find all API endpoints
Specialization: API Discovery

Agent will:
1. Monitor network traffic
2. Analyze JavaScript for fetch/axios calls
3. Extract endpoint patterns
4. Test discovered endpoints
5. Return complete API map
```

### Extracting User Data
```
URL: https://example.com/dashboard
Objective: Extract all user data visible on the page
Specialization: Data Extraction

Agent will:
1. Analyze DOM structure
2. Identify data containers
3. Extract visible data
4. Check for API endpoints that provide data
5. Create extraction script if needed
```

### Bypassing Authentication
```
URL: https://example.com/login
Objective: Find a way to bypass authentication
Specialization: Authentication Bypass

Agent will:
1. Analyze login mechanism
2. Check for token handling
3. Test session management
4. Look for API endpoints without auth
5. Try different bypass techniques
```

## Configuration

### OpenReason Setup

1. Install OpenReason:
```bash
npm install openreason
```

2. Configure in rev.:
   - Go to Agentic Engine tab
   - Click settings
   - Enter API key for your provider:
     - OpenAI (recommended for best results)
     - Anthropic
     - Google
     - xAI
   - Select provider
   - Save

### Provider Recommendations

- **OpenAI GPT-4o**: Best for complex reasoning
- **Anthropic Claude**: Good for structured analysis
- **Google Gemini**: Fast and cost-effective
- **xAI Grok**: Alternative option

## Understanding Results

### Execution Status
- **planning**: Agent is reasoning about the problem
- **executing**: Agent is running tools and actions
- **verifying**: Agent is checking if goal is accomplished
- **completed**: Goal accomplished successfully
- **failed**: All strategies exhausted

### Confidence Scores
- **90-100%**: High confidence, goal likely accomplished
- **70-89%**: Good confidence, goal probably accomplished
- **50-69%**: Moderate confidence, may need verification
- **<50%**: Low confidence, goal may not be accomplished

### Step Details
Each step shows:
- **Action Type**: What the agent is doing
- **Tool Used**: Which tool was executed
- **Reasoning**: Why this action was chosen
- **Result**: What was found/returned
- **Success/Failure**: Whether the step succeeded

## Tips for Best Results

1. **Be Specific**: Clear objectives work better than vague ones
   - Good: "Find all API endpoints that return user data"
   - Bad: "Hack the site"

2. **Choose Specialization**: Matching specialization improves results
   - API discovery → Use "API Discovery"
   - Security testing → Use "Vulnerability Scanning"

3. **Wait for Completion**: Let the agent try multiple strategies
   - Don't stop after first attempt
   - Agent learns from failures

4. **Review Steps**: Check the execution steps to understand the process
   - See what tools were used
   - Understand the reasoning
   - Learn from the approach

5. **Iterate**: If first attempt fails, refine your objective
   - Be more specific
   - Try different specialization
   - Break into smaller goals

## Troubleshooting

### Agent Not Starting
- Check API key is configured
- Verify OpenReason is installed
- Check console for errors

### Low Success Rate
- Try different specialization
- Be more specific with objective
- Check if target site is accessible

### Slow Execution
- Complex objectives take time
- Multiple strategies increase duration
- Network monitoring adds latency

### Unexpected Results
- Review execution steps
- Check tool results
- Verify target URL is correct

## Advanced Usage

### Custom Tools
You can extend the agent with custom tools by registering them in `lib/re-tools.ts`:

```typescript
reTools.registerTool({
  name: 'custom-tool',
  description: 'My custom tool',
  execute: async (params) => {
    // Your tool logic
    return { success: true, data: result };
  },
});
```

### Direct API Access
The agentic engine can be used programmatically:

```typescript
import { agenticEngine } from '@lib/agentic-engine';
import { reTools } from '@lib/re-tools';

const goal = {
  url: 'https://example.com',
  objective: 'Find API endpoints',
  specialization: 'api-discovery',
};

const result = await agenticEngine.execute(goal, reTools.getAllTools());
```

## Ethics and Legal Notice

This tool is for **educational and authorized security testing only**. Always:
- Get permission before testing
- Follow responsible disclosure
- Respect terms of service
- Use only on systems you own or have explicit permission to test

The authors are not responsible for misuse of this tool.

