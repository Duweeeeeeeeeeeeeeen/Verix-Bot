# 🛠 Verix Bot - Developer & Deployment Guide

This guide is designed to help any AI assistant (like Gemini) understand the project structure and deployment procedures instantly, avoiding redundant research.

## 📁 Project Structure

- **`/src`**: Core Discord bot logic (Discord.js).
  - `/commands`, `/events`, `/modules`: Standard bot organization.
- **`/dashboard/client`**: Frontend dashboard built with **Next.js**.
  - `/src/components`: UI components (e.g., `Layout.js`).
  - `/src/pages`: Dashboard routes (Config pages are in `/config/[guildId]`).
  - `/src/contexts`: State management (Auth, Theme, Language).
- **`/dashboard/api`**: Backend API for the dashboard (Express/Node.js).
- **`/scripts`**: PowerShell scripts for VPS deployment and maintenance.

## 🚀 Deployment Procedures

The project is deployed to a Linux VPS via SSH/SCP.

### Main Deployment
To sync all changes (Bot + Dashboard) and restart services:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy_vps.ps1
```

### VPS Details
- **IP**: `178.104.245.26` (root)
- **Remote Path**: `/root/Verix-Bot`
- **Services**: Managed via PM2 (`verix-bot`, `verix-dashboard-client`).

## 💡 Common Troubleshooting for AI

1. **V2 UI Standardization**: All configuration pages MUST use the `.pc-header-v2` structure.
   - Headers must contain: Toggle row, a vertical `.pc-header-divider`, and action buttons (Reset, Sync, and optionally Send Panel).
   - Use standardized utility classes: `.pc-card-v2`, `.pc-input-modern-v2`, `.pc-status-tag-v2`.
2. **State Management**: Use the `setNested` function or immutable spread updates. Avoid direct state mutations.
3. **ReferenceErrors in Dashboard**: Always check `AuthContext`, `ThemeContext`, and `LanguageContext` before assuming a variable is global.
4. **Translation Keys**: Locales are in `dashboard/client/src/locales/*.json`. Use the `useT()` hook for translations.
5. **Sidebar Updates**: The main navigation is defined in `dashboard/client/src/components/Layout.js`.
6. **Environment**: The `.env` file in the root contains both Bot and Dashboard secrets.

---
*Assistant Note: If you are a new Gemini session, read this file first to understand the environment without searching.*
