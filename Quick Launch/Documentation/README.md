# Quick Launch Scripts

This folder contains batch scripts to quickly start and stop all services for the E-Learning platform.

## Available Scripts

### 1. **START_BACKEND_SERVERS.bat**
Starts all backend servers only (no frontend)

**Servers Started:**
- Main Backend Server (Port 3001)
- Voice Server (Port 8002)
- Whisper Voice Server (Port 8003)
- Ollama (Port 11434)

**Usage:**
```
Double-click START_BACKEND_SERVERS.bat
```

**When to use:**
- When you only need backend services
- For API testing
- When frontend is running in IDE

---

### 2. **STOP_BACKEND_SERVERS.bat**
Stops all backend servers

**Servers Stopped:**
- Main Backend Server (Port 3001)
- Voice Server (Port 8002)
- Whisper Voice Server (Port 8003)
- Ollama (Port 11434)

**Usage:**
```
Double-click STOP_BACKEND_SERVERS.bat
```

**When to use:**
- Before restarting backend services
- To free up ports
- For cleanup

---

### 3. **START_ALL.bat**
Starts all services (frontend + backend)

**Services Started:**
- Backend: 4 servers (3001, 8002, 8003, 11434)
- Frontend: 3 instances (8000, 8001, 8002)

**Usage:**
```
Double-click START_ALL.bat
```

**When to use:**
- Full system startup
- Testing multiple frontend instances
- Complete development environment

**Note:** Frontend instances 4 & 5 (ports 8003-8004) are not started to avoid conflicts with backend servers.

---

### 4. **STOP_ALL.bat**
Stops all services (frontend + backend)

**Services Stopped:**
- Backend: 4 servers (3001, 8002, 8003, 11434)
- Frontend: 5 instances (8000-8004)

**Usage:**
```
Double-click STOP_ALL.bat
```

**When to use:**
- Complete system shutdown
- Before restarting everything
- Cleanup before closing

---

## Port Reference

### Backend Ports
| Service | Port | Purpose |
|---------|------|---------|
| Main Backend | 3001 | API server, LMS routes |
| Voice Server | 8002 | Voice navigation |
| Whisper Server | 8003 | Whisper voice processing |
| Ollama | 11434 | AI model serving |

### Frontend Ports
| Instance | Port | Purpose |
|----------|------|---------|
| Instance 1 | 8000 | Development server |
| Instance 2 | 8001 | Development server |
| Instance 3 | 8002 | Development server |
| Instance 4 | 8003 | Development server |
| Instance 5 | 8004 | Development server |

---

## Prerequisites

### Required
- **Node.js** - Download from https://nodejs.org/
- **npm** - Comes with Node.js

### Optional
- **Ollama** - Download from https://ollama.ai/
  - If not installed, Ollama server won't start (non-blocking)

### Installation Check
```cmd
node --version
npm --version
ollama --version
```

---

## Troubleshooting

### Port Already in Use
If you get "port already in use" error:

1. **Find process on port:**
   ```cmd
   netstat -ano | findstr :PORT_NUMBER
   ```

2. **Kill process:**
   ```cmd
   taskkill /PID PROCESS_ID /F
   ```

3. **Or use the stop scripts:**
   ```cmd
   STOP_BACKEND_SERVERS.bat
   STOP_ALL.bat
   ```

### Node.js Not Found
If you get "Node.js is not installed":
1. Download from https://nodejs.org/
2. Install with default settings
3. Restart your computer
4. Try again

### Ollama Not Found
If Ollama doesn't start:
1. Download from https://ollama.ai/
2. Install and run once manually
3. Try the script again
4. If still fails, it's optional - backend will work without it

### Script Won't Run
If batch file won't execute:
1. Right-click the .bat file
2. Select "Run as administrator"
3. Or open Command Prompt as admin and run:
   ```cmd
   cd "Quick Launch"
   START_BACKEND_SERVERS.bat
   ```

---

## Manual Commands

If you prefer to run commands manually:

### Start Backend Manually
```cmd
cd backend
node server.js
```

In separate terminals:
```cmd
cd backend
node voice-server.js
```

```cmd
cd backend
node whisper-voice-server.js
```

```cmd
ollama serve
```

### Start Frontend Manually
```cmd
npm run dev -- --port 8000
```

### Stop Services Manually
Press `Ctrl+C` in each terminal window

---

## Quick Start Guide

### First Time Setup
1. Install Node.js from https://nodejs.org/
2. Install Ollama from https://ollama.ai/ (optional)
3. Run `npm install` in project root
4. Run `npm install` in backend folder

### Daily Startup
```
Double-click START_BACKEND_SERVERS.bat
```

Then in IDE:
```
npm run dev
```

Or use:
```
Double-click START_ALL.bat
```

### Daily Shutdown
```
Double-click STOP_ALL.bat
```

---

## Service Status

### Check if Services are Running

**Backend Services:**
```cmd
netstat -ano | findstr :3001
netstat -ano | findstr :8002
netstat -ano | findstr :8003
netstat -ano | findstr :11434
```

**Frontend Services:**
```cmd
netstat -ano | findstr :8000
netstat -ano | findstr :8001
netstat -ano | findstr :8002
netstat -ano | findstr :8003
netstat -ano | findstr :8004
```

---

## Tips & Tricks

### Run as Administrator
For better compatibility, run scripts as administrator:
1. Right-click the .bat file
2. Select "Run as administrator"

### Keep Terminal Open
Scripts automatically pause at the end. Press any key to close.

### View Logs
Each service opens in its own terminal window. You can see logs in real-time.

### Restart a Single Service
1. Find the terminal window for that service
2. Press `Ctrl+C` to stop it
3. Press any key to close the window
4. Run the start script again

### Kill All Node Processes
```cmd
taskkill /IM node.exe /F
```

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify all prerequisites are installed
3. Check port conflicts
4. Review backend logs in terminal windows
5. Check frontend console in browser DevTools

---

## File Descriptions

| File | Purpose |
|------|---------|
| START_BACKEND_SERVERS.bat | Start backend only |
| STOP_BACKEND_SERVERS.bat | Stop backend only |
| START_ALL.bat | Start frontend + backend |
| STOP_ALL.bat | Stop frontend + backend |
| BACKEND_COMMANDS.txt | Manual backend commands |
| START_ALL_SERVICES.bat | Legacy frontend starter |
| STOP_ALL_SERVICES.bat | Legacy frontend stopper |
| README.md | This file |

---

Last Updated: December 2025
