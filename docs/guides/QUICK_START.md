# Quick Start Guide

Get the E-Learning Platform running in 5 minutes.

## Prerequisites

- Node.js v14+ ([Download](https://nodejs.org/))
- npm v6+ (comes with Node.js)
- Ollama (optional, [Download](https://ollama.ai/))

## Installation (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Install backend dependencies
cd backend
npm install
cd ..

# 3. Set up environment variables
# Copy .env file (already configured)
```

## Start Development (1 minute)

### Option A: Backend Only (Recommended)
```bash
# Terminal 1: Start backend
cd Quick Launch
START_BACKEND_SERVERS.bat

# Terminal 2: Start frontend
npm run dev
```

Open: http://localhost:5173

### Option B: Everything
```bash
# Start all services
cd Quick Launch
START_ALL.bat
```

Open: http://localhost:8000

## Verify It's Working

- Frontend loads: ✓
- Can login: ✓
- Backend responds: ✓

## Next Steps

- Read: [Full Setup Guide](./SETUP.md)
- Read: [Architecture Overview](../architecture/OVERVIEW.md)
- Start coding!

## Troubleshooting

**Port already in use?**
```bash
cd Quick Launch
STOP_ALL.bat
```

**Node not found?**
- Install from https://nodejs.org/
- Restart computer

**Need help?**
- See: [Troubleshooting Guide](../operations/TROUBLESHOOTING.md)
- See: [Launch Scripts Guide](../../tools/launch/README.md)

---

**Time to first run: ~5 minutes**

Happy coding! 🚀
