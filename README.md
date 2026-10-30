# Dhanvikk Blooms & Exports — Architecture

This repository contains the complete frontend and backend codebase for **Dhanvikk Blooms & Exports**, a luxury botanical commerce and gifting platform.

---

## Directory Structure

```
dhanvikk/
├── frontend/                  # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/        # Reusable botanical UI and Auth components
│   │   ├── pages/             # Login, Admin, Account, Checkout, Home
│   │   ├── services/          # Centralized Axios API client & Auth services
│   │   ├── store/             # Redux Toolkit store & auth slice
│   │   └── index.css          # Design tokens & Poppins styling
│   ├── index.html
│   ├── package.json
│   └── vite.config.js         # Vite configuration with proxy to backend
│
├── backend/                   # Node.js + Express REST API Backend
│   ├── src/
│   │   ├── controllers/       # Auth controller (login, google, me, logout, register)
│   │   ├── routes/            # /api/auth routes
│   │   ├── middleware/        # JWT verification, Role authorization, Error handler
│   │   ├── config/            # JWT configuration
│   │   └── data/              # In-memory user database with bcrypt hashes
│   ├── server.js              # Express server entry point (port 5000)
│   ├── .env                   # Environment variables
│   └── package.json
│
└── package.json               # Root workspace scripts
```

---

## Quick Start

### 1. Run the Backend Server
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Run the Frontend App
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Access Credentials

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Super Admin** | `divagar.m.msc.cs@gmail.com` | `admin@2026` | Full root access to Admin Dashboard, Analytics, Dispatch & Settings |
| **Customer (Test)** | `customer@dhanvikk.com` | `Bloom@2026` | Storefront browsing, cart, checkout, tracking |

> **Note**: Additional staff members can be authorized and created dynamically by the Super Admin in the Admin Console under **Settings > Authorized Personnel Roster**.
