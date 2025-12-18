# 👋 Welcome to E-Learning Platform

Clean, organized, professional project structure.

## 🚀 Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..

# 2. Start backend
cd tools/launch
START_BACKEND_SERVERS.bat

# 3. Start frontend (in new terminal)
npm run dev

# 4. Open browser
http://localhost:5173
```

**Done!** You're ready to develop.

---

## 📚 Documentation

Everything is organized and easy to find.

### Getting Started
- **[Quick Start Guide](docs/guides/QUICK_START.md)** - 5 minute setup
- **[Full Setup Guide](docs/guides/SETUP.md)** - Detailed setup
- **[Architecture Overview](docs/architecture/OVERVIEW.md)** - System design

### Development
- **[Frontend Guide](docs/guides/FRONTEND.md)** - Frontend development
- **[Backend Guide](docs/guides/BACKEND.md)** - Backend development
- **[API Documentation](docs/api/README.md)** - API reference

### Operations
- **[Deployment Guide](docs/operations/DEPLOYMENT.md)** - Deploy to production
- **[Troubleshooting](docs/operations/TROUBLESHOOTING.md)** - Fix issues
- **[Security Guide](docs/security/SECURITY_OVERVIEW.md)** - Security practices

### Tools
- **[Launch Scripts](tools/launch/README.md)** - Start/stop services
- **[Utilities](tools/utils/README.md)** - Helper scripts

---

## 📁 Project Structure

```
project-root/
├── src/                 ← Frontend code
├── backend/             ← Backend code
├── database/            ← Database migrations
├── docs/                ← Documentation (START HERE!)
├── tools/               ← Scripts & utilities
├── reports/             ← Generated reports
└── Configuration files
```

**See**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for details

---

## 🎯 What to Do Next

### Option 1: Start Developing
1. Read: [Quick Start Guide](docs/guides/QUICK_START.md)
2. Run: `tools/launch/START_BACKEND_SERVERS.bat`
3. Run: `npm run dev`
4. Start coding!

### Option 2: Understand the System
1. Read: [Architecture Overview](docs/architecture/OVERVIEW.md)
2. Read: [Database Schema](docs/database/SCHEMA.md)
3. Read: [API Documentation](docs/api/README.md)
4. Explore the code!

### Option 3: Deploy to Production
1. Read: [Deployment Guide](docs/operations/DEPLOYMENT.md)
2. Read: [Security Guide](docs/security/SECURITY_OVERVIEW.md)
3. Follow deployment steps
4. Monitor the system!

---

## 🛠️ Available Commands

### Start Services
```bash
cd tools/launch
START_BACKEND_SERVERS.bat    # Backend only
START_ALL.bat                # Frontend + Backend
```

### Stop Services
```bash
cd tools/launch
STOP_BACKEND_SERVERS.bat     # Stop backend
STOP_ALL.bat                 # Stop everything
```

### Check Status
```bash
cd tools/launch
CHECK_SERVICES.bat           # Show running services
MENU.bat                     # Interactive menu
```

### Frontend Development
```bash
npm run dev                  # Start dev server
npm run build                # Build for production
npm run preview              # Preview production build
```

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Frontend Files | 100+ |
| Backend Files | 50+ |
| Documentation Files | 20+ |
| Script Files | 10+ |
| Total Size | ~5.6MB |
| Setup Time | ~5 min |

---

## 🔗 Quick Links

| Need | Link |
|------|------|
| **Getting Started** | [Quick Start](docs/guides/QUICK_START.md) |
| **Project Structure** | [Structure Guide](STRUCTURE_GUIDE.md) |
| **Launch Scripts** | [Tools](tools/launch/README.md) |
| **Documentation** | [Docs Index](docs/README.md) |
| **Troubleshooting** | [Help](docs/operations/TROUBLESHOOTING.md) |

---

## ❓ FAQ

**Q: How do I start developing?**
A: See [Quick Start Guide](docs/guides/QUICK_START.md)

**Q: Where are the launch scripts?**
A: In `tools/launch/` folder

**Q: How do I deploy?**
A: See [Deployment Guide](docs/operations/DEPLOYMENT.md)

**Q: Something's broken, what do I do?**
A: See [Troubleshooting Guide](docs/operations/TROUBLESHOOTING.md)

**Q: Where's the documentation?**
A: In `docs/` folder - start with [README.md](docs/README.md)

---

## 🎓 Learning Resources

### Beginner Path
1. [Quick Start](docs/guides/QUICK_START.md)
2. [Architecture Overview](docs/architecture/OVERVIEW.md)
3. [Frontend Guide](docs/guides/FRONTEND.md)

### Intermediate Path
1. [API Documentation](docs/api/README.md)
2. [Database Schema](docs/database/SCHEMA.md)
3. [Backend Guide](docs/guides/BACKEND.md)

### Advanced Path
1. [Security Guide](docs/security/SECURITY_OVERVIEW.md)
2. [Deployment Guide](docs/operations/DEPLOYMENT.md)
3. [Monitoring Guide](docs/operations/MONITORING.md)

---

## 💡 Tips

✅ **Do**
- Read the documentation first
- Use the launch scripts
- Follow the project structure
- Ask questions!

❌ **Don't**
- Move core folders (src, backend, database)
- Ignore the documentation
- Create new top-level folders
- Commit large files

---

## 🆘 Need Help?

1. **Check Documentation**: `docs/README.md`
2. **Check Troubleshooting**: `docs/operations/TROUBLESHOOTING.md`
3. **Check Structure**: `PROJECT_STRUCTURE.md`
4. **Check This File**: You're reading it!

---

## 🎉 Ready?

**Let's get started!**

→ Open: [Quick Start Guide](docs/guides/QUICK_START.md)

---

**Last Updated**: December 2025

**Questions?** Check the documentation first! 📚

Happy coding! 🚀
