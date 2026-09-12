# 🌊 Bluesphere Ocean Data Platform

Bluesphere is a full-stack, AI-powered oceanographic data exploration, analysis, and 3D visualization platform designed for researchers, oceanographers, and environmental analysts.

---

## 🔑 API Keys & Environment Variables Summary

All API keys and environment configurations are consolidated here for easy reference:

### **Backend (`backend/.env`)**

| Variable | Current Value / Setting | Description |
| :--- | :--- | :--- |
| `NVIDIA_API_KEY` | `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` | NVIDIA NIM API key for AI Copilot reasoning & LLM tool calling |
| `LLM_PROVIDER` | `nvidia` | AI copilot LLM provider (`nvidia` or `local`) |
| `NVIDIA_API_BASE_URL` | `https://integrate.api.nvidia.com/v1` | Base URL for NVIDIA AI endpoints |
| `NVIDIA_MODEL` | `openai/gpt-oss-20b` | Model used for agentic copilot queries |
| `LOCAL_LLM_BASE_URL` | `http://localhost:8000/v1` | Fallback / Local LLM base endpoint |
| `LOCAL_LLM_MODEL` | `gpt-oss-20b` | Local LLM model identifier |
| `DATABASE_URL` | `sqlite:///./bluesphere_v2.db` | Database connection string (SQLite default / PostgreSQL compatible) |
| `APP_ENV` | `development` | Application environment |
| `API_V1_STR` | `/api/v1` | API prefix path |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173` | Allowed frontend origins |

### **Frontend (`frontend/.env`)**

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api/v1` | Proxy target to backend API |

### **External Data Sources (No API Key Required)**

* **INCOIS ERDDAP**: `https://erddap.incois.gov.in` (Proxied through `/erddap` in frontend Vite config)

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Run

```powershell
cd "d:\Sih 2026\backend"

# Install dependencies
pip install -r requirements.txt

# Run the server
python run_server.py
```
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup & Run

```powershell
cd "d:\Sih 2026\frontend"

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- **Frontend App**: [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture & Features

* **3D Ocean Explorer**: CesiumJS-powered globe visualizing Argo float trajectories, sea surface temperature (SST), salinity, oxygen profiles, and bathymetry.
* **Agentic AI Copilot**: Real-time natural language query assistant powered by NVIDIA NIM to filter datasets, query telemetry, and trigger analysis.
* **Analysis & Simulation**: Particle drift simulation, spatial clustering, and anomaly detection algorithms.
* **Database & Ingestion**: Pre-populated SQLite DB (`bluesphere_v2.db`) with support for automated ERDDAP ingestion pipelines.
