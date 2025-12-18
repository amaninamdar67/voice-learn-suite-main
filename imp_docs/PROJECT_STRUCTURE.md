# Project Structure

Clean, organized project layout for the E-Learning Platform.

## Overview

```
project-root/
│
├── 🔧 CORE APPLICATION (DO NOT MODIFY)
│   ├── src/                 - Frontend React/TypeScript
│   ├── backend/             - Backend Node.js servers
│   ├── database/            - SQL migrations
│   ├── node_modules/        - Dependencies
│   └── public/              - Static assets
│
├── 📚 DOCUMENTATION
│   └── docs/                - All documentation
│       ├── guides/          - Step-by-step guides
│       ├── api/             - API reference
│       ├── architecture/    - System design
│       ├── database/        - Database docs
│       ├── security/        - Security docs
│       ├── operations/      - Deployment & ops
│       └── README.md        - Documentation index
│
├── 🛠️ TOOLS & SCRIPTS
│   └── tools/               - Utilities and scripts
│       ├── launch/          - Start/stop scripts
│       ├── utils/           - Helper scripts
│       └── README.md        - Tools index
│
├── 📊 REPORTS & DATA
│   └── reports/             - Generated reports
│       ├── analytics/       - Analytics reports
│       ├── exports/         - Data exports
│       └── README.md        - Reports index
│
├── ⚙️ CONFIGURATION (Root Level)
│   ├── package.json         - Project dependencies
│   ├── tsconfig.json        - TypeScript config
│   ├── vite.config.ts       - Vite config
│   ├── tailwind.config.ts   - Tailwind config
│   ├── eslint.config.js     - ESLint config
│   ├── postcss.config.js    - PostCSS config
│   ├── .env                 - Environment variables
│   ├── .gitignore           - Git ignore rules
│   └── .project-structure.md - Structure overview
│
└── 📖 THIS FILE
    └── PROJECT_STRUCTURE.md - You are here
```

## Quick Navigation

### I want to...

**Start developing**
→ See: `docs/guides/QUICK_START.md`

**Understand the architecture**
→ See: `docs/architecture/OVERVIEW.md`

**Start/stop services**
→ See: `tools/launch/README.md`

**Read API documentation**
→ See: `docs/api/README.md`

**Deploy to production**
→ See: `docs/operations/DEPLOYMENT.md`

**Understand security**
→ See: `docs/security/SECURITY_OVERVIEW.md`

**Troubleshoot issues**
→ See: `docs/operations/TROUBLESHOOTING.md`

## Folder Details

### 🔧 Core Application
**DO NOT REORGANIZE** - These are critical to the project

- `src/` - Frontend code (React, TypeScript)
- `backend/` - Backend servers (Node.js)
- `database/` - SQL migrations (ordered)
- `node_modules/` - Dependencies
- `public/` - Static files

### 📚 Documentation (`docs/`)
All project documentation organized by topic

```
docs/
├── guides/              - How-to guides
│   ├── QUICK_START.md
│   ├── SETUP.md
│   ├── FRONTEND.md
│   └── BACKEND.md
├── api/                 - API documentation
│   ├── README.md
│   ├── ENDPOINTS.md
│   └── AUTHENTICATION.md
├── architecture/        - System design
│   ├── OVERVIEW.md
│   ├── DATABASE.md
│   └── COMPONENTS.md
├── database/            - Database docs
│   ├── SCHEMA.md
│   ├── MIGRATIONS.md
│   └── RELATIONSHIPS.md
├── security/            - Security docs
│   ├── SECURITY_OVERVIEW.md
│   ├── RLS_POLICIES.md
│   └── BEST_PRACTICES.md
├── operations/          - Operations docs
│   ├── DEPLOYMENT.md
│   ├── TROUBLESHOOTING.md
│   └── MONITORING.md
└── README.md            - Documentation index
```

### 🛠️ Tools & Scripts (`tools/`)
Utilities and automation scripts

```
tools/
├── launch/              - Service launch scripts
│   ├── START_BACKEND_SERVERS.bat
│   ├── STOP_BACKEND_SERVERS.bat
│   ├── START_ALL.bat
│   ├── STOP_ALL.bat
│   ├── CHECK_SERVICES.bat
│   ├── MENU.bat
│   └── README.md
├── utils/               - Helper scripts
│   ├── setup.js
│   ├── migrate.js
│   └── README.md
└── README.md            - Tools index
```

### 📊 Reports & Data (`reports/`)
Generated reports and exports

```
reports/
├── analytics/           - Analytics reports
├── exports/             - Data exports
└── README.md            - Reports index
```

### ⚙️ Configuration (Root)
Project configuration files (must stay at root)

- `package.json` - npm dependencies
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS configuration
- `.env` - Environment variables
- `.gitignore` - Git ignore rules

## File Statistics

| Category | Count | Size |
|----------|-------|------|
| Core Code | 100+ | ~5MB |
| Documentation | 20+ | ~500KB |
| Tools & Scripts | 10+ | ~100KB |
| Configuration | 8 | ~50KB |
| **Total** | **138+** | **~5.6MB** |

## Best Practices

✅ **DO**
- Keep `src/`, `backend/`, `database/` organized
- Use `docs/` for all documentation
- Use `tools/` for scripts and utilities
- Keep configuration files at root
- Follow existing naming conventions

❌ **DON'T**
- Move `src/`, `backend/`, `database/` folders
- Add code files to `docs/` or `tools/`
- Move configuration files from root
- Create new top-level folders without discussion
- Modify import paths in code

## Getting Started

1. **Read**: `docs/guides/QUICK_START.md`
2. **Understand**: `docs/architecture/OVERVIEW.md`
3. **Start**: `tools/launch/README.md`
4. **Code**: `src/` and `backend/`

## Support

- **Documentation**: See `docs/README.md`
- **Tools**: See `tools/README.md`
- **Reports**: See `reports/README.md`
- **Structure**: See this file

---

**Last Updated**: December 2025

**Questions?** Check the relevant documentation folder first!
