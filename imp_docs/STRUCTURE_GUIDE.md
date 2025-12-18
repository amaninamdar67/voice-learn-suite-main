# Project Structure Guide

Visual guide to the E-Learning Platform project organization.

## 🎯 At a Glance

```
E-Learning Platform/
│
├── 🔧 CODE (Core - Don't Touch)
│   ├── src/              Frontend
│   ├── backend/          Backend
│   ├── database/         Database
│   └── node_modules/     Dependencies
│
├── 📚 DOCS (Documentation)
│   └── docs/             All guides & docs
│
├── 🛠️ TOOLS (Scripts)
│   └── tools/            Launch & utilities
│
├── 📊 REPORTS (Generated)
│   └── reports/          Analytics & exports
│
└── ⚙️ CONFIG (Root)
    ├── package.json
    ├── .env
    └── Other configs
```

## 📍 Where to Find Things

### I need to...

| Task | Location | File |
|------|----------|------|
| **Start developing** | docs/guides/ | QUICK_START.md |
| **Understand system** | docs/architecture/ | OVERVIEW.md |
| **Start backend** | tools/launch/ | START_BACKEND_SERVERS.bat |
| **Read API docs** | docs/api/ | README.md |
| **Deploy** | docs/operations/ | DEPLOYMENT.md |
| **Fix issues** | docs/operations/ | TROUBLESHOOTING.md |
| **Understand security** | docs/security/ | SECURITY_OVERVIEW.md |
| **Check database** | docs/database/ | SCHEMA.md |

## 🚀 Quick Start Paths

### Path 1: First Time Setup
```
1. Read: docs/guides/QUICK_START.md
2. Read: docs/architecture/OVERVIEW.md
3. Run: tools/launch/START_BACKEND_SERVERS.bat
4. Run: npm run dev
5. Start coding!
```

### Path 2: Troubleshooting
```
1. Run: tools/launch/CHECK_SERVICES.bat
2. Read: docs/operations/TROUBLESHOOTING.md
3. Run: tools/launch/STOP_ALL.bat
4. Try again
```

### Path 3: Deployment
```
1. Read: docs/operations/DEPLOYMENT.md
2. Read: docs/security/SECURITY_OVERVIEW.md
3. Follow deployment steps
4. Monitor: docs/operations/MONITORING.md
```

## 📂 Detailed Structure

### docs/ (Documentation)
```
docs/
├── guides/              ← How-to guides
│   ├── QUICK_START.md   ← Start here!
│   ├── SETUP.md
│   ├── FRONTEND.md
│   └── BACKEND.md
├── api/                 ← API reference
│   ├── README.md
│   ├── ENDPOINTS.md
│   └── AUTHENTICATION.md
├── architecture/        ← System design
│   ├── OVERVIEW.md
│   ├── DATABASE.md
│   └── COMPONENTS.md
├── database/            ← Database docs
│   ├── SCHEMA.md
│   ├── MIGRATIONS.md
│   └── RELATIONSHIPS.md
├── security/            ← Security docs
│   ├── SECURITY_OVERVIEW.md
│   ├── RLS_POLICIES.md
│   └── BEST_PRACTICES.md
├── operations/          ← Operations docs
│   ├── DEPLOYMENT.md
│   ├── TROUBLESHOOTING.md
│   └── MONITORING.md
└── README.md            ← Documentation index
```

### tools/ (Scripts & Utilities)
```
tools/
├── launch/              ← Service scripts
│   ├── START_BACKEND_SERVERS.bat
│   ├── STOP_BACKEND_SERVERS.bat
│   ├── START_ALL.bat
│   ├── STOP_ALL.bat
│   ├── CHECK_SERVICES.bat
│   ├── MENU.bat
│   └── README.md
├── utils/               ← Helper scripts
│   ├── setup.js
│   ├── migrate.js
│   └── README.md
└── README.md            ← Tools index
```

### reports/ (Generated Data)
```
reports/
├── analytics/           ← Analytics reports
├── exports/             ← Data exports
└── README.md            ← Reports index
```

## 🎓 Learning Path

### Beginner
1. `docs/guides/QUICK_START.md` - Get running
2. `docs/architecture/OVERVIEW.md` - Understand system
3. `docs/guides/FRONTEND.md` - Frontend development
4. Start coding!

### Intermediate
1. `docs/api/README.md` - API reference
2. `docs/database/SCHEMA.md` - Database structure
3. `docs/guides/BACKEND.md` - Backend development
4. Build features!

### Advanced
1. `docs/security/SECURITY_OVERVIEW.md` - Security
2. `docs/operations/DEPLOYMENT.md` - Deployment
3. `docs/operations/MONITORING.md` - Monitoring
4. Deploy to production!

## ✅ Checklist

### Before Starting
- [ ] Read `docs/guides/QUICK_START.md`
- [ ] Install Node.js
- [ ] Run `npm install`
- [ ] Run `tools/launch/START_BACKEND_SERVERS.bat`
- [ ] Run `npm run dev`

### Before Committing
- [ ] Code follows conventions
- [ ] Tests pass
- [ ] No console errors
- [ ] Documentation updated

### Before Deploying
- [ ] Read `docs/operations/DEPLOYMENT.md`
- [ ] Security review done
- [ ] Performance tested
- [ ] Backup created

## 🔗 Navigation

| From | To | How |
|------|----|----|
| Root | Docs | Open `docs/README.md` |
| Root | Tools | Open `tools/README.md` |
| Root | Reports | Open `reports/README.md` |
| Docs | Tools | See `../tools/README.md` |
| Tools | Docs | See `../docs/README.md` |

## 📊 Statistics

- **Documentation Files**: 20+
- **Script Files**: 10+
- **Configuration Files**: 8
- **Total Size**: ~5.6MB
- **Setup Time**: ~5 minutes

## 🆘 Help

**Can't find something?**
1. Check `PROJECT_STRUCTURE.md` (this file)
2. Check `docs/README.md`
3. Check `tools/README.md`
4. Check `reports/README.md`

**Still stuck?**
- See: `docs/operations/TROUBLESHOOTING.md`
- See: `docs/guides/QUICK_START.md`

## 🎯 Key Takeaways

✅ **Code** stays in `src/`, `backend/`, `database/`
✅ **Docs** go in `docs/`
✅ **Scripts** go in `tools/`
✅ **Reports** go in `reports/`
✅ **Config** stays at root

❌ **Don't** move core folders
❌ **Don't** mix code and docs
❌ **Don't** create new top-level folders
❌ **Don't** modify import paths

---

**Last Updated**: December 2025

**Ready to start?** → Open `docs/guides/QUICK_START.md`
