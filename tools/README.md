# Tools & Scripts

Utilities and automation scripts for the E-Learning Platform.

## Folders

### launch/
Service launch and management scripts

- `START_BACKEND_SERVERS.bat` - Start backend servers
- `STOP_BACKEND_SERVERS.bat` - Stop backend servers
- `START_ALL.bat` - Start frontend + backend
- `STOP_ALL.bat` - Stop all services
- `CHECK_SERVICES.bat` - Check service status
- `MENU.bat` - Interactive menu

See: `launch/README.md` for details

### utils/
Helper scripts and utilities

- Database utilities
- Setup scripts
- Migration tools

See: `utils/README.md` for details

## Quick Commands

```bash
# Start backend
cd launch
START_BACKEND_SERVERS.bat

# Start everything
cd launch
START_ALL.bat

# Check status
cd launch
CHECK_SERVICES.bat

# Interactive menu
cd launch
MENU.bat
```

## Documentation

- **Launch Scripts**: `launch/README.md`
- **Utilities**: `utils/README.md`
- **Full Docs**: `../docs/README.md`

---

**Note**: All scripts are in the `launch/` subfolder for organization.
