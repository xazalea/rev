# Installation Guide

## Quick Start

```bash
npm install
```

## Optional: OpenReason Installation

For enhanced agentic reasoning capabilities, you can optionally install OpenReason from GitHub:

```bash
npm install github:CaviraOSS/OpenReason
```

**Note**: OpenReason is optional. The agentic engine will work with fallback reasoning if OpenReason is not installed, though with reduced capabilities.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Dependencies

### Required
- React 18+
- Electron 28+
- TypeScript 5+

### Optional
- OpenReason (for enhanced reasoning) - Install from GitHub: `npm install github:CaviraOSS/OpenReason`
- Keyv (included, used by OpenReason if installed)
- Zod (included, for type validation)

## Troubleshooting

### OpenReason Installation Issues

If you encounter issues installing OpenReason from GitHub:

1. Make sure you have Git installed
2. Try installing with full URL:
   ```bash
   npm install https://github.com/CaviraOSS/OpenReason.git
   ```

3. Or clone and link manually:
   ```bash
   git clone https://github.com/CaviraOSS/OpenReason.git
   cd OpenReason
   npm install
   npm link
   cd ../rev
   npm link openreason
   ```

The application will work without OpenReason, but with basic fallback reasoning instead of the full adaptive reasoning engine.

