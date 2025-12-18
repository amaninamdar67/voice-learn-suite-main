# Launch Scripts

Automated scripts to start and stop all backend servers.

## Quick Start

### Start Backend Only
```bash
START_BACKEND_SERVERS.bat
```
Then in IDE: `npm run dev`

### Start Everything
```bash
START_ALL.bat
```

### Stop Services
```bash
STOP_BACKEND_SERVERS.bat
# or
STOP_ALL.bat
```

### Check Status
```bash
CHECK_SERVICES.bat
```

### Interactive Menu
```bash
MENU.bat
```

## Available Scripts

| Script | Purpose | Starts |
|--------|---------|--------|
| START_BACKEND_SERVERS.bat | Backend only | 4 servers |
| STOP_BACKEND_SERVERS.bat | Stop backend | All backend |
| START_ALL.bat | Full system | Backend + Frontend |
| STOP_ALL.bat | Stop everything | All services |
| CHECK_SERVICES.bat | Check status | (read-only) |
| MENU.bat | Interactive menu | (menu) |

## Backend Servers

| Port | Service | Purpose |
|------|---------|---------|
| 3001 | Main Backend | API server |
| 8002 | Voice Server | Voice navigation |
| 8003 | Whisper Server | Voice processing |
| 11434 | Ollama | AI models |

## Frontend Instances

| Port | Instance |
|------|----------|
| 8000 | Instance 1 |
| 8001 | Instance 2 |
| 8002 | Instance 3 |
| 8003 | Instance 4 |
| 8004 | Instance 5 |

## Troubleshooting

**Port already in use?**
```bash
CHECK_SERVICES.bat
STOP_ALL.bat
```

**Script won't run?**
- Right-click → Run as administrator

**Need help?**
- See: `Documentation/` folder
- See: `../../docs/` folder

---

For detailed documentation, see: `../../docs/guides/`
